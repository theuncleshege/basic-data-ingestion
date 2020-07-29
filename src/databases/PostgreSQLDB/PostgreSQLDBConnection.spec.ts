import { getDbOptions } from '@DBConnections/PostgreSQLDB/PostgreSQLDBConnection';

describe('PostgreSQLDBConnection Tests', () => {
  const defaultDbOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'backendexercise',
    logging: false,
  };

  it('should return correct testing db config', () => {
    const options = getDbOptions();

    expect(options).toMatchObject({
      ...defaultDbOptions,
      database: 'test',
    });
  });

  it('should return correct offline db config', () => {
    const jestWotkerId = process.env.JEST_WORKER_ID;
    process.env.JEST_WORKER_ID = '';
    process.env.IS_OFFLINE = 'true';

    const options = getDbOptions();

    expect(options).toMatchObject({
      ...defaultDbOptions,
      synchronize: true,
    });

    process.env.IS_OFFLINE = '';
    process.env.JEST_WORKER_ID = jestWotkerId;
  });

  it('should return correct default db config', () => {
    const jestWotkerId = process.env.JEST_WORKER_ID;
    const nodeEnv = process.env.NODE_ENV;
    process.env.JEST_WORKER_ID = '';
    process.env.NODE_ENV = 'production';

    const options = getDbOptions();

    expect(options).toMatchObject(defaultDbOptions);

    process.env.JEST_WORKER_ID = jestWotkerId;
    process.env.JEST_WORKER_ID = nodeEnv;
  });
});
