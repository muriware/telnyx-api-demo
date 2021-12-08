export interface Payload {
  call_control_id: string;
  client_state: string;
  conference_id: string;
}

export interface ClientState {
  callerIdNumber: string;
  callDestination: string;
  callLeg: 'caller' | 'callee';
  webrtcCallControlId: string;
  pstnCallControlId: string;
  conferenceId: string;
}
