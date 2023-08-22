## Table of Contents

- [Driverbot](#driverbot)
  - [Setup](#setup)
    - [Install dependencies](#install-dependencies)
  - [Usage](#usage)
    - [Start broker](#start-broker)
    - [Open web interface](#open-web-interface)
      - [Controls](#controls)
  - [Configuration](#configuration)
  - [Troubleshooting](#troubleshooting)
  - [Documentation](#documentation)

# Driverbot

A car that can be remote-controlled via a web interface using MQTT.

## Setup

### Install dependencies

```bash
cd aedes-broker-mqtt
npm install
```

## Usage

### Start broker

```bash
cd aedes-broker-mqtt
node broker.js
```

### Open web interface

Open `index.html` in your preferred browser.

#### Controls

You control the car using `W`, `A`, `S` & `D`.

## Configuration

To configure the application to work for your needs you need to change the following files:

- In `index.html` change the `host` to the IP address of the broker.
  - If you want to change MQTT port: In `broker.js` change the `port` to the port you want to use. And also change `port` to the corresponding port in `index.html`
- In `main.cpp` change WiFi SSID and password to your needs. Also, change the broker IP and port in the PubSubClient setup.

## Troubleshooting

- **Issue 1:** The car doesn't respond to control commands.

  - **Solution:** It can depend on many things.
    Make sure the car is connected to the MQTT broker and the MQTT messages are being received correctly. Check the broker logs and verify the connection settings in `index.html`. Also, check the Config section in `main.cpp`.

- **Issue 2:** The car moves in the wrong direction when using the controls.
  - **Solution:** Change the `reversedMotor` variable in `main.cpp` to `true` or `false` depending on your needs. Alternatively just change the wiring of the motor.

## Documentation

[Paho MQTT JavaScript Client](https://www.eclipse.org/paho/files/jsdoc/index.html)

[PubSubClient](https://pubsubclient.knolleary.net/api)
