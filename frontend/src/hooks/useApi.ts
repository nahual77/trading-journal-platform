import { useState, useEffect, useCallback } from 'react';
import { apiService, ApiResponse } from '../services/apiService';

// Hook para manejar estados de carga y errores
export function useApi<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data || null);
        setError(null);
      } else {
        setError(response.error || 'Error desconocido');
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
}

// Hook específico para health check
export function useHealthCheck() {
  const api = useApi();
  
  const checkHealth = useCallback(() => {
    api.execute(() => apiService.getHealth());
  }, [api]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    ...api,
    checkHealth,
  };
}

// Hook específico para Supabase test
export function useSupabaseTest() {
  const api = useApi();
  
  const testSupabase = useCallback(() => {
    api.execute(() => apiService.testSupabase());
  }, [api]);

  return {
    ...api,
    testSupabase,
  };
}

// Hook específico para admin info
export function useAdminInfo() {
  const api = useApi();
  
  const getAdminInfo = useCallback(() => {
    api.execute(() => apiService.getAdminInfo());
  }, [api]);

  return {
    ...api,
    getAdminInfo,
  };
}

// Hook específico para usuarios
export function useUsers() {
  const api = useApi();
  
  const getUsers = useCallback(() => {
    api.execute(() => apiService.getUsers());
  }, [api]);

  return {
    ...api,
    getUsers,
  };
}

// Hook específico para estadísticas
export function useStats() {
  const api = useApi();
  
  const getOverviewStats = useCallback(() => {
    api.execute(() => apiService.getOverviewStats());
  }, [api]);

  const getTradingStats = useCallback(() => {
    api.execute(() => apiService.getTradingStats());
  }, [api]);

  return {
    ...api,
    getOverviewStats,
    getTradingStats,
  };
}

