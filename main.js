import { TelnyxRTC } from '@telnyx/webrtc';
import './style.css';

let client;

const username = document.getElementById('username');
const password = document.getElementById('password');
const idname = document.getElementById('idname');
const idnumber = document.getElementById('idnumber');
const destination = document.getElementById('destination');
const connect = document.getElementById('connect');
const reconnect = document.getElementById('reconnect');
const call = document.getElementById('call');
const hangup = document.getElementById('hangup');
const log = document.getElementById('log');

onDocumentReady(function () {
  connect.addEventListener('click', onConnect);
  reconnect.addEventListener('click', onReconnect);
});

function onConnect() {
  if (needsCredentials()) {
    return;
  }

  client = new TelnyxRTC({
    login: username.value,
    password: password.value,
  });

  client.remoteElement = 'remote';

  client.on('telnyx.ready', () => {
    logEvent('registered');
    connect.className = 'hidden';
    reconnect.className = 'block';
    call.disabled = false;
  });

  client.on('telnyx.error', (error) => {
    console.error(error);
    onDisconnect();
  });

  client.on('telnyx.socket.close', () => {
    console.log('error');
    onDisconnect();
  });

  client.on('telnyx.notification', (notification) => {
    logEvent(notification.call.state);
  });

  client.connect();
}

function onReconnect() {
  client.disconnect();
  removeTelnyxClientEvents();
  logEvent('unregistered');
  call.disabled = true;

  if (needsCredentials()) {
    connect.className = 'block';
    reconnect.className = 'hidden';
  } else {
    onConnect();
  }
}

function onDisconnect() {
  client.disconnect();
  removeTelnyxClientEvents();
  logEvent('disconnected');
  connect.className = 'block';
  reconnect.className = 'hidden';
  call.disabled = true;
}

call.onclick = () => {
  const call = client.newCall({
    callerName: idname.value,
    callerNumber: idnumber.value,
    destinationNumber: destination.value,
  });
};

function needsCredentials() {
  return !username.value || !password.value ? true : false;
}

function removeTelnyxClientEvents() {
  client.off('telnyx.ready');
  client.off('telnyx.notification');
}

function logEvent(message) {
  log.insertAdjacentHTML('afterbegin', `${message}\n`);
}

function onDocumentReady(callback) {
  document.addEventListener('DOMContentLoaded', callback);
}
