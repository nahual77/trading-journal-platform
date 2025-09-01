// Servicio para conexión local con MT5 (requiere MT5 terminal corriendo)
import { MT5Config } from '../types/trading';

interface LocalMT5ConnectionResult {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  connected: boolean;
  error?: string;
}

export class LocalMT5Service {
  private bridgeUrl: string;

  constructor() {
    // URL del bridge local (requiere EA o script en MT5)
    this.bridgeUrl = 'http://localhost:8080/mt5-bridge';
  }

  async connect(credentials: MT5Config): Promise<LocalMT5ConnectionResult> {
    try {
      console.log('Intentando conexión con MT5 local...');
      
      // Verificar si el bridge local está disponible
      const healthCheck = await this.checkBridgeHealth();
      if (!healthCheck) {
        throw new Error('Bridge MT5 local no disponible. Asegúrese de que MT5 esté ejecutándose con el EA bridge.');
      }

      // Enviar solicitud de conexión
      const response = await fetch(this.bridgeUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'connect',
          login: credentials.accountNumber,
          password: credentials.password,
          server: credentials.serverName,
          broker: credentials.broker
        }),
        signal: AbortSignal.timeout(15000) // Timeout de 15 segundos
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        return {
          balance: data.accountInfo.balance || 0,
          equity: data.accountInfo.equity || 0,
          margin: data.accountInfo.margin || 0,
          freeMargin: data.accountInfo.freeMargin || 0,
          connected: true
        };
      } else {
        throw new Error(data.error || 'Error desconocido del bridge MT5');
      }

    } catch (error) {
      console.error('Error en conexión MT5 local:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se puede conectar con MT5 local. Verificar que el terminal MT5 esté abierto con el bridge activado.');
      } else if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout de conexión con MT5 local. El terminal puede estar ocupado.');
      } else {
        throw new Error(`Error MT5 local: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  }

  private async checkBridgeHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.bridgeUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAccountInfo(): Promise<LocalMT5ConnectionResult | null> {
    try {
      const response = await fetch(`${this.bridgeUrl}/account-info`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          balance: data.balance || 0,
          equity: data.equity || 0,
          margin: data.margin || 0,
          freeMargin: data.freeMargin || 0,
          connected: true
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo info de cuenta MT5:', error);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await fetch(this.bridgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
        signal: AbortSignal.timeout(5000)
      });
    } catch (error) {
      console.error('Error desconectando MT5 local:', error);
    }
  }

  async isAvailable(): Promise<boolean> {
    return await this.checkBridgeHealth();
  }
}

// Instancia singleton
export const localMT5 = new LocalMT5Service();
