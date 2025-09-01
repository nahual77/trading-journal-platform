//+------------------------------------------------------------------+
//|                                        MT5_NagualAPI_Corrected.mq5 |
//|                                    Copyright 2024, Nagual Trader |
//|                             VERSIÓN CORREGIDA - Documentación Oficial |
//+------------------------------------------------------------------+
#property copyright "Nagual Trader"
#property link      ""
#property version   "1.00"
#property strict

//--- Includes (solo funciones estándar MQL5)
#include <Trade\Trade.mqh>

//--- Input parameters
input int UpdateInterval = 1; // Actualización cada X segundos

//--- Global variables
datetime lastUpdate = 0;
string fileName = "nagual_mt5_data.txt";

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("✅ Nagual MT5 API CORREGIDO iniciado correctamente");
   Print("📁 Exportando datos a: ", fileName);
   
   // Verificar AutoTrading
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED))
   {
      Print("⚠️ ADVERTENCIA: AutoTrading no está habilitado");
      Print("🔧 SOLUCIÓN: Habilita AutoTrading en MT5 para funcionamiento óptimo");
   }
   
   // Crear archivo inicial
   ExportAccountData();
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                               |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("❌ Nagual MT5 API CORREGIDO desconectado - Código:", reason);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Actualizar cada X segundos
   if(TimeCurrent() - lastUpdate >= UpdateInterval)
   {
      ExportAccountData();
      lastUpdate = TimeCurrent();
   }
}

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
{
   ExportAccountData();
}

//+------------------------------------------------------------------+
//| Export account data to file (SINTAXIS OFICIAL MQL5)            |
//+------------------------------------------------------------------+
void ExportAccountData()
{
   // *** USAR CONSTANTES OFICIALES MQL5 ***
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double margin = AccountInfoDouble(ACCOUNT_MARGIN);
   double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   string currency = AccountInfoString(ACCOUNT_CURRENCY);
   long login = AccountInfoInteger(ACCOUNT_LOGIN);
   string server = AccountInfoString(ACCOUNT_SERVER);
   string company = AccountInfoString(ACCOUNT_COMPANY);
   
   // *** USAR StringFormat() OFICIAL PARA JSON ***
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
      "\"ea_version\":\"corrected_v1.0\","
      "\"mt5_build\":%d"
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
      TerminalInfoInteger(TERMINAL_BUILD)
   );
   
   // *** USAR FileOpen() CON FLAGS OFICIALES ***
   ResetLastError(); // Limpiar errores previos
   int fileHandle = FileOpen(fileName, FILE_WRITE|FILE_TXT|FILE_ANSI);
   
   // *** VERIFICAR CON INVALID_HANDLE OFICIAL ***
   if(fileHandle != INVALID_HANDLE)
   {
      // *** USAR FileWriteString() OFICIAL ***
      uint bytesWritten = FileWriteString(fileHandle, jsonData);
      FileClose(fileHandle);
      
      // Log controlado cada 10 actualizaciones
      static int logCounter = 0;
      logCounter++;
      if(logCounter >= 10)
      {
         Print(StringFormat("📊 Datos exportados - Balance: %.2f %s - Bytes: %d", 
                           balance, currency, bytesWritten));
         logCounter = 0;
      }
   }
   else
   {
      int errorCode = GetLastError();
      Print(StringFormat("❌ Error al escribir archivo: %s - Código: %d", fileName, errorCode));
      
      // Información adicional para debugging
      if(errorCode == 5002) // Cannot open file
      {
         Print("💡 SOLUCIÓN: Verifica permisos de la carpeta MQL5\\Files");
      }
   }
}

//+------------------------------------------------------------------+
//| Función adicional para verificar estado (opcional)             |
//+------------------------------------------------------------------+
void PrintSystemInfo()
{
   Print("=== INFORMACIÓN DEL SISTEMA ===");
   Print("Terminal Build: ", TerminalInfoInteger(TERMINAL_BUILD));
   Print("Data Path: ", TerminalInfoString(TERMINAL_DATA_PATH));
   Print("Trade Allowed: ", TerminalInfoInteger(TERMINAL_TRADE_ALLOWED));
   Print("Account Login: ", AccountInfoInteger(ACCOUNT_LOGIN));
   Print("Account Server: ", AccountInfoString(ACCOUNT_SERVER));
   Print("Account Currency: ", AccountInfoString(ACCOUNT_CURRENCY));
   Print("===============================");
}
