// Servicio de API para comunicarse con el backend
const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // Métodos GET
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // Métodos POST
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Métodos PUT
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Métodos DELETE
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Métodos específicos del backend

  // Health check
  async getHealth(): Promise<ApiResponse> {
    // El health check está en la raíz del backend, no bajo /api
    const response = await fetch('http://localhost:3001/health');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      success: true,
      data,
    };
  }

  // Supabase test
  async testSupabase(): Promise<ApiResponse> {
    return this.get('/supabase/test');
  }

  // Admin endpoints
  async getAdminInfo(): Promise<ApiResponse> {
    return this.get('/admin');
  }

  async getAdminDashboard(): Promise<ApiResponse> {
    return this.get('/admin/dashboard');
  }

  async getUsers(): Promise<ApiResponse> {
    return this.get('/admin/users');
  }

  async getUserById(id: string): Promise<ApiResponse> {
    return this.get(`/admin/users/${id}`);
  }

  async getOverviewStats(): Promise<ApiResponse> {
    return this.get('/admin/stats/overview');
  }

  async getTradingStats(): Promise<ApiResponse> {
    return this.get('/admin/stats/trading');
  }

  async getSubscriptions(): Promise<ApiResponse> {
    return this.get('/admin/subscriptions');
  }

  // Trading Journal endpoints (para el futuro)
  async getTradingJournal(userId?: string): Promise<ApiResponse> {
    const endpoint = userId ? `/trading-journal/${userId}` : '/trading-journal';
    return this.get(endpoint);
  }

  async createTradingEntry(data: any): Promise<ApiResponse> {
    return this.post('/trading-journal', data);
  }

  async updateTradingEntry(id: string, data: any): Promise<ApiResponse> {
    return this.put(`/trading-journal/${id}`, data);
  }

  async deleteTradingEntry(id: string): Promise<ApiResponse> {
    return this.delete(`/trading-journal/${id}`);
  }
}

// Instancia singleton del servicio
export const apiService = new ApiService();

// Exportar la clase para casos especiales
export default ApiService;
