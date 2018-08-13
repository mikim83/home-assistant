var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var SENSOR = {
  currentTemperature: 25.0,
  currentHumidity: 50.0,
  getTemperature: function() { 
    console.log("Getting the current temperature!");
    return SENSOR.currentTemperature;
  },
  getHumidity: function() { 
    console.log("Getting the current humidity!");
    return SENSOR.currentHumidity;
  }
}

// MQTT Setup
var mqtt = require('mqtt');
console.log("Connecting to MQTT broker...");
var mqtt = require('mqtt');
var options = {
  port: 11984,
  host: 'XXX.cloudmqtt.com',
  username: 'XXXXX', //enable only if you have authentication on your MQTT broker
  password: 'XXXXX', //enable only if you have authentication on your MQTT broker
  clientId: 'DHT22_Sensor'
};
var client = mqtt.connect(options);
console.log("Temp Sensor Connected to MQTT broker");
client.subscribe('sensor/#');
client.on('message', function(topic, message) {
  //console.log(parseFloat(message));
  // message is Buffer 
  data = JSON.parse(message);
  if (data === null) {return null}
  if(topic == 'sensor/temperature') {
    SENSOR.currentTemperature = parseFloat(data);
    console.log("Home Temperature: " + SENSOR.currentTemperature);
  } else if (topic == 'sensor/humidity') {
    SENSOR.currentHumidity = parseFloat(data);
  }
});

// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Sensor', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C4:5D:1A:1E:52:FA";
sensor.pincode = "012-34-567";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.TemperatureSensor)
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, SENSOR.getTemperature());
  });

// Add the Humidity Service
sensor
  .addService(Service.HumiditySensor)
  .getCharacteristic(Characteristic.CurrentRelativeHumidity)
  .on('get', function(callback) {

    // return our current value
    callback(null, SENSOR.getHumidity());
  });

// update readings every 10 seconds
setInterval(function() {

  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, SENSOR.currentTemperature);
  
  sensor
    .getService(Service.HumiditySensor)
    .setCharacteristic(Characteristic.CurrentRelativeHumidity, SENSOR.currentHumidity);
  
}, 3000);
