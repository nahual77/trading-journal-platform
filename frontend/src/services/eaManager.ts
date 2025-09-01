// eaManager.ts - Gestor del Expert Advisor descargable
import { MT5ConnectionData } from '../types/trading';
import { connectToDirectMT5, checkMT5EAStatus } from './directMT5Connection';

export interface EADownloadInfo {
  filename: string;
  version: string;
  size: string;
  description: string;
  features: string[];
}

/**
 * Información del EA disponible para descarga
 */
export const EA_INFO: EADownloadInfo = {
  filename: 'Nagual_MT5_WebAPI.mq5',
  version: '1.0',
  size: '~15KB',
  description: 'Expert Advisor para conexión directa MT5 ↔ Nagual Trader Journal',
  features: [
    '🌐 Servidor REST API integrado (puerto 8080)',
    '📊 Datos reales en tiempo real (Balance, Equity, Margin)',
    '🔒 100% seguro - Solo lectura de datos',
    '⚡ Respuesta instantánea',
    '📱 Compatible con cualquier navegador',
    '💰 Completamente GRATUITO'
  ]
};

/**
 * Descargar Expert Advisor
 */
export const downloadEA = async (): Promise<void> => {
  console.log('📥 Iniciando descarga del EA...');
  
  try {
    // Obtener el código del EA desde el archivo público
    const response = await fetch('/ea/Nagual_MT5_WebAPI.mq5');
    
    if (!response.ok) {
      throw new Error(`Error descargando EA: ${response.status}`);
    }
    
    const eaCode = await response.text();
    
    // Crear blob y descargar
    const blob = new Blob([eaCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = EA_INFO.filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    console.log('✅ EA descargado exitosamente');
    
  } catch (error) {
    console.error('❌ Error descargando EA:', error);
    throw new Error('No se pudo descargar el Expert Advisor');
  }
};

/**
 * Generar código EA alternativo (más simple)
 */
export const downloadSimpleEA = (): void => {
  console.log('📥 Generando EA simple...');
  
  const simpleEACode = `//+------------------------------------------------------------------+
//|                                      Nagual_Simple_WebAPI.mq5 |
//|                            Nagual Trader Journal - Simple EA  |
//+------------------------------------------------------------------+
#property copyright "Nagual Trader Journal"
#property version   "1.00"
#property description "EA Simple para Nagual Trader Journal"

// Variables globales
int file_handle = INVALID_HANDLE;
datetime last_update = 0;

//+------------------------------------------------------------------+
//| Inicialización                                                  |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("✅ Nagual Simple EA - Iniciado");
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Función principal                                               |
//+------------------------------------------------------------------+
void OnTick()
{
   // Actualizar archivo cada segundo
   if(TimeCurrent() - last_update >= 1)
   {
      ExportAccountData();
      last_update = TimeCurrent();
   }
}

//+------------------------------------------------------------------+
//| Exportar datos a archivo                                       |
//+------------------------------------------------------------------+
void ExportAccountData()
{
   string filename = "Nagual_MT5_Data.csv";
   
   file_handle = FileOpen(filename, FILE_WRITE|FILE_CSV);
   
   if(file_handle != INVALID_HANDLE)
   {
      // Escribir datos de cuenta
      FileWrite(file_handle,
         TimeToString(TimeCurrent()),
         DoubleToString(AccountInfoDouble(ACCOUNT_BALANCE), 2),
         DoubleToString(AccountInfoDouble(ACCOUNT_EQUITY), 2),
         DoubleToString(AccountInfoDouble(ACCOUNT_MARGIN), 2),
         DoubleToString(AccountInfoDouble(ACCOUNT_MARGIN_FREE), 2),
         IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN)),
         AccountInfoString(ACCOUNT_SERVER)
      );
      
      FileClose(file_handle);
   }
}

//+------------------------------------------------------------------+`;

  // Descargar EA simple
  const blob = new Blob([simpleEACode], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Nagual_Simple_WebAPI.mq5';
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
  
  console.log('✅ EA simple generado');
};

/**
 * Verificar estado del EA
 */
export const getEAStatus = async (): Promise<{
  isActive: boolean;
  method?: string;
  port?: number;
  message: string;
}> => {
  try {
    const status = await checkMT5EAStatus();
    
    if (status.active) {
      return {
        isActive: true,
        method: status.method,
        port: status.port,
        message: `✅ EA activo - ${status.method} en puerto ${status.port}`
      };
    } else {
      return {
        isActive: false,
        message: '❌ EA no detectado - Instala y activa el EA en MT5'
      };
    }
  } catch (error) {
    return {
      isActive: false,
      message: '❌ Error verificando EA - Asegúrate de que MT5 esté ejecutándose'
    };
  }
};

/**
 * Conectar usando EA directo
 */
export const connectWithEA = async (credentials: {
  accountNumber: string;
  password: string;
  serverName: string;
}): Promise<MT5ConnectionData> => {
  console.log('🔗 Conectando con EA directo...');
  
  try {
    const result = await connectToDirectMT5(credentials);
    console.log('✅ Conexión directa MT5 exitosa');
    return result;
  } catch (error) {
    console.error('❌ Error en conexión directa:', error);
    throw error;
  }
};

/**
 * Instrucciones de instalación del EA
 */
export const getInstallationInstructions = (): string[] => {
  return [
    '📥 Descarga el archivo "Nagual_MT5_WebAPI.mq5"',
    '📁 Abre MT5 → Archivo → Abrir carpeta de datos',
    '📂 Ve a: MQL5 → Experts',
    '📋 Pega el archivo .mq5 descargado',
    '🔄 En MT5: Ve a Navegador → Experts → Haz doble click en "Nagual_MT5_WebAPI"',
    '📊 Arrastra el EA a cualquier gráfico',
    '✅ Habilita "AutoTrading" (botón verde en la barra de herramientas)',
    '🎯 Vuelve aquí y presiona "Conectar" para obtener datos reales'
  ];
};

/**
 * Enlaces útiles para el usuario
 */
export const getHelpfulLinks = (): Array<{title: string, url: string, description: string}> => {
  return [
    {
      title: 'Cómo instalar EA en MT5',
      url: 'https://www.youtube.com/results?search_query=como+instalar+expert+advisor+mt5',
      description: 'Videos explicativos en YouTube'
    },
    {
      title: 'Documentación MT5',
      url: 'https://www.mql5.com/es/docs',
      description: 'Documentación oficial de MQL5'
    },
    {
      title: 'Habilitar AutoTrading',
      url: 'https://www.mql5.com/es/articles/581',
      description: 'Cómo activar trading automático'
    }
  ];
};