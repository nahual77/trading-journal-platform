//+------------------------------------------------------------------+
//|                                                MT5_NagualAPI.mq5 |
//|                                    Copyright 2024, Nagual Trader |
//|                                                                  |
//+------------------------------------------------------------------+
#property copyright "Nagual Trader"
#property link      ""
#property version   "1.00"
#property strict

//--- Includes
#include <Trade/Trade.mqh>

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
   Print("✅ Nagual MT5 API iniciado correctamente");
   Print("📁 Exportando datos a: ", fileName);
   
   // Crear archivo inicial
   ExportAccountData();
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                               |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("❌ Nagual MT5 API desconectado");
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
//| Export account data to file                                     |
//+------------------------------------------------------------------+
void ExportAccountData()
{
   // Obtener datos de la cuenta
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double margin = AccountInfoDouble(ACCOUNT_MARGIN);
   double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   string currency = AccountInfoString(ACCOUNT_CURRENCY);
   long login = AccountInfoInteger(ACCOUNT_LOGIN);
   string server = AccountInfoString(ACCOUNT_SERVER);
   
   // Crear JSON simple
   string jsonData = StringFormat(
      "{"
      "\"timestamp\":\"%s\","
      "\"login\":%d,"
      "\"server\":\"%s\","
      "\"balance\":%.2f,"
      "\"equity\":%.2f,"
      "\"margin\":%.2f,"
      "\"freeMargin\":%.2f,"
      "\"currency\":\"%s\","
      "\"connected\":true"
      "}",
      TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS),
      login,
      server,
      balance,
      equity,
      margin,
      freeMargin,
      currency
   );
   
   // Escribir a archivo
   int fileHandle = FileOpen(fileName, FILE_WRITE|FILE_TXT|FILE_ANSI);
   if(fileHandle != INVALID_HANDLE)
   {
      FileWriteString(fileHandle, jsonData);
      FileClose(fileHandle);
      
      // Log cada 10 actualizaciones para no saturar
      static int logCounter = 0;
      logCounter++;
      if(logCounter >= 10)
      {
         Print("📊 Datos exportados - Balance: ", balance, " ", currency);
         logCounter = 0;
      }
   }
   else
   {
      Print("❌ Error al escribir archivo: ", fileName);
   }
}
