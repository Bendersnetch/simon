#include <Wire.h>
#include <SPI.h>
#include <Adafruit_SHT4x.h>
#include <SoftwareSerial.h>

// --- PIN DEFINITIONS ---
const int MQ135_PIN = A0; // Gas Sensor
const int UV_PIN = A2;    // UV Sensor

// --- LORA SETUP ---
SoftwareSerial LA66(10, 11); 

// --- SENSOR OBJECTS ---
Adafruit_SHT4x sht4;

// --- ABP KEYS ---
String DevAddr = "260B2294";          
String NwkSKey = "CCDEFAEEACDEFAEEAADCDAABCEEFAEEE"; 
String AppSKey = "CCDEFAEEACDEFAEEAADCDAABCEEFAEEE"; 

void setup() {
  // 1. Initialize Serials
  Serial.begin(9600);
  LA66.begin(9600);
  delay(2000); // Wait for module boot
  
  Serial.println(F("Initializing..."));

  // 2. Initialize SHT40
  if (!sht4.begin()) {
    Serial.println(F("SHT40 not found! Check A4/A5."));
    while (1) delay(10);
  }
  sht4.setPrecision(SHT4X_HIGH_PRECISION);
  sht4.setHeater(SHT4X_NO_HEATER);

  // 3. Configure LA66 (ABP + SF7)
  // Factory Reset
  sendAT("AT+FDR"); 
  delay(5000); 

  // Set ABP Mode (0)
  sendAT("AT+NJM=0");

  // Set Keys
  sendAT("AT+DADDR=" + DevAddr);
  sendAT("AT+NWKSKEY=" + NwkSKey);
  sendAT("AT+APPSKEY=" + AppSKey);

  // Single Channel Fix (868.1 MHz) - Optional but requested in your code
  sendAT("AT+CHS=868100000"); 

  // Disable ADR
  sendAT("AT+ADR=0");

  // Set SF7 (DR5 in EU868)
  sendAT("AT+DR=3"); 
  
  // Power setting
  sendAT("AT+TXP=5");

  Serial.println(F("Setup Complete."));
}

void loop() {
  // --- 1. READ SENSORS ---
  sensors_event_t humidity, temp;
  sht4.getEvent(&humidity, &temp);

  int gasRaw = analogRead(MQ135_PIN);
  int uvRaw = analogRead(UV_PIN);

  // --- 2. CONVERT TO HEX ---
  int16_t t_int = (int16_t)(temp.temperature * 100);
  uint16_t h_int = (uint16_t)(humidity.relative_humidity * 100);
  uint16_t g_int = (uint16_t)gasRaw;
  uint16_t u_int = (uint16_t)uvRaw;

  // Create a string buffer for the Hex payload
  char payload[20];
  sprintf(payload, "%04X%04X%04X%04X", t_int, h_int, g_int, u_int);

  // Debug print
  Serial.print(F("Sending Hex: "));
  Serial.println(payload);

  // --- 3. SEND COMMAND ---
  String cmd = "AT+SENDB=0,2,8,";
  cmd += payload;
  
  sendAT(cmd);
  
  // Wait 30 seconds
  delay(30000);
}

void sendAT(String command) {
  Serial.println("CMD: " + command);
  LA66.println(command);
  delay(300);
  while (LA66.available()) {
    Serial.write(LA66.read());
  }
  Serial.println();
}