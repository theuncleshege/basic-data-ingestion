import { NotificationAttributes } from '~/types';
import NotificationService from '@Services/Notification/NotificationService';
import { SNS } from 'aws-sdk';
import { PublishInput } from 'aws-sdk/clients/sns';

export const getSNSOptions = (): { [name: string]: any } => {
  let options = {};
  if (process.env.IS_OFFLINE) {
    options = {
      endpoint: 'http://localhost:8001',
      region: 'localhost',
    };
  } else if (process.env.JEST_WORKER_ID) {
    options = {
      endpoint: 'localhost:8001',
      region: 'local-env',
      sslEnabled: false,
    };
  }

  return options;
};

export default class SNSNotificationService implements NotificationService {
  private awsSNS: SNS;

  constructor() {
    this.awsSNS = new SNS(getSNSOptions());
  }

  public async notify(attributes: NotificationAttributes): Promise<string> {
    const emailParams = {
      Message: attributes.body,
      Subject: attributes.subject,
      TopicArn: process.env.SNS_TOPIC,
    };

    const smsParams = {
      Message: attributes.body,
      TopicArn: process.env.SNS_TOPIC,
    };

    await this.sendEmail(emailParams);
    await this.sendSMS(smsParams);

    return 'Notification Sent Successfully';
  }

  private async sendEmail(params: PublishInput): Promise<any> {
    return await this.awsSNS.publish(params).promise();
  }

  private async sendSMS(params: PublishInput): Promise<any> {
    return JSON.stringify(params);
  }
}
