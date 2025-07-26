#include <WiFi.h>
#include <HTTPClient.h>
#include "DHTesp.h"
#include <time.h>

// Configuración Wi-Fi
const char* ssid = "Wokwi-GUEST";     // Cambia si usas otra red
const char* password = "";            // Vacía para Wokwi

const int DHT_PIN = 15;
DHTesp dht;

// Pines de los LEDs
const int LED_FAN      = 21;  // 🔵 Azul: ventilador
const int LED_NEUTRAL  = 22;  // 🟢 Verde: estado neutro
const int LED_HEATER   = 23;  // 🔴 Rojo: calefactor

void conectarWiFi() {
  Serial.print("🔌 Conectando a Wi-Fi ");
  Serial.print(ssid);
  WiFi.begin(ssid, password);

  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    intentos++;
    if (intentos > 20) {
      Serial.println("\n❌ No se pudo conectar al Wi-Fi.");
      return;
    }
  }
  Serial.println("\n✅ Conectado a Wi-Fi");
  Serial.print("🌐 Dirección IP: ");
  Serial.println(WiFi.localIP());
}

// Sincroniza la hora usando NTP
void sincronizarHora() {
  configTime(-5 * 3600, 0, "pool.ntp.org", "time.nist.gov"); // GMT-5 para Perú
  Serial.println("Sincronizando hora...");
  time_t now = time(nullptr);
  int intentos = 0;
  while (now < 8 * 3600 * 2 && intentos < 30) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
    intentos++;
  }
  Serial.println("\nHora sincronizada.");
}

// Devuelve la fecha/hora actual en formato ISO (UTC)
String getFechaHoraISO() {
  time_t now = time(nullptr);
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);

  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S", &timeinfo);
  return String(buf);
}

// Envía los datos a la API como JSON
void enviarDatosAPI(float temperatura, float humedad, String estado, String accion, String fecha_hora) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("https://arduino-api-nine.vercel.app/api/registros");
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"fecha_hora\":\"" + fecha_hora + "\",";
    json += "\"temperatura\":" + String(temperatura, 1) + ",";
    json += "\"humedad\":" + String(humedad, 1) + ",";
    json += "\"estado\":\"" + estado + "\",";
    json += "\"accion\":\"" + accion + "\"";
    json += "}";

    int httpResponseCode = http.POST(json);

    Serial.print("API status: ");
    Serial.println(httpResponseCode);
    Serial.println(json);

    http.end();
  } else {
    Serial.println("No WiFi, no se puede enviar a la API.");
  }
}

void setup() {
  Serial.begin(115200);
  dht.setup(DHT_PIN, DHTesp::DHT22);

  // Inicializar LEDs
  pinMode(LED_FAN, OUTPUT);
  pinMode(LED_NEUTRAL, OUTPUT);
  pinMode(LED_HEATER, OUTPUT);

  digitalWrite(LED_FAN, LOW);
  digitalWrite(LED_NEUTRAL, LOW);
  digitalWrite(LED_HEATER, LOW);

  // Conectar a Wi-Fi
  conectarWiFi();
  // Sincronizar hora con NTP
  sincronizarHora();
}

void loop() {
  TempAndHumidity data = dht.getTempAndHumidity();
  float temp = data.temperature;
  float hum = data.humidity;

  String estado, accion;

  // Apagar todos los LEDs
  digitalWrite(LED_FAN, LOW);
  digitalWrite(LED_NEUTRAL, LOW);
  digitalWrite(LED_HEATER, LOW);

  // Lógica de control y etiquetas
  if (temp > 30) {
    digitalWrite(LED_FAN, HIGH);
    estado = "ALTO";
    accion = "Ventilador ON";
  } else if (temp >= 21 && temp <= 29) {
    digitalWrite(LED_NEUTRAL, HIGH);
    estado = "normal";
    accion = "ninguna";
  } else if (temp < 19) {
    digitalWrite(LED_HEATER, HIGH);
    estado = "BAJO";
    accion = "Calefactor ON";
  } else {
    estado = "normal";
    accion = "ninguna";
  }

  String fecha_hora = getFechaHoraISO();

  Serial.print("🌡️ Temp: "); Serial.print(temp); Serial.print(" °C");
  Serial.print(" | 💧 Hum: "); Serial.print(hum); Serial.println(" %");
  Serial.print("Estado: "); Serial.print(estado);
  Serial.print(" | Acción: "); Serial.println(accion);
  Serial.print("Fecha/hora: "); Serial.println(fecha_hora);

  // Envía a la API
  enviarDatosAPI(temp, hum, estado, accion, fecha_hora);

  delay(2000);  // cada 2 segundos
}
