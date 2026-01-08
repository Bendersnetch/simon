#include <SoftwareSerial.h>

// RX, TX - Connect LA66 TX to Pin 10, LA66 RX to Pin 11
SoftwareSerial LA66(10, 11); 

// --- ABP KEYS FROM TTN CONSOLE ---
// Replace these with YOUR specific keys from the TTN Device Overview
String DevAddr = "260B2294";          // Example: 260B25D1
String NwkSKey = "CCDEFAEEACDEFAEEAADCDAABCEEFAEEE"; 
String AppSKey = "CCDEFAEEACDEFAEEAADCDAABCEEFAEEE"; 

void setup() {
  Serial.begin(9600);
  LA66.begin(9600);
  
  delay(2000);
  Serial.println("Initializing LA66...");

  // 1. Factory Reset to clear corrupted states
  sendAT("AT+FDR"); 
  delay(5000); // Wait for the factory reset to finish rebooting

 

  // 3. Set ABP Mode
  sendAT("AT+NJM=0");

  // 4. Set Keys
  sendAT("AT+DADDR=" + DevAddr);
  sendAT("AT+NWKSKEY=" + NwkSKey);
  sendAT("AT+APPSKEY=" + AppSKey);

  // 5. Single Channel Fix (868.1 MHz)
  sendAT("AT+CHS=868100000"); 

   // 2. Disable ADR (Crucial for manual DR setting)
  sendAT("AT+ADR=0");

  // 6. Set SF7 (DR5 for EU868)
  sendAT("AT+DR=5"); 
  
  // 7. Power setting (Keep it low for now)
  sendAT("AT+TXP=5");

  Serial.println("Setup Complete.");
}

void loop() {
  // Send a simple "Hello" payload (Hex: 48656C6C6F)
  // Format: AT+SEND=<Port>:<Payload>
  sendAT("AT+SEND=2:48656C6C6F");
  
  // Wait 30 seconds before sending again
  delay(30000);
  
  // Read any response from LA66 (e.g., "TX_OK")
  while (LA66.available()) {
    Serial.write(LA66.read());
  }
}

void sendAT(String command) {
  Serial.println("Sending: " + command);
  LA66.println(command);
  // Small delay to let the module process
  delay(300);
  
  // Print response to Serial Monitor
  while (LA66.available()) {
    Serial.write(LA66.read());
  }
  Serial.println();
}