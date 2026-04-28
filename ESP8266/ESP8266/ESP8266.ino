/**
 * Redes Avanzadas
 * Modelo para peticiones GET y POST
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

String serverName = "IP_SERVER";
const char* ssid = "SSID_INTERNET";
const char* password = "";
String nombreNodo = "";  // Id del ESP8622, me figuro que el nombre del grupo;

float param[5] = { nombreNodo, 0.0, 0.0, 0.0, 0.0 }; 

void setup() {
  Serial.begin(9600);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print('.');
  }

  Serial.println("");
  Serial.print("Iniciado STA:\t");
  Serial.println(ssid);
  Serial.print("IP address:\t");
  Serial.println(WiFi.localIP());
}

void loop() {
  WiFiClient client;
  HTTPClient http;
  JsonDocument objJson;
  objJson["id_nodo"] = param[0];
  objJson["temperatura"] = param[1];
  objJson["humedad"] = param[2];
  objJson["co2"] = param[3];
  objJson["volatiles"] = param[4];

  String getRecord = "/record?id_nodo=" + param[0] + "&temperatura" + param[1] + "&humedad" + param[2] + "&co2" + param[3] + "&volatiles" + param[4];
  // Comentar según el uso esperado
  
  // POST
  // String serverPath = serverName + "/record";
  // String jsonPost;
  // serializeJson(doc, jsonPost);
  // Serial.println(jsonPost);
  // http.begin(client, serverPath);

  // http.addHeader("Content-Type", "application/json");
  // int httpResponseCode = http.POST(jsonPost);

  //GET
  String serverPath = serverName + getRecord; 
  int httpResponseCode = http.GET();

  if (httpResponseCode <= 0) {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }

  http.end();
  delay(10000); // Tiempo entre peticiones, en ms
}
