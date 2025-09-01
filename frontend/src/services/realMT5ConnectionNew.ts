// realMT5ConnectionNew.ts - Conexión REAL MT5 DIRECTA (100% GRATIS)
import { MT5Config } from '../types/trading';
import { connectToDirectMT5, checkMT5EAStatus } from './directMT5Connection';
import { connectWithEA } from './eaManager';

export interface RealMT5ConnectionResult {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  connected: boolean;
  connectionType: 'direct_ea' | 'direct_api' | 'direct_file';
  error?: string;
  lastUpdate: string;
  accountNumber?: string;
  server?: string;
  currency?: string;
}

export class RealMT5ConnectionService {
  private currentConnection: string | null = null;
  private connectionData: RealMT5ConnectionResult | null = null;

  async connect(credentials: MT5Config): Promise<RealMT5ConnectionResult> {
    console.log('🚀 INICIANDO CONEXIÓN DIRECTA MT5 - 100% GRATIS');
    console.log('📋 Credenciales recibidas:', {
      account: credentials.accountNumber,
      server: credentials.serverName,
      broker: credentials.broker,
      hasPassword: !!credentials.password
    });
    
    // VERIFICACIÓN: Para cualquier cuenta MT5, usar conexión directa
    console.log('🔗 USANDO CONEXIÓN DIRECTA MT5 - Sin servicios externos');
    
    return this.connectWithDirectMT5(credentials);
  }

  private async connectWithDirectMT5(credentials: MT5Config): Promise<RealMT5ConnectionResult> {
    console.log('🔗 CONECTANDO DIRECTAMENTE A MT5 - Expert Advisor');
    
    try {
      // Verificar si EA está activo
      const eaStatus = await checkMT5EAStatus();
      
      if (!eaStatus.active) {
        throw new Error(`❌ EXPERT ADVISOR NO DETECTADO

🔧 SOLUCIÓN SIMPLE (100% GRATIS):

📥 1. DESCARGA EA: 
   - Haz clic en "Descargar EA" abajo
   - Guarda "Nagual_MT5_WebAPI.mq5"

📁 2. INSTALA EN MT5:
   - Abre MT5 → Archivo → Abrir carpeta de datos
   - Ve a: MQL5 → Experts
   - Copia el archivo .mq5

📊 3. ACTIVA EA:
   - En MT5: Navegador → Experts → "Nagual_MT5_WebAPI"
   - Arrastra al gráfico
   - Habilita "AutoTrading" (botón verde)

🎯 4. CONECTA:
   - Vuelve aquí y presiona "Conectar"
   - ¡Datos reales aparecerán!

💰 100% GRATUITO - Sin servicios externos`);
      }

      // Conectar usando EA
      const result = await connectWithEA({
        accountNumber: credentials.accountNumber,
        password: credentials.password,
        serverName: credentials.serverName
      });

      const connectionResult: RealMT5ConnectionResult = {
        balance: result.balance,
        equity: result.equity,
        margin: result.margin,
        freeMargin: result.freeMargin,
        connected: true,
        connectionType: 'direct_ea',
        lastUpdate: result.lastUpdate,
        accountNumber: result.accountNumber,
        server: result.server,
        currency: result.currency
      };

      console.log('✅ CONEXIÓN DIRECTA MT5 EXITOSA');
      console.log('💰 Datos obtenidos:', {
        balance: connectionResult.balance,
        equity: connectionResult.equity,
        server: connectionResult.server,
        currency: connectionResult.currency
      });

      this.connectionData = connectionResult;
      this.currentConnection = 'direct_ea';

      return connectionResult;

    } catch (error) {
      console.error('❌ ERROR CONEXIÓN DIRECTA MT5:', error);
      
      const errorResult: RealMT5ConnectionResult = {
        balance: 0,
        equity: 0,
        margin: 0,
        freeMargin: 0,
        connected: false,
        connectionType: 'direct_ea',
        error: error instanceof Error ? error.message : 'Error desconocido',
        lastUpdate: new Date().toLocaleTimeString()
      };

      return errorResult;
    }
  }

  async disconnect(): Promise<void> {
    console.log('🔌 Desconectando MT5...');
    this.currentConnection = null;
    this.connectionData = null;
  }

  getCurrentConnectionData(): RealMT5ConnectionResult | null {
    return this.connectionData;
  }

  isConnected(): boolean {
    return this.connectionData?.connected || false;
  }

  getConnectionType(): string | null {
    return this.currentConnection;
  }
}

// Instancia singleton
export const realMT5Connection = new RealMT5ConnectionService();

// Función de conveniencia para uso directo
export const connectToRealMT5 = async (credentials: MT5Config): Promise<RealMT5ConnectionResult> => {
  return realMT5Connection.connect(credentials);
};