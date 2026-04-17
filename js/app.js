'use strict';

/* ═══════════════════════════════════════════════════════════════
   DATA STORE
  esse objeto será substituído por chamadas na API
   ═══════════════════════════════════════════════════════════════ */
const STORE = {
  currentUser: {
    name: 'João da Silva',
    initials: 'JS',
  },

  courses: [
    {
      id: 'crs_001',
      title: 'React Avançado com Hooks e Context',
      category: 'frontend',
      instructor: 'Ana Costa',
      totalModules: 10,
      completedModules: [],
      enrolled: false,
      duration: '20h',
      level: 'avancado',
      icon: '⚛️',
    },
    {
      id: 'crs_002',
      title: 'Node.js e APIs RESTful',
      category: 'backend',
      instructor: 'Carlos Lima',
      totalModules: 8,
      completedModules: [],
      enrolled: false,
      duration: '16h',
      level: 'intermediario',
      icon: '🟢',
    },
    {
      id: 'crs_003',
      title: 'Python para Data Science',
      category: 'data',
      instructor: 'Mariana Ferreira',
      totalModules: 12,
      completedModules: [],
      enrolled: false,
      duration: '30h',
      level: 'iniciante',
      icon: '📊',
    },
    {
      id: 'crs_004',
      title: 'UI/UX Design com Figma',
      category: 'design',
      instructor: 'Lucas Mendes',
      totalModules: 8,
      completedModules: [],
      enrolled: false,
      duration: '18h',
      level: 'iniciante',
      icon: '🎨',
    },
    {
      id: 'crs_005',
      title: 'DevOps: Docker e Kubernetes',
      category: 'devops',
      instructor: 'Rafael Souza',
      totalModules: 10,
      completedModules: [],
      enrolled: false,
      duration: '24h',
      level: 'avancado',
      icon: '🐳',
    },
    {
      id: 'crs_006',
      title: 'TypeScript do Zero ao Avançado',
      category: 'frontend',
      instructor: 'Beatriz Nunes',
      totalModules: 8,
      completedModules: [],
      enrolled: false,
      duration: '14h',
      level: 'intermediario',
      icon: '🔷',
    },
  ],

  certificates: [],
};

/* ═══════════════════════════════════════════════════════════════
   UTILITY: Toast Notification
   ═══════════════════════════════════════════════════════════════ */
const Toast = {
  _container: null,

  _init() {
    this._container = document.getElementById('toastContainer');
  },

  show(message, type = 'info', duration = 3500) {
    if (!this._container) this._init();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;

    this._container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
  },
};

/* ═══════════════════════════════════════════════════════════════
   UI CONTROLLER
   Responsável por: renderizar os componentes visuais com base
   no estado atual do STORE e dos filtros.
   ═══════════════════════════════════════════════════════════════ */
const UI = (() => {

  /* ── Render: Course Cards ─────────────────────────────────── */
  function renderCourses() {
    const grid     = document.getElementById('coursesGrid');
    const empty    = document.getElementById('emptyState');
    const filtered = CourseFilter.getFiltered();

    grid.innerHTML = '';

    if (filtered.length === 0) {
      empty.classList.remove('hidden');
      grid.classList.add('hidden');
      return;
    }

    empty.classList.add('hidden');
    grid.classList.remove('hidden');

    filtered.forEach((course, i) => {
      const card = _buildCard(course);
      card.style.animationDelay = `${i * 0.05}s`;
      grid.appendChild(card);
    });
  }

  /**
   * Constrói o elemento HTML de um card de curso.
   * @param {Object} course
   * @returns {HTMLElement}
   */
  function _buildCard(course) {
    const progress    = ProgressTracker.calculateProgress(course);
    const isCompleted = progress === 100 && course.enrolled;
    const isEligible  = CertificateValidator.isEligible(course.id);

    const levelLabels = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' };

    const card = document.createElement('article');
    card.className = `course-card${isCompleted ? ' is-completed' : ''}`;
    card.dataset.courseId = course.id;

    card.innerHTML = `
      <div class="card-top">
        <div class="course-icon cat-${course.category}">${course.icon}</div>
        <div class="card-title-group">
          <h3 class="course-title">${course.title}</h3>
          <p class="course-instructor">${course.instructor}</p>
        </div>
      </div>

      <div class="card-badges">
        <span class="badge badge-category">${course.category}</span>
        <span class="badge badge-level ${course.level}">${levelLabels[course.level] || course.level}</span>
      </div>

      <div class="card-meta">
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          ${course.duration}
        </span>
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          ${course.totalModules} módulos
        </span>
        ${course.enrolled ? `
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
          ${course.completedModules.length}/${course.totalModules} assistidos
        </span>` : ''}
      </div>

      ${course.enrolled ? `
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Progresso</span>
          <span class="progress-pct-badge">${progress}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill${isCompleted ? ' completed' : ''}" style="width: ${progress}%"></div>
        </div>
      </div>` : ''}

      <div class="card-actions">
        ${_buildCardActions(course, isEligible)}
      </div>
    `;

    _attachCardEvents(card, course, isEligible);

    return card;
  }

  function _buildCardActions(course, isEligible) {
    if (!course.enrolled) {
      return `<button class="btn-primary js-enroll">Inscrever-me</button>`;
    }

    const progress = ProgressTracker.calculateProgress(course);
    const manageBtn = `<button class="btn-secondary js-progress">
      ${progress === 0 ? 'Iniciar Curso' : progress < 100 ? 'Continuar' : 'Rever Módulos'}
    </button>`;
    const certBtn = `<button class="btn-cert js-cert" ${isEligible ? '' : 'disabled'}>
      ${isEligible ? '🏆 Ver Certificado' : `Certificado (${ProgressTracker.calculateProgress(course)}%)`}
    </button>`;

    return manageBtn + certBtn;
  }

  function _attachCardEvents(card, course, isEligible) {
    const enrollBtn   = card.querySelector('.js-enroll');
    const progressBtn = card.querySelector('.js-progress');
    const certBtn     = card.querySelector('.js-cert');

    enrollBtn?.addEventListener('click', () => EnrollmentManager.openModal(course.id));
    progressBtn?.addEventListener('click', () => ProgressTracker.openModal(course.id));
    certBtn?.addEventListener('click', () => {
      if (isEligible) CertificateValidator.openModal(course.id);
    });
  }

  /* ── Render: Certificates ─────────────────────────────────── */
  function renderCertificates() {
    const section = document.getElementById('certsSection');
    const grid    = document.getElementById('certsGrid');
    const count   = document.getElementById('certCount');

    if (STORE.certificates.length === 0) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');
    count.textContent = STORE.certificates.length;
    grid.innerHTML = '';

    STORE.certificates.forEach(cert => {
      const date = new Date(cert.issuedAt).toLocaleDateString('pt-BR');
      const card = document.createElement('div');
      card.className = 'cert-card';
      card.innerHTML = `
        <div class="cert-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="8" r="4"/>
            <path d="M12 12v9m-4-5l4 5 4-5"/>
          </svg>
        </div>
        <div>
          <p class="cert-card-title">${cert.courseTitle}</p>
          <p class="cert-card-date">Emitido em ${date}</p>
        </div>
        <button class="cert-card-action js-view-cert" data-course-id="${cert.courseId}">
          Visualizar Certificado
        </button>
      `;
      card.querySelector('.js-view-cert')
          .addEventListener('click', () => CertificateValidator.openModal(cert.courseId));
      grid.appendChild(card);
    });
  }

  /* ── Update: Stats ─────────────────────────────────────────── */
  function updateStats() {
    const enrolled     = STORE.courses.filter(c => c.enrolled).length;
    const inProgress   = STORE.courses.filter(c => {
      const p = ProgressTracker.calculateProgress(c);
      return c.enrolled && p > 0 && p < 100;
    }).length;
    const completed    = STORE.courses.filter(c => ProgressTracker.calculateProgress(c) === 100).length;
    const certificates = STORE.certificates.length;

    document.getElementById('statEnrolled').textContent    = enrolled;
    document.getElementById('statInProgress').textContent  = inProgress;
    document.getElementById('statCompleted').textContent   = completed;
    document.getElementById('statCertificates').textContent = certificates;
  }

  /* ── Update: User Info ─────────────────────────────────────── */
  function updateUserInfo() {
    const { name, initials } = STORE.currentUser;
    document.getElementById('heroUserName').textContent  = name;
    document.getElementById('sidebarUserName').textContent = name;
    document.getElementById('sidebarAvatar').textContent = initials;
    document.getElementById('topbarAvatar').textContent  = initials;
  }

  return { renderCourses, renderCertificates, updateStats, updateUserInfo };
})();


/* ═══════════════════════════════════════════════════════════════
   EVENT BINDING
   Centraliza todos os event listeners da aplicação.
   ═══════════════════════════════════════════════════════════════ */
(function bindEvents() {

  // ── Navigation tabs ─────────────────────────────────────────
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // ── Filter tabs ─────────────────────────────────────────────
  document.getElementById('filterTabs').addEventListener('click', e => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    CourseFilter.setTab(tab.dataset.filter);
  });

  // ── Category select ──────────────────────────────────────────
  document.getElementById('categoryFilter').addEventListener('change', e => {
    CourseFilter.setCategory(e.target.value);
  });

  // ── Search input (debounced 300ms) ───────────────────────────
  let searchTimer;
  document.getElementById('searchInput').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => CourseFilter.setSearch(e.target.value), 300);
  });

  // ── Enrollment modal ─────────────────────────────────────────
  document.getElementById('confirmEnrollBtn').addEventListener('click', () => EnrollmentManager.confirm());
  document.getElementById('cancelEnrollBtn').addEventListener('click',  () => EnrollmentManager.cancel());
  document.getElementById('enrollModalClose').addEventListener('click', () => EnrollmentManager.cancel());
  document.getElementById('enrollModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) EnrollmentManager.cancel();
  });

  // ── Certificate modal ─────────────────────────────────────────
  document.getElementById('closeCertBtn').addEventListener('click',   () => CertificateValidator.closeModal());
  document.getElementById('certModalClose').addEventListener('click', () => CertificateValidator.closeModal());
  document.getElementById('certModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) CertificateValidator.closeModal();
  });
  document.getElementById('downloadCertBtn').addEventListener('click', () => {
    Toast.show('Funcionalidade de download disponível na Parte 3 (backend).', 'info');
  });

  // ── Progress modal ────────────────────────────────────────────
  document.getElementById('saveProgressBtn').addEventListener('click',    () => ProgressTracker.save());
  document.getElementById('closeProgressBtn').addEventListener('click',   () => ProgressTracker.closeModal());
  document.getElementById('progressModalClose').addEventListener('click', () => ProgressTracker.closeModal());
  document.getElementById('progressModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) ProgressTracker.closeModal();
  });

  // ── Hamburger menu ────────────────────────────────────────────
  document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // ── Keyboard shortcut ⌘K / Ctrl+K para o search ──────────────
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('searchInput').focus();
    }
    if (e.key === 'Escape') {
      EnrollmentManager.cancel();
      CertificateValidator.closeModal();
      ProgressTracker.closeModal();
    }
  });

})();


/* ═══════════════════════════════════════════════════════════════
   INIT
   Ponto de entrada da aplicação.
   ═══════════════════════════════════════════════════════════════ */
(function init() {
  UI.updateUserInfo();
  UI.renderCourses();
  UI.updateStats();

  setTimeout(() => Toast.show('Bem-vindo! Explore os cursos disponíveis.', 'info', 4000), 800);
})();