/*
This file has a basic structure to test the mqtt client.
However is currently not automated.
 */
//return;

import { Logger } from "./logger.js";

import MQTTClient from "../notifications/mqttClient.js";
const client = new MQTTClient({
    testCharacteristic: function() {
        return true;
    },
    getCharacteristic: function() {
        return {
            getDefaultValue: function() {
                return true;
            },
            updateValue: function(newValue) {
                Logger.info("new value " + newValue);
            }
        }
    }
}, {
    host: "TODOHOST",
    port: "1883",
    username: "username",
    password: "password"
}, Logger.withPrefix("test"), true);
client.connect();


client.subscribe({
    topic: "testTopic"
}, "On");
