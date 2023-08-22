// Global variables
let consolePlaceholder;
let client = new Paho.MQTT.Client("10.22.3.68", 8883, "website");
let clientConnected = false;

// Tracks currently pressed keys
let keysPressed = {};

// Initialize the page
window.onload = () => {
  interval = setInterval(getInput, 100);
};

// Checks if a key is pressed
window.onkeydown = function (event) {
  event = event || window.event;
  keysPressed[event.keyCode] = true;
};

// Checks if a key is released
window.onkeyup = function (event) {
  event = event || window.event;
  delete keysPressed[event.keyCode];
};

// Turns the user input into byte arrays
function toBytes(forward, sideways) {
  return [forward & 0xff, (forward >> 8) & 0xff, sideways & 0xff];
}

// Determines the forward and sideways values based upon the keys pressed
function controller() {
  let forward = 0;
  let sideways = 90;

  if ("W".charCodeAt(0) in keysPressed) forward = 1023;
  else if ("S".charCodeAt(0) in keysPressed) forward = -1023;

  if ("A".charCodeAt(0) in keysPressed) sideways = 180;
  else if ("D".charCodeAt(0) in keysPressed) sideways = 0;

  return [forward, sideways];
}

// Stores the previous data
let oldData = "";

// Sends the user input to the broker
function getInput() {
  const [forward, sideways] = controller();
  const value = toBytes(forward, sideways);
  const data = String.fromCharCode.apply(null, value);

  // Only send data if it has changed and when the client is connected
  if (clientConnected && data !== oldData) {
    console(`car/comms: speed = ${forward}, dir = ${sideways}`);
    updateStats(forward, sideways);
    client.send("car/comms", new Uint8Array(value));
    oldData = data;
  }
}

// Get current date and timestamp
function getTime() {
  const time = new Date();
  return time.toLocaleTimeString([], {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// Console messages
function console(message) {
  // Check if consolePlaceholder is null
  if (!consolePlaceholder) {
    consolePlaceholder = document.getElementById("console");
  }
  consolePlaceholder.innerHTML += `<span>${getTime()} ${message}</span><br/>`;
  consolePlaceholder.scrollTop = consolePlaceholder.scrollHeight;
}

// Update stats
function updateStats(speed, direction) {
  // Update current speed element
  const currentSpeedElement = document.getElementById("currentSpeed");
  currentSpeedElement.innerText = speed;

  // Update current direction element
  const currentDirectionElement = document.getElementById("currentDirection");
  currentDirectionElement.innerHTML = direction + "°";
}

// Callback function when the client connects successfully
function onConnect() {
  console("Connected!");

  // Set clientConnected flag to true
  clientConnected = true;

  // Subscribe to "car/comms"
  client.subscribe("car/comms");
}

// Callback function when the connection is lost
function onDisconnect(response) {
  // Set clientConnected flag to false
  clientConnected = false;

  if (response.errorCode !== 0) {
    // Unexpected disconnect
    console(`Disconnected: ${response.errorMessage}`);
  } else {
    // Intentional disconnect
    console("Disconnected!");
  }
}

// Configure client callbacks
client.onConnectionLost = onDisconnect;

// Connect the client
client.connect({ onSuccess: onConnect });
