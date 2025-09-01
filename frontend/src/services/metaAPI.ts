// Servicio para conexión real con MetaApi
import { MT5Config } from '../types/trading';

interface MetaApiConnectionResult {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  connected: boolean;
  error?: string;
}

export class MetaApiService {
  private apiToken: string | null = null;

  constructor() {
    // En una implementación real, el token se obtendría del usuario
    // Por ahora usamos un token demo o configuración
    this.apiToken = (import.meta.env?.VITE_METAAPI_TOKEN as string) || null;
  }

  async connect(credentials: MT5Config): Promise<MetaApiConnectionResult> {
    try {
      // Verificar si tenemos token de API
      if (!this.apiToken) {
        throw new Error('Token de MetaApi no configurado. Se requiere token para conexión real.');
      }

      // Importación dinámica de MetaApi para evitar errores en build
      const MetaApi = await this.loadMetaApi();
      
      if (!MetaApi) {
        throw new Error('MetaApi SDK no disponible en el navegador');
      }

      const api = new MetaApi(this.apiToken);
      
      // Crear conexión a la cuenta
      const accountConfig = {
        name: `${credentials.broker} - ${credentials.accountNumber}`,
        type: 'cloud-g1' as const,
        login: credentials.accountNumber,
        password: credentials.password,
        server: credentials.serverName,
        platform: 'mt5' as const,
        magic: 123456,
        application: 'MetaApi',
        connectionStatus: 'CONNECTED'
      };

      console.log('Intentando crear cuenta MetaApi con configuración:', accountConfig);

      // Crear la cuenta
      const account = await api.metatraderAccountApi.createAccount(accountConfig);
      
      // Conectar a la cuenta
      console.log('Conectando a cuenta MetaApi...');
      await account.connect();

      // Obtener información de la cuenta
      console.log('Obteniendo información de cuenta...');
      const connection = account.getRPCConnection();
      await connection.connect();
      await connection.waitSynchronized();

      const accountInfo = await connection.getAccountInformation();
      
      return {
        balance: accountInfo.balance || 0,
        equity: accountInfo.equity || 0,
        margin: accountInfo.margin || 0,
        freeMargin: accountInfo.freeMargin || 0,
        connected: true
      };

    } catch (error) {
      console.error('Error en MetaApi:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en MetaApi';
      
      // Algunos errores específicos de MetaApi
      if (errorMessage.includes('E_SRV_NOT_FOUND')) {
        throw new Error('Servidor MT5 no encontrado. Verificar nombre del servidor.');
      } else if (errorMessage.includes('TRADE_DISABLED')) {
        throw new Error('Cuenta deshabilitada para trading. Contactar al broker.');
      } else if (errorMessage.includes('INVALID_ACCOUNT')) {
        throw new Error('Número de cuenta o contraseña incorrectos.');
      } else {
        throw new Error(`Error de MetaApi: ${errorMessage}`);
      }
    }
  }

  private async loadMetaApi(): Promise<any> {
    try {
      // MetaApi no funciona bien en el navegador debido a dependencias de Node.js
      // Por ahora retornamos null y usamos otros métodos de conexión
      console.warn('MetaApi no disponible en el navegador (requiere backend)');
      return null;
    } catch (error) {
      console.warn('MetaApi no disponible en el navegador:', error);
      return null;
    }
  }

  async disconnect() {
    // Cleanup si es necesario
    console.log('Desconectando MetaApi...');
  }

  // Método para validar si MetaApi está disponible
  async isAvailable(): Promise<boolean> {
    try {
      const MetaApi = await this.loadMetaApi();
      return MetaApi !== null && this.apiToken !== null;
    } catch {
      return false;
    }
  }
}

// Instancia singleton
export const metaAPI = new MetaApiService();
