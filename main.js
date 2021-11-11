import { TelnyxRTC } from '@telnyx/webrtc';
import './style.css';

let client;

const username = document.getElementById('username');
const password = document.getElementById('password');
const idname = document.getElementById('idname');
const idnumber = document.getElementById('idnumber');
const destination = document.getElementById('destination');
const register = document.getElementById('register');
const call = document.getElementById('call');
const log = document.getElementById('log');

register.onclick = () => {
  if (register.innerText === 'Reconnect') {
    // Disconnecting and Removing listeners.
    client.disconnect();
    client.off('telnyx.ready');
    client.off('telnyx.notification');
    log.insertAdjacentHTML('afterbegin', 'unregistered\n');
    call.disabled = true;
  }

  client = new TelnyxRTC({
    login: username.value,
    password: password.value,
  });

  // Attach event listeners
  client
    .on('telnyx.ready', () => {
      log.insertAdjacentHTML('afterbegin', 'registered\n');
      register.textContent = 'Reconnect';
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
