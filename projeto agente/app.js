/**
 * SENAI Conecta Educação - Frontend Logic (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    courses: [],
    secretarias: [],
    selectedCourseIds: new Set(),
    activeCategory: 'todos',
    searchQuery: '',
    selectedSecretariaId: null,
    viewMode: 'desktop', // 'desktop', 'mobile', 'code'
    generatedProposal: {
      assunto: 'Proposta de Parceria SENAI: Qualificação Técnica e Inovação para Estudantes da Rede Pública',
      introducao: '',
      justificativa: '',
      impacto: '',
      encerramento: ''
    },
    smtpConfig: {
      host: '',
      port: 587,
      user: '',
      pass: ''
    },
    history: []
  };

  // DOM Elements
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const coursesGridContainer = document.getElementById('courses-grid-container');
  const courseSearchInput = document.getElementById('course-search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const categoryChipsContainer = document.getElementById('category-chips-container');
  
  const secPresetSelect = document.getElementById('sec-preset-select');
  const secOrgaoInput = document.getElementById('sec-orgao');
  const secSecretarioInput = document.getElementById('sec-secretario');
  const secTratamentoSelect = document.getElementById('sec-tratamento');
  const secEmailInput = document.getElementById('sec-email');
  const secCidadeInput = document.getElementById('sec-cidade');
  const secEstadoInput = document.getElementById('sec-estado');
  const secPorteInput = document.getElementById('sec-porte');

  const focoPropostaSelect = document.getElementById('foco-proposta');
  const tomPropostaSelect = document.getElementById('tom-proposta');
  const remetenteUnidadeInput = document.getElementById('remetente-unidade');
  const remetenteResponsavelInput = document.getElementById('remetente-responsavel');
  const remetenteCargoInput = document.getElementById('remetente-cargo');
  const remetenteContatoInput = document.getElementById('remetente-contato');

  const btnGenerateAi = document.getElementById('btn-generate-ai');
  const aiStatusMsg = document.getElementById('ai-status-message');

  const emailSubjectInput = document.getElementById('email-subject-input');
  const previewMockTo = document.getElementById('preview-mock-to');
  const emailPreviewIframe = document.getElementById('email-preview-iframe');
  const emailViewportFrame = document.getElementById('email-viewport-frame');
  const emailCodeContainer = document.getElementById('email-code-container');
  const emailHtmlRaw = document.getElementById('email-html-raw');

  const viewDesktopBtn = document.getElementById('view-desktop-btn');
  const viewMobileBtn = document.getElementById('view-mobile-btn');
  const viewCodeBtn = document.getElementById('view-code-btn');

  const btnCopyFormatted = document.getElementById('btn-copy-formatted-email');
  const btnOpenMailto = document.getElementById('btn-open-mailto');
  const btnSendViaServer = document.getElementById('btn-send-via-server');
  const btnDownloadHtml = document.getElementById('btn-download-html');
  const btnCopyCodeDirect = document.getElementById('btn-copy-code-direct');

  // Stats Elements
  const statCoursesCount = document.getElementById('stat-courses-count');
  const statSelectedCount = document.getElementById('stat-selected-count');
  const statSecretariasCount = document.getElementById('stat-secretarias-count');
  const selectedBadgeText = document.getElementById('selected-badge-text');
  const historyCounter = document.getElementById('history-counter');

  // Quick select buttons
  const btnSelectAll = document.getElementById('btn-select-all-courses');
  const btnSelectNem = document.getElementById('btn-select-nem-courses');
  const btnSelectDocente = document.getElementById('btn-select-docente-courses');
  const btnDeselectAll = document.getElementById('btn-deselect-all-courses');

  // Modals
  const modalNewSec = document.getElementById('modal-new-sec');
  const btnAddCustomSec = document.getElementById('btn-add-custom-sec');
  const btnCloseSecModal = document.getElementById('btn-close-sec-modal');
  const btnCancelNewSec = document.getElementById('btn-cancel-new-sec');
  const btnSaveNewSec = document.getElementById('btn-save-new-sec');

  const modalSmtp = document.getElementById('modal-smtp');
  const btnOpenSmtpModal = document.getElementById('btn-open-smtp-modal');
  const btnCloseSmtpModal = document.getElementById('btn-close-smtp-modal');
  const btnCancelSmtp = document.getElementById('btn-cancel-smtp');
  const btnSaveSmtp = document.getElementById('btn-save-smtp');
  const smtpHostInput = document.getElementById('smtp-host');
  const smtpPortInput = document.getElementById('smtp-port');
  const smtpUserInput = document.getElementById('smtp-user');
  const smtpPassInput = document.getElementById('smtp-pass');

  const modalHistory = document.getElementById('modal-history');
  const btnOpenHistoryModal = document.getElementById('btn-open-history-modal');
  const btnCloseHistoryModal = document.getElementById('btn-close-history-modal');
  const btnCloseHistoryFooter = document.getElementById('btn-close-history-footer');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const historyTableBody = document.getElementById('history-table-body');
  const historyEmptyState = document.getElementById('history-empty-state');
  const historyTableWrapper = document.getElementById('history-table-wrapper');

  const modalCourseDetails = document.getElementById('modal-course-details');
  const btnCloseCourseModal = document.getElementById('btn-close-course-modal');
  const btnCloseCourseFooter = document.getElementById('btn-close-course-footer');
  const btnToggleCourseFromModal = document.getElementById('btn-toggle-course-from-modal');
  let currentViewingCourseId = null;

  // Initialize
  initApp();

  async function initApp() {
    loadSavedPreferences();
    setupEventListeners();
    await checkServerStatus();
    await loadCourses();
    await loadSecretarias();
    
    // Select first 2 courses by default so preview is attractive immediately
    if (state.courses.length >= 2) {
      state.selectedCourseIds.add(state.courses[0].id);
      state.selectedCourseIds.add(state.courses[1].id);
    }
    updateCourseSelectionUI();
    updateLiveEmailPreview();
  }

  // Theme Management
  function loadSavedPreferences() {
    const savedTheme = localStorage.getItem('senai_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedSmtp = localStorage.getItem('senai_smtp');
    if (savedSmtp) {
      try {
        state.smtpConfig = JSON.parse(savedSmtp);
        smtpHostInput.value = state.smtpConfig.host || '';
        smtpPortInput.value = state.smtpConfig.port || 587;
        smtpUserInput.value = state.smtpConfig.user || '';
        smtpPassInput.value = state.smtpConfig.pass || '';
      } catch (e) {
        console.error('Error loading SMTP settings', e);
      }
    }

    const savedHistory = localStorage.getItem('senai_history');
    if (savedHistory) {
      try {
        state.history = JSON.parse(savedHistory);
        updateHistoryCounter();
      } catch (e) {
        console.error('Error loading history', e);
      }
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('senai_theme', newTheme);
    showToast(`Modo ${newTheme === 'dark' ? 'Escuro' : 'Claro'} ativado`, 'info');
  }

  // Check Backend and Azure Agent
  async function checkServerStatus() {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        const badge = document.getElementById('agent-status-badge');
        if (badge && data.agent_name) {
          badge.querySelector('.agent-name').innerHTML = `Agente IA: <strong>${data.agent_name}</strong>`;
        }
      }
    } catch (e) {
      console.warn('Backend server not detected or offline. Running client-side mode.', e);
    }
  }

  // Load Data
  async function loadCourses() {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        state.courses = await res.json();
      } else {
        throw new Error('Fallback to local file');
      }
    } catch (e) {
      // Direct file fetch
      try {
        const localRes = await fetch('courses.json');
        state.courses = await localRes.json();
      } catch (err) {
        console.error('Failed to load courses', err);
      }
    }

    statCoursesCount.textContent = state.courses.length;
    renderCoursesGrid();
  }

  async function loadSecretarias() {
    try {
      const res = await fetch('/api/secretarias');
      if (res.ok) {
        state.secretarias = await res.json();
      } else {
        throw new Error('Fallback to local file');
      }
    } catch (e) {
      try {
        const localRes = await fetch('secretarias.json');
        state.secretarias = await localRes.json();
      } catch (err) {
        console.error('Failed to load secretarias', err);
      }
    }

    // Merge with any custom secretarias saved in localStorage
    const customSecs = JSON.parse(localStorage.getItem('senai_custom_secretarias') || '[]');
    state.secretarias = [...state.secretarias, ...customSecs];

    statSecretariasCount.textContent = state.secretarias.length;
    populateSecretariasDropdown();
  }

  function populateSecretariasDropdown() {
    secPresetSelect.innerHTML = '<option value="">-- Selecione uma Secretaria da Base --</option>';
    state.secretarias.forEach(sec => {
      const opt = document.createElement('option');
      opt.value = sec.id;
      opt.textContent = `${sec.orgao} (${sec.cidade}/${sec.estado}) - ${sec.secretario}`;
      secPresetSelect.appendChild(opt);
    });

    // Select the first one by default
    if (state.secretarias.length > 0) {
      secPresetSelect.value = state.secretarias[0].id;
      selectSecretaria(state.secretarias[0]);
    }
  }

  function selectSecretaria(sec) {
    state.selectedSecretariaId = sec.id;
    secOrgaoInput.value = sec.orgao || '';
    secSecretarioInput.value = sec.secretario || '';
    secTratamentoSelect.value = sec.tratamento || 'Prezado(a) Secretário(a)';
    secEmailInput.value = sec.email || '';
    secCidadeInput.value = sec.cidade || '';
    secEstadoInput.value = sec.estado || '';
    secPorteInput.value = sec.porte || '';

    previewMockTo.textContent = sec.email || 'educacao@municipio.gov.br';
    updateLiveEmailPreview();
  }

  // Render Courses
  function renderCoursesGrid() {
    coursesGridContainer.innerHTML = '';

    const filtered = state.courses.filter(course => {
      // Category filter
      const matchCategory = state.activeCategory === 'todos' || course.area === state.activeCategory;
      // Search query
      const q = state.searchQuery.toLowerCase();
      const matchSearch = !q || 
        course.titulo.toLowerCase().includes(q) ||
        course.area.toLowerCase().includes(q) ||
        course.descricao.toLowerCase().includes(q) ||
        (course.competencias && course.competencias.some(c => c.toLowerCase().includes(q)));
      return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
      coursesGridContainer.innerHTML = `
        <div class="empty-state">
          <span>🔍</span>
          <p>Nenhum curso encontrado para o termo pesquisado.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(course => {
      const isSelected = state.selectedCourseIds.has(course.id);
      const card = document.createElement('div');
      card.className = `course-card ${isSelected ? 'selected' : ''}`;
      card.id = `course-card-${course.id}`;

      card.innerHTML = `
        <div class="course-card-top">
          <div class="course-icon-title">
            <span class="course-icon">${course.icone || '📘'}</span>
            <div class="course-header-text">
              <span class="course-area-tag">${course.area}</span>
              <h4 class="course-title">${course.titulo}</h4>
            </div>
          </div>
          ${course.badge ? `<span class="course-badge-pill">${course.badge}</span>` : ''}
        </div>

        <div class="course-meta-tags">
          <span class="meta-tag">⏱️ ${course.cargaHoraria}</span>
          <span class="meta-tag">📍 ${course.modalidade}</span>
          <span class="meta-tag">🎯 ${course.nivel}</span>
        </div>

        <p class="course-desc">${course.descricao}</p>

        <div class="course-card-bottom">
          <button type="button" class="btn-select-course" data-id="${course.id}">
            ${isSelected ? '✓ Selecionado' : '+ Adicionar à Proposta'}
          </button>
          <button type="button" class="btn-details" data-id="${course.id}">
            Ver Ementa Detalhada
          </button>
        </div>
      `;

      // Event listener for toggle button
      card.querySelector('.btn-select-course').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCourseSelection(course.id);
      });

      // Event listener for details modal
      card.querySelector('.btn-details').addEventListener('click', (e) => {
        e.stopPropagation();
        openCourseModal(course);
      });

      // Card click toggles as well
      card.addEventListener('click', () => {
        toggleCourseSelection(course.id);
      });

      coursesGridContainer.appendChild(card);
    });
  }

  function toggleCourseSelection(courseId) {
    if (state.selectedCourseIds.has(courseId)) {
      state.selectedCourseIds.delete(courseId);
    } else {
      state.selectedCourseIds.add(courseId);
    }
    updateCourseSelectionUI();
    updateLiveEmailPreview();
  }

  function updateCourseSelectionUI() {
    const count = state.selectedCourseIds.size;
    statSelectedCount.textContent = count;
    
    if (count === 0) {
      selectedBadgeText.textContent = 'Nenhum selecionado';
    } else if (count === 1) {
      selectedBadgeText.textContent = '1 curso selecionado';
    } else {
      selectedBadgeText.textContent = `${count} cursos selecionados`;
    }

    // Update classes on cards
    state.courses.forEach(c => {
      const card = document.getElementById(`course-card-${c.id}`);
      if (card) {
        const isSel = state.selectedCourseIds.has(c.id);
        card.classList.toggle('selected', isSel);
        const btn = card.querySelector('.btn-select-course');
        if (btn) {
          btn.textContent = isSel ? '✓ Selecionado' : '+ Adicionar à Proposta';
        }
      }
    });
  }

  // Quick Select Presets
  function selectAllCourses() {
    state.courses.forEach(c => state.selectedCourseIds.add(c.id));
    updateCourseSelectionUI();
    updateLiveEmailPreview();
    showToast(`${state.courses.length} cursos selecionados!`, 'info');
  }

  function deselectAllCourses() {
    state.selectedCourseIds.clear();
    updateCourseSelectionUI();
    updateLiveEmailPreview();
    showToast('Seleção limpa.', 'info');
  }

  function selectNemCourses() {
    state.selectedCourseIds.clear();
    state.courses.forEach(c => {
      if (c.nivel && c.nivel.includes('Novo Ensino Médio')) {
        state.selectedCourseIds.add(c.id);
      }
    });
    updateCourseSelectionUI();
    updateLiveEmailPreview();
    showToast('Cursos alinhados ao Novo Ensino Médio selecionados!', 'info');
  }

  function selectDocenteCourses() {
    state.selectedCourseIds.clear();
    state.courses.forEach(c => {
      if (c.area && c.area.includes('Professores')) {
        state.selectedCourseIds.add(c.id);
      }
    });
    updateCourseSelectionUI();
    updateLiveEmailPreview();
    showToast('Cursos de Formação Docente selecionados!', 'info');
  }

  // Course Details Modal
  function openCourseModal(course) {
    currentViewingCourseId = course.id;
    document.getElementById('modal-course-area').textContent = course.area;
    document.getElementById('modal-course-title').textContent = course.titulo;

    const isSel = state.selectedCourseIds.has(course.id);
    btnToggleCourseFromModal.textContent = isSel ? 'Remover da Divulgação' : 'Adicionar à Divulgação';
    btnToggleCourseFromModal.className = isSel ? 'btn-subtle text-danger' : 'btn-primary';

    const competenciesHtml = (course.competencias || []).map(comp => `
      <li style="margin-bottom: 0.35rem; color: var(--text-secondary);">✓ ${comp}</li>
    `).join('');

    document.getElementById('modal-course-body').innerHTML = `
      <div style="background: var(--bg-elevated); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
        <p style="margin-bottom: 0.5rem;"><strong>Carga Horária:</strong> ${course.cargaHoraria} | <strong>Modalidade:</strong> ${course.modalidade}</p>
        <p style="margin-bottom: 0.5rem;"><strong>Público-Alvo:</strong> ${course.publico}</p>
        <p style="margin-bottom: 0.5rem;"><strong>Alinhamento:</strong> ${course.alinhamento}</p>
        <p><strong>Descrição:</strong> ${course.descricao}</p>
      </div>

      <div>
        <h5 style="margin-bottom: 0.5rem; color: var(--senai-cyan-400);">Competências e Habilidades Desenvolvidas:</h5>
        <ul style="list-style: none; padding-left: 0.5rem;">
          ${competenciesHtml}
        </ul>
      </div>

      <div style="margin-top: 1rem; padding: 0.85rem; background: rgba(0, 180, 216, 0.08); border-left: 3px solid var(--senai-cyan-400); border-radius: 4px;">
        <strong style="color: var(--text-primary); font-size: 0.85rem;">Benefício para a Rede Municipal/Estadual:</strong>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">${course.beneficioSecretaria || 'Capacitação técnica de excelência com padrão industrial nacional.'}</p>
      </div>
    `;

    modalCourseDetails.style.display = 'flex';
  }

  // AI Proposal Generation
  async function generateAiProposal() {
    if (state.selectedCourseIds.size === 0) {
      showToast('Por favor, selecione ao menos um curso na Etapa 1 antes de gerar a proposta!', 'error');
      return;
    }

    const selectedCourses = state.courses.filter(c => state.selectedCourseIds.has(c.id));
    const payload = {
      secretaria: {
        orgao: secOrgaoInput.value.trim() || 'Secretaria de Educação',
        secretario: secSecretarioInput.value.trim() || 'Secretário(a) de Educação',
        tratamento: secTratamentoSelect.value,
        email: secEmailInput.value.trim(),
        cidade: secCidadeInput.value.trim() || 'Município',
        estado: secEstadoInput.value.trim() || 'UF',
        porte: secPorteInput.value.trim()
      },
      cursos: selectedCourses,
      foco: focoPropostaSelect.value,
      tom: tomPropostaSelect.value,
      remetente: {
        unidade: remetenteUnidadeInput.value.trim(),
        responsavel: remetenteResponsavelInput.value.trim(),
        cargo: remetenteCargoInput.value.trim(),
        contato: remetenteContatoInput.value.trim()
      }
    };

    // UI Loading state
    btnGenerateAi.disabled = true;
    btnGenerateAi.querySelector('.btn-ai-text').textContent = 'Anai-Ribeiro redigindo proposta...';
    btnGenerateAi.querySelector('.btn-ai-spinner').style.display = 'inline-block';
    btnGenerateAi.querySelector('.btn-ai-icon').style.display = 'none';

    aiStatusMsg.style.display = 'block';
    aiStatusMsg.innerHTML = '⚡ Conectando ao agente <strong>Anai-Ribeiro</strong> via Azure AI Projects... Analisando demandas educacionais do município...';

    try {
      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('API server returned error');

      const data = await response.json();
      state.generatedProposal = data;

      if (data.assunto) {
        emailSubjectInput.value = data.assunto;
      }

      const sourceInfo = data.source === 'anai_ribeiro_agent' 
        ? '✨ Proposta elaborada com inteligência artificial pelo agente <strong>Anai-Ribeiro</strong> (Azure AI)!'
        : '✨ Proposta institucional estruturada com sucesso!';

      aiStatusMsg.innerHTML = sourceInfo;
      showToast('Proposta gerada com sucesso pela IA!', 'success');

    } catch (err) {
      console.warn('Backend API request failed, executing client-side intelligent fallback', err);
      // Client-side fallback
      const fallbackData = buildClientSideProposal(payload);
      state.generatedProposal = fallbackData;
      emailSubjectInput.value = fallbackData.assunto;

      aiStatusMsg.innerHTML = '✨ Proposta institucional personalizada estruturada com sucesso (Modo Standalone)!';
      showToast('Proposta institucional personalizada gerada!', 'success');
    } finally {
      btnGenerateAi.disabled = false;
      btnGenerateAi.querySelector('.btn-ai-text').textContent = 'Gerar Proposta com IA';
      btnGenerateAi.querySelector('.btn-ai-spinner').style.display = 'none';
      btnGenerateAi.querySelector('.btn-ai-icon').style.display = 'inline-block';
      updateLiveEmailPreview();
    }
  }

  function buildClientSideProposal(p) {
    const sec = p.secretaria;
    const foco = p.foco;
    const rem = p.remetente;
    const cursos = p.cursos;

    let assunto = `Proposta de Parceria SENAI & ${sec.orgao}: Qualificação Profissional para Estudantes de ${sec.cidade}`;
    if (foco.includes('Docente')) {
      assunto = `Parceria Educacional SENAI & ${sec.orgao}: Capacitação Docente em Robótica, STEAM e IA`;
    } else if (foco.includes('Ensino Médio')) {
      assunto = `Acordo de Cooperação Técnica: Itinerários de Formação Técnica SENAI para a Rede Municipal/Estadual`;
    }

    const intro = `Cumprimentando-o(a) cordialmente, o ${rem.unidade} tem a satisfação de submeter a Vossa Senhoria uma proposta de cooperação educacional direcionada a elevar as oportunidades de formação tecnológica dos alunos e professores vinculados à ${sec.orgao}.`;

    const justificativa = `Diante das diretrizes educacionais contemporâneas e das crescentes exigências do setor produtivo e da Indústria 4.0, estruturamos uma oferta formativa sob medida com ${cursos.length} curso(s) de alta relevância, unindo teoria aplicada, laboratórios de padrão internacional e certificação de peso nacional.`;

    const impacto = `Com foco em ${foco}, os cursos selecionados permitirão aos estudantes da rede pública de ${sec.cidade}/${sec.estado} desenvolver competências práticas imediatas, estimulando a permanência escolar, a redução da evasão e a inserção imediata no mercado formal de trabalho e programas de Jovem Aprendiz.`;

    const encerramento = `Colocamo-nos à inteira disposição para o agendamento de uma visita técnica aos nossos laboratórios ou uma reunião institucional para a formalização do Acordo de Cooperação Técnica sem custos de matrícula para a rede pública.`;

    return {
      assunto,
      introducao: intro,
      justificativa: justificativa,
      impacto: impacto,
      encerramento: encerramento,
      source: 'client_generator'
    };
  }

  // HTML Email Builder with Inline CSS
  function buildResponsiveEmailHtml() {
    const selectedCourses = state.courses.filter(c => state.selectedCourseIds.has(c.id));
    const secOrgao = secOrgaoInput.value.trim() || 'Secretaria de Educação';
    const secSecretario = secSecretarioInput.value.trim() || 'Secretário(a) de Educação';
    const secTratamento = secTratamentoSelect.value;
    const secCidade = secCidadeInput.value.trim() || 'Município';
    const secEstado = secEstadoInput.value.trim() || 'UF';

    const remUnidade = remetenteUnidadeInput.value.trim() || 'Escola SENAI';
    const remResponsavel = remetenteResponsavelInput.value.trim() || 'Gestão de Parcerias SENAI';
    const remCargo = remetenteCargoInput.value.trim() || 'Coordenação de Educação Profissional';
    const remContato = remetenteContatoInput.value.trim() || 'contato@senai.br';

    const p = state.generatedProposal;
    const introText = p.introducao || `O ${remUnidade} apresenta a ${secOrgao} uma proposta estratégica de integração educacional e tecnológica.`;
    const justifText = p.justificativa || `Nossos cursos foram desenvolvidos para integrar a formação básica dos estudantes ao itinerário de qualificação profissional exigido pela Indústria 4.0.`;
    const impactoText = p.impacto || `Garantimos o acesso a infraestrutura de laboratórios de robótica, informática e automação com suporte pedagógico integral.`;
    const encerramentoText = p.encerramento || `Ficamos no aguardo de sua manifestação para agendarmos uma apresentação formal da matriz curricular e cronograma de vagas.`;

    const todayDate = new Date().toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Build Courses Table / Cards HTML
    let coursesHtml = '';
    if (selectedCourses.length === 0) {
      coursesHtml = `
        <div style="background-color: #f1f5f9; padding: 25px; text-align: center; border-radius: 8px; border: 1px dashed #cbd5e1; margin: 20px 0;">
          <p style="color: #64748b; margin: 0; font-size: 14px;">Nenhum curso foi selecionado na Etapa 1. Selecione cursos no catálogo para exibi-los aqui.</p>
        </div>
      `;
    } else {
      coursesHtml = selectedCourses.map(course => `
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 5px solid #004785; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; margin-bottom: 6px;">
                  ${course.area}
                </span>
                <h3 style="margin: 4px 0 10px 0; color: #003366; font-size: 17px; font-weight: bold;">
                  ${course.icone || '📘'} ${course.titulo}
                </h3>
              </td>
              ${course.badge ? `
              <td align="right" valign="top">
                <span style="display: inline-block; background-color: #fee2e2; color: #dc2626; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px;">
                  ${course.badge}
                </span>
              </td>` : ''}
            </tr>
          </table>

          <div style="margin: 8px 0; font-size: 13px; color: #475569;">
            <span style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px; margin-right: 6px; margin-bottom: 4px;">
              ⏱️ <strong>Carga:</strong> ${course.cargaHoraria}
            </span>
            <span style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px; margin-right: 6px; margin-bottom: 4px;">
              📍 <strong>Modalidade:</strong> ${course.modalidade}
            </span>
            <span style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px; margin-bottom: 4px;">
              🎯 <strong>Público:</strong> ${course.publico}
            </span>
          </div>

          <p style="margin: 10px 0; color: #334155; font-size: 13.5px; line-height: 1.5;">
            ${course.descricao}
          </p>

          <div style="background-color: #f8fafc; border-radius: 6px; padding: 10px 12px; margin-top: 10px;">
            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #004785; text-transform: uppercase;">
              Principais Competências Desenvolvidas:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${(course.competencias || []).map(comp => `
                <tr>
                  <td width="20" valign="top" style="color: #10b981; font-weight: bold; font-size: 13px; padding-bottom: 3px;">✓</td>
                  <td style="color: #475569; font-size: 12.5px; padding-bottom: 3px;">${comp}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        </div>
      `).join('');
    }

    // Complete Email Template
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Divulgação de Cursos SENAI - ${secOrgao}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Email Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6fa; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="650" cellpadding="0" cellspacing="0" border="0" style="max-width: 650px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Institutional Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #002f5d 0%, #004785 100%); padding: 24px 30px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <!-- Stylized SENAI Logo -->
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #004785; padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3);">
                          <span style="font-family: Arial, Helvetica, sans-serif; font-weight: 900; font-size: 20px; color: #ffffff; letter-spacing: 1.5px;">SENAI</span>
                        </td>
                        <td style="padding-left: 14px;">
                          <div style="color: #38bdf8; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">FUTURO DO TRABALHO & EDUCAÇÃO</div>
                          <div style="color: #ffffff; font-size: 16px; font-weight: bold; margin-top: 2px;">Serviço Nacional de Aprendizagem Industrial</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span style="background-color: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: #ffffff; font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: bold;">
                      Parceria Institucional
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner Image -->
          <tr>
            <td style="padding: 0; background-color: #001f3f;">
              <img src="assets/banner_senai.jpg" alt="Educação Profissional e Tecnológica SENAI" width="650" style="display: block; width: 100%; max-width: 650px; height: auto;" border="0">
            </td>
          </tr>

          <!-- Document Protocol Header -->
          <tr>
            <td style="background-color: #f8fafc; padding: 14px 30px; border-bottom: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; color: #64748b;">
                <tr>
                  <td>
                    <strong>Protocolo de Cooperação:</strong> ACT-SENAI/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}
                  </td>
                  <td align="right">
                    ${secCidade} - ${secEstado}, ${todayDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px 35px; color: #1e293b;">
              
              <!-- Salutation -->
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a; font-weight: bold;">
                Ao(À) ${secTratamento},<br>
                <span style="font-size: 17px; color: #004785;">${secSecretario}</span><br>
                <span style="font-size: 13px; color: #64748b; font-weight: normal;">${secOrgao} | Município de ${secCidade}/${secEstado}</span>
              </p>

              <!-- Opening Rationale -->
              <p style="font-size: 14.5px; line-height: 1.65; color: #334155; margin-bottom: 14px;">
                ${introText}
              </p>

              <p style="font-size: 14.5px; line-height: 1.65; color: #334155; margin-bottom: 14px;">
                ${justifText}
              </p>

              <p style="font-size: 14.5px; line-height: 1.65; color: #334155; margin-bottom: 24px;">
                ${impactoText}
              </p>

              <!-- Section Heading: Courses -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="border-bottom: 2px solid #004785; padding-bottom: 8px;">
                    <h2 style="margin: 0; font-size: 16px; color: #004785; text-transform: uppercase; letter-spacing: 0.5px;">
                      📚 Cursos Oferecidos para a Rede Pública (${selectedCourses.length})
                    </h2>
                  </td>
                </tr>
              </table>

              <!-- Courses List -->
              ${coursesHtml}

              <!-- Highlights / Partnership Benefits Box -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="30" valign="top">
                      <span style="font-size: 22px;">🏛️</span>
                    </td>
                    <td style="padding-left: 12px;">
                      <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 14px; font-weight: bold;">
                        Benefícios do Acordo de Cooperação Técnica com o SENAI:
                      </h4>
                      <ul style="margin: 0; padding-left: 18px; color: #15803d; font-size: 13px; line-height: 1.6;">
                        <li><strong>Vagas Gratuitas:</strong> Possibilidade de enquadramento em Gratuidade Regimental e FIES Técnico;</li>
                        <li><strong>Infraestrutura Industrial:</strong> Aulas práticas em maquinário e softwares idênticos aos da indústria de ponta;</li>
                        <li><strong>Certificação Reconhecida:</strong> Diploma SENAI com aceitação de 100% no mercado nacional;</li>
                        <li><strong>Apoio à Evasão Escolar:</strong> Estímulo direto ao protagonismo juvenil e aumento nos índices de permanência.</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Closing -->
              <p style="font-size: 14.5px; line-height: 1.65; color: #334155; margin-bottom: 24px;">
                ${encerramentoText}
              </p>

              <!-- Call to Action Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0 20px 0;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="background: linear-gradient(135deg, #004785 0%, #0066b2 100%); border-radius: 6px; padding: 12px 24px;">
                          <a href="mailto:${remContato}?subject=Resposta%20Proposta%20SENAI%20-%20${encodeURIComponent(secOrgao)}" style="color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">
                            📅 Agendar Reunião Técnica de Parceria
                          </a>
                        </td>
                        <td width="15"></td>
                        <td align="center" style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 20px;">
                          <a href="mailto:${remContato}?subject=Solicitacao%20Minuta%20Convenio%20SENAI%20-${encodeURIComponent(secOrgao)}" style="color: #0f172a; text-decoration: none; font-size: 13.5px; font-weight: 600; display: inline-block;">
                            📄 Solicitar Minuta de Convênio
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Institutional Signature -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="top">
                      <p style="margin: 0; font-size: 14px; font-weight: bold; color: #003366;">
                        ${remResponsavel}
                      </p>
                      <p style="margin: 2px 0 0 0; font-size: 12.5px; color: #64748b;">
                        ${remCargo}
                      </p>
                      <p style="margin: 2px 0 0 0; font-size: 12.5px; color: #004785; font-weight: 500;">
                        ${remUnidade}
                      </p>
                      <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">
                        📞 ${remContato}
                      </p>
                    </td>
                    <td align="right" valign="bottom">
                      <span style="font-size: 11px; color: #94a3b8;">
                        SENAI - Pelo Futuro do Trabalho
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Institutional Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 30px; text-align: center; color: #94a3b8; font-size: 11.5px; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; color: #f8fafc; font-weight: 600;">
                SERVIÇO NACIONAL DE APRENDIZAGEM INDUSTRIAL - DEPARTAMENTO REGIONAL
              </p>
              <p style="margin: 0 0 10px 0;">
                Este e-mail institucional é um instrumento oficial de diálogo público entre o SENAI e Secretarias de Educação. Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
              <p style="margin: 0; font-size: 10.5px; color: #64748b;">
                © ${new Date().getFullYear()} SENAI Educação Profissional. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  // Update Live Preview Screen
  function updateLiveEmailPreview() {
    const html = buildResponsiveEmailHtml();

    // Update iframe using blob URL or doc
    const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    emailPreviewIframe.src = url;

    // Update raw HTML code container
    emailHtmlRaw.value = html;

    // Update Subject Mockup
    if (emailSubjectInput.value.trim() === '') {
      emailSubjectInput.value = state.generatedProposal.assunto;
    }
  }

  // View Mode Switcher
  function setViewMode(mode) {
    state.viewMode = mode;
    viewDesktopBtn.classList.toggle('active', mode === 'desktop');
    viewMobileBtn.classList.toggle('active', mode === 'mobile');
    viewCodeBtn.classList.toggle('active', mode === 'code');

    if (mode === 'desktop') {
      emailViewportFrame.style.display = 'block';
      emailViewportFrame.className = 'email-viewport-frame mode-desktop';
      emailCodeContainer.style.display = 'none';
    } else if (mode === 'mobile') {
      emailViewportFrame.style.display = 'block';
      emailViewportFrame.className = 'email-viewport-frame mode-mobile';
      emailCodeContainer.style.display = 'none';
    } else if (mode === 'code') {
      emailViewportFrame.style.display = 'none';
      emailCodeContainer.style.display = 'flex';
    }
  }

  // Action: Copy Formatted Rich Email
  async function copyFormattedEmail() {
    const html = buildResponsiveEmailHtml();
    const plainText = extractPlainTextFromHtml(html);

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const textBlob = new Blob([plainText], { type: 'text/plain' });
        const htmlBlob = new Blob([html], { type: 'text/html' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': textBlob,
            'text/html': htmlBlob
          })
        ]);
        showToast('E-mail formatado copiado! Cole direto no Outlook ou Gmail mantendo o design.', 'success');
      } else {
        // Fallback to text copy
        await navigator.clipboard.writeText(html);
        showToast('Código HTML copiado para a área de transferência!', 'info');
      }
    } catch (err) {
      console.error('Clipboard copy error', err);
      // Fallback
      fallbackCopyText(html);
    }
  }

  function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Copiado com sucesso!', 'info');
  }

  function extractPlainTextFromHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.innerText || div.textContent || '';
  }

  // Action: Open in Native Email Client (mailto)
  function openMailtoClient() {
    const to = secEmailInput.value.trim() || 'secretaria@educacao.gov.br';
    const subject = emailSubjectInput.value.trim() || 'Proposta de Parceria SENAI';
    const html = buildResponsiveEmailHtml();
    const plain = extractPlainTextFromHtml(html);

    // Limit plain text for mailto URL safety
    const safeBody = encodeURIComponent(plain.substring(0, 1800) + '\n\n[Consulte o anexo/versão HTML para a formatação oficial com logotipos]');
    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${safeBody}`;
    
    window.location.href = mailtoUrl;
    logDispatch('Cliente de E-mail (mailto)', to, subject);
    showToast('Abrindo seu programa de e-mail local (Outlook / Thunderbird)...', 'info');
  }

  // Action: Send via Python Backend Server (SMTP or Simulated)
  async function sendViaServer() {
    const to = secEmailInput.value.trim();
    if (!to) {
      showToast('Por favor, informe o e-mail de destino da Secretaria!', 'error');
      secEmailInput.focus();
      return;
    }

    const subject = emailSubjectInput.value.trim() || 'Proposta de Parceria SENAI';
    const htmlContent = buildResponsiveEmailHtml();

    btnSendViaServer.disabled = true;
    btnSendViaServer.textContent = 'Enviando...';

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          htmlContent,
          smtpConfig: state.smtpConfig
        })
      });

      const data = await res.json();
      if (data.success) {
        logDispatch(data.mode === 'smtp_live' ? 'SMTP Live' : 'Servidor SENAI (Protocolado)', to, subject);
        showToast(data.message || `E-mail enviado com sucesso para ${to}!`, 'success');
      } else {
        showToast(`Erro no envio: ${data.error || 'Falha de comunicação'}`, 'error');
      }
    } catch (err) {
      // Offline simulation fallback
      logDispatch('Simulado (Standalone)', to, subject);
      showToast(`Protocolo gerado e registrado para envio a ${to}!`, 'success');
    } finally {
      btnSendViaServer.disabled = false;
      btnSendViaServer.textContent = '🚀 Enviar via Servidor SENAI';
    }
  }

  // Action: Download HTML file
  function downloadHtmlFile() {
    const html = buildResponsiveEmailHtml();
    const secName = (secOrgaoInput.value || 'Secretaria').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Proposta_SENAI_${secName}.html`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Arquivo "${filename}" baixado com sucesso!`, 'success');
  }

  // Logging & History
  function logDispatch(canal, destinatario, assunto) {
    const item = {
      id: Date.now(),
      data: new Date().toLocaleString('pt-BR'),
      secretaria: secOrgaoInput.value.trim() || 'Secretaria',
      email: destinatario,
      assunto: assunto,
      qtdCursos: state.selectedCourseIds.size,
      canal: canal,
      status: 'Enviado / Protocolado'
    };

    state.history.unshift(item);
    localStorage.setItem('senai_history', JSON.stringify(state.history));
    updateHistoryCounter();
  }

  function updateHistoryCounter() {
    historyCounter.textContent = state.history.length;
  }

  function renderHistoryTable() {
    historyTableBody.innerHTML = '';
    if (state.history.length === 0) {
      historyEmptyState.style.display = 'block';
      historyTableWrapper.style.display = 'none';
      return;
    }

    historyEmptyState.style.display = 'none';
    historyTableWrapper.style.display = 'block';

    state.history.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--text-muted); font-size: 0.78rem;">${item.data}</td>
        <td><strong>${item.secretaria}</strong></td>
        <td><code style="font-size: 0.76rem; color: var(--senai-cyan-300);">${item.email}</code></td>
        <td>${item.qtdCursos} curso(s)</td>
        <td><span style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: bold;">${item.canal}</span></td>
      `;
      historyTableBody.appendChild(tr);
    });
  }

  // Toast Notification
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Event Listeners Setup
  function setupEventListeners() {
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Search Input
    courseSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      btnClearSearch.style.display = state.searchQuery ? 'block' : 'none';
      renderCoursesGrid();
    });

    btnClearSearch.addEventListener('click', () => {
      courseSearchInput.value = '';
      state.searchQuery = '';
      btnClearSearch.style.display = 'none';
      renderCoursesGrid();
    });

    // Category Chips
    categoryChipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      categoryChipsContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeCategory = chip.dataset.category;
      renderCoursesGrid();
    });

    // Quick select buttons
    btnSelectAll.addEventListener('click', selectAllCourses);
    btnSelectNem.addEventListener('click', selectNemCourses);
    btnSelectDocente.addEventListener('click', selectDocenteCourses);
    btnDeselectAll.addEventListener('click', deselectAllCourses);

    // Secretariat selector
    secPresetSelect.addEventListener('change', (e) => {
      const sec = state.secretarias.find(s => s.id === e.target.value);
      if (sec) selectSecretaria(sec);
    });

    // Dynamic inputs refresh email
    [
      secOrgaoInput, secSecretarioInput, secTratamentoSelect, secEmailInput,
      secCidadeInput, secEstadoInput, remetenteUnidadeInput, remetenteResponsavelInput,
      remetenteCargoInput, remetenteContatoInput, emailSubjectInput
    ].forEach(input => {
      input.addEventListener('input', () => {
        previewMockTo.textContent = secEmailInput.value || 'educacao@municipio.gov.br';
        updateLiveEmailPreview();
      });
    });

    // AI Generation Trigger
    btnGenerateAi.addEventListener('click', generateAiProposal);

    // View mode buttons
    viewDesktopBtn.addEventListener('click', () => setViewMode('desktop'));
    viewMobileBtn.addEventListener('click', () => setViewMode('mobile'));
    viewCodeBtn.addEventListener('click', () => setViewMode('code'));

    // Action buttons
    btnCopyFormatted.addEventListener('click', copyFormattedEmail);
    btnOpenMailto.addEventListener('click', openMailtoClient);
    btnSendViaServer.addEventListener('click', sendViaServer);
    btnDownloadHtml.addEventListener('click', downloadHtmlFile);
    btnCopyCodeDirect.addEventListener('click', () => {
      navigator.clipboard.writeText(emailHtmlRaw.value);
      showToast('Código HTML copiado!', 'info');
    });

    // Modal: New Secretariat
    btnAddCustomSec.addEventListener('click', () => {
      modalNewSec.style.display = 'flex';
    });
    btnCloseSecModal.addEventListener('click', () => modalNewSec.style.display = 'none');
    btnCancelNewSec.addEventListener('click', () => modalNewSec.style.display = 'none');
    btnSaveNewSec.addEventListener('click', () => {
      const orgao = document.getElementById('modal-sec-orgao').value.trim();
      const nome = document.getElementById('modal-sec-nome').value.trim();
      const email = document.getElementById('modal-sec-email').value.trim();
      const cidade = document.getElementById('modal-sec-cidade').value.trim();
      const uf = document.getElementById('modal-sec-uf').value.trim().toUpperCase();

      if (!orgao || !email) {
        showToast('Preencha ao menos o Órgão e o E-mail!', 'error');
        return;
      }

      const newSec = {
        id: `custom-${Date.now()}`,
        orgao,
        secretario: nome || 'Secretário(a) de Educação',
        tratamento: 'Prezado(a) Secretário(a)',
        email,
        cidade: cidade || 'Município',
        estado: uf || 'UF',
        porte: 'Rede Municipal'
      };

      state.secretarias.push(newSec);
      const customSecs = JSON.parse(localStorage.getItem('senai_custom_secretarias') || '[]');
      customSecs.push(newSec);
      localStorage.setItem('senai_custom_secretarias', JSON.stringify(customSecs));

      populateSecretariasDropdown();
      secPresetSelect.value = newSec.id;
      selectSecretaria(newSec);

      modalNewSec.style.display = 'none';
      showToast(`Secretaria "${orgao}" adicionada e selecionada!`, 'success');
    });

    // Modal: SMTP
    btnOpenSmtpModal.addEventListener('click', () => {
      modalSmtp.style.display = 'flex';
    });
    btnCloseSmtpModal.addEventListener('click', () => modalSmtp.style.display = 'none');
    btnCancelSmtp.addEventListener('click', () => modalSmtp.style.display = 'none');
    btnSaveSmtp.addEventListener('click', () => {
      state.smtpConfig = {
        host: smtpHostInput.value.trim(),
        port: parseInt(smtpPortInput.value.trim(), 10) || 587,
        user: smtpUserInput.value.trim(),
        pass: smtpPassInput.value.trim()
      };
      localStorage.setItem('senai_smtp', JSON.stringify(state.smtpConfig));
      modalSmtp.style.display = 'none';
      showToast('Configurações SMTP salvas!', 'success');
    });

    // Modal: History
    btnOpenHistoryModal.addEventListener('click', () => {
      renderHistoryTable();
      modalHistory.style.display = 'flex';
    });
    btnCloseHistoryModal.addEventListener('click', () => modalHistory.style.display = 'none');
    btnCloseHistoryFooter.addEventListener('click', () => modalHistory.style.display = 'none');
    btnClearHistory.addEventListener('click', () => {
      if (confirm('Tem certeza de que deseja limpar o histórico de envios?')) {
        state.history = [];
        localStorage.removeItem('senai_history');
        updateHistoryCounter();
        renderHistoryTable();
        showToast('Histórico limpo.', 'info');
      }
    });

    // Modal: Course Details
    btnCloseCourseModal.addEventListener('click', () => modalCourseDetails.style.display = 'none');
    btnCloseCourseFooter.addEventListener('click', () => modalCourseDetails.style.display = 'none');
    btnToggleCourseFromModal.addEventListener('click', () => {
      if (currentViewingCourseId) {
        toggleCourseSelection(currentViewingCourseId);
        modalCourseDetails.style.display = 'none';
      }
    });

    // Close modals on backdrop click
    [modalNewSec, modalSmtp, modalHistory, modalCourseDetails].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    });
  }
});
