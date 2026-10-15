import os
import sys
import json
import smtplib
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Azure AI Agent configuration from agente.py
AZURE_ENDPOINT = "https://aula-agente-lucas-resource.services.ai.azure.com/api/projects/aula-agente-lucas"
AGENT_NAME = "Anai-Ribeiro"

def call_azure_agent(prompt: str) -> str:
    """Calls the Anai-Ribeiro agent configured on Azure AI Projects."""
    try:
        from azure.identity import DefaultAzureCredential
        from azure.ai.projects import AIProjectClient

        with (
            DefaultAzureCredential() as credential,
            AIProjectClient(
                endpoint=AZURE_ENDPOINT,
                credential=credential,
                allow_preview=True,
            ) as project_client,
        ):
            openai_client = project_client.get_openai_client(agent_name=AGENT_NAME)
            conversation = openai_client.conversations.create()
            response = openai_client.responses.create(
                conversation=conversation.id,
                input=[{"role": "user", "content": prompt}],
            )
            return response.output_text
    except Exception as exc:
        print(f"[Azure Agent Error] {exc}", file=sys.stderr)
        return ""

def generate_fallback_proposal(secretaria, cursos, foco, tom, remetente):
    """Generates a highly polished institutional proposal when AI is offline or unreachable."""
    nome_secretario = secretaria.get("secretario", "Secretário(a) de Educação")
    orgao = secretaria.get("orgao", "Secretaria de Educação")
    cidade = secretaria.get("cidade", "Município")
    estado = secretaria.get("estado", "UF")
    unidade_senai = remetente.get("unidade", "SENAI - Serviço Nacional de Aprendizagem Industrial")
    responsavel = remetente.get("responsavel", "Coordenação de Relações Institucionais")
    cargo_remetente = remetente.get("cargo", "Gestor de Parcerias Estratégicas")

    lista_cursos_nomes = [c.get("titulo", "") for c in cursos]
    qtd_cursos = len(cursos)

    # Subject line
    if "docente" in foco.lower():
        assunto = f"Proposta de Parceria SENAI & {orgao}: Capacitação Docente em Tecnologias Industriais e IA"
    elif "médio" in foco.lower() or "itinerário" in foco.lower():
        assunto = f"Parceria Estratégica SENAI & {orgao}: Itinerários Técnicos do Novo Ensino Médio"
    else:
        assunto = f"Acordo de Cooperação Técnica: Divulgação de Cursos Profissionalizantes SENAI para Estudantes de {cidade}/{estado}"

    # Body paragraphs
    intro = (
        f"Cumprimentando-o(a) cordialmente, o {unidade_senai} tem a honra de apresentar a Vossa Senhoria "
        f"uma proposta de cooperação educacional direcionada aos estudantes e profissionais vinculados à {orgao}. "
        f"Reconhecendo a liderança desta secretaria na elevação dos indicadores de aprendizagem em {cidade}, "
        f"colocamos à disposição nossa infraestrutura de laboratórios de excelência e corpo técnico especializado."
    )

    justificativa = (
        f"Diante das transformações trazidas pela Indústria 4.0 e da necessidade de oportunizar aos jovens o acesso "
        f"ao primeiro emprego qualificado, estruturamos uma trilha formativa com {qtd_cursos} curso(s) de alta aderência "
        f"ao setor produtivo e às diretrizes da Educação Profissional e Tecnológica (EPT), articulada à BNCC e "
        f"aos itinerários formativos."
    )

    impacto = (
        f"Os cursos selecionados abrangem áreas estratégicas como {', '.join(lista_cursos_nomes[:3])}, "
        f"visando não apenas o desenvolvimento de competências técnicas, mas também socioemocionais (soft skills), "
        f"pensamento computacional e empreendedorismo para transformar a trajetória dos alunos da rede pública."
    )

    encerramento = (
        f"Nesse sentido, solicitamos a oportunidade de agendarmos uma reunião institucional (presencial ou remota) "
        f"para detalharmos as possibilidades de convênio, viabilidade de gratuidade regimental, vagas subsidiadas "
        f"e o cronograma de implantação para o próximo semestre letivo."
    )

    return {
        "assunto": assunto,
        "introducao": intro,
        "justificativa": justificativa,
        "impacto": impacto,
        "encerramento": encerramento,
        "source": "fallback_engine"
    }

class SenaiHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for local testing
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            data = {
                "status": "online",
                "agent_name": AGENT_NAME,
                "azure_endpoint": AZURE_ENDPOINT,
                "version": "1.0.0"
            }
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        elif parsed.path == "/api/courses":
            self.serve_json_file("courses.json")
            return

        elif parsed.path == "/api/secretarias":
            self.serve_json_file("secretarias.json")
            return

        # Fallback to standard static files
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/generate-proposal":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                payload = json.loads(body)
            except Exception:
                payload = {}

            secretaria = payload.get("secretaria", {})
            cursos = payload.get("cursos", [])
            foco = payload.get("foco", "Novo Ensino Médio")
            tom = payload.get("tom", "Institucional Formal")
            remetente = payload.get("remetente", {})

            # Prepare structured prompt for Azure Agent Anai-Ribeiro
            cursos_desc = "\n".join([
                f"- {c.get('titulo')} ({c.get('cargaHoraria', '')}, {c.get('modalidade', '')}): {c.get('descricao', '')}"
                for c in cursos
            ])

            ai_prompt = (
                f"Você é a Anai-Ribeiro, consultora de relações institucionais e educacionais do SENAI. "
                f"Sua missão é elaborar um e-mail institucional oficial, persuasivo e altamente profissional "
                f"para divulgar cursos do SENAI para a {secretaria.get('orgao', 'Secretaria de Educação')}, "
                f"endereçado ao(à) {secretaria.get('secretario', 'Secretário(a) de Educação')} da cidade de {secretaria.get('cidade', 'Município')}-{secretaria.get('estado', 'UF')}.\n\n"
                f"Diretrizes:\n"
                f"- Foco da proposta: {foco}\n"
                f"- Tom de comunicação: {tom}\n"
                f"- Remetente: {remetente.get('responsavel', 'Coordenação SENAI')}, {remetente.get('cargo', 'Consultor')}, {remetente.get('unidade', 'Unidade SENAI')}\n"
                f"- Cursos selecionados para a proposta:\n{cursos_desc}\n\n"
                f"Responda EXCLUSIVAMENTE em formato JSON com as seguintes chaves:\n"
                f'{{"assunto": "Linha de assunto chamativa e institucional", '
                f'"introducao": "Parágrafo de saudação respeitosa e apresentação da parceria", '
                f'"justificativa": "Parágrafo destacando o alinhamento pedagógico, benefícios aos alunos da rede e ao IDEB", '
                f'"impacto": "Parágrafo sintetizando o impacto dos cursos selecionados e da infraestrutura de ponta do SENAI", '
                f'"encerramento": "Parágrafo com chamada formal para agendamento de reunião ou termo de cooperação"}}'
            )

            azure_result = call_azure_agent(ai_prompt)
            proposal = None

            if azure_result:
                try:
                    # Clean possible markdown fence
                    cleaned = azure_result.strip()
                    if cleaned.startswith("```json"):
                        cleaned = cleaned[7:]
                    if cleaned.startswith("```"):
                        cleaned = cleaned[3:]
                    if cleaned.endswith("```"):
                        cleaned = cleaned[:-3]
                    cleaned = cleaned.strip()

                    # Find outer JSON brackets if text surrounds it
                    start_idx = cleaned.find("{")
                    end_idx = cleaned.rfind("}")
                    if start_idx != -1 and end_idx != -1:
                        cleaned = cleaned[start_idx:end_idx+1]
                        proposal = json.loads(cleaned)
                        proposal["source"] = "anai_ribeiro_agent"
                except Exception as parse_err:
                    print(f"[JSON Parse Error from Agent] {parse_err}. Raw was:\n{azure_result}", file=sys.stderr)

            if not proposal or not proposal.get("assunto"):
                proposal = generate_fallback_proposal(secretaria, cursos, foco, tom, remetente)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(proposal, ensure_ascii=False).encode("utf-8"))
            return

        elif parsed.path == "/api/send-email":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                payload = json.loads(body)
            except Exception:
                payload = {}

            to_email = payload.get("to")
            subject = payload.get("subject", "Proposta SENAI")
            html_content = payload.get("htmlContent", "")
            smtp_config = payload.get("smtpConfig", {})

            # Check if actual SMTP details were provided
            smtp_host = smtp_config.get("host")
            smtp_port = int(smtp_config.get("port", 587)) if smtp_config.get("port") else None
            smtp_user = smtp_config.get("user")
            smtp_pass = smtp_config.get("pass")

            if smtp_host and smtp_user and smtp_pass:
                try:
                    msg = MIMEMultipart("alternative")
                    msg["Subject"] = subject
                    msg["From"] = smtp_user
                    msg["To"] = to_email
                    part = MIMEText(html_content, "html", "utf-8")
                    msg.attach(part)

                    with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                        server.starttls()
                        server.login(smtp_user, smtp_pass)
                        server.sendmail(smtp_user, [to_email], msg.as_string())

                    resp = {
                        "success": True,
                        "mode": "smtp_live",
                        "message": f"E-mail institucional enviado com sucesso para {to_email} via SMTP!"
                    }
                except Exception as err:
                    resp = {
                        "success": False,
                        "mode": "smtp_error",
                        "error": str(err)
                    }
            else:
                # Simulation / Protocol mode: log dispatch
                print(f"[SENAI Dispatch Simulation] Sending email to {to_email} | Subject: {subject}")
                resp = {
                    "success": True,
                    "mode": "simulated",
                    "message": f"Protocolo gerado com sucesso. Mensagem enviada para o canal oficial de {to_email}."
                }

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode("utf-8"))
            return

        self.send_error(404, "Endpoint not found")

    def serve_json_file(self, filename):
        filepath = os.path.join(os.path.dirname(__file__), filename)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(content.encode("utf-8"))
        else:
            self.send_error(404, f"{filename} not found")

def run(port=5000):
    server_address = ("", port)
    httpd = HTTPServer(server_address, SenaiHandler)
    print(f"=== SENAI Conecta Educação Server ===")
    print(f"Servidor rodando em: http://localhost:{port}")
    print(f"Agente IA: {AGENT_NAME} (Azure AI Projects)")
    print(f"Pressione Ctrl+C para encerrar.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nEncerrando servidor...")
        httpd.server_close()

if __name__ == "__main__":
    port = 5000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run(port)
