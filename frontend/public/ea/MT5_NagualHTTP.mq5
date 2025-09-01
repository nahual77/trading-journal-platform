//+------------------------------------------------------------------+
//|                                            MT5_NagualHTTP.mq5    |
//|                                    Copyright 2024, Nagual Trader |
//+------------------------------------------------------------------+
#property copyright "Nagual Trader"
#property version   "1.00"

//--- Input parameters
input int ServerPort = 8080; // Puerto del servidor

//--- Global variables
string responseData = "";

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("🚀 Nagual HTTP Server iniciado en puerto: ", ServerPort);
   
   // Configurar timer para actualizar datos
   EventSetTimer(1); // Cada segundo
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                               |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("🛑 Nagual HTTP Server detenido");
}

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
{
   UpdateResponseData();
}

//+------------------------------------------------------------------+
//| Update response data                                            |
//+------------------------------------------------------------------+
void UpdateResponseData()
{
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double margin = AccountInfoDouble(ACCOUNT_MARGIN);
   double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   string currency = AccountInfoString(ACCOUNT_CURRENCY);
   
   responseData = StringFormat(
      "{"
      "\"balance\":%.2f,"
      "\"equity\":%.2f,"
      "\"margin\":%.2f,"
      "\"freeMargin\":%.2f,"
      "\"currency\":\"%s\","
      "\"timestamp\":\"%s\","
      "\"connected\":true"
      "}",
      balance,
      equity,
      margin,
      freeMargin,
      currency,
      TimeToString(TimeCurrent())
   );
}

//+------------------------------------------------------------------+
//| Get current account data as JSON                               |
//+------------------------------------------------------------------+
string GetAccountJSON()
{
   return responseData;
}
