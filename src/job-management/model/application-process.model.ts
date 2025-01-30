import { randomUUID } from 'crypto';

export const ApplicationProcess: { [x: string]: 
  'APPLYED' 
  | 'HAVENT_REQUIREMENTS' 
  | 'DONT_CARE' 
  | 'STAGE_HR' 
  | 'TECHNICAL_EVALUATION_STAGE' 
  | 'RECEIVED_JOB_OFFER'
  | 'DIDNT_PASS_PROCESS'
} = {
  APPLYED: 'APPLYED',
  STAGE_HR: 'STAGE_HR',
  TECHNICAL_EVALUATION_STAGE: 'TECHNICAL_EVALUATION_STAGE',
  RECEIVED_JOB_OFFER: 'RECEIVED_JOB_OFFER',
  DIDNT_PASS_PROCESS: 'DIDNT_PASS_PROCESS',
  HAVENT_REQUIREMENTS: 'HAVENT_REQUIREMENTS',
  DONT_CARE: 'DONT_CARE'
};

export default class StatusApplication {
  id: string;
  title: string;
  url: string;
  status: StatusApplication | null;

  constructor(data: StatusApplication) {
    Object.assign(this, data);
  }

  static create(
    data: Omit<
      StatusApplication,
      'id' 
    >,
    id = randomUUID(),
  ): StatusApplication {
    return new StatusApplication({
      id,
      title: data.title,
      url: data.url,
      status: null     
    });
  }
}
