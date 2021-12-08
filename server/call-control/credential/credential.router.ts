import express, { Request, Response } from 'express';

import * as CredentialService from './credential.service';
import { Data } from './credential.interface';

export const credentialRouter = express.Router();

credentialRouter.post('/', async (req: Request, res: Response) => {
  try {
    const params: Data = {
      connection_id: process.env.TELNYX_SIP_CONNECTION_ID || 'YOUR_SIP_CONNECTION_ID',
    };

    const credential = await CredentialService.create(params)
    const token = await CredentialService.generateToken(credential.id);

    const result = {
      sip_username: credential.sip_username,
      token,
    };

    res.status(201).json(result);
  } catch (error: any) {
    console.log(error.toJSON());
    res.status(500).send(error.message);
  }
});
