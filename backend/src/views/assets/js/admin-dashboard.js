// Admin Dashboard JavaScript
class AdminDashboard {
  constructor() {
    this.currentView = 'overview';
    this.refreshInterval = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadInitialData();
    this.startAutoRefresh();
    this.updateTime();
    // Cargar el contenido inicial del resumen
    this.loadViewContent('overview');
  }

  setupEventListeners() {
    // Navigation - Regular nav items
    document.querySelectorAll('.nav-item:not(.dropdown-trigger)').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = e.currentTarget.dataset.view;
        this.switchView(view);
      });
    });

    // Dropdown triggers
    document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown(trigger);
      });
    });

    // Dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = e.currentTarget.dataset.view;
        this.switchView(view);
        this.closeAllDropdowns();
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-dropdown')) {
        this.closeAllDropdowns();
      }
    });

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshAllData());
    }

    // Quick action buttons
    document.querySelectorAll('.quick-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleQuickAction(action);
      });
    });
  }

  toggleDropdown(trigger) {
    const dropdown = trigger.closest('.nav-dropdown');
    const isOpen = dropdown.classList.contains('open');
    
    // Close all dropdowns first
    this.closeAllDropdowns();
    
    // Open this dropdown if it wasn't open
    if (!isOpen) {
      dropdown.classList.add('open');
    }
  }

  closeAllDropdowns() {
    document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
      dropdown.classList.remove('open');
    });
  }

  switchView(view) {
    // Update navigation - handle both regular nav items and dropdown items
    document.querySelectorAll('.nav-item, .dropdown-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`[data-view="${view}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }

    // Update content
    this.currentView = view;
    this.loadViewContent(view);
  }

  getCurrentView() {
    return this.currentView || 'overview';
  }

  loadViewContent(view) {
    const content = document.getElementById('mainContent');
    
    switch(view) {
      case 'overview':
        content.innerHTML = this.getOverviewHTML();
        break;
      case 'users-overview':
        content.innerHTML = this.getUsersOverviewHTML();
        // Cargar resumen de usuarios automáticamente
        setTimeout(() => {
          this.loadUsersOverview();
        }, 100);
        break;
      case 'users-free':
        content.innerHTML = this.getUsersFreeHTML();
        // Cargar usuarios gratuitos automáticamente
        setTimeout(() => {
          this.loadUsersByType('free');
        }, 100);
        break;
      case 'users-premium':
        content.innerHTML = this.getUsersPremiumHTML();
        // Cargar usuarios premium automáticamente
        setTimeout(() => {
          this.loadUsersByType('premium');
        }, 100);
        break;
      case 'users-pro':
        content.innerHTML = this.getUsersProHTML();
        // Cargar usuarios pro automáticamente
        setTimeout(() => {
          this.loadUsersByType('pro');
        }, 100);
        break;
      case 'educators':
        content.innerHTML = this.getEducatorsHTML();
        // Cargar educadores automáticamente
        setTimeout(() => {
          this.loadEducators();
        }, 100);
        break;
      case 'students':
        content.innerHTML = this.getStudentsHTML();
        // Cargar estudiantes automáticamente
        setTimeout(() => {
          this.loadStudents();
        }, 100);
        break;
      case 'analytics':
        content.innerHTML = this.getAnalyticsHTML();
        break;
      case 'settings':
        content.innerHTML = this.getSettingsHTML();
        break;
      case 'logs':
        content.innerHTML = this.getLogsHTML();
        break;
      case 'subscriptions':
        content.innerHTML = this.getSubscriptionsHTML();
        break;
      case 'plans':
        content.innerHTML = this.getPlansHTML();
        break;
      case 'payments':
        content.innerHTML = this.getPaymentsHTML();
        break;
      case 'affiliates':
        content.innerHTML = this.getAffiliatesHTML();
        break;
      case 'performance':
        content.innerHTML = this.getPerformanceHTML();
        break;
      case 'reports':
        content.innerHTML = this.getReportsHTML();
        break;
      case 'security':
        content.innerHTML = this.getSecurityHTML();
        break;
      case 'backup':
        content.innerHTML = this.getBackupHTML();
        break;
    }

    // Re-setup event listeners for new content
    this.setupViewEventListeners();
  }

  getOverviewHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">📊</span>
          Panel de Control
        </h1>
        <p class="content-subtitle">Resumen del estado del sistema y métricas principales</p>
      </div>

      <!-- Status Cards -->
      <div class="card-grid">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="nav-icon">💚</span>
              Health Check
            </h3>
            <div id="healthIcon" class="status-icon loading">
              <span>⟳</span>
            </div>
          </div>
          <p class="card-description">Estado del servidor backend</p>
          <div id="healthStatus" class="card-content text-muted">Verificando...</div>
          <div id="healthDetails" class="text-sm text-muted mt-2"></div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="nav-icon">🗄️</span>
              Supabase
            </h3>
            <div id="supabaseIcon" class="status-icon loading">
              <span>⟳</span>
            </div>
          </div>
          <p class="card-description">Conexión a la base de datos</p>
          <div id="supabaseStatus" class="card-content text-muted">Conectando...</div>
          <div id="supabaseDetails" class="text-sm text-muted mt-2"></div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="nav-icon">⚙️</span>
              Admin Panel
            </h3>
            <div id="adminIcon" class="status-icon loading">
              <span>⟳</span>
            </div>
          </div>
          <p class="card-description">Panel de administración</p>
          <div id="adminStatus" class="card-content text-muted">Cargando...</div>
          <div id="adminDetails" class="text-sm text-muted mt-2"></div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-item">
          <div id="serverUptime" class="stat-value">-</div>
          <div class="stat-label">Uptime (min)</div>
        </div>
        <div class="stat-item">
          <div id="totalUsers" class="stat-value">-</div>
          <div class="stat-label">Usuarios</div>
        </div>
        <div class="stat-item">
          <div id="memoryUsage" class="stat-value">-</div>
          <div class="stat-label">Memoria (MB)</div>
        </div>
        <div class="stat-item">
          <div id="activeConnections" class="stat-value">-</div>
          <div class="stat-label">Conexiones</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="nav-icon">⚡</span>
            Acciones Rápidas
          </h3>
        </div>
        <div class="flex gap-4 flex-wrap">
          <button class="btn btn-primary quick-action" data-action="refresh">
            <span class="nav-icon">🔄</span>
            Actualizar Todo
          </button>
          <button class="btn btn-secondary quick-action" data-action="users">
            <span class="nav-icon">👥</span>
            Ver Usuarios
          </button>
          <button class="btn btn-secondary quick-action" data-action="analytics">
            <span class="nav-icon">📈</span>
            Analytics
          </button>
          <button class="btn btn-secondary quick-action" data-action="logs">
            <span class="nav-icon">📋</span>
            Ver Logs
          </button>
        </div>
      </div>
    `;
  }

  getUsersHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">👥</span>
          Gestión de Usuarios
        </h1>
        <p class="content-subtitle">Administrar usuarios, permisos y suscripciones</p>
      </div>

      <!-- Stats de usuarios -->
      <div class="stats-grid">
        <div class="stat-item">
          <div id="totalUsersCount" class="stat-value">-</div>
          <div class="stat-label">Total Usuarios</div>
        </div>
        <div class="stat-item">
          <div id="activeUsersCount" class="stat-value">-</div>
          <div class="stat-label">Usuarios Activos</div>
        </div>
        <div class="stat-item">
          <div id="newUsersToday" class="stat-value">-</div>
          <div class="stat-label">Nuevos Hoy</div>
        </div>
        <div class="stat-item">
          <div id="premiumUsers" class="stat-value">-</div>
          <div class="stat-label">Usuarios Premium</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Lista de Usuarios</h3>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" id="refreshUsersBtn">
              <span class="nav-icon">🔄</span>
              Actualizar
            </button>
            <button class="btn btn-primary btn-sm" id="createUserBtn">
              <span class="nav-icon">➕</span>
              Nuevo Usuario
            </button>
          </div>
        </div>
        <div id="usersList" class="card-content">
          <div class="text-center py-8">
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; width: 60%; margin: 0 auto;"></div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Usuarios Recientes</h3>
        <div class="card-content">
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  Y
                </div>
                <div>
                  <div class="font-medium">yemuru@outlook.com</div>
                  <div class="text-sm text-muted">Registrado hace 2 horas</div>
                </div>
              </div>
              <div class="badge badge-success">Activo</div>
            </div>
            <div class="text-center text-muted py-4">
              Cargando más usuarios...
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getUsersOverviewHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">📊</span>
          Resumen de Usuarios
        </h1>
        <p class="content-subtitle">Vista general de todos los usuarios del sistema</p>
      </div>

      <!-- Stats generales -->
      <div class="stats-grid">
        <div class="stat-item">
          <div id="totalUsersCount" class="stat-value">-</div>
          <div class="stat-label">Total Usuarios</div>
        </div>
        <div class="stat-item">
          <div id="freeUsersCount" class="stat-value">-</div>
          <div class="stat-label">Usuarios Gratuitos</div>
        </div>
        <div class="stat-item">
          <div id="premiumUsersCount" class="stat-value">-</div>
          <div class="stat-label">Usuarios Premium</div>
        </div>
        <div class="stat-item">
          <div id="proUsersCount" class="stat-value">-</div>
          <div class="stat-label">Usuarios Pro</div>
        </div>
        <div class="stat-item">
          <div id="educatorsCount" class="stat-value">-</div>
          <div class="stat-label">Educadores</div>
        </div>
        <div class="stat-item">
          <div id="studentsCount" class="stat-value">-</div>
          <div class="stat-label">Estudiantes</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Distribución de Usuarios</h3>
        </div>
        <div class="card-content">
          <div id="usersDistribution" class="text-center py-8">
            <div class="loading-skeleton" style="height: 200px; border-radius: 8px;"></div>
          </div>
        </div>
      </div>
    `;
  }

  getUsersFreeHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">🆓</span>
          Usuarios Gratuitos
        </h1>
        <p class="content-subtitle">Gestión de usuarios con plan gratuito</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Usuarios Gratuitos</h3>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" id="refreshFreeUsersBtn">
              <span class="nav-icon">🔄</span>
              Actualizar
            </button>
            <button class="btn btn-primary btn-sm" id="upgradeUserBtn">
              <span class="nav-icon">⬆️</span>
              Actualizar Plan
            </button>
          </div>
        </div>
        <div id="freeUsersList" class="card-content">
          <div class="text-center py-8">
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; width: 60%; margin: 0 auto;"></div>
          </div>
        </div>
      </div>
    `;
  }

  getUsersPremiumHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">⭐</span>
          Usuarios Premium
        </h1>
        <p class="content-subtitle">Gestión de usuarios con plan premium</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Usuarios Premium</h3>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" id="refreshPremiumUsersBtn">
              <span class="nav-icon">🔄</span>
              Actualizar
            </button>
            <button class="btn btn-primary btn-sm" id="manageSubscriptionBtn">
              <span class="nav-icon">⚙️</span>
              Gestionar Suscripción
            </button>
          </div>
        </div>
        <div id="premiumUsersList" class="card-content">
          <div class="text-center py-8">
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; width: 60%; margin: 0 auto;"></div>
          </div>
        </div>
      </div>
    `;
  }

  getUsersProHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">💎</span>
          Usuarios Pro
        </h1>
        <p class="content-subtitle">Gestión de usuarios con plan profesional</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Usuarios Pro</h3>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" id="refreshProUsersBtn">
              <span class="nav-icon">🔄</span>
              Actualizar
            </button>
            <button class="btn btn-primary btn-sm" id="manageProSubscriptionBtn">
              <span class="nav-icon">⚙️</span>
              Gestionar Suscripción
            </button>
          </div>
        </div>
        <div id="proUsersList" class="card-content">
          <div class="text-center py-8">
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; width: 60%; margin: 0 auto;"></div>
          </div>
        </div>
      </div>
    `;
  }

  getEducatorsHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">🎓</span>
          Educadores
        </h1>
        <p class="content-subtitle">Gestión de educadores y sus comisiones</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Lista de Educadores</h3>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" id="refreshEducatorsBtn">
              <span class="nav-icon">🔄</span>
              Actualizar
            </button>
            <button class="btn btn-primary btn-sm" id="createEducatorBtn">
              <span class="nav-icon">➕</span>
              Nuevo Educador
            </button>
          </div>
        </div>
        <div id="educatorsList" class="card-content">
          <div class="text-center py-8">
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; width: 60%; margin: 0 auto;"></div>
          </div>
        </div>
      </div>
    `;
  }

  getStudentsHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">🎒</span>
          Estudiantes
        </h1>
        <p class="content-subtitle">Gestión de estudiantes y sus educadores</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Lista de Estudiantes</h3>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" id="refreshStudentsBtn">
              <span class="nav-icon">🔄</span>
              Actualizar
            </button>
            <button class="btn btn-primary btn-sm" id="assignStudentBtn">
              <span class="nav-icon">🔗</span>
              Asignar a Educador
            </button>
          </div>
        </div>
        <div id="studentsList" class="card-content">
          <div class="text-center py-8">
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
            <div class="loading-skeleton" style="height: 20px; border-radius: 4px; width: 60%; margin: 0 auto;"></div>
          </div>
        </div>
      </div>
    `;
  }

  getAnalyticsHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">📈</span>
          Analytics y Métricas
        </h1>
        <p class="content-subtitle">Estadísticas de uso y rendimiento del sistema</p>
      </div>

      <!-- Métricas principales -->
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value text-success">99.9%</div>
          <div class="stat-label">Uptime</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">1,234</div>
          <div class="stat-label">Sesiones Hoy</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">45</div>
          <div class="stat-label">Nuevos Usuarios</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">2.3s</div>
          <div class="stat-label">Tiempo Respuesta</div>
        </div>
      </div>

      <div class="card-grid">
        <div class="card">
          <h3 class="card-title">Uso del Sistema (Últimos 7 días)</h3>
          <div class="card-content">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-muted">Lunes</span>
                <div class="flex items-center gap-2">
                  <div class="w-32 h-2 bg-gray-700 rounded">
                    <div class="h-full bg-primary rounded" style="width: 75%"></div>
                  </div>
                  <span class="text-sm">75%</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-muted">Martes</span>
                <div class="flex items-center gap-2">
                  <div class="w-32 h-2 bg-gray-700 rounded">
                    <div class="h-full bg-primary rounded" style="width: 90%"></div>
                  </div>
                  <span class="text-sm">90%</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-muted">Miércoles</span>
                <div class="flex items-center gap-2">
                  <div class="w-32 h-2 bg-gray-700 rounded">
                    <div class="h-full bg-primary rounded" style="width: 60%"></div>
                  </div>
                  <span class="text-sm">60%</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-muted">Hoy</span>
                <div class="flex items-center gap-2">
                  <div class="w-32 h-2 bg-gray-700 rounded">
                    <div class="h-full bg-primary rounded" style="width: 85%"></div>
                  </div>
                  <span class="text-sm">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Actividad de Usuarios</h3>
          <div class="card-content">
            <div class="space-y-4">
              <div class="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <div>
                  <div class="font-medium">Trading Journal</div>
                  <div class="text-sm text-muted">1,234 accesos</div>
                </div>
                <div class="badge badge-success">+12%</div>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <div>
                  <div class="font-medium">Estadísticas</div>
                  <div class="text-sm text-muted">856 accesos</div>
                </div>
                <div class="badge badge-success">+8%</div>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <div>
                  <div class="font-medium">Backtesting</div>
                  <div class="text-sm text-muted">432 accesos</div>
                </div>
                <div class="badge badge-warning">+3%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Rendimiento del Servidor</h3>
        <div class="card-content">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-gray-800 rounded-lg">
              <div class="text-2xl font-bold text-success">105 MB</div>
              <div class="text-sm text-muted">Memoria Usada</div>
            </div>
            <div class="text-center p-4 bg-gray-800 rounded-lg">
              <div class="text-2xl font-bold text-warning">2.3s</div>
              <div class="text-sm text-muted">Tiempo Respuesta</div>
            </div>
            <div class="text-center p-4 bg-gray-800 rounded-lg">
              <div class="text-2xl font-bold text-success">99.9%</div>
              <div class="text-sm text-muted">Uptime</div>
            </div>
            <div class="text-center p-4 bg-gray-800 rounded-lg">
              <div class="text-2xl font-bold">1,234</div>
              <div class="text-sm text-muted">Requests Hoy</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getSettingsHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">⚙️</span>
          Configuración
        </h1>
        <p class="content-subtitle">Configurar parámetros del sistema y notificaciones</p>
      </div>

      <div class="card-grid">
        <div class="card">
          <h3 class="card-title">Configuración del Servidor</h3>
          <div class="card-content space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium">Puerto del Servidor</div>
                <div class="text-sm text-muted">Puerto donde corre el backend</div>
              </div>
              <div class="badge badge-success">3001</div>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium">Entorno</div>
                <div class="text-sm text-muted">Modo de ejecución actual</div>
              </div>
              <div class="badge badge-warning">Development</div>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium">CORS</div>
                <div class="text-sm text-muted">Configuración de CORS</div>
              </div>
              <div class="badge badge-success">Habilitado</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Base de Datos</h3>
          <div class="card-content space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium">Supabase URL</div>
                <div class="text-sm text-muted">URL de conexión a Supabase</div>
              </div>
              <div class="text-xs text-muted">qxofbcfindfglcbkckxs.supabase.co</div>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium">Estado de Conexión</div>
                <div class="text-sm text-muted">Estado actual de la BD</div>
              </div>
              <div class="badge badge-success">Conectado</div>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium">Última Sincronización</div>
                <div class="text-sm text-muted">Última vez que se sincronizó</div>
              </div>
              <div class="text-xs text-muted">Hace 2 minutos</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Notificaciones</h3>
        <div class="card-content">
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div>
                <div class="font-medium">Alertas de Error</div>
                <div class="text-sm text-muted">Notificar cuando hay errores del sistema</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked>
                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div>
                <div class="font-medium">Reportes Diarios</div>
                <div class="text-sm text-muted">Enviar reportes de uso diario</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked>
                <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getLogsHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">📋</span>
          Logs del Sistema
        </h1>
        <p class="content-subtitle">Registros de actividad y errores del sistema</p>
      </div>

      <!-- Filtros de logs -->
      <div class="card mb-6">
        <div class="card-header">
          <h3 class="card-title">Filtros</h3>
                  <div class="flex gap-2">
                    <button class="btn btn-secondary btn-sm log-filter-btn" data-filter="all">Todos</button>
                    <button class="btn btn-sm log-filter-btn" data-filter="info">Info</button>
                    <button class="btn btn-sm log-filter-btn" data-filter="warning">Warning</button>
                    <button class="btn btn-sm log-filter-btn" data-filter="error">Error</button>
                  </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Logs Recientes</h3>
          <button class="btn btn-secondary btn-sm">
            <span class="nav-icon">🔄</span>
            Actualizar
          </button>
        </div>
        <div class="card-content">
          <div class="space-y-3">
            <div class="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
              <div class="w-2 h-2 bg-success rounded-full mt-2"></div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-medium text-success">Health Check Exitoso</div>
                    <div class="text-sm text-muted">Servidor respondiendo correctamente</div>
                  </div>
                  <div class="text-xs text-muted">Hace 2 minutos</div>
                </div>
                <div class="text-xs text-muted mt-1">GET /health - 200 OK</div>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
              <div class="w-2 h-2 bg-success rounded-full mt-2"></div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-medium text-success">Conexión Supabase</div>
                    <div class="text-sm text-muted">Base de datos conectada exitosamente</div>
                  </div>
                  <div class="text-xs text-muted">Hace 5 minutos</div>
                </div>
                <div class="text-xs text-muted mt-1">GET /api/supabase/test - 200 OK</div>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
              <div class="w-2 h-2 bg-warning rounded-full mt-2"></div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-medium text-warning">Alto Uso de Memoria</div>
                    <div class="text-sm text-muted">Memoria del servidor al 85%</div>
                  </div>
                  <div class="text-xs text-muted">Hace 10 minutos</div>
                </div>
                <div class="text-xs text-muted mt-1">Memory usage: 105MB / 128MB</div>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
              <div class="w-2 h-2 bg-success rounded-full mt-2"></div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-medium text-success">Usuario Registrado</div>
                    <div class="text-sm text-muted">Nuevo usuario: yemuru@outlook.com</div>
                  </div>
                  <div class="text-xs text-muted">Hace 15 minutos</div>
                </div>
                <div class="text-xs text-muted mt-1">POST /api/auth/register - 201 Created</div>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
              <div class="w-2 h-2 bg-success rounded-full mt-2"></div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-medium text-success">Servidor Iniciado</div>
                    <div class="text-sm text-muted">Backend iniciado correctamente</div>
                  </div>
                  <div class="text-xs text-muted">Hace 1 hora</div>
                </div>
                <div class="text-xs text-muted mt-1">Server started on port 3001</div>
              </div>
            </div>
          </div>

                  <div class="text-center mt-6">
                    <button class="btn btn-secondary" id="loadMoreLogsBtn">
                      <span class="nav-icon">📄</span>
                      Cargar Más Logs
                    </button>
                  </div>
        </div>
      </div>
    `;
  }

  setupViewEventListeners() {
    // Re-setup event listeners for dynamically loaded content
    document.querySelectorAll('.quick-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleQuickAction(action);
      });
    });

    // Botón de actualizar usuarios
    const refreshUsersBtn = document.getElementById('refreshUsersBtn');
    if (refreshUsersBtn) {
      refreshUsersBtn.addEventListener('click', () => this.loadUsers());
    }

    // Botón de crear usuario
    const createUserBtn = document.getElementById('createUserBtn');
    if (createUserBtn) {
      createUserBtn.addEventListener('click', () => this.showCreateUserModal());
    }

    // Botón de cargar más logs
    const loadMoreLogsBtn = document.getElementById('loadMoreLogsBtn');
    if (loadMoreLogsBtn) {
      loadMoreLogsBtn.addEventListener('click', () => this.loadMoreLogs());
    }

    // Filtros de logs
    document.querySelectorAll('.log-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.currentTarget.dataset.filter;
        this.filterLogs(filter);
      });
    });

    // Los event listeners de edición se configuran en setupEditUserListeners()
  }

  async loadUsers() {
    console.log('🔄 Cargando usuarios...');
    const usersList = document.getElementById('usersList');
    if (usersList) {
      // Mostrar loading
      usersList.innerHTML = `
        <div class="text-center py-8">
          <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
          <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
          <div class="loading-skeleton" style="height: 20px; border-radius: 4px; width: 60%; margin: 0 auto;"></div>
        </div>
      `;

      try {
        console.log('📡 Haciendo petición a /api/supabase/users');
        // Obtener usuarios reales de Supabase
        const response = await fetch('/api/supabase/users');
        console.log('📡 Respuesta recibida:', response.status);
        
        const data = await response.json();
        console.log('📊 Datos recibidos:', data);

        if (data.success && data.users) {
          console.log('✅ Usuarios cargados exitosamente:', data.users.length);
          this.renderUsers(data.users);
        } else {
          throw new Error(data.error || 'Error al cargar usuarios');
        }
      } catch (error) {
        console.error('❌ Error al cargar usuarios:', error);
        usersList.innerHTML = `
          <div class="text-center py-8">
            <div class="text-error mb-2">Error al cargar usuarios</div>
            <div class="text-sm text-muted">${error.message}</div>
            <button class="btn btn-secondary btn-sm mt-4" onclick="adminDashboard.loadUsers()">
              <span class="nav-icon">🔄</span>
              Reintentar
            </button>
          </div>
        `;
      }
    }

    // Actualizar estadísticas de usuarios
    this.updateUserStats();
  }

  async loadUsersOverview() {
    console.log('🔄 Cargando resumen de usuarios...');
    try {
      // Cargar estadísticas generales
      const response = await fetch('/api/supabase/users/stats');
      const data = await response.json();
      
      if (data.success && data.stats) {
        // Actualizar contadores
        document.getElementById('totalUsersCount').textContent = data.stats.totalUsers || 0;
        document.getElementById('freeUsersCount').textContent = Math.floor((data.stats.totalUsers || 0) * 0.7); // 70% gratuitos
        document.getElementById('premiumUsersCount').textContent = Math.floor((data.stats.totalUsers || 0) * 0.2); // 20% premium
        document.getElementById('proUsersCount').textContent = Math.floor((data.stats.totalUsers || 0) * 0.1); // 10% pro
        document.getElementById('educatorsCount').textContent = Math.floor((data.stats.totalUsers || 0) * 0.05); // 5% educadores
        document.getElementById('studentsCount').textContent = Math.floor((data.stats.totalUsers || 0) * 0.15); // 15% estudiantes
      }
    } catch (error) {
      console.error('❌ Error al cargar resumen de usuarios:', error);
    }
  }

  async loadUsersByType(type) {
    console.log(`🔄 Cargando usuarios ${type}...`);
    const listElement = document.getElementById(`${type}UsersList`);
    if (listElement) {
      // Mostrar loading
      listElement.innerHTML = `
        <div class="text-center py-8">
          <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
          <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
          <div class="loading-skeleton" style="height: 20px; border-radius: 4px; width: 60%; margin: 0 auto;"></div>
        </div>
      `;

      try {
        const response = await fetch('/api/supabase/users');
        const data = await response.json();
        
        if (data.success && data.users) {
          // Filtrar usuarios por tipo (simulado por ahora)
          const filteredUsers = this.filterUsersByType(data.users, type);
          this.renderUsersByType(filteredUsers, type);
        } else {
          throw new Error(data.error || 'Error al cargar usuarios');
        }
      } catch (error) {
        console.error(`❌ Error al cargar usuarios ${type}:`, error);
        listElement.innerHTML = `
          <div class="text-center py-8">
            <div class="text-error mb-2">Error al cargar usuarios ${type}</div>
            <div class="text-sm text-muted">${error.message}</div>
            <button class="btn btn-secondary btn-sm mt-4" onclick="adminDashboard.loadUsersByType('${type}')">
              <span class="nav-icon">🔄</span>
              Reintentar
            </button>
          </div>
        `;
      }
    }
  }

  filterUsersByType(users, type) {
    // Simular filtrado por tipo de usuario
    // En un sistema real, esto vendría de la base de datos
    const typePercentages = {
      'free': 0.7,
      'premium': 0.2,
      'pro': 0.1
    };
    
    const count = Math.floor(users.length * (typePercentages[type] || 0.1));
    return users.slice(0, count);
  }

  renderUsersByType(users, type) {
    const listElement = document.getElementById(`${type}UsersList`);
    if (listElement) {
      if (users.length === 0) {
        listElement.innerHTML = `
          <div class="text-center py-8">
            <div class="text-muted mb-2">No hay usuarios ${type} registrados</div>
            <div class="text-sm text-muted">Los usuarios aparecerán aquí cuando se registren</div>
          </div>
        `;
        return;
      }

      const usersHTML = users.map(user => `
        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              ${user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div class="font-medium">${user.display_name || user.email || 'Usuario'}</div>
              <div class="text-sm text-muted">${user.email || 'Sin email'}</div>
              <div class="text-xs text-muted">Registrado: ${new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge badge-success">${type.toUpperCase()}</span>
            <button class="btn btn-secondary btn-sm" onclick="adminDashboard.editUser('${user.id}')">
              <span class="nav-icon">✏️</span>
              Editar
            </button>
          </div>
        </div>
      `).join('');

      listElement.innerHTML = usersHTML;
    }
  }

  async loadEducators() {
    console.log('🔄 Cargando educadores...');
    const listElement = document.getElementById('educatorsList');
    if (listElement) {
      // Mostrar loading
      listElement.innerHTML = `
        <div class="text-center py-8">
          <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
          <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
          <div class="loading-skeleton" style="height: 20px; border-radius: 4px; width: 60%; margin: 0 auto;"></div>
        </div>
      `;

      try {
        // Simular carga de educadores
        const educators = [
          {
            id: 'edu1',
            name: 'Dr. María González',
            email: 'maria@tradingacademy.com',
            students: 25,
            commission: 15.5,
            status: 'active'
          },
          {
            id: 'edu2',
            name: 'Prof. Carlos Ruiz',
            email: 'carlos@tradingacademy.com',
            students: 18,
            commission: 12.3,
            status: 'active'
          }
        ];

        this.renderEducators(educators);
      } catch (error) {
        console.error('❌ Error al cargar educadores:', error);
        listElement.innerHTML = `
          <div class="text-center py-8">
            <div class="text-error mb-2">Error al cargar educadores</div>
            <div class="text-sm text-muted">${error.message}</div>
          </div>
        `;
      }
    }
  }

  renderEducators(educators) {
    const listElement = document.getElementById('educatorsList');
    if (listElement) {
      if (educators.length === 0) {
        listElement.innerHTML = `
          <div class="text-center py-8">
            <div class="text-muted mb-2">No hay educadores registrados</div>
            <div class="text-sm text-muted">Los educadores aparecerán aquí cuando se registren</div>
          </div>
        `;
        return;
      }

      const educatorsHTML = educators.map(educator => `
        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              ${educator.name.charAt(0)}
            </div>
            <div>
              <div class="font-medium">${educator.name}</div>
              <div class="text-sm text-muted">${educator.email}</div>
              <div class="text-xs text-muted">${educator.students} estudiantes • ${educator.commission}% comisión</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge badge-success">ACTIVO</span>
            <button class="btn btn-secondary btn-sm">
              <span class="nav-icon">✏️</span>
              Editar
            </button>
          </div>
        </div>
      `).join('');

      listElement.innerHTML = educatorsHTML;
    }
  }

  async loadStudents() {
    console.log('🔄 Cargando estudiantes...');
    const listElement = document.getElementById('studentsList');
    if (listElement) {
      // Mostrar loading
      listElement.innerHTML = `
        <div class="text-center py-8">
          <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
          <div class="loading-skeleton" style="height: 20px; border-radius: 4px; margin-bottom: 8px;"></div>
          <div class="loading-skeleton" style="height: 20px; border-radius: 4px; width: 60%; margin: 0 auto;"></div>
        </div>
      `;

      try {
        // Simular carga de estudiantes
        const students = [
          {
            id: 'stu1',
            name: 'Ana Martínez',
            email: 'ana@student.com',
            educator: 'Dr. María González',
            level: 'Intermedio',
            status: 'active'
          },
          {
            id: 'stu2',
            name: 'Luis Pérez',
            email: 'luis@student.com',
            educator: 'Prof. Carlos Ruiz',
            level: 'Principiante',
            status: 'active'
          }
        ];

        this.renderStudents(students);
      } catch (error) {
        console.error('❌ Error al cargar estudiantes:', error);
        listElement.innerHTML = `
          <div class="text-center py-8">
            <div class="text-error mb-2">Error al cargar estudiantes</div>
            <div class="text-sm text-muted">${error.message}</div>
          </div>
        `;
      }
    }
  }

  renderStudents(students) {
    const listElement = document.getElementById('studentsList');
    if (listElement) {
      if (students.length === 0) {
        listElement.innerHTML = `
          <div class="text-center py-8">
            <div class="text-muted mb-2">No hay estudiantes registrados</div>
            <div class="text-sm text-muted">Los estudiantes aparecerán aquí cuando se registren</div>
          </div>
        `;
        return;
      }

      const studentsHTML = students.map(student => `
        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              ${student.name.charAt(0)}
            </div>
            <div>
              <div class="font-medium">${student.name}</div>
              <div class="text-sm text-muted">${student.email}</div>
              <div class="text-xs text-muted">Educador: ${student.educator} • Nivel: ${student.level}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge badge-success">ACTIVO</span>
            <button class="btn btn-secondary btn-sm">
              <span class="nav-icon">✏️</span>
              Editar
            </button>
          </div>
        </div>
      `).join('');

      listElement.innerHTML = studentsHTML;
    }
  }

  renderUsers(users) {
    console.log('📋 Renderizando usuarios:', users.length);
    console.log('📋 Datos de usuarios:', users);
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    if (users.length === 0) {
      usersList.innerHTML = `
        <div class="text-center py-8">
          <div class="text-muted">No hay usuarios registrados</div>
        </div>
      `;
      return;
    }

    const usersHTML = users.map(user => {
      const initial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
      const createdDate = new Date(user.created_at);
      const timeAgo = this.getTimeAgo(createdDate);
      const lastSignIn = user.last_sign_in_at ? this.getTimeAgo(new Date(user.last_sign_in_at)) : 'Nunca';
      const isActive = user.last_sign_in_at && (new Date() - new Date(user.last_sign_in_at)) < (30 * 24 * 60 * 60 * 1000);
      
      return `
        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              ${initial}
            </div>
            <div>
              <div class="font-medium">${user.email || 'Sin email'}</div>
              <div class="text-sm text-muted">Registrado ${timeAgo}</div>
              <div class="text-xs text-muted">Último acceso: ${lastSignIn}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="badge ${isActive ? 'badge-success' : 'badge-warning'}">${isActive ? 'Activo' : 'Inactivo'}</div>
            <button class="btn btn-sm edit-user-btn" data-user-id="${user.id}" data-user-email="${user.email}" data-user-name="${user.display_name}" onclick="window.adminDashboard.showEditUserModal('${user.id}', '${user.email}', '${user.display_name}')">Editar</button>
          </div>
        </div>
      `;
    }).join('');

    usersList.innerHTML = `
      <div class="space-y-3">
        ${usersHTML}
      </div>
    `;

    // Configurar event listeners para los botones de editar DESPUÉS de renderizar
    this.setupEditUserListeners();
  }

  setupEditUserListeners() {
    console.log('🔧 Configurando event listeners de edición...');
    // Configurar event listeners para los botones de editar usuario
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
      // Remover listeners anteriores para evitar duplicados
      btn.removeEventListener('click', this.handleEditClick);
      // Agregar nuevo listener
      btn.addEventListener('click', this.handleEditClick.bind(this));
    });
    console.log(`✅ ${document.querySelectorAll('.edit-user-btn').length} botones de editar configurados`);
  }

  handleEditClick(e) {
    e.preventDefault();
    const userId = e.currentTarget.dataset.userId;
    const userEmail = e.currentTarget.dataset.userEmail;
    const userName = e.currentTarget.dataset.userName;
    console.log('🔄 Editando usuario:', { userId, userEmail, userName });
    this.showEditUserModal(userId, userEmail, userName);
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    return `hace ${Math.floor(diffInSeconds / 2592000)} meses`;
  }

  async updateUserStats() {
    console.log('📊 Cargando estadísticas de usuarios...');
    try {
      // Obtener estadísticas reales de Supabase
      const response = await fetch('/api/supabase/users/stats');
      console.log('📡 Respuesta de estadísticas:', response.status);
      
      const data = await response.json();
      console.log('📊 Estadísticas recibidas:', data);

      if (data.success && data.stats) {
        const stats = data.stats;
        console.log('✅ Actualizando estadísticas:', stats);
        
        const totalUsers = document.getElementById('totalUsersCount');
        const activeUsers = document.getElementById('activeUsersCount');
        const newUsersToday = document.getElementById('newUsersToday');
        const premiumUsers = document.getElementById('premiumUsers');

        if (totalUsers) totalUsers.textContent = stats.totalUsers;
        if (activeUsers) activeUsers.textContent = stats.activeUsers;
        if (newUsersToday) newUsersToday.textContent = stats.newUsersToday;
        if (premiumUsers) premiumUsers.textContent = stats.premiumUsers;
      }
    } catch (error) {
      console.error('❌ Error al cargar estadísticas de usuarios:', error);
      // Fallback a datos simulados si hay error
      const totalUsers = document.getElementById('totalUsersCount');
      const activeUsers = document.getElementById('activeUsersCount');
      const newUsersToday = document.getElementById('newUsersToday');
      const premiumUsers = document.getElementById('premiumUsers');

      if (totalUsers) totalUsers.textContent = '-';
      if (activeUsers) activeUsers.textContent = '-';
      if (newUsersToday) newUsersToday.textContent = '-';
      if (premiumUsers) premiumUsers.textContent = '-';
    }
  }

  showCreateUserModal() {
    // Crear modal si no existe
    let modal = document.getElementById('createUserModal');
    if (!modal) {
      modal = this.createUserModal();
      document.body.appendChild(modal);
    }
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    // Limpiar formulario
    const form = modal.querySelector('#createUserForm');
    form.reset();
  }

  createUserModal() {
    const modal = document.createElement('div');
    modal.id = 'createUserModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    modal.innerHTML = `
      <div style="
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 2rem;
        width: 90%;
        max-width: 500px;
        position: relative;
      ">
        <button id="closeModal" style="
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.5rem;
          cursor: pointer;
        ">×</button>
        
        <h3 style="
          color: #f1f5f9;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        ">Crear Nuevo Usuario</h3>
        
        <form id="createUserForm">
          <div style="margin-bottom: 1rem;">
            <label style="
              display: block;
              color: #f1f5f9;
              font-size: 0.875rem;
              font-weight: 500;
              margin-bottom: 0.5rem;
            ">Email *</label>
            <input type="email" id="userEmail" required style="
              width: 100%;
              padding: 0.75rem;
              background: #334155;
              border: 1px solid #475569;
              border-radius: 8px;
              color: #f1f5f9;
              font-size: 0.875rem;
            " placeholder="usuario@ejemplo.com">
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="
              display: block;
              color: #f1f5f9;
              font-size: 0.875rem;
              font-weight: 500;
              margin-bottom: 0.5rem;
            ">Contraseña *</label>
            <input type="password" id="userPassword" required style="
              width: 100%;
              padding: 0.75rem;
              background: #334155;
              border: 1px solid #475569;
              border-radius: 8px;
              color: #f1f5f9;
              font-size: 0.875rem;
            " placeholder="Mínimo 6 caracteres">
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="
              display: block;
              color: #f1f5f9;
              font-size: 0.875rem;
              font-weight: 500;
              margin-bottom: 0.5rem;
            ">Nombre Completo</label>
            <input type="text" id="userFullName" style="
              width: 100%;
              padding: 0.75rem;
              background: #334155;
              border: 1px solid #475569;
              border-radius: 8px;
              color: #f1f5f9;
              font-size: 0.875rem;
            " placeholder="Nombre del usuario">
          </div>
          
          <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button type="button" id="cancelCreate" style="
              padding: 0.75rem 1.5rem;
              background: #64748b;
              border: none;
              border-radius: 8px;
              color: #f1f5f9;
              cursor: pointer;
              font-size: 0.875rem;
            ">Cancelar</button>
            <button type="submit" id="submitCreate" style="
              padding: 0.75rem 1.5rem;
              background: #f59e0b;
              border: none;
              border-radius: 8px;
              color: white;
              cursor: pointer;
              font-size: 0.875rem;
              font-weight: 500;
            ">Crear Usuario</button>
          </div>
        </form>
        
        <div id="createUserMessage" style="
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
          display: none;
        "></div>
      </div>
    `;

    // Event listeners
    modal.querySelector('#closeModal').addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.querySelector('#cancelCreate').addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.querySelector('#createUserForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.createUser();
    });

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    return modal;
  }

  async createUser() {
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const fullName = document.getElementById('userFullName').value;
    const messageDiv = document.getElementById('createUserMessage');
    const submitBtn = document.getElementById('submitCreate');

    // Validar
    if (!email || !password) {
      this.showMessage('Email y contraseña son requeridos', 'error');
      return;
    }

    if (password.length < 6) {
      this.showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    // Mostrar loading
    submitBtn.textContent = 'Creando...';
    submitBtn.disabled = true;

    try {
      console.log('🔄 Creando usuario:', email);
      
      const response = await fetch('/api/supabase/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          full_name: fullName
        })
      });

      const data = await response.json();
      console.log('📊 Respuesta de creación:', data);

      if (data.success) {
        this.showMessage('Usuario creado exitosamente', 'success');
        // Cerrar modal después de 1 segundo
        setTimeout(() => {
          document.getElementById('createUserModal').style.display = 'none';
          // Recargar lista de usuarios
          this.loadUsers();
        }, 1000);
      } else {
        throw new Error(data.error || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      this.showMessage(`Error: ${error.message}`, 'error');
    } finally {
      submitBtn.textContent = 'Crear Usuario';
      submitBtn.disabled = false;
    }
  }

  showEditUserModal(userId, userEmail, userName) {
    // Crear modal si no existe
    let modal = document.getElementById('editUserModal');
    if (!modal) {
      modal = this.createEditUserModal();
      document.body.appendChild(modal);
    }
    
    // Llenar formulario con datos del usuario
    document.getElementById('editUserEmail').value = userEmail || '';
    document.getElementById('editUserFullName').value = userName || '';
    document.getElementById('editUserId').value = userId;
    
    // Mostrar modal
    modal.style.display = 'flex';
  }

  createEditUserModal() {
    const modal = document.createElement('div');
    modal.id = 'editUserModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    modal.innerHTML = `
      <div style="
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 2rem;
        width: 90%;
        max-width: 500px;
        position: relative;
      ">
        <button id="closeEditModal" style="
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.5rem;
          cursor: pointer;
        ">×</button>
        
        <h3 style="
          color: #f1f5f9;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        ">Editar Usuario</h3>
        
        <form id="editUserForm">
          <input type="hidden" id="editUserId">
          
          <div style="margin-bottom: 1rem;">
            <label style="
              display: block;
              color: #f1f5f9;
              font-size: 0.875rem;
              font-weight: 500;
              margin-bottom: 0.5rem;
            ">Email *</label>
            <input type="email" id="editUserEmail" required style="
              width: 100%;
              padding: 0.75rem;
              background: #334155;
              border: 1px solid #475569;
              border-radius: 8px;
              color: #f1f5f9;
              font-size: 0.875rem;
            " placeholder="usuario@ejemplo.com">
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="
              display: block;
              color: #f1f5f9;
              font-size: 0.875rem;
              font-weight: 500;
              margin-bottom: 0.5rem;
            ">Nueva Contraseña</label>
            <input type="password" id="editUserPassword" style="
              width: 100%;
              padding: 0.75rem;
              background: #334155;
              border: 1px solid #475569;
              border-radius: 8px;
              color: #f1f5f9;
              font-size: 0.875rem;
            " placeholder="Dejar vacío para no cambiar">
            <div style="
              color: #94a3b8;
              font-size: 0.75rem;
              margin-top: 0.25rem;
            ">Dejar vacío para mantener la contraseña actual</div>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="
              display: block;
              color: #f1f5f9;
              font-size: 0.875rem;
              font-weight: 500;
              margin-bottom: 0.5rem;
            ">Nombre Completo</label>
            <input type="text" id="editUserFullName" style="
              width: 100%;
              padding: 0.75rem;
              background: #334155;
              border: 1px solid #475569;
              border-radius: 8px;
              color: #f1f5f9;
              font-size: 0.875rem;
            " placeholder="Nombre del usuario">
          </div>
          
          <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button type="button" id="cancelEdit" style="
              padding: 0.75rem 1.5rem;
              background: #64748b;
              border: none;
              border-radius: 8px;
              color: #f1f5f9;
              cursor: pointer;
              font-size: 0.875rem;
            ">Cancelar</button>
            <button type="submit" id="submitEdit" style="
              padding: 0.75rem 1.5rem;
              background: #f59e0b;
              border: none;
              border-radius: 8px;
              color: white;
              cursor: pointer;
              font-size: 0.875rem;
              font-weight: 500;
            ">Guardar Cambios</button>
          </div>
        </form>
        
        <div id="editUserMessage" style="
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
          display: none;
        "></div>
      </div>
    `;

    // Event listeners
    modal.querySelector('#closeEditModal').addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.querySelector('#cancelEdit').addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.querySelector('#editUserForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateUser();
    });

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    return modal;
  }

  async updateUser() {
    const userId = document.getElementById('editUserId').value;
    const email = document.getElementById('editUserEmail').value;
    const password = document.getElementById('editUserPassword').value;
    const fullName = document.getElementById('editUserFullName').value;
    const messageDiv = document.getElementById('editUserMessage');
    const submitBtn = document.getElementById('submitEdit');

    // Validar
    if (!email) {
      this.showEditMessage('Email es requerido', 'error');
      return;
    }

    if (password && password.length < 6) {
      this.showEditMessage('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    // Mostrar loading
    submitBtn.textContent = 'Guardando...';
    submitBtn.disabled = true;

    try {
      console.log('🔄 Actualizando usuario:', userId, email);
      
      // Preparar datos de actualización
      const updateData = {
        email: email,
        user_metadata: {
          full_name: fullName || ''
        }
      };

      // Solo incluir contraseña si se proporcionó
      if (password) {
        updateData.password = password;
      }

      const response = await fetch(`/api/supabase/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      console.log('📊 Respuesta de actualización:', data);

      if (data.success) {
        this.showEditMessage('Usuario actualizado exitosamente', 'success');
        // Cerrar modal después de 1 segundo
        setTimeout(() => {
          document.getElementById('editUserModal').style.display = 'none';
          // Recargar lista de usuarios
          this.loadUsers();
        }, 1000);
      } else {
        throw new Error(data.error || 'Error al actualizar usuario');
      }
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      this.showEditMessage(`Error: ${error.message}`, 'error');
    } finally {
      submitBtn.textContent = 'Guardar Cambios';
      submitBtn.disabled = false;
    }
  }

  showEditMessage(message, type) {
    const messageDiv = document.getElementById('editUserMessage');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
    messageDiv.style.color = 'white';
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }

  showMessage(message, type) {
    const messageDiv = document.getElementById('createUserMessage');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
    messageDiv.style.color = 'white';
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }

  async loadMoreLogs() {
    console.log('📄 Cargando más logs...');
    const logsContainer = document.querySelector('.space-y-3');
    const loadMoreBtn = document.getElementById('loadMoreLogsBtn');
    
    if (!logsContainer || !loadMoreBtn) {
      console.error('❌ No se encontró el contenedor de logs o el botón');
      return;
    }

    // Mostrar loading en el botón
    const originalText = loadMoreBtn.innerHTML;
    loadMoreBtn.innerHTML = '<span class="nav-icon">⏳</span> Cargando...';
    loadMoreBtn.disabled = true;

    try {
      // Simular carga de más logs (en un sistema real, esto vendría de una API)
      const moreLogs = this.generateMoreLogs();
      
      // Agregar los nuevos logs al contenedor
      moreLogs.forEach(logHTML => {
        const logElement = document.createElement('div');
        logElement.innerHTML = logHTML;
        logsContainer.appendChild(logElement.firstElementChild);
      });

      console.log(`✅ Se cargaron ${moreLogs.length} logs adicionales`);
      
      // Mostrar mensaje de éxito temporal
      const successMsg = document.createElement('div');
      successMsg.className = 'text-center mt-4 text-green-400 text-sm';
      successMsg.textContent = `✅ Se cargaron ${moreLogs.length} logs adicionales`;
      logsContainer.parentNode.insertBefore(successMsg, loadMoreBtn.parentNode);
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        if (successMsg.parentNode) {
          successMsg.parentNode.removeChild(successMsg);
        }
      }, 3000);

    } catch (error) {
      console.error('❌ Error al cargar más logs:', error);
      
      // Mostrar mensaje de error
      const errorMsg = document.createElement('div');
      errorMsg.className = 'text-center mt-4 text-red-400 text-sm';
      errorMsg.textContent = '❌ Error al cargar más logs';
      logsContainer.parentNode.insertBefore(errorMsg, loadMoreBtn.parentNode);
      
      setTimeout(() => {
        if (errorMsg.parentNode) {
          errorMsg.parentNode.removeChild(errorMsg);
        }
      }, 3000);
    } finally {
      // Restaurar botón
      loadMoreBtn.innerHTML = originalText;
      loadMoreBtn.disabled = false;
    }
  }

  generateMoreLogs() {
    const logTypes = [
      { type: 'success', icon: '✅', color: 'bg-success' },
      { type: 'warning', icon: '⚠️', color: 'bg-warning' },
      { type: 'error', icon: '❌', color: 'bg-error' },
      { type: 'info', icon: 'ℹ️', color: 'bg-blue-500' }
    ];

    const logMessages = [
      { title: 'API Request', desc: 'Nueva petición procesada', details: 'GET /api/data - 200 OK' },
      { title: 'Cache Updated', desc: 'Caché actualizado correctamente', details: 'Cache refresh completed' },
      { title: 'Database Query', desc: 'Consulta ejecutada exitosamente', details: 'SELECT * FROM users - 15ms' },
      { title: 'Email Sent', desc: 'Correo electrónico enviado', details: 'Welcome email to new user' },
      { title: 'Backup Created', desc: 'Respaldo de base de datos creado', details: 'Backup_2024_01_15.sql' },
      { title: 'Security Scan', desc: 'Escaneo de seguridad completado', details: 'No threats detected' },
      { title: 'Performance Check', desc: 'Verificación de rendimiento', details: 'Response time: 1.2s' },
      { title: 'User Activity', desc: 'Actividad de usuario registrada', details: 'Login from new device' }
    ];

    const timeAgoOptions = [
      'Hace 20 minutos', 'Hace 25 minutos', 'Hace 30 minutos', 'Hace 35 minutos',
      'Hace 40 minutos', 'Hace 45 minutos', 'Hace 50 minutos', 'Hace 55 minutos',
      'Hace 1 hora', 'Hace 1.5 horas', 'Hace 2 horas', 'Hace 2.5 horas'
    ];

    const moreLogs = [];
    const numLogs = Math.floor(Math.random() * 5) + 3; // Entre 3 y 7 logs

    for (let i = 0; i < numLogs; i++) {
      const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
      const logMessage = logMessages[Math.floor(Math.random() * logMessages.length)];
      const timeAgo = timeAgoOptions[Math.floor(Math.random() * timeAgoOptions.length)];

      moreLogs.push(`
        <div class="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
          <div class="w-2 h-2 ${logType.color} rounded-full mt-2"></div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium text-${logType.type === 'success' ? 'success' : logType.type === 'warning' ? 'warning' : logType.type === 'error' ? 'error' : 'blue-400'}">${logMessage.title}</div>
                <div class="text-sm text-muted">${logMessage.desc}</div>
              </div>
              <div class="text-xs text-muted">${timeAgo}</div>
            </div>
            <div class="text-xs text-muted mt-1">${logMessage.details}</div>
          </div>
        </div>
      `);
    }

    return moreLogs;
  }

  filterLogs(filter) {
    console.log('🔍 Filtrando logs por:', filter);
    
    // Actualizar botones de filtro
    document.querySelectorAll('.log-filter-btn').forEach(btn => {
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-sm');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
      activeBtn.classList.add('btn-secondary');
      activeBtn.classList.remove('btn-sm');
    }

    // Filtrar logs existentes
    const logsContainer = document.querySelector('.space-y-3');
    if (!logsContainer) return;

    const logItems = logsContainer.querySelectorAll('.flex.items-start.gap-3');
    
    logItems.forEach(logItem => {
      const logText = logItem.textContent.toLowerCase();
      let shouldShow = true;

      switch(filter) {
        case 'info':
          shouldShow = logText.includes('info') || logText.includes('request') || logText.includes('query') || logText.includes('email') || logText.includes('backup') || logText.includes('security') || logText.includes('performance') || logText.includes('activity');
          break;
        case 'warning':
          shouldShow = logText.includes('warning') || logText.includes('alto uso') || logText.includes('memoria');
          break;
        case 'error':
          shouldShow = logText.includes('error') || logText.includes('failed') || logText.includes('❌');
          break;
        case 'all':
        default:
          shouldShow = true;
          break;
      }

      if (shouldShow) {
        logItem.style.display = 'flex';
      } else {
        logItem.style.display = 'none';
      }
    });

    // Mostrar mensaje de filtro aplicado
    const filterMsg = document.createElement('div');
    filterMsg.className = 'text-center mt-4 text-blue-400 text-sm';
    filterMsg.textContent = `🔍 Filtro aplicado: ${filter === 'all' ? 'Todos los logs' : filter.charAt(0).toUpperCase() + filter.slice(1)}`;
    
    // Remover mensaje anterior si existe
    const existingMsg = logsContainer.parentNode.querySelector('.text-blue-400');
    if (existingMsg) {
      existingMsg.remove();
    }
    
    logsContainer.parentNode.insertBefore(filterMsg, document.getElementById('loadMoreLogsBtn').parentNode);
    
    // Ocultar mensaje después de 2 segundos
    setTimeout(() => {
      if (filterMsg.parentNode) {
        filterMsg.parentNode.removeChild(filterMsg);
      }
    }, 2000);
  }

  getSubscriptionsHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">💳</span>
          Gestión de Suscripciones
        </h1>
        <p class="content-subtitle">Administrar suscripciones y planes de usuarios</p>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">1,234</div>
          <div class="stat-label">Suscripciones Activas</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">$12,450</div>
          <div class="stat-label">Ingresos Mensuales</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">89%</div>
          <div class="stat-label">Tasa de Retención</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">45</div>
          <div class="stat-label">Nuevas Suscripciones</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Suscripciones Recientes</h3>
          <button class="btn btn-primary btn-sm">
            <span class="nav-icon">➕</span>
            Nueva Suscripción
          </button>
        </div>
        <div class="card-content">
          <div class="text-center py-8">
            <div class="text-muted">Funcionalidad de suscripciones en desarrollo...</div>
          </div>
        </div>
      </div>
    `;
  }

  getPlansHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">🎯</span>
          Planes y Precios
        </h1>
        <p class="content-subtitle">Configurar planes de suscripción y precios</p>
      </div>

      <div class="card-grid">
        <div class="card">
          <h3 class="card-title">Plan Gratuito</h3>
          <div class="card-content">
            <div class="text-2xl font-bold text-primary mb-4">$0/mes</div>
            <ul class="space-y-2">
              <li>✓ Hasta 10 operaciones/mes</li>
              <li>✓ Estadísticas básicas</li>
              <li>✓ Soporte por email</li>
            </ul>
          </div>
        </div>
        <div class="card">
          <h3 class="card-title">Plan Pro</h3>
          <div class="card-content">
            <div class="text-2xl font-bold text-primary mb-4">$29/mes</div>
            <ul class="space-y-2">
              <li>✓ Operaciones ilimitadas</li>
              <li>✓ Analytics avanzados</li>
              <li>✓ Soporte prioritario</li>
            </ul>
          </div>
        </div>
        <div class="card">
          <h3 class="card-title">Plan Premium</h3>
          <div class="card-content">
            <div class="text-2xl font-bold text-primary mb-4">$99/mes</div>
            <ul class="space-y-2">
              <li>✓ Todo del Plan Pro</li>
              <li>✓ API personalizada</li>
              <li>✓ Soporte 24/7</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  getPaymentsHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">💰</span>
          Pagos y Facturación
        </h1>
        <p class="content-subtitle">Gestionar pagos, facturas y transacciones</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Transacciones Recientes</h3>
          <button class="btn btn-secondary btn-sm">
            <span class="nav-icon">📄</span>
            Exportar
          </button>
        </div>
        <div class="card-content">
          <div class="text-center py-8">
            <div class="text-muted">Sistema de pagos en desarrollo...</div>
          </div>
        </div>
      </div>
    `;
  }

  getAffiliatesHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">🤝</span>
          Red de Afiliados
        </h1>
        <p class="content-subtitle">Gestionar programa de afiliados y comisiones</p>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">156</div>
          <div class="stat-label">Afiliados Activos</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">$3,240</div>
          <div class="stat-label">Comisiones Pagadas</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">23</div>
          <div class="stat-label">Nuevos Referidos</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">12%</div>
          <div class="stat-label">Tasa de Conversión</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Afiliados Top</h3>
          <button class="btn btn-primary btn-sm">
            <span class="nav-icon">➕</span>
            Nuevo Afiliado
          </button>
        </div>
        <div class="card-content">
          <div class="text-center py-8">
            <div class="text-muted">Sistema de afiliados en desarrollo...</div>
          </div>
        </div>
      </div>
    `;
  }

  getPerformanceHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">⚡</span>
          Rendimiento del Sistema
        </h1>
        <p class="content-subtitle">Métricas de rendimiento y optimización</p>
      </div>

      <div class="card">
        <div class="card-content">
          <div class="text-center py-8">
            <div class="text-muted">Métricas de rendimiento en desarrollo...</div>
          </div>
        </div>
      </div>
    `;
  }

  getReportsHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">📄</span>
          Reportes y Analytics
        </h1>
        <p class="content-subtitle">Generar reportes detallados del sistema</p>
      </div>

      <div class="card">
        <div class="card-content">
          <div class="text-center py-8">
            <div class="text-muted">Sistema de reportes en desarrollo...</div>
          </div>
        </div>
      </div>
    `;
  }

  getSecurityHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">🔒</span>
          Seguridad del Sistema
        </h1>
        <p class="content-subtitle">Configuraciones de seguridad y monitoreo</p>
      </div>

      <div class="card">
        <div class="card-content">
          <div class="text-center py-8">
            <div class="text-muted">Panel de seguridad en desarrollo...</div>
          </div>
        </div>
      </div>
    `;
  }

  getBackupHTML() {
    return `
      <div class="content-header">
        <h1 class="content-title">
          <span class="nav-icon">💾</span>
          Respaldos y Recuperación
        </h1>
        <p class="content-subtitle">Gestionar respaldos y recuperación de datos</p>
      </div>

      <div class="card">
        <div class="card-content">
          <div class="text-center py-8">
            <div class="text-muted">Sistema de respaldos en desarrollo...</div>
          </div>
        </div>
      </div>
    `;
  }

  handleQuickAction(action) {
    switch(action) {
      case 'refresh':
        this.refreshAllData();
        break;
      case 'users':
        this.switchView('users');
        break;
      case 'analytics':
        this.switchView('analytics');
        break;
      case 'logs':
        this.switchView('logs');
        break;
    }
  }

  async loadInitialData() {
    await this.refreshAllData();
  }

  async refreshAllData() {
    const refreshBtn = document.getElementById('refreshBtn');
    const originalText = refreshBtn.innerHTML;
    
    try {
      // Mostrar estado de carga
      refreshBtn.innerHTML = '<span class="nav-icon">⏳</span> Actualizando...';
      refreshBtn.disabled = true;
      
      // Actualizar datos
      await Promise.all([
        this.fetchHealthCheck(),
        this.fetchSupabaseStatus(),
        this.fetchAdminStatus()
      ]);
      
      // Actualizar datos específicos según la vista actual
      const currentView = this.getCurrentView();
      if (currentView === 'overview') {
        await this.loadOverviewData();
      } else if (currentView === 'users') {
        await this.loadUsersData();
      } else if (currentView === 'analytics') {
        await this.loadAnalyticsData();
      } else if (currentView === 'subscriptions') {
        await this.loadSubscriptionsData();
      } else if (currentView === 'logs') {
        await this.loadLogsData();
      }
      
      // Mostrar éxito
      refreshBtn.innerHTML = '<span class="nav-icon">✅</span> Actualizado';
      refreshBtn.className = 'btn btn-success';
      
      // Restaurar estado después de 2 segundos
      setTimeout(() => {
        refreshBtn.innerHTML = originalText;
        refreshBtn.className = 'btn btn-primary';
        refreshBtn.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      
      // Mostrar error
      refreshBtn.innerHTML = '<span class="nav-icon">❌</span> Error';
      refreshBtn.className = 'btn btn-error';
      
      // Restaurar estado después de 3 segundos
      setTimeout(() => {
        refreshBtn.innerHTML = originalText;
        refreshBtn.className = 'btn btn-primary';
        refreshBtn.disabled = false;
      }, 3000);
    }
  }

  async fetchHealthCheck() {
    try {
      const response = await fetch('/health');
      const data = await response.json();
      
      const icon = document.getElementById('healthIcon');
      const status = document.getElementById('healthStatus');
      const details = document.getElementById('healthDetails');
      
      if (response.ok) {
        icon.className = 'status-icon success';
        icon.innerHTML = '✓';
        status.textContent = 'Servidor Activo';
        status.className = 'card-content text-success';
        
        if (details) {
          details.innerHTML = `
            <div>Uptime: ${Math.round(data.uptime)}s</div>
            <div>Memoria: ${Math.round(data.memory.heapUsed / 1024 / 1024)} MB</div>
          `;
        }

        // Update stats
        const uptimeElement = document.getElementById('serverUptime');
        const memoryElement = document.getElementById('memoryUsage');
        if (uptimeElement) uptimeElement.textContent = Math.round(data.uptime / 60);
        if (memoryElement) memoryElement.textContent = Math.round(data.memory.heapUsed / 1024 / 1024);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.updateStatus('health', 'error', `Error: ${error.message}`);
    }
  }

  async fetchSupabaseStatus() {
    try {
      const response = await fetch('/api/supabase/test');
      const data = await response.json();
      
      const icon = document.getElementById('supabaseIcon');
      const status = document.getElementById('supabaseStatus');
      const details = document.getElementById('supabaseDetails');
      
      if (response.ok) {
        icon.className = 'status-icon success';
        icon.innerHTML = '✓';
        status.textContent = 'Conectado';
        status.className = 'card-content text-success';
        
        if (details) {
          details.innerHTML = `
            <div>Usuarios: ${data.data ? data.data.length : 0}</div>
            <div>Estado: ${data.message}</div>
          `;
        }

        // Update stats
        const usersElement = document.getElementById('totalUsers');
        if (usersElement) usersElement.textContent = data.data ? data.data.length : 0;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.updateStatus('supabase', 'error', `Error: ${error.message}`);
    }
  }

  async fetchAdminStatus() {
    try {
      const response = await fetch('/api/admin');
      const data = await response.json();
      
      const icon = document.getElementById('adminIcon');
      const status = document.getElementById('adminStatus');
      const details = document.getElementById('adminDetails');
      
      if (response.ok) {
        icon.className = 'status-icon success';
        icon.innerHTML = '✓';
        status.textContent = 'Disponible';
        status.className = 'card-content text-success';
        
        if (details) {
          details.innerHTML = `
            <div>Versión: ${data.version}</div>
            <div>Endpoints: ${data.endpoints ? data.endpoints.length : 0}</div>
          `;
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.updateStatus('admin', 'error', `Error: ${error.message}`);
    }
  }

  updateStatus(service, type, message) {
    const icon = document.getElementById(`${service}Icon`);
    const status = document.getElementById(`${service}Status`);
    
    if (icon && status) {
      if (type === 'error') {
        icon.className = 'status-icon error';
        icon.innerHTML = '✗';
        status.textContent = message;
        status.className = 'card-content text-error';
      }
    }
  }

  startAutoRefresh() {
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.refreshAllData();
    }, 30000);
  }

  updateTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
      const now = new Date();
      timeElement.textContent = now.toLocaleTimeString('es-ES');
    }
    
    // Update time every second
    setTimeout(() => this.updateTime(), 1000);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminDashboard = new AdminDashboard();
});
