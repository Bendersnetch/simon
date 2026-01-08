#include <Wire.h>
#include <SPI.h>
#include <Adafruit_SHT4x.h>

// --- Pin Definitions ---
const int MQ135_PIN = A0; // Gas Sensor
const int UV_PIN = A2;    // UV Sensor

// --- Sensor Objects ---
Adafruit_SHT4x sht4;

void setup() {
  // Initialize Serial Communication for logging
  Serial.begin(9600);
  while (!Serial) delay(10); // Wait for serial console to open

  Serial.println("Initializing sensors...");

  // Initialize SHT40
  if (!sht4.begin()) {
    Serial.println("SHT40 sensor not found! Check wiring (A4/A5).");
    while (1) delay(10); // Halt if sensor is missing
  }
  
  // Set SHT40 precision (High precision is slower but more accurate)
  sht4.setPrecision(SHT4X_HIGH_PRECISION);
  sht4.setHeater(SHT4X_NO_HEATER);

  // Print Header for the Log (CSV format)
  Serial.println("Time(ms), Temperature(C), Humidity(%), Gas_Raw, UV_Voltage(V), UV_Index");
}

void loop() {
  // --- 1. Read SHT40 (Temp & Hum) ---
  sensors_event_t humidity, temp;
  sht4.getEvent(&humidity, &temp); // Get new data

  // --- 2. Read MQ135 (Gas) ---
  // We read the raw analog value (0-1023). 
  // Higher values usually mean higher concentration of CO2/Smoke/Ammonia.
  int gasRaw = analogRead(MQ135_PIN);

  // --- 3. Read GUVA-S12SD (UV) ---
  int uvRaw = analogRead(UV_PIN);
  
  // Convert UV Analog Reading to Voltage (assuming 5V Arduino)
  float uvVoltage = uvRaw * (5.0 / 1024.0);
  
  // Convert Voltage to UV Index
  // Standard formula: UV Index = OutputVoltage / 0.1V
  float uvIndex = uvVoltage;

  // --- 4. Log Data to Serial Monitor ---
  // Format: Time, Temp, Hum, Gas, UV_Volts, UV_Index
  
  Serial.print(millis()); // Timestamp in milliseconds
  Serial.print(", ");
  
  Serial.print(temp.temperature);
  Serial.print(", ");
  
  Serial.print(humidity.relative_humidity);
  Serial.print(", ");
  
  Serial.print(gasRaw);
  Serial.print(", ");
  
  Serial.print(uvVoltage);
  Serial.print(", ");
  
  Serial.println(uvIndex); // println creates a new line for the next reading

  // Wait 1 second before next reading
  delay(1000);
}