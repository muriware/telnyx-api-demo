import express, { Request, Response } from 'express';

import * as DialService from './dial.service';
import { Data } from './dial.interface';
import * as Base64 from '../utils/base64';

export const dialRouter = express.Router();

dialRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { sip_username, caller_id_number, call_destination } = req.body;

    const clientState = Base64.encode({
      callerIdNumber: caller_id_number,
      callDestination: call_destination,
      callLeg: 'caller'
    });

    const params: Data = {
      connection_id: process.env.TELNYX_CALL_CONTROL_CONNECTION_ID || '',
      to: `sip:${sip_username}@sip.telnyx.com`,
      from: caller_id_number,
      client_state: clientState,
    };

    const dial = await DialService.create(params);

    console.log(dial);
    res.status(200).json(dial);
  } catch (error: any) {
    console.log(error.toJSON());
    res.status(500).send(error.message);
  }
});
