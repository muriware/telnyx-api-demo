import { TelnyxRTC } from '@telnyx/webrtc';
import './style.css';

let client;
let currentCall = null;
let isMute = false;

const username = document.getElementById('username');
const password = document.getElementById('password');
const idname = document.getElementById('idname');
const idnumber = document.getElementById('idnumber');
const destination = document.getElementById('destination');
const connect = document.getElementById('connect');
const reconnect = document.getElementById('reconnect');
const callBtn = document.getElementById('call');
const mute = document.getElementById('mute');
const unmute = document.getElementById('unmute');
const hangup = document.getElementById('hangup');
const hold = document.getElementById('hold');
const unhold = document.getElementById('unhold');
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
  mute.addEventListener('click', toggleMute);
  unmute.addEventListener('click', toggleMute);
  hangup.addEventListener('click', onHangup);
  hold.addEventListener('click', toggleHold);
  unhold.addEventListener('click', toggleHold);

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

function toggleMute() {
  if (currentCall) {
    currentCall.toggleAudioMute();
    isMute = !isMute;

    if (isMute) {
      logEvent(`Call state: muted`);
      mute.className = 'hidden';
      unmute.className = 'block';
    } else {
      logEvent(`Call state: active`);
      mute.className = 'block';
      unmute.className = 'hidden';
    }
  }
}

async function toggleHold() {
  if (currentCall) {
    await currentCall.toggleHold();
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
    case 'requesting':
    case 'recovering':
    case 'early':
      logEvent(`${prepend} connecting`);
      break;
    case 'active':
      logEvent(`${prepend} active`);
      callBtn.className = 'hidden';
      hangup.className = 'block';
      hold.className = 'block';
      unhold.className = 'hidden';

      if (!isMute) {
        mute.className = 'block';
      }
      break;
    case 'held':
      logEvent(`${prepend} held`);
      hold.className = 'hidden';
      unhold.className = 'block';
      break;
    case 'hangup':
      logEvent(`${prepend} done (${call.cause})`);
      callBtn.className = 'block';
      mute.className = 'hidden';
      unmute.className = 'hidden';
      hangup.className = 'hidden';
      hold.className = 'hidden';
      unhold.className = 'hidden';
      break;
    case 'destroy':
      currentCall = null;
      logEvent(`${prepend} done (${call.cause})`);
      break;
    default:
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
