import { get_logger } from "./helpers";

/**
 * Handles error event while connection is lost
 * @callback handler_mqtt_connection_lost
 * @arg {Object} err Error indicating reason for lost connection.
 * @arg {string} err.errorCode A related error code.
 * @arg {string} err.errorMessage An error message indicating the reason of the error.
 */

/**
 * Handles the new messages arrived
 * @callback handler_mqtt_message_arrived
 * @arg {Object} mesg Message object sent by the mqtt server. For more info -   {@link http://www.eclipse.org/paho/files/jsdoc/Paho.MQTT.Message.html | MQTT.Message}
 * @arg {string} mesg.payloadString The payload as a string if the payload consists of valid UTF-8 characters.
 */

/**
 * Callback called when client is connected to the server. For more information -   {@link http://www.eclipse.org/paho/files/jsdoc/Paho.MQTT.Client.html|MQTT.Client}
 * @callback handler_mqtt_on_connected
 */

/**
 * Sets and returns the object containing Mqtt client based on PAHO[https://www.eclipse.org/paho/clients/js/#]
 * @arg {Object} client_options The client options to set the MQTT client. For more information -   {@link http://www.eclipse.org/paho/files/jsdoc/Paho.MQTT.Client.html|MQTT.Client}
 * @arg {string} client_options.ipaddr IP-address of the mqtt server.
 * @arg {Number} client_options.port The port number on which mqtt server is running.
 * @arg {string} client_options.clientId The client id used to connect to the server.
 * @arg {handler_mqtt_connection_lost} client_options.onConnectionLost A callback for losing connection.
 * @arg {handler_mqtt_message_arrived} client_options.onMessageArrived A callback for handling new messages from server.
 * @arg {handler_mqtt_message_arrived} client_options.onMessageDelivered A callback for handling the event when message is delivered.
 * @arg {handler_mqtt_on_connected} client_options.onConnected A callback which will be called when connection is online.
 * @arg {string} client_options.comments String to pass to the logger.
 * @arg {object} connect_options Options to pass to connect method. See connect method {@link http://www.eclipse.org/paho/files/jsdoc/Paho.MQTT.Client.html| here}
 * @arg {object} subscribe_options Options to pass to subscribe method. See subscribe method {@link http://www.eclipse.org/paho/files/jsdoc/Paho.MQTT.Client.html| here}
 */
if (window.MQTT_URL) {
  var {
    host,
    port: configured_port,
    endpoint: configured_endpoint
  } = window.MQTT_URL;
}
export function subscribe(client_options, connect_options, subscribe_options) {
  let {
    ipaddr = host,
    port = configured_port,
    endpoint = configured_endpoint,
    clientId,
    onConnectionLost,
    onMessageArrived,
    onMessageDelivered,
    onConnected,
    comments = ""
  } = client_options;
  let log = get_logger("mqtt"),
    print = (message, code) => {
      log(`MQTT-${code}:${comments}: ${message}`);
    };
  // log(
  //   "Connecting using , client_options, connect_options, subscribe_options - ",
  //   clientId,
  //   connect_options,
  //   subscribe_options
  // );
  let client = new window.Paho.MQTT.Client(ipaddr, port, endpoint, clientId);

  client.onConnectionLost = err => {
    print(
      `ConnectionLost[Reason:${err.errorMessage}::${err.errorCode}]`,
      "warn"
    );
    if (onConnectionLost) {
      onConnectionLost(err);
    }
  };
  client.onMessageArrived = mesg => {
    print(`MessageArrived:${mesg.payloadString}`, "info");
    if (onMessageArrived) {
      onMessageArrived(mesg);
    }
  };
  client.onMessageDelivered = mesg => {
    print(`MessageDelivered:${mesg.payloadString}`, "info");
    if (onMessageArrived) {
      onMessageArrived(mesg);
    }
  };
  client.onConnected = (reconnect, uri) => {
    print(`Connected:[Reconnect:${reconnect}|URI:${uri}]`, "info");
    if (onConnected) {
      onConnected(reconnect, uri);
    }
  };
  let { onSuccess, onFailure } = connect_options;
  connect_options.onSuccess = ctx => {
    print(`Connect success`, "info");
    let { onSuccess: sub_success, onFailure: sub_fail } = subscribe_options;
    if (onSuccess) {
      onSuccess(ctx);
    }
    subscribe_options.onSuccess = ctx => {
      print(`Subscribe success.`, "info");
      if (sub_success) {
        sub_success(ctx);
      }
    };
    subscribe_options.onFailure = resp => {
      print(`Subscribe failed due to ${resp.errorMessage}`, "error");
      if (sub_fail) {
        sub_fail(resp);
      }
    };
    let { filter, ...other_options } = subscribe_options;
    try {
      client.subscribe(filter, other_options);
    } catch (err) {
      print(`Error while subscribing!: ${err}`, "critical-error");
    }
  };
  connect_options.onFailure = resp => {
    print(`Connect fail:${resp.errorMessage}`, "error");
    if (onFailure) {
      onFailure(resp);
    }
  };
  try {
    client.connect(connect_options);
    return client;
  } catch (err) {
    print(`Error while connecting- ${err}`, "critical-error");
    return null;
  }
}
