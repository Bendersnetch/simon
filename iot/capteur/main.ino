#include <Wire.h>
#include <Adafruit_SHT4x.h>

#define MQ135_PIN A0

Adafruit_SHT4x sht4 = Adafruit_SHT4x();

void setup() {
    Serial.begin(9600);
    delay(1500);

    Serial.println("Starting MQ135 + SHT40 Test...");

    // Initialize SHT40
    if (!sht4.begin()) {
        Serial.println("Could not find SHT40 sensor!");
        while (1);
    }

    sht4.setPrecision(SHT4X_HIGH_PRECISION);
    sht4.setHeater(SHT4X_NO_HEATER);

    Serial.println("SHT40 initialized.");
}

void loop() {

    // Read SHT40
    sensors_event_t humidity, temp;
    sht4.getEvent(&humidity, &temp);

    float temperature = temp.temperature;
    float hum = humidity.relative_humidity;

    // Read MQ135
    int mq_raw = analogRead(MQ135_PIN);

    // Print everything
    Serial.println("--------------------------------------------------");
    Serial.print("Temperature (°C): ");
    Serial.println(temperature);

    Serial.print("Humidity (%):     ");
    Serial.println(hum);

    Serial.print("MQ135 Raw ADC:    ");
    Serial.println(mq_raw);

    delay(2000);
}
