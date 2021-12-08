import axios from 'axios';

import { Data } from './dial.interface';

export const create = async (data: Data) => {
  const response = await axios({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
    },
    url: `${process.env.TELNYX_CALLS_API}`,
    data,
  });

  return {
    call_control_id: response.data.data.call_control_id,
    call_leg_id: response.data.data.call_leg_id,
    call_session_id: response.data.data.call_session_id,
  };
};
