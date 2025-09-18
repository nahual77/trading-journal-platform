import React from 'react';
import { useHealthCheck, useSupabaseTest, useAdminInfo } from '../hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

export function BackendConnection() {
  const health = useHealthCheck();
  const supabase = useSupabaseTest();
  const admin = useAdminInfo();

  const handleRefreshAll = () => {
    health.checkHealth();
    supabase.testSupabase();
    admin.getAdminInfo();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🔗 Conexión Backend</h2>
        <Button onClick={handleRefreshAll} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar Todo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Check */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              {health.loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : health.error ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              Health Check
            </CardTitle>
            <CardDescription>
              Estado del servidor backend
            </CardDescription>
          </CardHeader>
          <CardContent>
            {health.loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando...
              </div>
            )}
            {health.error && (
              <div className="text-sm text-red-500">
                Error: {health.error}
              </div>
            )}
            {health.data && (
              <div className="space-y-2">
                <Badge variant="outline" className="text-green-600">
                  Servidor Activo
                </Badge>
                <div className="text-xs text-gray-500">
                  Uptime: {Math.round(health.data.uptime || 0)}s
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supabase Test */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              {supabase.loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : supabase.error ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              Supabase
            </CardTitle>
            <CardDescription>
              Conexión a la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {supabase.loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Conectando...
              </div>
            )}
            {supabase.error && (
              <div className="text-sm text-red-500">
                Error: {supabase.error}
              </div>
            )}
            {supabase.data && (
              <div className="space-y-2">
                <Badge variant="outline" className="text-green-600">
                  Conectado
                </Badge>
                <div className="text-xs text-gray-500">
                  {supabase.data.users?.length || 0} usuarios encontrados
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              {admin.loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : admin.error ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              Admin Panel
            </CardTitle>
            <CardDescription>
              Panel de administración
            </CardDescription>
          </CardHeader>
          <CardContent>
            {admin.loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando...
              </div>
            )}
            {admin.error && (
              <div className="text-sm text-red-500">
                Error: {admin.error}
              </div>
            )}
            {admin.data && (
              <div className="space-y-2">
                <Badge variant="outline" className="text-blue-600">
                  Disponible
                </Badge>
                <div className="text-xs text-gray-500">
                  v{admin.data.version} - {admin.data.endpoints?.length || 0} endpoints
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detalles de conexión */}
      {(health.data || supabase.data || admin.data) && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Detalles de Conexión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {health.data && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Servidor Backend</h4>
                  <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                    <div>Status: {health.data.status}</div>
                    <div>Uptime: {Math.round(health.data.uptime)} segundos</div>
                    <div>Memoria: {Math.round((health.data.memory?.heapUsed || 0) / 1024 / 1024)} MB</div>
                  </div>
                </div>
              )}

              {supabase.data && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Base de Datos Supabase</h4>
                  <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                    <div>Usuarios: {supabase.data.users?.length || 0}</div>
                    <div>Último usuario: {supabase.data.users?.[0]?.email || 'N/A'}</div>
                  </div>
                </div>
              )}

              {admin.data && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Panel de Administración</h4>
                  <div className="bg-gray-50 p-3 rounded text-xs">
                    <div className="mb-2">Endpoints disponibles:</div>
                    <ul className="space-y-1 text-xs">
                      {admin.data.endpoints?.slice(0, 3).map((endpoint: string, index: number) => (
                        <li key={index} className="text-gray-600">• {endpoint}</li>
                      ))}
                      {admin.data.endpoints?.length > 3 && (
                        <li className="text-gray-500">... y {admin.data.endpoints.length - 3} más</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

