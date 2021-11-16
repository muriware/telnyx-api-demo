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

function removeTelnyxClientEvents() {
  client.off('telnyx.ready');
  client.off('telnyx.notification');
}

function onConnect() {
  client = new TelnyxRTC({
    login: username.value,
    password: password.value,
  });

  client.remoteElement = 'remote';

  client
    .on('telnyx.ready', () => {
      logEvent('registered');
      connect.className = 'hidden';
      reconnect.className = 'block';
      call.disabled = false;
    })
    .on('telnyx.notification', (notification) => {
      logEvent(notification.call.state);
    });

  client.connect();
}

function onReconnect() {
  client.disconnect();
  removeTelnyxClientEvents();
  logEvent('unregistered');
  call.disabled = true;

  // Don't attempt to reconnect without credentials
  if (!username.value || !password.value) {
    connect.className = 'block';
    reconnect.className = 'hidden';
  } else {
    onConnect();
  }
}

call.onclick = () => {
  const call = client.newCall({
    callerName: idname.value,
    callerNumber: idnumber.value,
    destinationNumber: destination.value,
  });
};

function onDocumentReady(callback) {
  document.addEventListener('DOMContentLoaded', callback);
}

function logEvent(message) {
  log.insertAdjacentHTML('afterbegin', `${message}\n`);
}
