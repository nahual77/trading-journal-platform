// Servicio principal para conexión REAL MT5 - SIN SIMULACIÓN CUANDO HAY TOKEN
import { MT5Config } from '../types/trading';
import { derivRealConnection } from './derivRealConnection';
import { derivAPI } from './derivAPI';
import { realDerivAPI } from './derivAPIReal';
import { metaAPI } from './metaAPI';
import { localMT5 } from './localMT5';

export interface RealMT5ConnectionResult {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  connected: boolean;
  connectionType: 'deriv' | 'metaapi' | 'local' | 'demo';
  error?: string;
  lastUpdate: string;
}

export class RealMT5ConnectionService {
  private currentConnection: string | null = null;
  private connectionData: RealMT5ConnectionResult | null = null;

  async connect(credentials: MT5Config): Promise<RealMT5ConnectionResult> {
    console.log('🚀 Iniciando conexión REAL a cuenta 80340837 en Deriv...');
    console.log('📋 Credenciales recibidas:', {
      account: credentials.accountNumber,
      server: credentials.serverName,
      broker: credentials.broker,
      hasPassword: !!credentials.password,
      hasApiToken: !!credentials.apiToken
    });
    
    // VERIFICACIÓN CRÍTICA: Si hay API token, SOLO usar conexión real
    if (credentials.apiToken && credentials.apiToken.trim() !== '') {
      console.log('🔥 MODO CONEXIÓN REAL: Token de API detectado - SIN FALLBACK A SIMULACIÓN');
      return this.connectWithRealToken(credentials);
    }
    
    // Si NO hay token de API, informar al usuario claramente
    if (credentials.accountNumber === '80340837') {
      throw new Error('❌ CONEXIÓN REAL REQUERIDA: Para conectar la cuenta 80340837, necesitas tu TOKEN DE API de Deriv.\n\n📝 PASOS:\n1. Ve a https://app.deriv.com/api-token\n2. Genera un token con permisos de lectura\n3. Copia el token y pégalo en el campo "API Token"\n4. Inténtalo de nuevo\n\n⚠️ Sin token de API, no es posible una conexión real a tu cuenta.');
    }
    
    // Para otras cuentas (modo legacy con fallbacks)
    console.log('⚠️ Modo legacy: Intentando conexiones con fallback...');
    const connectionStrategies = [
      { name: 'deriv-real', service: realDerivAPI, description: 'Deriv API Real HTTP+WebSocket', method: 'connectReal' },
      { name: 'deriv', service: derivAPI, description: 'Deriv API WebSocket', method: 'connect' },
      { name: 'metaapi', service: metaAPI, description: 'MetaApi Cloud', method: 'connect' },
      { name: 'local', service: localMT5, description: 'MT5 Local Bridge', method: 'connect' }
    ];

    let lastError: Error | null = null;

    // Intentar cada estrategia de conexión
    for (const strategy of connectionStrategies) {
      try {
        console.log(`🔌 Intentando conexión vía ${strategy.description}...`);
        
        // Verificar disponibilidad si el servicio lo soporta
        if ('isAvailable' in strategy.service) {
          const available = await strategy.service.isAvailable();
          if (!available) {
            console.log(`⚠️ ${strategy.description} no está disponible`);
            continue;
          }
        }

        // Intentar conexión usando el método apropiado
        const method = strategy.method || 'connect';
        const result = await strategy.service[method](credentials);
        
        if (result.connected) {
          console.log(`✅ Conexión exitosa vía ${strategy.description}`);
          
          this.currentConnection = strategy.name;
          this.connectionData = {
            ...result,
            connectionType: strategy.name as any,
            lastUpdate: new Date().toISOString()
          };
          
          return this.connectionData;
        }

      } catch (error) {
        console.error(`❌ Error en ${strategy.description}:`, error);
        lastError = error instanceof Error ? error : new Error(`Error en ${strategy.description}`);
        
        // Limpiar conexión si falló
        if ('disconnect' in strategy.service) {
          try {
            await strategy.service.disconnect();
          } catch (disconnectError) {
            console.error(`Error desconectando ${strategy.description}:`, disconnectError);
          }
        }
      }
    }

    // Si todas las conexiones reales fallaron, usar modo demo mejorado
    console.log('⚠️ Todas las conexiones reales fallaron, usando modo demo mejorado...');
    return this.connectDemoMode(credentials, lastError);
  }

  /**
   * CONEXIÓN REAL EXCLUSIVA - SIN SIMULACIÓN
   * Se usa cuando el usuario proporciona un token de API real
   */
  private async connectWithRealToken(credentials: MT5Config): Promise<RealMT5ConnectionResult> {
    console.log('🔥 CONEXIÓN REAL EXCLUSIVA - Token de API proporcionado');
    console.log('🔍 DEBUG CREDENCIALES EN REAL MT5:', {
      accountNumber: credentials.accountNumber,
      serverName: credentials.serverName,
      broker: credentials.broker,
      hasPassword: !!credentials.password,
      hasApiToken: !!credentials.apiToken,
      apiTokenLength: credentials.apiToken?.length || 0
    });
    
    try {
      // ÚNICO INTENTO: Conexión real con token
      console.log('🌐 Conectando con token de API real a Deriv...');
      console.log('📞 Llamando a derivRealConnection.connectReal...');
      const realResult = await derivRealConnection.connectReal(credentials);
      console.log('✅ derivRealConnection.connectReal completado:', realResult);
      
      if (realResult.connected) {
        console.log('✅ CONEXIÓN REAL EXITOSA - Datos auténticos de cuenta 80340837');
        
        this.currentConnection = 'deriv-real';
        this.connectionData = {
          ...realResult,
          connectionType: 'deriv',
          lastUpdate: new Date().toISOString()
        };
        
        return this.connectionData;
      } else {
        throw new Error(realResult.error || 'Conexión real falló sin error específico');
      }
      
    } catch (error) {
      console.error('❌ ERROR EN CONEXIÓN REAL:', error);
      console.error('🔍 ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('🔍 ERROR TYPE:', typeof error);
      console.error('🔍 ERROR CONSTRUCTOR:', error?.constructor?.name);
      
      // NO HAY FALLBACK CUANDO HAY TOKEN - Error claro
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en conexión real';
      
      throw new Error(`❌ CONEXIÓN REAL FALLÓ:\n${errorMessage}\n\n🔧 SOLUCIONES:\n• Verifica que tu token de API sea válido\n• Asegúrate de tener permisos de lectura\n• Revisa tu conexión a internet\n• Verifica el estado de tu cuenta en Deriv\n\n⚠️ NO SE USARÁN DATOS SIMULADOS con token de API presente.`);
    }
  }

  // Método especializado para la cuenta específica 80340837
  private async connectSpecificAccount80340837(credentials: MT5Config): Promise<RealMT5ConnectionResult> {
    console.log('🎯 Conexión especializada para cuenta 80340837');
    
    try {
      // Método 1: Conexión real HTTP+WebSocket
      console.log('🚀 Intentando conexión real HTTP+WebSocket...');
      const realResult = await realDerivAPI.connectReal(credentials);
      
      if (realResult.connected) {
        console.log('✅ Conexión REAL exitosa para cuenta 80340837');
        
        this.currentConnection = 'deriv-real';
        this.connectionData = {
          ...realResult,
          connectionType: 'deriv',
          lastUpdate: new Date().toISOString()
        };
        
        return this.connectionData;
      }
    } catch (error) {
      console.error('❌ Error en conexión real especializada:', error);
    }

    try {
      // Método 2: WebSocket estándar de Deriv
      console.log('🌐 Intentando WebSocket estándar de Deriv...');
      const derivResult = await derivAPI.connect(credentials);
      
      if (derivResult.connected) {
        console.log('✅ Conexión WebSocket exitosa para cuenta 80340837');
        
        this.currentConnection = 'deriv';
        this.connectionData = {
          ...derivResult,
          connectionType: 'deriv',
          lastUpdate: new Date().toISOString()
        };
        
        return this.connectionData;
      }
    } catch (error) {
      console.error('❌ Error en WebSocket estándar:', error);
    }

    // Fallback: Datos realistas específicos para 80340837
    console.log('📊 Usando datos realistas específicos para cuenta 80340837...');
    return this.generateSpecificAccountData(credentials);
  }

  private generateSpecificAccountData(credentials: MT5Config): RealMT5ConnectionResult {
    // Datos específicos más realistas para la cuenta 80340837
    const now = new Date();
    const marketHour = now.getHours();
    const isMarketOpen = marketHour >= 7 && marketHour <= 22;
    
    // Balance base para cuenta demo Deriv típica
    const baseBalance = 10000;
    const timeBasedVariation = Math.sin(now.getTime() / 100000) * 0.03;
    const marketVariation = isMarketOpen ? 1.01 : 0.99;
    
    const balance = parseFloat((baseBalance * (1 + timeBasedVariation) * marketVariation).toFixed(2));
    const equity = parseFloat((balance * (0.985 + Math.random() * 0.03)).toFixed(2));
    const margin = parseFloat((balance * 0.08 * Math.random()).toFixed(2));
    const freeMargin = parseFloat((equity - margin).toFixed(2));
    
    console.log('💰 Datos específicos para 80340837 generados:', {
      balance, equity, margin, freeMargin, marketOpen: isMarketOpen
    });
    
    this.currentConnection = 'demo';
    this.connectionData = {
      balance,
      equity,
      margin,
      freeMargin,
      connected: true,
      connectionType: 'demo',
      lastUpdate: new Date().toISOString(),
      error: 'Datos realistas para cuenta 80340837 - Conexión real no disponible'
    };
    
    return this.connectionData;
  }

  private connectDemoMode(credentials: MT5Config, lastError: Error | null): RealMT5ConnectionResult {
    // Generar datos demo más realistas basados en las credenciales
    const accountSeed = this.generateSeedFromCredentials(credentials);
    const now = new Date();
    
    // Variación basada en la hora del día para simular mercado real
    const hourVariation = Math.sin((now.getHours() / 24) * 2 * Math.PI) * 0.1;
    const randomVariation = (Math.random() - 0.5) * 0.05;
    const totalVariation = 1 + hourVariation + randomVariation;

    // Balance base más realista
    const baseBalance = this.calculateRealisticBalance(credentials.accountNumber);
    const currentBalance = baseBalance * totalVariation;
    
    // Simular datos de trading realistas
    const marginPercentage = 0.05 + Math.random() * 0.15; // 5-20% de margen usado
    const equityVariation = 0.98 + Math.random() * 0.04; // -2% a +2% de variación
    
    const balance = parseFloat(currentBalance.toFixed(2));
    const equity = parseFloat((balance * equityVariation).toFixed(2));
    const margin = parseFloat((balance * marginPercentage).toFixed(2));
    const freeMargin = parseFloat((equity - margin).toFixed(2));

    console.log('📊 Datos demo generados:', { balance, equity, margin, freeMargin });

    this.currentConnection = 'demo';
    this.connectionData = {
      balance,
      equity,
      margin,
      freeMargin,
      connected: true,
      connectionType: 'demo',
      lastUpdate: new Date().toISOString(),
      error: lastError ? `Conexión real falló: ${lastError.message}. Usando modo demo.` : undefined
    };

    return this.connectionData;
  }

  private generateSeedFromCredentials(credentials: MT5Config): number {
    // Crear seed reproducible basado en credenciales
    const str = `${credentials.accountNumber}${credentials.serverName}${credentials.broker}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    return Math.abs(hash);
  }

  private calculateRealisticBalance(accountNumber: string): number {
    // Extraer números del account number para determinar balance base
    const numericPart = accountNumber.replace(/\D/g, '');
    const lastDigits = parseInt(numericPart.slice(-4)) || 1000;
    
    // Rangos de balance basados en el tipo de cuenta (inferido del número)
    if (lastDigits < 1000) {
      return 500 + (lastDigits % 500); // Cuentas pequeñas: $500-$1000
    } else if (lastDigits < 5000) {
      return 1000 + (lastDigits % 2000); // Cuentas medianas: $1000-$3000
    } else {
      return 2000 + (lastDigits % 8000); // Cuentas grandes: $2000-$10000
    }
  }

  async disconnect(): Promise<void> {
    console.log('🔌 Desconectando servicios MT5...');
    
    // Desconectar el servicio activo
    try {
      if (this.currentConnection === 'deriv-real') {
        derivRealConnection.disconnect();
      } else if (this.currentConnection === 'deriv') {
        await derivAPI.disconnect();
      } else if (this.currentConnection === 'metaapi') {
        await metaAPI.disconnect();
      } else if (this.currentConnection === 'local') {
        await localMT5.disconnect();
      }
    } catch (error) {
      console.error('Error desconectando:', error);
    }

    this.currentConnection = null;
    this.connectionData = null;
  }

  async updateAccountData(): Promise<RealMT5ConnectionResult | null> {
    if (!this.connectionData || !this.currentConnection) {
      return null;
    }

    try {
      // Actualizar datos según el tipo de conexión
      if (this.currentConnection === 'deriv-real') {
        // ACTUALIZACIÓN REAL desde Deriv API
        const update = await derivRealConnection.updateRealData();
        if (update && update.connected) {
          console.log('🔄 Datos reales actualizados desde Deriv API');
          this.connectionData = {
            ...update,
            connectionType: 'deriv',
            lastUpdate: new Date().toISOString()
          };
        }
      } else if (this.currentConnection === 'local') {
        const update = await localMT5.getAccountInfo();
        if (update) {
          this.connectionData = {
            ...update,
            connectionType: 'local',
            lastUpdate: new Date().toISOString()
          };
        }
      } else if (this.currentConnection === 'deriv') {
        const update = await derivAPI.getAccountUpdate();
        if (update) {
          this.connectionData = {
            ...update,
            connectionType: 'deriv',
            lastUpdate: new Date().toISOString()
          };
        }
      }
      // Para demo mode, generar pequeñas variaciones
      else if (this.currentConnection === 'demo') {
        const variation = 1 + (Math.random() - 0.5) * 0.02; // ±1% variación
        this.connectionData = {
          ...this.connectionData,
          equity: parseFloat((this.connectionData.balance * variation).toFixed(2)),
          lastUpdate: new Date().toISOString()
        };
      }

      return this.connectionData;
    } catch (error) {
      console.error('Error actualizando datos de cuenta:', error);
      return null;
    }
  }

  getCurrentConnection(): RealMT5ConnectionResult | null {
    return this.connectionData;
  }

  getConnectionStatus(): string {
    if (!this.currentConnection) return 'disconnected';
    return this.connectionData?.connected ? 'connected' : 'disconnected';
  }
}

// Instancia singleton
export const realMT5Connection = new RealMT5ConnectionService();
