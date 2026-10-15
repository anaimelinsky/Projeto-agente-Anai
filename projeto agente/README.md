# SENAI Conecta Educação 🎓🏭

Plataforma Web completa para **divulgação estratégica de cursos do SENAI por e-mail para Secretarias Municipais e Estaduais de Educação**, integrada ao Agente de Inteligência Artificial **Anai-Ribeiro** (Azure AI Projects).

---

## 🚀 Como Iniciar a Aplicação

### Opção 1: Executar com 1 Clique (Windows)
Dê um duplo clique no arquivo [`iniciar.bat`](file:///c:/Users/09717590818/Desktop/projeto%20agente/iniciar.bat).

### Opção 2: Pelo Terminal / PowerShell
```powershell
.\.venv\Scripts\python.exe server.py 5000
```

Abra o seu navegador em:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## ✨ Principais Funcionalidades

### 1. 📚 Catálogo Inteligente de Cursos SENAI
- Cursos estruturados para atender às demandas de Educação Profissional e Tecnológica (EPT), Novo Ensino Médio (Itinerário V), Jovem Aprendiz e Formação Docente.
- Filtros por área: **TI & Software**, **Indústria 4.0 & Robótica**, **Energia & Elétrica**, **Capacitação Docente**, **Gestão & Power BI**, **Mecânica CNC**.
- Botões de seleção rápida: **Combo Novo Ensino Médio**, **Combo Formação Docente**, **Selecionar Todos**.
- Modal de ementa detalhada com competências desenvolvidas e benefícios para a rede pública.

### 2. 🏛️ Gestão de Secretarias de Educação Destinatárias
- Base com órgãos cadastrados: **SEDUC-SP**, **SME São Paulo**, **SEED-PR**, **SME Curitiba**, **SEE-MG**, **SME Campinas**, **SME Ribeirão Preto**.
- Cadastro dinâmico de **Novas Secretarias** com persistência automática no navegador.
- Preenchimento inteligente do nome do(a) Secretário(a), e-mail institucional oficial, cidade, estado e porte da rede.

### 3. 🤖 Redação de Propostas com IA (Agente Anai-Ribeiro)
- Conexão nativa com o agente **Anai-Ribeiro** via **Azure AI Projects SDK**.
- A IA analisa os cursos marcados, o órgão público e a cidade destinatária, redigindo:
  - **Linha de Assunto Institucional** personalizada e persuasiva.
  - **Saudação formal** e respeitosa aos gestores públicos.
  - **Justificativa pedagógica** alinhada ao IDEB, combate à evasão e BNCC.
  - **Impacto dos laboratórios de ponta do SENAI** na empregabilidade dos jovens.
  - **Chamada para ação (CTA)** para celebração de Acordo de Cooperação Técnica.

### 4. ✉️ Live Preview do E-mail Responsivo (Outlook / Gmail)
- Renderização visual em tempo real do e-mail com a identidade oficial do SENAI:
  - Cabeçalho institucional e banner oficial de alta tecnologia.
  - Protocolo de cooperação técnica e data automática.
  - Cards individuais de cada curso selecionado (com carga horária, modalidade e competências).
  - Caixa de benefícios da gratuidade regimental / parceria pública.
  - Botões interativos ("Agendar Reunião Técnica", "Solicitar Minuta de Convênio").
  - Assinatura com contatos da coordenação SENAI.
- **Alternador de Visualização**:
  - 🖥️ **Desktop** (formato tela ampla de e-mail corporativo)
  - 📱 **Mobile** (moldura responsiva de smartphone)
  - 💻 **Código HTML** (com estilos inline compatíveis com todos os clientes de e-mail)

### 5. 📤 Disparo e Compartilhamento Flexível
- 📋 **Copiar E-mail Formatado (Rich Text)**: Permite colar diretamente dentro do Gmail, Outlook Web ou Outlook Desktop mantendo todas as cores, tabelas, imagens e botões intactos!
- ✉️ **Abrir no Outlook / E-mail (`mailto:`)**: Inicia o programa padrão de e-mail com destinatário e assunto preenchidos.
- 🚀 **Enviar via Servidor SENAI (SMTP / API)**: Dispara o e-mail pelo servidor Python. Caso não configure SMTP, gera o protocolo simulado oficial com registro de log.
- 💾 **Baixar HTML**: Exporta o arquivo `.html` pronto para arquivamento ou mala direta.
- 📋 **Histórico de Envios**: Registra e audita todos os disparos realizados.

---

## 📁 Estrutura do Projeto

- [`index.html`](file:///c:/Users/09717590818/Desktop/projeto%20agente/index.html): Estrutura semântica da página web.
- [`styles.css`](file:///c:/Users/09717590818/Desktop/projeto%20agente/styles.css): Estilos Vanilla CSS com paleta SENAI, dark/light mode e componentes glassmorphism.
- [`app.js`](file:///c:/Users/09717590818/Desktop/projeto%20agente/app.js): Lógica de estado, IA Copilot, preview ao vivo e cópia rica.
- [`server.py`](file:///c:/Users/09717590818/Desktop/projeto%20agente/server.py): Backend Python com rotas para o Azure AI Agent e disparo de e-mails.
- [`agente.py`](file:///c:/Users/09717590818/Desktop/projeto%20agente/agente.py): Script de referência da conexão Azure AI Projects.
- [`courses.json`](file:///c:/Users/09717590818/Desktop/projeto%20agente/courses.json): Catálogo de cursos técnicos e de qualificação.
- [`secretarias.json`](file:///c:/Users/09717590818/Desktop/projeto%20agente/secretarias.json): Base inicial de Secretarias de Educação.
- `assets/banner_senai.jpg`: Banner de alta definição dos laboratórios e alunos do SENAI.
