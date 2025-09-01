// metaTraderAPI.ts - Conexión REAL a MT5 usando MetaAPI.cloud
import { MT5ConnectionData } from '../types/trading';

interface MetaAPICredentials {
  accountNumber: string;
  password: string;
  serverName: string;
  metaApiToken: string;
}

interface MetaAPIAccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  login: string;
  server: string;
  currency: string;
}

/**
 * Conectar a cuenta MT5 real usando MetaAPI.cloud
 * Este es el método estándar para conectar aplicaciones con MT5
 */
export const connectToRealMT5Account = async (credentials: MetaAPICredentials): Promise<MT5ConnectionData> => {
  console.log('🚀 INICIANDO CONEXIÓN MT5 REAL - MetaAPI.cloud');
  console.log('🔧 Credenciales:', {
    accountNumber: credentials.accountNumber,
    server: credentials.serverName,
    hasPassword: !!credentials.password,
    hasMetaApiToken: !!credentials.metaApiToken
  });

  try {
    // PASO 1: Crear cuenta en MetaAPI si no existe
    console.log('📝 PASO 1: Creando/conectando cuenta MT5 en MetaAPI...');
    
    const createAccountResponse = await fetch('https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': credentials.metaApiToken
      },
      body: JSON.stringify({
        name: `Deriv-MT5-${credentials.accountNumber}`,
        type: 'cloud',
        login: credentials.accountNumber,
        password: credentials.password,
        server: credentials.serverName,
        platform: 'mt5',
        magic: 123456,
        application: 'MetaApi',
        copyFactoryRoles: ['SUBSCRIBER']
      })
    });

    console.log('📊 Respuesta MetaAPI:', createAccountResponse.status);

    let accountId: string;
    
    if (createAccountResponse.status === 201) {
      // Cuenta creada exitosamente
      const newAccount = await createAccountResponse.json();
      accountId = newAccount.id;
      console.log('✅ Nueva cuenta MT5 creada:', accountId);
    } else if (createAccountResponse.status === 409) {
      // Cuenta ya existe, obtener ID
      console.log('📋 Cuenta ya existe, obteniendo lista...');
      const accountsResponse = await fetch('https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts', {
        headers: {
          'auth-token': credentials.metaApiToken
        }
      });
      
      const accounts = await accountsResponse.json();
      const existingAccount = accounts.find((acc: any) => acc.login === credentials.accountNumber);
      
      if (!existingAccount) {
        throw new Error(`No se encontró cuenta MT5 con login ${credentials.accountNumber}`);
      }
      
      accountId = existingAccount.id;
      console.log('✅ Cuenta existente encontrada:', accountId);
    } else {
      const errorData = await createAccountResponse.text();
      throw new Error(`Error MetaAPI: ${createAccountResponse.status} - ${errorData}`);
    }

    // PASO 2: Esperar a que la cuenta esté desplegada
    console.log('⏳ PASO 2: Esperando despliegue de cuenta...');
    
    let accountReady = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 segundos máximo
    
    while (!accountReady && attempts < maxAttempts) {
      const statusResponse = await fetch(`https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts/${accountId}`, {
        headers: {
          'auth-token': credentials.metaApiToken
        }
      });
      
      const accountStatus = await statusResponse.json();
      console.log(`🔄 Estado cuenta (intento ${attempts + 1}):`, accountStatus.state);
      
      if (accountStatus.state === 'DEPLOYED') {
        accountReady = true;
        console.log('✅ Cuenta MT5 desplegada y lista');
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        attempts++;
      }
    }
    
    if (!accountReady) {
      throw new Error('Timeout: La cuenta MT5 no se desplegó en 30 segundos');
    }

    // PASO 3: Obtener información de la cuenta
    console.log('📊 PASO 3: Obteniendo información de cuenta...');
    
    const accountInfoResponse = await fetch(`https://mt-client-api-v1.london.agiliumtrade.ai/users/current/accounts/${accountId}/account-information`, {
      headers: {
        'auth-token': credentials.metaApiToken
      }
    });
    
    if (!accountInfoResponse.ok) {
      throw new Error(`Error obteniendo info de cuenta: ${accountInfoResponse.status}`);
    }
    
    const accountInfo: MetaAPIAccountInfo = await accountInfoResponse.json();
    
    console.log('💰 INFORMACIÓN DE CUENTA MT5 RECIBIDA:');
    console.log('📈 Balance:', accountInfo.balance);
    console.log('📈 Equity:', accountInfo.equity);
    console.log('📈 Margin:', accountInfo.margin);
    console.log('📈 Free Margin:', accountInfo.freeMargin);
    console.log('🏦 Server:', accountInfo.server);
    console.log('💱 Currency:', accountInfo.currency);

    return {
      balance: accountInfo.balance,
      equity: accountInfo.equity,
      margin: accountInfo.margin,
      freeMargin: accountInfo.freeMargin,
      connected: true,
      isReal: true,
      lastUpdate: new Date().toLocaleTimeString(),
      accountNumber: accountInfo.login,
      server: accountInfo.server,
      currency: accountInfo.currency
    };

  } catch (error) {
    console.error('❌ ERROR CONEXIÓN MT5 REAL:', error);
    throw new Error(`MT5 Real Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Conectar a terminal MT5 local (alternativa)
 */
export const connectToLocalMT5Terminal = async (credentials: MetaAPICredentials): Promise<MT5ConnectionData> => {
  console.log('🏠 INTENTANDO CONEXIÓN MT5 LOCAL...');
  
  try {
    // Buscar en puertos comunes para MT5 local
    const ports = [8080, 8081, 8082, 9090, 9091];
    
    for (const port of ports) {
      try {
        console.log(`🔍 Probando puerto ${port}...`);
        
        const response = await fetch(`http://localhost:${port}/mt5-connect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            login: credentials.accountNumber,
            password: credentials.password,
            server: credentials.serverName
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ MT5 Local conectado en puerto ${port}`);
          
          return {
            balance: data.balance,
            equity: data.equity,
            margin: data.margin,
            freeMargin: data.freeMargin,
            connected: true,
            isReal: true,
            lastUpdate: new Date().toLocaleTimeString()
          };
        }
      } catch (portError) {
        console.log(`❌ Puerto ${port} no disponible`);
      }
    }
    
    throw new Error('No se encontró terminal MT5 local en puertos 8080-8082, 9090-9091');
    
  } catch (error) {
    console.error('❌ ERROR MT5 LOCAL:', error);
    throw new Error(`MT5 Local: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Conectar usando cTrader API (alternativa para Deriv)
 */
export const connectToCTraderDeriv = async (credentials: MetaAPICredentials): Promise<MT5ConnectionData> => {
  console.log('🔄 INTENTANDO CONEXIÓN cTrader...');
  
  try {
    const response = await fetch('https://openapi.ctrader.com/v1/accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.metaApiToken}`, // Usar como cTrader token
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`cTrader API Error: ${response.status}`);
    }
    
    const accounts = await response.json();
    
    // Buscar cuenta específica
    const userAccount = accounts.find((acc: any) => 
      acc.login === credentials.accountNumber
    );
    
    if (!userAccount) {
      throw new Error(`No se encontró cuenta cTrader con login ${credentials.accountNumber}`);
    }
    
    console.log('✅ Cuenta cTrader encontrada');
    
    return {
      balance: userAccount.balance,
      equity: userAccount.equity,
      margin: userAccount.margin,
      freeMargin: userAccount.freeMargin,
      connected: true,
      isReal: true,
      lastUpdate: new Date().toLocaleTimeString()
    };
    
  } catch (error) {
    console.error('❌ ERROR cTrader:', error);
    throw new Error(`cTrader API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Sistema de detección automática de métodos MT5
 */
export const connectToMT5Real = async (credentials: MetaAPICredentials): Promise<MT5ConnectionData> => {
  console.log('🎯 DETECTANDO MÉTODO DE CONEXIÓN MT5 ÓPTIMO...');
  console.log('🔧 Credenciales recibidas:', {
    accountNumber: credentials.accountNumber,
    server: credentials.serverName,
    hasPassword: !!credentials.password,
    hasMetaApiToken: !!credentials.metaApiToken
  });
  
  const errors: string[] = [];
  
  // MÉTODO 1: MetaAPI.cloud (recomendado)
  if (credentials.metaApiToken && credentials.metaApiToken.length > 20) {
    try {
      console.log('🥇 MÉTODO 1: Intentando MetaAPI.cloud...');
      return await connectToRealMT5Account(credentials);
    } catch (error) {
      const errorMsg = `MetaAPI: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.log('❌ MetaAPI no disponible:', errorMsg);
      errors.push(errorMsg);
    }
  } else {
    console.log('⚠️ Token MetaAPI no válido o no proporcionado');
    errors.push('Token MetaAPI requerido para conexión en la nube');
  }
  
  // MÉTODO 2: MT5 Local
  try {
    console.log('🥈 MÉTODO 2: Intentando MT5 Local...');
    return await connectToLocalMT5Terminal(credentials);
  } catch (error) {
    const errorMsg = `MT5 Local: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.log('❌ MT5 Local no disponible:', errorMsg);
    errors.push(errorMsg);
  }
  
  // MÉTODO 3: cTrader (usando token como cTrader token)
  if (credentials.metaApiToken) {
    try {
      console.log('🥉 MÉTODO 3: Intentando cTrader...');
      return await connectToCTraderDeriv(credentials);
    } catch (error) {
      const errorMsg = `cTrader: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.log('❌ cTrader no disponible:', errorMsg);
      errors.push(errorMsg);
    }
  }
  
  // Si todos los métodos fallan
  console.error('💥 TODOS LOS MÉTODOS DE CONEXIÓN MT5 FALLARON');
  console.error('📋 Errores:', errors);
  
  throw new Error(`No se pudo conectar con MT5. Errores encontrados:\n${errors.join('\n')}\n\n💡 Solución: Configura MetaAPI.cloud o ejecuta MT5 localmente`);
};