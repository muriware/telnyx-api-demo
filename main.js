import { TelnyxRTC } from '@telnyx/webrtc';
import './style.css';

let client;
let currentCall = null;

const username = document.getElementById('username');
const password = document.getElementById('password');
const idname = document.getElementById('idname');
const idnumber = document.getElementById('idnumber');
const destination = document.getElementById('destination');
const connect = document.getElementById('connect');
const reconnect = document.getElementById('reconnect');
const callBtn = document.getElementById('call');
const hangup = document.getElementById('hangup');
const log = document.getElementById('log');

onDocumentReady(function () {
  username.addEventListener('change', saveLocalStorage);
  password.addEventListener('change', saveLocalStorage);
  idname.addEventListener('change', saveLocalStorage);
  idnumber.addEventListener('change', saveLocalStorage);
  destination.addEventListener('change', saveLocalStorage);
  connect.addEventListener('click', onConnect);
  reconnect.addEventListener('click', onReconnect);
  callBtn.addEventListener('click', onCall);
  hangup.addEventListener('click', onHangup);

  username.value = localStorage.getItem('telnyx.demo.username') || '';
  password.value = localStorage.getItem('telnyx.demo.password') || '';
  idname.value = localStorage.getItem('telnyx.demo.idname') || '';
  idnumber.value = localStorage.getItem('telnyx.demo.idnumber') || '';
  destination.value = localStorage.getItem('telnyx.demo.destination') || '';
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
  const params = {
    callerName: idname.value,
    callerNumber: idnumber.value,
    destinationNumber: destination.value,
  };

  logEvent(`Calling: ${destination.value}`);
  currentCall = client.newCall(params);
}

function onHangup() {
  if (currentCall) {
    currentCall.hangup();
  }
}

function onCallUpdate(call) {
  console.log(call.state);
  console.log(call.cause);
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
  document.addEventListener('DOMContentLoaded', callback);
}

function saveLocalStorage(event) {
  const key = event.target.name || event.target.id;
  localStorage.setItem(`telnyx.demo.${key}`, event.target.value);
}
