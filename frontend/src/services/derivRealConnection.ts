// 🔥 SERVICIO VERDADERO PARA CONEXIÓN REAL A DERIV - FORMATO OFICIAL CORRECTO
// Actualizado para usar derivAPICorrect con req_id numérico según documentación oficial

import { MT5Config } from '../types/trading';
import { derivAPICorrect } from './derivAPICorrect';

interface RealDerivResult {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  connected: boolean;
  currency?: string;
  isReal?: boolean;
  connectionType?: string;
  error?: string;
}

export class DerivRealConnectionService {
  private currentConnection: any = null;

  /**
   * CONEXIÓN REAL OBLIGATORIA - USANDO FORMATO OFICIAL DE DERIV API
   * Requiere API token real del usuario para funcionar
   */
  async connectReal(credentials: MT5Config): Promise<RealDerivResult> {
    console.log('🔥 INICIANDO CONEXIÓN REAL A DERIV - FORMATO OFICIAL CORRECTO');
    console.log('🔍 DEBUG CREDENCIALES RECIBIDAS:');
    console.log('  - apiToken:', credentials.apiToken ? `[TOKEN DE ${credentials.apiToken.length} CARACTERES]` : 'NO PROPORCIONADO');
    console.log('  - accountNumber:', credentials.accountNumber);
    console.log('  - serverName:', credentials.serverName);
    console.log('  - broker:', credentials.broker);
    console.log('  - password:', credentials.password ? '[CONTRASEÑA PROPORCIONADA]' : 'NO PROPORCIONADA');
    
    // VALIDACIÓN ESTRICTA: Token de API es OBLIGATORIO
    if (!credentials.apiToken || credentials.apiToken.trim() === '') {
      console.error('❌ VALIDACIÓN FALLIDA: Token de API vacío');
      throw new Error('❌ TOKEN DE API DE DERIV ES OBLIGATORIO. Sin token, no hay conexión real posible. Obtén tu token en: https://app.deriv.com/api-token');
    }
    console.log('✅ VALIDACIÓN 1: Token de API presente');

    // VALIDACIÓN: Credenciales específicas para cuenta 80340837
    if (credentials.accountNumber !== '80340837') {
      console.error('❌ VALIDACIÓN FALLIDA: Número de cuenta incorrecto:', credentials.accountNumber);
      throw new Error('❌ Este servicio está configurado específicamente para la cuenta 80340837');
    }
    console.log('✅ VALIDACIÓN 2: Cuenta 80340837 confirmada');

    // VALIDACIÓN RELAJADA: Servidor debe ser compatible (no solo incluir 'Deriv')
    if (!credentials.serverName || credentials.serverName.trim() === '') {
      console.error('❌ VALIDACIÓN FALLIDA: Servidor vacío');
      throw new Error('❌ Servidor es obligatorio (ej: DerivSVG-Server-02)');
    }
    console.log('✅ VALIDACIÓN 3: Servidor presente:', credentials.serverName);

    try {
      // Usar servicio correcto con formato oficial
      const result = await derivAPICorrect.connectReal(credentials);
      this.currentConnection = derivAPICorrect;
      
      console.log('✅ CONEXIÓN REAL EXITOSA con formato oficial');
      
      // Convertir formato para compatibilidad
      return {
        balance: result.balance,
        equity: result.equity,
        margin: result.margin,
        freeMargin: result.freeMargin,
        connected: result.connected,
        currency: result.currency,
        isReal: result.isReal,
        connectionType: result.connectionType
      };

    } catch (error) {
      console.error('❌ Error con API oficial:', error);
      throw error;
    }
  }

  /**
   * Actualizar datos en tiempo real - SOLO SI HAY CONEXIÓN REAL
   */
  async updateRealData(): Promise<RealDerivResult | null> {
    if (!this.currentConnection) {
      console.log('⚠️ Sin conexión real activa para actualizar');
      return null;
    }

    try {
      const result = await this.currentConnection.updateRealData();
      if (result) {
        return {
          balance: result.balance,
          equity: result.equity,
          margin: result.margin,
          freeMargin: result.freeMargin,
          connected: result.connected,
          currency: result.currency,
          isReal: result.isReal,
          connectionType: result.connectionType
        };
      }
      return null;
    } catch (error) {
      console.error('Error actualizando datos reales:', error);
      return null;
    }
  }

  /**
   * Desconectar - limpiar conexión real
   */
  disconnect(): void {
    console.log('🔌 Desconectando conexión REAL a Deriv...');
    
    if (this.currentConnection) {
      this.currentConnection.disconnect();
      this.currentConnection = null;
    }
  }

  /**
   * Verificar si hay conexión real activa
   */
  isReallyConnected(): boolean {
    return !!(this.currentConnection && this.currentConnection.isReallyConnected());
  }
}

// Instancia singleton para conexión real
export const derivRealConnection = new DerivRealConnectionService();
