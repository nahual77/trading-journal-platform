//+------------------------------------------------------------------+
//|                                         MT5_NagualAPI_Minimal.mq5 |
//|                                    Copyright 2024, Nagual Trader |
//|                        VERSIÓN ULTRA-SIMPLIFICADA - CERO ERRORES |
//+------------------------------------------------------------------+
#property copyright "Nagual Trader"
#property version   "1.00"

//--- NO INCLUDES - Solo funciones nativas MQL5

//--- Variables globales
datetime lastUpdate = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("✅ Nagual MT5 API MINIMAL iniciado");
   
   // Exportar datos inmediatamente
   ExportAccountData();
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                               |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("❌ Nagual MT5 API MINIMAL detenido");
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Actualizar cada segundo
   datetime currentTime = TimeCurrent();
   if(currentTime - lastUpdate >= 1)
   {
      ExportAccountData();
      lastUpdate = currentTime;
   }
}

//+------------------------------------------------------------------+
//| Export account data - VERSIÓN ULTRA-SIMPLIFICADA              |
//+------------------------------------------------------------------+
void ExportAccountData()
{
   // Variables locales
   double balance = 0.0;
   double equity = 0.0;
   double margin = 0.0;
   double freeMargin = 0.0;
   long login = 0;
   string currency = "";
   string server = "";
   
   // *** OBTENER DATOS CON FUNCIONES NATIVAS MQL5 ***
   balance = AccountInfoDouble(ACCOUNT_BALANCE);
   equity = AccountInfoDouble(ACCOUNT_EQUITY);
   margin = AccountInfoDouble(ACCOUNT_MARGIN);
   freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   login = AccountInfoInteger(ACCOUNT_LOGIN);
   currency = AccountInfoString(ACCOUNT_CURRENCY);
   server = AccountInfoString(ACCOUNT_SERVER);
   
   // *** CREAR JSON MANUAL SIN StringFormat PARA MÁXIMA COMPATIBILIDAD ***
   string jsonData = "{";
   jsonData += "\"timestamp\":\"" + TimeToString(TimeCurrent()) + "\",";
   jsonData += "\"login\":" + IntegerToString(login) + ",";
   jsonData += "\"server\":\"" + server + "\",";
   jsonData += "\"balance\":" + DoubleToString(balance, 2) + ",";
   jsonData += "\"equity\":" + DoubleToString(equity, 2) + ",";
   jsonData += "\"margin\":" + DoubleToString(margin, 2) + ",";
   jsonData += "\"freeMargin\":" + DoubleToString(freeMargin, 2) + ",";
   jsonData += "\"currency\":\"" + currency + "\",";
   jsonData += "\"connected\":true";
   jsonData += "}";
   
   // *** ESCRIBIR ARCHIVO CON FUNCIONES MÁS BÁSICAS ***
   int fileHandle = FileOpen("nagual_mt5_data.txt", FILE_WRITE|FILE_TXT);
   
   if(fileHandle != INVALID_HANDLE)
   {
      FileWriteString(fileHandle, jsonData);
      FileClose(fileHandle);
      
      // Log simple cada 10 actualizaciones
      static int counter = 0;
      counter++;
      if(counter >= 10)
      {
         Print("📊 Balance: " + DoubleToString(balance, 2) + " " + currency);
         counter = 0;
      }
   }
   else
   {
      Print("❌ Error archivo: " + IntegerToString(GetLastError()));
   }
}
