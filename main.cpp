#include <Arduino.h>
#include <Wire.h>
#include <Servo.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <string.h>

//Config
// Pin definitions
const byte motorSpeed = 5;
const byte motorDir = 0;
#define SERVO_PIN D5

// WiFi credentials
#define _SSID "ABBgym_2.4"
#define _PASSWORD "mittwifiarsabra"

#define MQTT_SERVER "10.22.3.68"
#define MQTT_PORT 1883

// Driving and steering
bool reversedMotor = true;
const int directionScale = 2;    // n = 90 / n


void callback(char* topic, byte* payload, unsigned int length);

Servo servo;
WiFiClient network;

PubSubClient client(network);

void setup() {
  Serial.begin(115200);

  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);

  pinMode(motorSpeed, OUTPUT);
  pinMode(motorDir, OUTPUT);
  pinMode(SERVO_PIN, OUTPUT);

  servo.attach(SERVO_PIN,544,2400);

  WiFi.begin(_SSID, _PASSWORD);
  Serial.println("Connecting to " _SSID);
  for (int i = 0; WiFi.status() != WL_CONNECTED; i = (i + 1) % 3) {
    Serial.print(!i ? "\r   \r." : ".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();
}

struct packet
{
  int16_t speed;
  uint8_t direction;
};

void callback(char *topic, byte *payload, unsigned int length) {
  struct packet p;
  memcpy(&p, payload, length);

  if (reversedMotor) {
    digitalWrite(motorDir, !(p.speed < 0));
  } else {
    digitalWrite(motorDir, (p.speed < 0));}

  analogWrite(motorSpeed, abs(p.speed));

  // Scale down the direction value - set in config above
  uint8_t scaledDirection = p.direction / directionScale;

  servo.write(scaledDirection);
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "car";
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      
      // Subscribe to the topic
      client.subscribe("car/comms");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void loop() {

  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}