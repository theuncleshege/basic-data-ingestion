import * as AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import SNSNotificationService, {
  getSNSOptions,
} from '@Services/Notification/SNS/SNSNotificationService';
import { NotificationAttributes } from '~/types';

describe('SNSNotificationService Tests', () => {
  beforeAll(async (done) => {
    done();
  });

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
  });

  afterEach(() => {
    AWSMock.restore('SNS');
  });

  it('should send mail successfully', async () => {
    const attributes: NotificationAttributes = {
      body: 'Testing SNS Body',
      subject: 'Testing SNS',
    };

    AWSMock.mock('SNS', 'publish', 'Threshold email sent successfully');

    const snsNotificationService: SNSNotificationService = new SNSNotificationService();

    expect(await snsNotificationService.notify(attributes)).toStrictEqual(
      'Notification Sent Successfully',
    );
  });
});

describe('SNSNotificationService Config Tests', () => {
  it('should return correct testing sns config', () => {
    const options = getSNSOptions();

    expect(options).toMatchObject({
      endpoint: 'localhost:8001',
      region: 'local-env',
      sslEnabled: false,
    });
  });

  it('should return correct offline sns config', () => {
    const jestWotkerId = process.env.JEST_WORKER_ID;
    process.env.JEST_WORKER_ID = '';
    process.env.IS_OFFLINE = 'true';

    const options = getSNSOptions();

    expect(options).toMatchObject({
      endpoint: 'http://localhost:8001',
      region: 'localhost',
    });

    process.env.IS_OFFLINE = '';
    process.env.JEST_WORKER_ID = jestWotkerId;
  });

  it('should return empty sns config', () => {
    const jestWotkerId = process.env.JEST_WORKER_ID;
    const nodeEnv = process.env.NODE_ENV;
    process.env.JEST_WORKER_ID = '';
    process.env.NODE_ENV = 'production';

    const options = getSNSOptions();

    expect(options).toMatchObject({});

    process.env.JEST_WORKER_ID = jestWotkerId;
    process.env.JEST_WORKER_ID = nodeEnv;
  });
});
