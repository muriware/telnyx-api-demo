import axios from 'axios';

import { Data, CredentialID } from './credential.interface';

export const create = async (data: Data) => {
  const response = await axios({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TELNYX_API_KEY || 'YOUR_API_KEY'}`,
    },
    url: `${process.env.TELNYX_TELEPHONY_CREDENTIALS_API}`,
    data,
  });

  return {
    id: response.data.data.id,
    sip_username: response.data.data.sip_username,
  };
};

export const generateToken = async (credential_id: CredentialID) => {
  const response = await axios({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TELNYX_API_KEY || 'YOUR_API_KEY'}`,
    },
    url: `${process.env.TELNYX_TELEPHONY_CREDENTIALS_API}/${credential_id}/token`,
  });

  return response.data;
};
