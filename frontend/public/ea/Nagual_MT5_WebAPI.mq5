//+------------------------------------------------------------------+
//|                                            Nagual_MT5_WebAPI.mq5 |
//|                        Copyright 2024, Nagual Trader Journal     |
//|                              https://nagual-trader-journal.com   |
//+------------------------------------------------------------------+
#property copyright "Nagual Trader Journal"
#property link      "https://nagual-trader-journal.com"
#property version   "1.00"
#property description "Expert Advisor para conexión directa con Nagual Trader Journal"
#property description "Actúa como servidor REST API en puerto 8080"
#property description "100% GRATUITO - Sin servicios externos"

#include <Trade\Trade.mqh>

//+------------------------------------------------------------------+
//| Variables globales                                               |
//+------------------------------------------------------------------+
int server_socket = INVALID_HANDLE;
bool server_running = false;
datetime last_heartbeat = 0;
string account_data = "";

//+------------------------------------------------------------------+
//| Parámetros de entrada                                            |
//+------------------------------------------------------------------+
input int ServerPort = 8080;              // Puerto del servidor (8080 por defecto)
input bool EnableLogging = true;          // Habilitar logs en consola
input int UpdateFrequency = 1000;         // Frecuencia de actualización (ms)

//+------------------------------------------------------------------+
//| Inicialización del Expert Advisor                               |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("🚀 Nagual MT5 WebAPI - Iniciando...");
   
   // Verificar que AutoTrading esté habilitado
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED))
   {
      Print("❌ ERROR: AutoTrading no está habilitado");
      Print("🔧 SOLUCIÓN: Presiona el botón 'AutoTrading' en MT5");
      return INIT_FAILED;
   }
   
   // Iniciar servidor
   if(StartServer())
   {
      Print("✅ Servidor iniciado exitosamente en puerto ", ServerPort);
      Print("🌐 URL: http://localhost:", ServerPort);
      Print("📱 Nagual Trader Journal puede conectarse ahora");
      return INIT_SUCCEEDED;
   }
   else
   {
      Print("❌ ERROR: No se pudo iniciar servidor en puerto ", ServerPort);
      Print("🔧 SOLUCIÓN: Verifica que el puerto esté libre");
      return INIT_FAILED;
   }
}

//+------------------------------------------------------------------+
//| Finalización del Expert Advisor                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   StopServer();
   Print("🔌 Nagual MT5 WebAPI - Detenido");
}

//+------------------------------------------------------------------+
//| Función principal - se ejecuta en cada tick                     |
//+------------------------------------------------------------------+
void OnTick()
{
   // Actualizar datos de cuenta cada segundo
   if(TimeCurrent() - last_heartbeat >= 1)
   {
      UpdateAccountData();
      last_heartbeat = TimeCurrent();
   }
   
   // Manejar conexiones entrantes
   if(server_running)
   {
      HandleIncomingConnections();
   }
}

//+------------------------------------------------------------------+
//| Iniciar servidor                                                |
//+------------------------------------------------------------------+
bool StartServer()
{
   // Crear socket del servidor
   server_socket = SocketCreate();
   
   if(server_socket == INVALID_HANDLE)
   {
      Print("❌ Error creando socket");
      return false;
   }
   
   // Configurar socket
   if(!SocketBind(server_socket, ServerPort))
   {
      Print("❌ Error en bind del puerto ", ServerPort);
      SocketClose(server_socket);
      return false;
   }
   
   // Escuchar conexiones
   if(!SocketListen(server_socket, 10))
   {
      Print("❌ Error en listen");
      SocketClose(server_socket);
      return false;
   }
   
   server_running = true;
   return true;
}

//+------------------------------------------------------------------+
//| Detener servidor                                                |
//+------------------------------------------------------------------+
void StopServer()
{
   if(server_socket != INVALID_HANDLE)
   {
      SocketClose(server_socket);
      server_socket = INVALID_HANDLE;
   }
   server_running = false;
}

//+------------------------------------------------------------------+
//| Actualizar datos de cuenta                                      |
//+------------------------------------------------------------------+
void UpdateAccountData()
{
   // Obtener información de la cuenta
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double margin = AccountInfoDouble(ACCOUNT_MARGIN);
   double free_margin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   long login = AccountInfoInteger(ACCOUNT_LOGIN);
   string server = AccountInfoString(ACCOUNT_SERVER);
   string currency = AccountInfoString(ACCOUNT_CURRENCY);
   
   // Crear JSON con datos de cuenta
   account_data = StringFormat(
      "{"
      "\"balance\":%.2f,"
      "\"equity\":%.2f,"
      "\"margin\":%.2f,"
      "\"freeMargin\":%.2f,"
      "\"accountNumber\":\"%d\","
      "\"server\":\"%s\","
      "\"currency\":\"%s\","
      "\"connected\":true,"
      "\"timestamp\":\"%s\","
      "\"ea_version\":\"1.0\","
      "\"mt5_build\":%d"
      "}",
      balance, equity, margin, free_margin,
      login, server, currency,
      TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS),
      TerminalInfoInteger(TERMINAL_BUILD)
   );
   
   if(EnableLogging && TimeCurrent() % 10 == 0) // Log cada 10 segundos
   {
      Print("📊 Balance: $", DoubleToString(balance, 2), 
            " | Equity: $", DoubleToString(equity, 2),
            " | Free Margin: $", DoubleToString(free_margin, 2));
   }
}

//+------------------------------------------------------------------+
//| Manejar conexiones entrantes                                    |
//+------------------------------------------------------------------+
void HandleIncomingConnections()
{
   // Aceptar conexión entrante (no bloqueante)
   int client_socket = SocketAccept(server_socket, 100);
   
   if(client_socket != INVALID_HANDLE)
   {
      // Leer petición
      string request = "";
      uint bytes_read = SocketReadString(client_socket);
      if(bytes_read > 0)
      {
         request = SocketGetString(client_socket);
      }
      
      // Determinar tipo de respuesta
      string response = "";
      
      if(StringFind(request, "GET /account-info") >= 0)
      {
         // Datos de cuenta
         response = CreateHTTPResponse(account_data);
         if(EnableLogging)
            Print("📤 Enviando datos de cuenta a Nagual Trader Journal");
      }
      else if(StringFind(request, "GET /ping") >= 0)
      {
         // Ping para verificar estado
         response = CreateHTTPResponse("{\"status\":\"active\",\"ea\":\"Nagual MT5 WebAPI\"}");
      }
      else if(StringFind(request, "GET /") >= 0)
      {
         // Página de estado
         string status_page = CreateStatusPage();
         response = CreateHTTPResponse(status_page, "text/html");
      }
      else
      {
         // Respuesta 404
         response = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nAccess-Control-Allow-Origin: *\r\n\r\n404 Not Found";
      }
      
      // Enviar respuesta
      SocketSend(client_socket, response);
      SocketClose(client_socket);
   }
}

//+------------------------------------------------------------------+
//| Crear respuesta HTTP                                            |
//+------------------------------------------------------------------+
string CreateHTTPResponse(string content, string content_type = "application/json")
{
   string response = StringFormat(
      "HTTP/1.1 200 OK\r\n"
      "Content-Type: %s\r\n"
      "Access-Control-Allow-Origin: *\r\n"
      "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
      "Access-Control-Allow-Headers: Content-Type\r\n"
      "Content-Length: %d\r\n"
      "Connection: close\r\n"
      "\r\n"
      "%s",
      content_type,
      StringLen(content),
      content
   );
   
   return response;
}

//+------------------------------------------------------------------+
//| Crear página de estado                                          |
//+------------------------------------------------------------------+
string CreateStatusPage()
{
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   long login = AccountInfoInteger(ACCOUNT_LOGIN);
   string server = AccountInfoString(ACCOUNT_SERVER);
   
   string page = StringFormat(
      "<html>"
      "<head><title>Nagual MT5 WebAPI</title></head>"
      "<body style='font-family: Arial; padding: 20px; background: #1a1a1a; color: #fff;'>"
      "<h1 style='color: #4ade80;'>🚀 Nagual MT5 WebAPI</h1>"
      "<h2>✅ Estado: ACTIVO</h2>"
      "<div style='background: #2a2a2a; padding: 15px; border-radius: 8px; margin: 10px 0;'>"
      "<h3>📊 Información de Cuenta:</h3>"
      "<p><strong>Login:</strong> %d</p>"
      "<p><strong>Servidor:</strong> %s</p>"
      "<p><strong>Balance:</strong> $%.2f</p>"
      "<p><strong>Equity:</strong> $%.2f</p>"
      "</div>"
      "<div style='background: #1e40af; padding: 15px; border-radius: 8px; margin: 10px 0;'>"
      "<h3>🔗 API Endpoints:</h3>"
      "<p><code>GET /account-info</code> - Datos de cuenta (JSON)</p>"
      "<p><code>GET /ping</code> - Estado del EA</p>"
      "</div>"
      "<p style='color: #84cc16;'>💡 La conexión con Nagual Trader Journal está lista</p>"
      "</body>"
      "</html>",
      login, server, balance, equity
   );
   
   return page;
}

//+------------------------------------------------------------------+
//| Timer para actualización periódica                              |
//+------------------------------------------------------------------+
void OnTimer()
{
   UpdateAccountData();
}

//+------------------------------------------------------------------+