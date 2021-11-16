import { TelnyxRTC } from '@telnyx/webrtc';
import './style.css';

let client;
let currentCall;

const username = document.getElementById('username');
const password = document.getElementById('password');
const connect = document.getElementById('connect');
const reconnect = document.getElementById('reconnect');
const call = document.getElementById('call');
const hangup = document.getElementById('hangup');
const log = document.getElementById('log');

onDocumentReady(function () {
  connect.addEventListener('click', onConnect);
  reconnect.addEventListener('click', onReconnect);
  call.addEventListener('click', onCall);
  hangup.addEventListener('click', onHangup);
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

function onCall() {
  const params = {
    callerName: document.getElementById('idname').value,
    callerNumber: document.getElementById('idname').value,
    destinationNumber: document.getElementById('destination').value,
  };

  currentCall = client.newCall(params);
}

function onHangup() {
  if (currentCall) {
    currentCall.hangup();
  }
}

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
