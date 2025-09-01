// Servicio para conexión REAL con Deriv API - NO SIMULACIÓN
import { MT5Config } from '../types/trading';

interface DerivConnectionResult {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  connected: boolean;
  error?: string;
}

export class DerivAPIService {
  private ws: WebSocket | null = null;
  private connectionPromise: Promise<DerivConnectionResult> | null = null;
  private authToken: string | null = null;

  async connect(credentials: MT5Config): Promise<DerivConnectionResult> {
    console.log('🚀 Iniciando conexión REAL a Deriv con credenciales:', {
      account: credentials.accountNumber,
      server: credentials.serverName,
      broker: credentials.broker
    });

    // Si ya hay una conexión en progreso, retornar esa promesa
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.establishRealConnection(credentials);
    return this.connectionPromise;
  }

  private establishRealConnection(credentials: MT5Config): Promise<DerivConnectionResult> {
    return new Promise((resolve, reject) => {
      try {
        // Cerrar conexión existente si existe
        if (this.ws) {
          this.ws.close();
        }

        // CONEXIÓN REAL: Usar endpoint oficial de Deriv con app_id específico
        this.ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=36300');
        
        let isResolved = false;
        const timeout = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            this.ws?.close();
            reject(new Error('Timeout: No se pudo conectar con el servidor real de Deriv'));
          }
        }, 15000);

        this.ws.onopen = () => {
          console.log('✅ Conexión WebSocket REAL establecida con Deriv');
          
          // PASO 1: Intentar autenticación directa con MT5 login
          if (!isResolved) {
            console.log('🔐 Intentando login MT5 con credenciales reales...');
            
            // Primer método: Login directo MT5 con Deriv
            this.attemptMT5Login(credentials, isResolved, timeout, resolve, reject);
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 Respuesta de Deriv API:', data);
            
            // Manejar respuesta de MT5 login
            if (data.mt5_login_list && !isResolved) {
              console.log('📋 Lista de cuentas MT5 recibida');
              this.handleMT5LoginList(data, credentials, isResolved, timeout, resolve, reject);
            }
            
            // Manejar respuesta de balance de cuenta específica
            if (data.mt5_get_settings && !isResolved) {
              console.log('💰 Datos de cuenta MT5 recibidos');
              this.handleMT5AccountData(data, isResolved, timeout, resolve, reject);
            }
            
            // Manejar respuesta de autorización con token
            if (data.authorize && !isResolved) {
              console.log('🔐 Autorización exitosa con token');
              isResolved = true;
              clearTimeout(timeout);
              
              // Solicitar lista de cuentas MT5 (req_id debe ser Number)
              this.ws?.send(JSON.stringify({
                mt5_login_list: 1,
                req_id: 2
              }));
            }
            
            // Manejar respuesta de balance directo
            if (data.balance && !isResolved) {
              console.log('💰 Balance directo recibido');
              isResolved = true;
              clearTimeout(timeout);
              
              resolve({
                balance: parseFloat(data.balance.balance),
                equity: parseFloat(data.balance.balance),
                margin: 0,
                freeMargin: parseFloat(data.balance.balance),
                connected: true
              });
            }
            
            // Manejar errores de la API
            if (data.error && !isResolved) {
              console.error('❌ Error de Deriv API:', data.error);
              
              // Si es error de autenticación, intentar método alternativo
              if (data.error.code === 'AuthorizationRequired' || data.error.code === 'InvalidToken') {
                console.log('🔄 Error de auth, intentando método sin token...');
                this.attemptDirectMT5Access(credentials, isResolved, timeout, resolve, reject);
              } else {
                isResolved = true;
                clearTimeout(timeout);
                reject(new Error(`Error de Deriv API: ${data.error.message} (${data.error.code})`));
              }
            }
            
          } catch (error) {
            console.error('Error parsing Deriv API response:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Error de conexión WebSocket:', error);
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            reject(new Error('Error de conexión con servidor de Deriv'));
          }
        };

        this.ws.onclose = (event) => {
          console.log('Conexión WebSocket cerrada:', event.code, event.reason);
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            reject(new Error('Conexión cerrada por el servidor de Deriv'));
          }
        };

      } catch (error) {
        reject(new Error(`Error iniciando conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`));
      }
    });
  }

  // MÉTODOS AUXILIARES PARA CONEXIÓN REAL

  private attemptMT5Login(credentials: MT5Config, isResolved: boolean, timeout: NodeJS.Timeout, resolve: Function, reject: Function) {
    if (isResolved) return;
    
    // Intentar obtener lista de cuentas MT5 disponibles (req_id debe ser Number)
    this.ws?.send(JSON.stringify({
      mt5_login_list: 1,
      req_id: 1
    }));
    
    // Si no hay respuesta en 5 segundos, intentar método directo
    setTimeout(() => {
      if (!isResolved) {
        console.log('⚠️ Timeout en mt5_login_list, intentando acceso directo...');
        this.attemptDirectMT5Access(credentials, isResolved, timeout, resolve, reject);
      }
    }, 5000);
  }

  private attemptDirectMT5Access(credentials: MT5Config, isResolved: boolean, timeout: NodeJS.Timeout, resolve: Function, reject: Function) {
    if (isResolved) return;
    
    // Intentar acceso directo a cuenta específica
    console.log(`🎯 Acceso directo a cuenta ${credentials.accountNumber}`);
    
    this.ws?.send(JSON.stringify({
      mt5_get_settings: 1,
      login: credentials.accountNumber,
      password: credentials.password,
      server: credentials.serverName,
      req_id: 3
    }));
  }

  private handleMT5LoginList(data: any, credentials: MT5Config, isResolved: boolean, timeout: NodeJS.Timeout, resolve: Function, reject: Function) {
    if (isResolved) return;
    
    // Buscar la cuenta específica del usuario
    const accounts = data.mt5_login_list || [];
    console.log(`🔍 Buscando cuenta ${credentials.accountNumber} en ${accounts.length} cuentas disponibles`);
    
    const userAccount = accounts.find((account: any) => 
      account.login === credentials.accountNumber ||
      account.login === parseInt(credentials.accountNumber)
    );
    
    if (userAccount) {
      console.log('✅ Cuenta encontrada:', userAccount);
      
      // Solicitar datos específicos de la cuenta (req_id debe ser Number)
      this.ws?.send(JSON.stringify({
        mt5_get_settings: 1,
        login: userAccount.login,
        req_id: 4
      }));
    } else {
      console.log('❌ Cuenta no encontrada en la lista, intentando acceso directo...');
      this.attemptDirectMT5Access(credentials, isResolved, timeout, resolve, reject);
    }
  }

  private handleMT5AccountData(data: any, isResolved: boolean, timeout: NodeJS.Timeout, resolve: Function, reject: Function) {
    if (isResolved) return;
    
    isResolved = true;
    clearTimeout(timeout);
    
    const accountData = data.mt5_get_settings;
    console.log('💰 Datos reales de cuenta MT5:', accountData);
    
    // Extraer datos reales de la cuenta
    const balance = parseFloat(accountData.balance || '0');
    const equity = parseFloat(accountData.equity || accountData.balance || '0');
    const margin = parseFloat(accountData.margin || accountData.margin_used || '0');
    const freeMargin = parseFloat(accountData.margin_free || (equity - margin).toString());
    
    resolve({
      balance,
      equity,
      margin,
      freeMargin,
      connected: true
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionPromise = null;
  }

  // Método para obtener datos REALES en tiempo real
  async getAccountUpdate(): Promise<DerivConnectionResult | null> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('⚠️ WebSocket no disponible para actualización');
      return null;
    }

    try {
      console.log('🔄 Solicitando actualización de datos reales...');
      
      // Solicitar actualización de balance en tiempo real (req_id debe ser Number)
      return new Promise((resolve) => {
        const requestId = Math.floor(Math.random() * 1000) + 100; // Número aleatorio
        
        // Timeout para la respuesta
        const timeout = setTimeout(() => {
          resolve(null);
        }, 5000);
        
        // Listener temporal para esta actualización
        const messageHandler = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.req_id === requestId || data.balance || data.mt5_get_settings) {
              clearTimeout(timeout);
              this.ws?.removeEventListener('message', messageHandler);
              
              if (data.balance) {
                resolve({
                  balance: parseFloat(data.balance.balance),
                  equity: parseFloat(data.balance.balance),
                  margin: 0,
                  freeMargin: parseFloat(data.balance.balance),
                  connected: true
                });
              } else if (data.mt5_get_settings) {
                const accountData = data.mt5_get_settings;
                resolve({
                  balance: parseFloat(accountData.balance || '0'),
                  equity: parseFloat(accountData.equity || accountData.balance || '0'),
                  margin: parseFloat(accountData.margin || '0'),
                  freeMargin: parseFloat(accountData.margin_free || '0'),
                  connected: true
                });
              }
            }
          } catch (error) {
            console.error('Error en actualización:', error);
          }
        };
        
        this.ws?.addEventListener('message', messageHandler);
        
        // Solicitar actualización
        this.ws?.send(JSON.stringify({
          balance: 1,
          account: 'all',
          req_id: requestId
        }));
      });
      
    } catch (error) {
      console.error('Error solicitando actualización:', error);
      return null;
    }
  }

  // Validar credenciales específicas del usuario 80340837
  private validateSpecificCredentials(credentials: MT5Config): boolean {
    const expectedAccount = '80340837';
    const expectedServer = 'DerivSVG-Server-02';
    
    if (credentials.accountNumber === expectedAccount && 
        credentials.serverName === expectedServer &&
        credentials.password.length >= 6) {
      console.log('✅ Credenciales del usuario 80340837 validadas');
      return true;
    }
    
    console.log('⚠️ Credenciales no coinciden con cuenta específica 80340837');
    return false;
  }
}

// Instancia singleton
export const derivAPI = new DerivAPIService();
