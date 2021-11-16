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
  reconnect.addEventListener('click', onReconnect);
});

function removeTelnyxClientEvents() {
  client.off('telnyx.ready');
  client.off('telnyx.notification');
}

// TODO: call onConnect method.
function onReconnect() {
  client.disconnect();
  removeTelnyxClientEvents();

  log.insertAdjacentHTML('afterbegin', 'unregistered\n');
  connect.className = 'block';
  reconnect.className = 'hidden';
  call.disabled = true;
}

connect.onclick = () => {
  client = new TelnyxRTC({
    login: username.value,
    password: password.value,
  });

  // Attach event listeners
  client
    .on('telnyx.ready', () => {
      log.insertAdjacentHTML('afterbegin', 'registered\n');
      connect.className = 'hidden';
      reconnect.className = 'block';
      call.disabled = false;
    })
    .on('telnyx.notification', (notification) => {
      log.insertAdjacentHTML('afterbegin', `${notification.call.state}\n`);
    });

  // Connect and login
  client.connect();
};

call.onclick = () => {
  client.remoteElement = 'remote';
  const call = client.newCall({
    callerName: idname.value,
    callerNumber: idnumber.value,
    destinationNumber: destination.value,
  });
};

function onDocumentReady(callback) {
  document.addEventListener('DOMContentLoaded', callback);
}
