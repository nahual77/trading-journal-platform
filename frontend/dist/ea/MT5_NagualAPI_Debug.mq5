//+------------------------------------------------------------------+
//|                                          MT5_NagualAPI_Debug.mq5 |
//|                                    Copyright 2024, Nagual Trader |
//|              VERSIÓN CON DEBUGGING Y TROUBLESHOOTING COMPLETO    |
//+------------------------------------------------------------------+
#property copyright "Nagual Trader"
#property version   "1.00"
#property description "Expert Advisor con validación completa y debugging"

//--- Parámetros de entrada
input int UpdateInterval = 1; // Segundos entre actualizaciones
input bool EnableVerboseLogging = false; // Logs detallados
input string CustomFileName = "nagual_mt5_data.txt"; // Nombre del archivo

//--- Variables globales
datetime lastUpdate = 0;
int successCount = 0;
int errorCount = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("🚀 === NAGUAL MT5 API DEBUG VERSION ===");
   Print("📅 Iniciado: ", TimeToString(TimeCurrent()));
   Print("🔧 Archivo destino: ", CustomFileName);
   Print("⏱️ Intervalo actualización: ", UpdateInterval, " segundos");
   
   // VALIDACIÓN COMPLETA DEL SISTEMA
   if(!ValidateSystemRequirements())
   {
      Print("❌ Validación del sistema FALLIDA");
      return(INIT_FAILED);
   }
   
   // TEST INICIAL DE ESCRITURA
   if(!TestFileOperations())
   {
      Print("❌ Test de archivos FALLIDO");
      return(INIT_FAILED);
   }
   
   Print("✅ Inicialización EXITOSA - Sistema validado");
   Print("=========================================");
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                               |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("🔌 === NAGUAL MT5 API DETENIDO ===");
   Print("📊 Estadísticas finales:");
   Print("   - Exportaciones exitosas: ", successCount);
   Print("   - Errores encontrados: ", errorCount);
   Print("   - Ratio éxito: ", (successCount > 0 ? (successCount * 100.0 / (successCount + errorCount)) : 0), "%");
   Print("   - Razón de parada: ", reason);
   Print("====================================");
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   if(TimeCurrent() - lastUpdate >= UpdateInterval)
   {
      ExportAccountData();
      lastUpdate = TimeCurrent();
   }
}

//+------------------------------------------------------------------+
//| Validar requisitos del sistema                                 |
//+------------------------------------------------------------------+
bool ValidateSystemRequirements()
{
   Print("🔍 === VALIDACIÓN SISTEMA ===");
   
   // Verificar build de MT5
   long build = TerminalInfoInteger(TERMINAL_BUILD);
   Print("📦 MT5 Build: ", build);
   if(build < 2000)
   {
      Print("⚠️ ADVERTENCIA: Build MT5 muy antigua, puede tener limitaciones");
   }
   
   // Verificar permisos de trading
   bool tradeAllowed = TerminalInfoInteger(TERMINAL_TRADE_ALLOWED);
   Print("🔐 AutoTrading: ", (tradeAllowed ? "HABILITADO" : "DESHABILITADO"));
   if(!tradeAllowed)
   {
      Print("⚠️ ADVERTENCIA: AutoTrading deshabilitado - Habilítalo para mejor rendimiento");
   }
   
   // Verificar información de cuenta
   long login = AccountInfoInteger(ACCOUNT_LOGIN);
   string server = AccountInfoString(ACCOUNT_SERVER);
   string currency = AccountInfoString(ACCOUNT_CURRENCY);
   
   Print("👤 Login: ", login);
   Print("🌐 Servidor: ", server);
   Print("💰 Moneda: ", currency);
   
   if(login == 0)
   {
      Print("❌ ERROR: No se puede obtener información de la cuenta");
      return false;
   }
   
   // Verificar path de datos
   string dataPath = TerminalInfoString(TERMINAL_DATA_PATH);
   Print("📂 Data Path: ", dataPath);
   
   Print("✅ Validación sistema COMPLETADA");
   return true;
}

//+------------------------------------------------------------------+
//| Test de operaciones de archivo                                 |
//+------------------------------------------------------------------+
bool TestFileOperations()
{
   Print("🧪 === TEST OPERACIONES ARCHIVO ===");
   
   string testFile = "nagual_test_" + IntegerToString(TimeCurrent()) + ".txt";
   string testContent = "TEST NAGUAL MT5 API";
   
   // Test de escritura
   ResetLastError();
   int fileHandle = FileOpen(testFile, FILE_WRITE|FILE_TXT|FILE_ANSI);
   
   if(fileHandle == INVALID_HANDLE)
   {
      int error = GetLastError();
      Print("❌ ERROR creando archivo test - Código: ", error);
      PrintErrorSolution(error);
      return false;
   }
   
   uint bytesWritten = FileWriteString(fileHandle, testContent);
   FileClose(fileHandle);
   
   Print("✅ Test escritura OK - Bytes: ", bytesWritten);
   
   // Test de lectura
   ResetLastError();
   fileHandle = FileOpen(testFile, FILE_READ|FILE_TXT|FILE_ANSI);
   
   if(fileHandle == INVALID_HANDLE)
   {
      Print("❌ ERROR leyendo archivo test");
      return false;
   }
   
   string readContent = FileReadString(fileHandle);
   FileClose(fileHandle);
   
   if(readContent == testContent)
   {
      Print("✅ Test lectura OK - Contenido verificado");
   }
   else
   {
      Print("⚠️ ADVERTENCIA: Contenido leído difiere del escrito");
   }
   
   // Limpiar archivo test
   FileDelete(testFile);
   
   Print("✅ Test operaciones archivo COMPLETADO");
   return true;
}

//+------------------------------------------------------------------+
//| Export account data con debugging completo                     |
//+------------------------------------------------------------------+
void ExportAccountData()
{
   // *** OBTENER DATOS CON VALIDACIÓN ***
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double margin = AccountInfoDouble(ACCOUNT_MARGIN);
   double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   long login = AccountInfoInteger(ACCOUNT_LOGIN);
   string currency = AccountInfoString(ACCOUNT_CURRENCY);
   string server = AccountInfoString(ACCOUNT_SERVER);
   string company = AccountInfoString(ACCOUNT_COMPANY);
   
   if(EnableVerboseLogging)
   {
      Print("📊 Datos obtenidos - Balance: ", balance, " Equity: ", equity);
   }
   
   // *** CREAR JSON CON INFORMACIÓN COMPLETA ***
   string jsonData = StringFormat(
      "{"
      "\"timestamp\":\"%s\","
      "\"login\":%d,"
      "\"server\":\"%s\","
      "\"company\":\"%s\","
      "\"balance\":%.2f,"
      "\"equity\":%.2f,"
      "\"margin\":%.2f,"
      "\"freeMargin\":%.2f,"
      "\"currency\":\"%s\","
      "\"connected\":true,"
      "\"ea_version\":\"debug_v1.0\","
      "\"mt5_build\":%d,"
      "\"export_count\":%d,"
      "\"last_export\":\"%s\""
      "}",
      TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS),
      login,
      server,
      company,
      balance,
      equity,
      margin,
      freeMargin,
      currency,
      TerminalInfoInteger(TERMINAL_BUILD),
      successCount + 1,
      TimeToString(TimeCurrent())
   );
   
   // *** ESCRIBIR CON MANEJO COMPLETO DE ERRORES ***
   ResetLastError();
   int fileHandle = FileOpen(CustomFileName, FILE_WRITE|FILE_TXT|FILE_ANSI);
   
   if(fileHandle != INVALID_HANDLE)
   {
      uint bytesWritten = FileWriteString(fileHandle, jsonData);
      FileClose(fileHandle);
      
      successCount++;
      
      if(EnableVerboseLogging || (successCount % 10 == 0))
      {
         Print(StringFormat("📤 Exportación #%d - Balance: %.2f %s - Bytes: %d", 
                           successCount, balance, currency, bytesWritten));
      }
   }
   else
   {
      errorCount++;
      int error = GetLastError();
      Print(StringFormat("❌ Error exportación #%d - Archivo: %s - Código: %d", 
                        errorCount, CustomFileName, error));
      PrintErrorSolution(error);
   }
}

//+------------------------------------------------------------------+
//| Imprimir solución para errores comunes                         |
//+------------------------------------------------------------------+
void PrintErrorSolution(int errorCode)
{
   switch(errorCode)
   {
      case 5002: // Cannot open file
         Print("💡 SOLUCIÓN ERROR 5002:");
         Print("   1. Verifica permisos carpeta MQL5\\Files");
         Print("   2. Reinicia MT5 como administrador");
         Print("   3. Verifica que el nombre de archivo sea válido");
         break;
         
      case 5001: // Too many files open
         Print("💡 SOLUCIÓN ERROR 5001:");
         Print("   1. Demasiados archivos abiertos simultáneamente");
         Print("   2. Reinicia MT5 para liberar handles");
         break;
         
      case 4051: // Invalid function parameter value
         Print("💡 SOLUCIÓN ERROR 4051:");
         Print("   1. Parámetros de función inválidos");
         Print("   2. Verifica flags de FileOpen()");
         break;
         
      default:
         Print("💡 ERROR DESCONOCIDO - Consulta documentación MQL5");
         Print("   Código de error: ", errorCode);
         break;
   }
}

//+------------------------------------------------------------------+
//| Función para testing manual desde terminal                     |
//+------------------------------------------------------------------+
void ManualTest()
{
   Print("🧪 === TEST MANUAL INICIADO ===");
   ExportAccountData();
   Print("🧪 === TEST MANUAL COMPLETADO ===");
}
