import { getDbOptions } from '~/connections/DynamoDB/DynamoDBConnection';

describe('DynamoDBConnection Tests', () => {
  it('should return correct testing db config', () => {
    const options = getDbOptions();

    expect(options).toMatchObject({
      endpoint: 'localhost:8000',
      region: 'local-env',
      sslEnabled: false,
    });
  });

  it('should return correct offline db config', () => {
    process.env.IS_OFFLINE = 'true';

    const options = getDbOptions();

    expect(options).toMatchObject({
      endpoint: 'http://localhost:8000',
      region: 'localhost',
    });

    process.env.IS_OFFLINE = '';
  });

  it('should return empty db config', () => {
    const jestWotkerId = process.env.JEST_WORKER_ID;
    process.env.JEST_WORKER_ID = '';

    const options = getDbOptions();

    expect(options).toMatchObject({});

    process.env.JEST_WORKER_ID = jestWotkerId;
  });
});
