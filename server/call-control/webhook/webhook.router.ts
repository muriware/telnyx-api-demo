import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import * as DialService from '../dial/dial.service';
import { Data } from '../dial/dial.interface';
import * as WebhookService from './webhook.service';
import { Payload, ClientState } from './webhook.interface';
import * as Base64 from '../utils/base64';

export const webhookRouter = express.Router();

webhookRouter.post('/', async (req: Request, res: Response) => {
  res.status(200).send();
  console.log('received webhook:', req.body.data);

  const eventType = req.body.data.event_type;
  const payload: Payload = req.body.data.payload;
  const clientState: ClientState = Base64.decode(payload.client_state);

  switch (eventType) {
    case 'call.initiated':
      break;
    case 'call.answered':
      const params = {
        payload: '',
        voice: 'female',
        language: 'en-US',
      };

      if (clientState.callLeg === 'caller') {
        params.payload = `Telnyx is now dialing ${clientState.callDestination
          .split('')
          .join(' ')}`;
      }

      if (clientState.callLeg === 'callee') {
        params.payload = 'You are now joining a Telnyx conference call';
      }

      await WebhookService.speak(params, payload.call_control_id)
        .then((response) => {
          console.log('speak text response:', response);
        })
        .catch((error) => {
          console.log('speak text error:', error.toJSON());
        });
      break;
    case 'call.speak.ended':
      if (clientState.callLeg === 'caller') {
        const conferenceClientState = Base64.encode({
          ...clientState,
          webrtcCallControlId: payload.call_control_id,
        });

        const params = {
          name: `Room ${uuidv4()}`,
          call_control_id: payload.call_control_id,
          client_state: conferenceClientState,
          duration_minutes: 1,
        };

        await WebhookService.createConference(params)
          .then((response) => {
            console.log('create conference response:', response);
          })
          .catch((error) => {
            console.log('create conference error:', error.toJSON());
          });
      }

      if (clientState.callLeg === 'callee') {
        const conferenceClientState = Base64.encode({
          ...clientState,
          pstnCallControlId: payload.call_control_id,
        });

        const params = {
          call_control_id: payload.call_control_id,
          client_state: conferenceClientState,
          end_conference_on_exit: true,
        };

        await WebhookService.joinConference(params, clientState.conferenceId)
          .then((response) => {
            console.log('join conference response:', response);
          })
          .catch((error) => {
            console.log('join conference error:', error.toJSON());
          });
      }
      break;
    case 'conference.created':
      if (clientState.callLeg === 'caller') {
        const params = {
          call_control_ids: [clientState.webrtcCallControlId],
        };

        await WebhookService.holdParticipants(params, payload.conference_id)
          .then((response) => {
            console.log('hold conference participants response:', response);
          })
          .catch((error) => {
            console.log('hold conference participants error:', error.toJSON());
          });
      }
      break;
    case 'conference.participant.joined':
      if (clientState.callLeg === 'caller') {
        const conferenceClientState = Base64.encode({
          ...clientState,
          callLeg: 'callee',
          conferenceId: payload.conference_id,
        });

        const params: Data = {
          connection_id: process.env.TELNYX_CALL_CONTROL_CONNECTION_ID || '',
          to: clientState.callDestination,
          from: clientState.callerIdNumber,
          client_state: conferenceClientState,
        };

        await DialService.create(params)
          .then((response) => {
            console.log('dial response:', response);
          })
          .catch((error) => {
            console.log('dial error:', error.toJSON());
          });
      }

      if (clientState.callLeg === 'callee') {
        const params = {
          call_control_ids: [clientState.webrtcCallControlId],
        };

        await WebhookService.unholdParticipants(
          params,
          clientState.conferenceId
        )
          .then((response) => {
            console.log('unhold conference participants response:', response);
          })
          .catch((error) => {
            console.log(
              'unhold conference participants error:',
              error.toJSON()
            );
          });
      }
      break;
    case 'call.participant.left':
    case 'call.hangup':
      let callControlId = '';

      if (clientState.callLeg === 'caller') {
        callControlId = clientState.webrtcCallControlId;
      }

      if (clientState.callLeg === 'callee') {
        callControlId = clientState.pstnCallControlId;
      }

      const callStatus = await WebhookService.retrieveCallStatus(callControlId)
        .then((response) => {
          console.log('retrieve call status response:', response);
          return response;
        })
        .catch((error) => {
          console.log('retrieve call status error:', error.toJSON());
        });

      if (callStatus && callStatus.is_alive) {
        await WebhookService.hangupCall(callControlId)
          .then((response) => {
            console.log('hangup call response:', response);
          })
          .catch((error) => {
            console.log('hangup call status error:', error.toJSON());
          });
      }
      break;
    default:
      break;
  }
});
