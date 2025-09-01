// directMT5Connection.ts - Conexión DIRECTA a MT5 (100% GRATIS)
import { MT5ConnectionData } from '../types/trading';

interface DirectMT5Credentials {
  accountNumber: string;
  password: string;
  serverName: string;
}

/**
 * Conexión DIRECTA a MT5 - 100% GRATUITO
 * Requiere Expert Advisor "Nagual_MT5_WebAPI" instalado en MT5
 */
export const connectToDirectMT5 = async (credentials: DirectMT5Credentials): Promise<MT5ConnectionData> => {
  console.log('🚀 INICIANDO CONEXIÓN DIRECTA MT5 - 100% GRATIS');
  console.log('🔧 Credenciales:', {
    accountNumber: credentials.accountNumber,
    server: credentials.serverName,
    hasPassword: !!credentials.password
  });

  try {
    // MÉTODO 1: REST API Local (puerto 8080)
    console.log('🥇 MÉTODO 1: Intentando REST API MT5 en puerto 8080...');
    
    const result = await connectViaRestAPI();
    if (result) {
      console.log('✅ CONEXIÓN DIRECTA MT5 EXITOSA - REST API');
      return result;
    }

  } catch (error) {
    console.log('❌ REST API no disponible:', error);
  }

  try {
    // MÉTODO 2: Archivo JSON (MT5_NagualAPI.mq5)
    console.log('🥈 MÉTODO 2: Intentando lectura de archivo JSON...');
    
    const result = await connectViaJSONFile();
    if (result) {
      console.log('✅ CONEXIÓN DIRECTA MT5 EXITOSA - Archivo JSON');
      return result;
    }

  } catch (error) {
    console.log('❌ Archivo JSON no disponible:', error);
  }

  try {
    // MÉTODO 3: Archivo CSV (alternativa)
    console.log('🥉 MÉTODO 3: Intentando lectura de archivo CSV...');
    
    const result = await connectViaCSVFile();
    if (result) {
      console.log('✅ CONEXIÓN DIRECTA MT5 EXITOSA - Archivo CSV');
      return result;
    }

  } catch (error) {
    console.log('❌ Archivo CSV no disponible:', error);
  }

  // Si no hay conexión disponible
  throw new Error(`❌ CONEXIÓN DIRECTA MT5 NO DISPONIBLE

🔧 SOLUCIÓN: Instala el Expert Advisor (EA) gratuito

📝 PASOS SIMPLES:
1. Descarga "Nagual_MT5_WebAPI.ex5" (botón de abajo)
2. Copia a: MT5/Experts/
3. Arrastra EA al gráfico
4. Habilita "AutoTrading" (botón verde en MT5)
5. Vuelve aquí y presiona "Conectar"

💡 El EA actúa como puente entre MT5 y esta aplicación
✅ 100% GRATIS - Sin servicios externos`);
};

/**
 * Conectar vía REST API (puerto 8080)
 * EA debe estar corriendo en MT5
 */
const connectViaRestAPI = async (): Promise<MT5ConnectionData | null> => {
  const ports = [8080, 8081, 8082, 9090, 9091]; // Puertos comunes
  
  for (const port of ports) {
    try {
      console.log(`🔍 Probando puerto ${port}...`);
      
      const response = await fetch(`http://localhost:${port}/account-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        signal: AbortSignal.timeout(2000) // Timeout 2 segundos
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ MT5 REST API encontrado en puerto ${port}`);
        console.log('📊 Datos recibidos:', data);
        
        return {
          balance: data.balance || 0,
          equity: data.equity || 0,
          margin: data.margin || 0,
          freeMargin: data.freeMargin || 0,
          connected: true,
          isReal: true,
          lastUpdate: new Date().toLocaleTimeString(),
          accountNumber: data.accountNumber,
          server: data.server,
          currency: data.currency || 'USD'
        };
      }
    } catch (error) {
      console.log(`❌ Puerto ${port} no responde`);
    }
  }
  
  return null;
};

/**
 * Conectar vía archivo JSON
 * EA MT5_NagualAPI versiones corregidas escriben datos JSON a archivo cada segundo
 */
const connectViaJSONFile = async (): Promise<MT5ConnectionData | null> => {
  // Array de archivos posibles generados por diferentes versiones del EA
  const possibleFiles = [
    'nagual_mt5_data.txt',           // Versiones estándar
    'nagual_mt5_data.json',          // Versión con extensión JSON
    'mt5_data.txt',                  // Versión alternativa
    'nagual_corrected_data.txt',     // Versión corregida específica
    'nagual_minimal_data.txt',       // Versión minimal específica
    'nagual_debug_data.txt'          // Versión debug específica
  ];

  // Array de ubicaciones posibles donde puede estar el archivo
  const possibleLocations = [
    '',                              // Carpeta public del servidor web
    'ea/',                          // Subcarpeta ea
    'files/',                       // Subcarpeta files
    'data/',                        // Subcarpeta data
  ];

  // Intentar leer archivos en orden de prioridad y ubicaciones
  for (const fileName of possibleFiles) {
    for (const location of possibleLocations) {
      try {
        const fullPath = location ? `/${location}${fileName}` : `/${fileName}`;
        console.log(`🔍 Intentando leer: ${fullPath}`);
        
        const response = await fetch(fullPath, {
          cache: 'no-cache',        // No usar caché para datos en tiempo real
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const jsonText = await response.text();
          
          // Validar que el contenido sea JSON válido
        if (!jsonText.trim().startsWith('{')) {
          console.log(`⚠️ Archivo ${fullPath} no contiene JSON válido`);
          continue;
        }
        
        try {
          const data = JSON.parse(jsonText);
        
        console.log(`✅ Datos MT5 JSON encontrados en ${fullPath}:`, data);
        
        // Validar que los datos sean válidos y recientes
        if (!data.balance && data.balance !== 0) {
          console.log(`⚠️ Archivo ${fullPath} no tiene datos de balance válidos`);
          continue;
        }
        
        // Verificar que los datos sean recientes (últimos 60 segundos)
        if (data.timestamp) {
          const dataTime = new Date(data.timestamp);
          const now = new Date();
          const diffSeconds = (now.getTime() - dataTime.getTime()) / 1000;
          
          if (diffSeconds > 60) {
            console.log(`⚠️ Datos en ${fullPath} son antiguos (${diffSeconds.toFixed(0)}s). EA podría no estar corriendo.`);
            continue;
          }
          
          console.log(`✅ Datos recientes (${diffSeconds.toFixed(0)}s) - EA funcionando correctamente`);
        }
        
        // Detectar versión del EA basada en campos específicos
        let eaVersion = 'desconocida';
        if (data.ea_version) {
          eaVersion = data.ea_version;
        } else if (data.export_count) {
          eaVersion = 'debug';
        } else if (data.mt5_build) {
          eaVersion = 'corrected';
        } else {
          eaVersion = 'minimal';
        }
        
        console.log(`🤖 EA LOCAL DETECTADO: Versión ${eaVersion} funcionando correctamente`);
        
        return {
          balance: parseFloat(data.balance) || 0,
          equity: parseFloat(data.equity) || 0,
          margin: parseFloat(data.margin) || 0,
          freeMargin: parseFloat(data.freeMargin) || 0,
          connected: data.connected || true,
          isReal: true,
          lastUpdate: data.timestamp || data.last_export || new Date().toLocaleTimeString(),
          accountNumber: data.login?.toString(),
          server: data.server,
          currency: data.currency || 'USD',
          method: `🤖 EA Local (${eaVersion})`
        };
        } catch (parseError) {
          console.log(`❌ Error al parsear JSON en ${fullPath}:`, parseError);
          continue;
        }
      } else {
        console.log(`❌ No se pudo acceder a ${fullPath}: ${response.status}`);
      }
      } catch (error) {
        console.log(`❌ Error leyendo archivo ${fileName}:`, error);
      }
    }
  }

  // Si no se encontró ningún archivo válido
  console.log('❌ No se encontraron archivos del EA local en ninguna ubicación');
  return null;
};

/**
 * Conectar vía archivo CSV
 * EA escribe datos a archivo cada segundo
 */
const connectViaCSVFile = async (): Promise<MT5ConnectionData | null> => {
  try {
    // En navegador, necesitamos que el usuario seleccione el archivo
    // O usar File System Access API (navegadores modernos)
    
    if ('showOpenFilePicker' in window) {
      console.log('📁 Usando File System Access API...');
      
      // @ts-ignore - API moderna de archivos
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'MT5 Data Files',
          accept: { 'text/csv': ['.csv'] }
        }],
        excludeAcceptAllOption: true,
        multiple: false
      });
      
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      return parseCSVData(content);
    }
  } catch (error) {
    console.log('❌ File System API no disponible o cancelado');
  }
  
  return null;
};

/**
 * Parsear datos JSON del EA
 */
const parseJSONData = (jsonContent: string): MT5ConnectionData => {
  try {
    const data = JSON.parse(jsonContent);
    
    return {
      balance: data.balance || 0,
      equity: data.equity || 0,
      margin: data.margin || 0,
      freeMargin: data.freeMargin || 0,
      connected: data.connected || true,
      isReal: true,
      lastUpdate: data.timestamp || new Date().toLocaleTimeString(),
      accountNumber: data.login?.toString(),
      server: data.server,
      currency: data.currency || 'USD',
      method: '📁 MT5 File Direct'
    };
  } catch (error) {
    throw new Error('Formato de archivo JSON inválido');
  }
};

/**
 * Parsear datos CSV del EA
 */
const parseCSVData = (csvContent: string): MT5ConnectionData => {
  const lines = csvContent.trim().split('\n');
  const lastLine = lines[lines.length - 1]; // Última línea (más reciente)
  const values = lastLine.split(',');
  
  if (values.length >= 5) {
    return {
      balance: parseFloat(values[1]) || 0,
      equity: parseFloat(values[2]) || 0,
      margin: parseFloat(values[3]) || 0,
      freeMargin: parseFloat(values[4]) || 0,
      connected: true,
      isReal: true,
      lastUpdate: values[0] || new Date().toLocaleTimeString(),
      currency: 'USD'
    };
  }
  
  throw new Error('Formato de archivo CSV inválido');
};

/**
 * Verificar si MT5 EA está activo
 */
export const checkMT5EAStatus = async (): Promise<{active: boolean, method?: string, port?: number}> => {
  console.log('🔍 Verificando estado del EA MT5...');
  
  // Verificar REST API
  const ports = [8080, 8081, 8082, 9090, 9091];
  
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}/ping`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000)
      });
      
      if (response.ok) {
        console.log(`✅ EA activo en puerto ${port}`);
        return { active: true, method: 'REST API', port };
      }
    } catch (error) {
      // Puerto no responde
    }
  }
  
  console.log('❌ EA no detectado');
  return { active: false };
};

/**
 * Probar conexión directa MT5
 */
export const testDirectMT5Connection = async (): Promise<boolean> => {
  try {
    const status = await checkMT5EAStatus();
    return status.active;
  } catch (error) {
    console.error('Error probando conexión directa:', error);
    return false;
  }
};