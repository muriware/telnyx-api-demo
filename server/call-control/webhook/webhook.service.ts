import axios from 'axios';

export const speak = async (data: any, call_control_id: string) => {
  const response = await axios({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
    },
    url: `${process.env.TELNYX_CALLS_API}/${call_control_id}/actions/speak`,
    data,
  });

  return response.data.data;
};

export const createConference = async (data: any) => {
  const response = await axios({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
    },
    url: `${process.env.TELNYX_CONFERENCES_API}`,
    data,
  });

  return response.data.data;
};

export const joinConference = async (data: any, conference_id: string) => {
  const response = await axios({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
    },
    url: `${process.env.TELNYX_CONFERENCES_API}/${conference_id}/actions/join`,
    data,
  });

  return response.data.data;
};

export const holdParticipants = async (data: any, conference_id: string) => {
  const response = await axios({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
    },
    url: `${process.env.TELNYX_CONFERENCES_API}/${conference_id}/actions/hold`,
    data,
  });

  return response.data.data;
};

export const unholdParticipants = async (data: any, conference_id: string) => {
  const response = await axios({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
    },
    url: `${process.env.TELNYX_CONFERENCES_API}/${conference_id}/actions/unhold`,
    data,
  });

  return response.data.data;
};

export const retrieveCallStatus = async (call_control_id: string) => {
  const response = await axios({
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
    },
    url: `${process.env.TELNYX_CALLS_API}/${call_control_id}`,
  });

  return response.data.data;
};

export const hangupCall = async (call_control_id: string) => {
  const response = await axios({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
    },
    url: `${process.env.TELNYX_CALLS_API}/${call_control_id}/actions/hangup`,
  });

  return response.data.data;
};
