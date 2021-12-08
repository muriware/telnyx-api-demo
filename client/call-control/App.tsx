import { useState, useEffect, useRef } from 'react';
import { TelnyxRTC, Call, INotification } from '@telnyx/webrtc';
import axios from 'axios';

import './styles.pcss';

interface Credentials {
  sip_username: string;
  token: string;
}

const Loading = () => (
  <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export const App = () => {
  const [state, setState] = useState('');
  const [action, setAction] = useState('dial');
  const [processing, setProcessing] = useState(false);
  const [destination, setDestination] = useState(
    process.env.TELNYX_ECHO_DESTINATION_NUMBER || ''
  );
  const [credentials, setCredentials] = useState<Credentials>({
    sip_username: '',
    token: '',
  });

  const clientRef = useRef<TelnyxRTC>(null);
  const callRef = useRef<Call>(null);
  const mediaRef = useRef<HTMLAudioElement>(null);

  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(event.target.value);
  };

  const handleDial = async () => {
    try {
      setState('unregistered');
      setProcessing(true);
      await axios
        .post(`${process.env.SERVER_URL}/v1/call-control/credential`)
        .then((response) => {
          setCredentials(response.data);
        });
    } catch (error) {
      setProcessing(false);
      console.error(error);
    }
  };

  const handleHangup = () => {
    if (callRef.current) {
      callRef.current.hangup();
      setAction('dial');
    }
  };

  const handleDisconnect = () => {
    if (clientRef.current) {
      const client = clientRef.current;
      client.disconnect();
      client.off('telnyx.error');
      client.off('telnyx.ready');
      client.off('telnyx.notification');
      client.off('telnyx.socket.close');
      setState('unregistered');
      setAction('dial');
    }
  };

  useEffect(() => {
    if (credentials.token) {
      const session = new TelnyxRTC({
        login_token: credentials.token,
      });

      session.on('telnyx.ready', async () => {
        try {
          setState('registered');
          await axios
            .post(`${process.env.SERVER_URL}/v1/call-control/dial`, {
              sip_username: credentials.sip_username,
              caller_id_number: process.env.TELNYX_PHONE_NUMBER,
              call_destination: destination,
            })
            .then((response) => {
              setState(`Calling: ${destination}`);
              console.log(response.data);
            });
        } catch (error) {
          setProcessing(false);
          console.error(error);
        }
      });

      session.on('telnyx.error', () => {
        handleDisconnect();
      });

      session.on('telnyx.socket.close', () => {
        handleDisconnect();
      });

      session.on('telnyx.notification', (notification: INotification) => {
        if (notification.type === 'callUpdate') {
          const call = notification.call;
          const prepend = 'call state:';

          if (mediaRef.current) {
            mediaRef.current.srcObject = call.remoteStream;
          }

          switch (call.state) {
            case 'new':
              setState(`${prepend} new`);
              break;
            case 'ringing':
              setState(`${prepend} ringing`);
              if (
                call.options.remoteCallerNumber ===
                process.env.TELNYX_PHONE_NUMBER
              ) {
                call.answer();
              }
              break;
            case 'trying':
            case 'requesting':
            case 'recovering':
            case 'early':
              setState(`${prepend} connecting`);
              break;
            case 'active':
              setState(`${prepend} active`);
              setAction('hangup');
              setProcessing(false);
              break;
            case 'held':
              setState(`${prepend} held`);
              break;
            case 'hangup':
              setState(`${prepend} done (${call.cause})`);
              break;
            case 'destroy':
              setState(`${prepend} done (${call.cause})`);
              break;
            default:
              break;
          }

          callRef.current = call;
        }
      });

      clientRef.current = session;
      clientRef.current.connect();
    }

    return () => {
      handleHangup();
      handleDisconnect();
    };
  }, [credentials.token]);

  console.log(capitalize(state));

  return (
    <div className="flex justify-center min-h-screen py-24 bg-blue-900">
      <div className="flex flex-col items-center w-full px-10 overflow-hidden max-w-screen-xl">
        <h1 className="pb-6 text-3xl font-medium text-white">
          Telnyx Call Control Demo
        </h1>
        <div className="flex justify-center w-full">
          <audio ref={mediaRef} autoPlay={true}></audio>
          <input
            className="px-4 py-2 font-medium rounded-l outline-none w-96"
            type="text"
            placeholder="+E.164 or sip:username@sip.telnyx.com"
            value={destination}
            onChange={handleChange}
          />
          <button
            className="px-4 py-2 font-medium text-white bg-green-500 rounded-r outline-none w-36 hover:bg-green-300"
            onClick={action === 'dial' ? handleDial : handleHangup}
          >
            <span className="flex items-center justify-center">
              {processing ? <Loading /> : capitalize(action)}
            </span>
          </button>
        </div>
        <div className="px-5 py-6 w-96">
          <pre className="font-mono text-center text-white">
            {capitalize(state)}
          </pre>
        </div>
      </div>
    </div>
  );
};
