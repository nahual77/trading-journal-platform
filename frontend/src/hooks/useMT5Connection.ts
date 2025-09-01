import { useState, useEffect, useCallback, useRef } from 'react';
import { MT5Config } from '../types/trading';
import { realMT5Connection } from '../services/realMT5ConnectionNew';
import { DerivAPICorrectService } from '../services/derivAPICorrect';

interface MT5Data extends MT5Config {
  lastUpdate: string;
  profitLoss: number;
  dailyPnL: number;
  connectionType?: 'direct_ea' | 'direct_api' | 'direct_file';
  connectionError?: string;
  method?: string;
}

// Hook para simular conexión MT5 con datos realistas
export function useMT5Connection(initialConfig?: Partial<MT5Config>) {
  const [mt5Data, setMT5Data] = useState<MT5Data>({
    broker: initialConfig?.broker || 'Deriv (SVG) LLC',
    accountNumber: initialConfig?.accountNumber || '80340837',
    serverName: initialConfig?.serverName || 'DerivSVG-Server-02',
    password: initialConfig?.password || '',
    apiToken: initialConfig?.apiToken || '',
    balance: initialConfig?.balance || 1000.00,
    equity: initialConfig?.equity || 1000.00,
    margin: initialConfig?.margin || 0.00,
    freeMargin: initialConfig?.freeMargin || 1000.00,
    connected: initialConfig?.connected || false,
    lastUpdate: new Date().toISOString(),
    profitLoss: 0.00,
    dailyPnL: 0.00,
  });

  // Refs para valores críticos que siempre deben estar actualizados
  const passwordRef = useRef(initialConfig?.password || '');
  const apiTokenRef = useRef(initialConfig?.apiToken || '');

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Actualizar datos desde conexión real o simular pequeños movimientos
  const updateMarketData = useCallback(async () => {
    if (!mt5Data.connected) return;

    try {
      // Obtener datos actuales de la conexión
      const currentData = realMT5Connection.getCurrentConnectionData();
      
      if (currentData && currentData.connected) {
        // Usar datos reales actualizados
        const newProfitLoss = currentData.equity - currentData.balance;
        
        setMT5Data(prev => ({
          ...prev,
          balance: currentData.balance,
          equity: currentData.equity,
          margin: currentData.margin,
          freeMargin: currentData.freeMargin,
          profitLoss: parseFloat(newProfitLoss.toFixed(2)),
          lastUpdate: currentData.lastUpdate,
        }));
      } else {
        // Fallback: simular pequeños cambios si no hay datos reales
        setMT5Data(prev => {
          const change = (Math.random() - 0.5) * 2; // Cambios más pequeños ±1
          const newEquity = Math.max(0, prev.equity + change);
          const newProfitLoss = newEquity - prev.balance;
          
          return {
            ...prev,
            equity: parseFloat(newEquity.toFixed(2)),
            profitLoss: parseFloat(newProfitLoss.toFixed(2)),
            lastUpdate: new Date().toISOString(),
          };
        });
      }
    } catch (error) {
      console.error('Error actualizando datos de mercado:', error);
    }
  }, [mt5Data.connected]);

  // Conectar a MT5 usando conexión REAL (no simulación)
  const connect = async () => {
    console.log('🚀 FUNCIÓN CONNECT LLAMADA - INICIANDO PROCESO DE CONEXIÓN');
    setConnectionStatus('connecting');
    
    try {
      console.log('🔍 DEBUG VALORES ANTES DE VALIDACIÓN:');
      console.log('  - broker:', mt5Data.broker);
      console.log('  - serverName:', mt5Data.serverName);
      console.log('  - accountNumber:', mt5Data.accountNumber);
      console.log('  - password (estado):', mt5Data.password ? '[PRESENTE]' : '[VACÍO]');
      console.log('  - password (ref):', passwordRef.current ? '[PRESENTE]' : '[VACÍO]');
      console.log('  - apiToken (estado):', mt5Data.apiToken ? '[PRESENTE]' : '[VACÍO]');
      console.log('  - apiToken (ref):', apiTokenRef.current ? '[PRESENTE]' : '[VACÍO]');
      
      // Usar valores de los refs que siempre están actualizados
      const currentPassword = passwordRef.current || mt5Data.password || '';
      const currentApiToken = apiTokenRef.current || mt5Data.apiToken || '';
      
      console.log('🔍 VALORES FINALES PARA CONEXIÓN:');
      console.log('  - password final:', currentPassword ? '[PRESENTE]' : '[VACÍO]');
      console.log('  - apiToken final:', currentApiToken ? '[PRESENTE]' : '[VACÍO]');
      
      // Crear objeto con datos actuales usando refs
      const currentData = {
        ...mt5Data,
        password: currentPassword,
        apiToken: currentApiToken
      };
      
      // VALIDACIÓN RELAJADA PARA PERMITIR EA LOCAL
      if (currentData.accountNumber === '80340837') {
        console.log('🎯 CUENTA 80340837 DETECTADA - Intentando EA local primero');
        console.log('🤖 Para EA local no se requieren tokens - intentando conexión directa...');
        
        // No validar apiToken aquí - se validará solo si EA local falla
        if (!currentData.accountNumber) {
          throw new Error('ID de cuenta es requerido');
        }
      } else {
        // Para otras cuentas MT5: validación completa
        if (!currentData.broker || !currentData.serverName || !currentData.accountNumber || !currentData.password) {
          console.error('❌ VALIDACIÓN MT5 FALLIDA:');
          console.error('  - broker válido:', !!currentData.broker);
          console.error('  - serverName válido:', !!currentData.serverName);
          console.error('  - accountNumber válido:', !!currentData.accountNumber);
          console.error('  - password válido:', !!currentData.password);
          throw new Error('Broker, Servidor, ID de acceso y Contraseña son requeridos');
        }
      }
      
      // Validación específica para Deriv
      if (currentData.broker.includes('Deriv') && !currentData.serverName.includes('Deriv')) {
        throw new Error('El servidor debe ser compatible con el broker Deriv');
      }

      // Validación específica para cuenta 80340837
      if (currentData.accountNumber === '80340837') {
        console.log('🎯 Detectada cuenta 80340837 - Verificando requisitos...');
        
        console.log('🎯 Cuenta 80340837 detectada - Usando conexión DIRECTA MT5');
        console.log('💰 Modo: 100% GRATUITO - Sin servicios externos');
        
        console.log('✅ Procediendo con conexión DIRECTA MT5...');
      }

      console.log('🚀 Iniciando conexión REAL a MT5/Deriv...');
      
      let realConnectionResult;
      
      // PASO 1: PRIORIZAR EA LOCAL SIEMPRE
      console.log('🤖 PASO 1: Buscando EA local funcionando...');
      try {
        const { connectToDirectMT5 } = await import('../services/directMT5Connection');
        realConnectionResult = await connectToDirectMT5(currentData);
        console.log('✅ EA LOCAL ENCONTRADO - Usando datos reales del EA');
        realConnectionResult.connectionType = 'direct_ea';
      } catch (eaError: any) {
        console.log('📂 EA local no disponible:', eaError.message);
        
        // PASO 2: Solo si EA local falla, intentar API según cuenta
        console.log('🌐 EA local no encontrado, verificando alternativas...');
        
        if (currentData.accountNumber === '80340837') {
          // Para cuenta 80340837: verificar si token disponible para Deriv API
          if (currentData.apiToken) {
            console.log('🔥 USANDO SERVICIO DERIV API como fallback para cuenta 80340837');
            const derivService = new DerivAPICorrectService();
            realConnectionResult = await derivService.connectReal(currentData);
          } else {
            throw new Error(`🤖 EA LOCAL NO DISPONIBLE
            
📝 SOLUCIÓN RECOMENDADA:
1. Verifica que el EA esté corriendo en MT5
2. Confirma que AutoTrading esté habilitado
3. Busca el archivo "nagual_mt5_data.txt" en MQL5/Files

💡 ALTERNATIVA: Ingresa tu Token API de Deriv para conexión de respaldo`);
          }
        } else {
          // Para otras cuentas: usar servicio MT5 directo
          console.log('🏠 USANDO SERVICIO MT5 DIRECTO para otras cuentas');
          realConnectionResult = await realMT5Connection.connect(currentData);
        }
      }
      
      if (realConnectionResult.connected) {
        console.log('✅ Conexión real establecida:', realConnectionResult.connectionType);
        setConnectionStatus('connected');
        
        // Calcular P&L basado en balance vs equity
        const profitLoss = realConnectionResult.equity - realConnectionResult.balance;
        
        setMT5Data(prev => ({ 
          ...prev, 
          connected: true,
          balance: realConnectionResult.balance,
          equity: realConnectionResult.equity,
          margin: realConnectionResult.margin,
          freeMargin: realConnectionResult.freeMargin,
          profitLoss: parseFloat(profitLoss.toFixed(2)),
          lastUpdate: realConnectionResult.lastUpdate,
          connectionType: realConnectionResult.connectionType,
          connectionError: realConnectionResult.error
        }));

        // Si hay error pero está conectado (modo demo), logearlo
        if (realConnectionResult.error) {
          console.warn('⚠️ Conexión en modo demo:', realConnectionResult.error);
        }
      } else {
        throw new Error(realConnectionResult.error || 'Error de conexión desconocido');
      }
      
    } catch (error) {
      console.error('❌ Error en conexión real:', error);
      setConnectionStatus('disconnected');
      setMT5Data(prev => ({ 
        ...prev, 
        connected: false,
        connectionError: error instanceof Error ? error.message : 'Error desconocido'
      }));
      throw error;
    }
  }; // Función regular para capturar estado actual

  // Desconectar
  const disconnect = useCallback(async () => {
    console.log('🔌 Desconectando de MT5...');
    setConnectionStatus('disconnected');
    
    try {
      await realMT5Connection.disconnect();
    } catch (error) {
      console.error('Error al desconectar:', error);
    }
    
    setMT5Data(prev => ({ 
      ...prev, 
      connected: false,
      connectionType: undefined,
      connectionError: undefined
    }));
  }, []);

  // Actualizar configuración
  const updateConfig = useCallback((newConfig: Partial<MT5Config>) => {
    console.log('🔧 UPDATE CONFIG LLAMADO:', JSON.stringify(newConfig, null, 2));
    
    // Actualizar refs inmediatamente para valores críticos
    if (newConfig.password !== undefined) {
      passwordRef.current = newConfig.password;
      console.log('🔄 Password ref actualizado:', passwordRef.current ? '[PRESENTE]' : '[VACÍO]');
    }
    if (newConfig.apiToken !== undefined) {
      apiTokenRef.current = newConfig.apiToken;
      console.log('🔄 ApiToken ref actualizado:', apiTokenRef.current ? '[PRESENTE]' : '[VACÍO]');
    }
    
    setMT5Data(prev => {
      console.log('🔍 Estado anterior password:', prev.password);
      console.log('🔍 Estado anterior apiToken:', prev.apiToken);
      const newState = { ...prev, ...newConfig };
      console.log('🔍 Nuevo estado password:', newState.password);
      console.log('🔍 Nuevo estado apiToken:', newState.apiToken);
      return newState;
    });
  }, []); // SIN dependencias para evitar re-creación

  // Resetear PnL diario
  const resetDailyPnL = useCallback(() => {
    setMT5Data(prev => ({ ...prev, dailyPnL: 0 }));
  }, []);

  // Efecto para actualizaciones en tiempo real (datos reales cuando disponible)
  useEffect(() => {
    if (!mt5Data.connected) return;

    // Intervalo más inteligente: más frecuente para datos reales, menos para demo
    const updateInterval = !mt5Data.connected || mt5Data.connectionType === 'direct_file' ? 
      8000 + Math.random() * 4000 : // Demo: 8-12 segundos
      5000 + Math.random() * 3000;  // Real: 5-8 segundos

    const interval = setInterval(updateMarketData, updateInterval);
    return () => clearInterval(interval);
  }, [mt5Data.connected, mt5Data.connectionType, updateMarketData]);

  // Efecto para resetear PnL diario a medianoche
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      resetDailyPnL();
      // Configurar intervalo diario
      const dailyInterval = setInterval(resetDailyPnL, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [resetDailyPnL]);

  return {
    mt5Data,
    connectionStatus,
    connect,
    disconnect,
    updateConfig,
    resetDailyPnL,
    isConnected: mt5Data.connected,
    isConnecting: connectionStatus === 'connecting',
  };
}

// Hook para obtener datos históricos simulados
export function useMT5History(days: number = 30) {
  const [history, setHistory] = useState<Array<{
    date: string;
    balance: number;
    equity: number;
    profitLoss: number;
  }>>([]);

  useEffect(() => {
    // Generar historial simulado
    const generateHistory = () => {
      const data = [];
      let currentBalance = 1000;
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Simular cambios diarios
        const dailyChange = (Math.random() - 0.5) * 50; // -25 a +25
        currentBalance = Math.max(100, currentBalance + dailyChange);
        
        const equity = currentBalance + (Math.random() - 0.5) * 20;
        const profitLoss = equity - currentBalance;
        
        data.push({
          date: date.toISOString().split('T')[0],
          balance: parseFloat(currentBalance.toFixed(2)),
          equity: parseFloat(equity.toFixed(2)),
          profitLoss: parseFloat(profitLoss.toFixed(2)),
        });
      }
      
      setHistory(data);
    };

    generateHistory();
  }, [days]);

  return history;
}
