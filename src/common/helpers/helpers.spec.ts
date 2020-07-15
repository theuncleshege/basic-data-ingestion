import { response, parseAndValidateRequest } from '~/common/helpers/helpers';

describe('Helper Functions Tests', () => {
  it('should return valid response object', () => {
    const res = {
      statusCode: 303,
      body: JSON.stringify({ test: 'success' }),
    };

    expect(response(303, { test: 'success' })).toMatchObject(res);
  });

  it('should return request body if validation passes', () => {
    const event = { hello: 'Hi there', age: 45 };

    const validMap = {
      hello: 'string',
      age: 'number',
    };

    expect(parseAndValidateRequest(event, validMap)).toMatchObject(event);
  });
});
