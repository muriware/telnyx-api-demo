import { TelnyxRTC } from '@telnyx/webrtc';
import './style.css';

let client;
let currentCall = null;

const username = document.getElementById('username');
const password = document.getElementById('password');
const connect = document.getElementById('connect');
const reconnect = document.getElementById('reconnect');
const callBtn = document.getElementById('call');
const hangup = document.getElementById('hangup');
const log = document.getElementById('log');

onDocumentReady(function () {
  connect.addEventListener('click', onConnect);
  reconnect.addEventListener('click', onReconnect);
  callBtn.addEventListener('click', onCall);
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
    callBtn.disabled = false;
  });

  client.on('telnyx.error', (error) => {
    console.error(error);
    onDisconnect();
  });

  client.on('telnyx.socket.close', () => {
    onDisconnect();
  });

  client.on('telnyx.notification', (notification) => {
    if (notification.type === 'callUpdate') {
      onCallUpdate(notification.call);
    }
  });

  client.connect();
}

function onReconnect() {
  client.disconnect();
  removeTelnyxClientEvents();
  logEvent('unregistered');
  callBtn.disabled = true;

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
  callBtn.disabled = true;
}

function onCall() {
  const destinationNumber = document.getElementById('destination').value;

  const params = {
    callerName: document.getElementById('idname').value,
    callerNumber: document.getElementById('idnumber').value,
    destinationNumber,
  };

  logEvent(`Calling: ${destinationNumber}`);
  currentCall = client.newCall(params);
}

function onHangup() {
  if (currentCall) {
    currentCall.hangup();
  }
}

function onCallUpdate(call) {
  currentCall = call;
  const prepend = 'Call state:';

  switch (call.state) {
    case 'new':
      logEvent(`${prepend} new`);
      break;
    case 'trying':
      logEvent(`${prepend} connecting`);
      break;
    case 'active':
      logEvent(`${prepend} active`);
      callBtn.className = 'hidden';
      hangup.className = 'block';
      break;
    case 'hangup':
      logEvent(`${prepend} done`);
      callBtn.className = 'block';
      hangup.className = 'hidden';
      break;
    case 'destroy':
      currentCall = null;
      logEvent(`${prepend} done`);
      break;
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
  document.addEventListener('DOMContentLoaded', callback);;
}
