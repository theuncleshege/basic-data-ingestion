import { isApiGatewayResponse } from '~/__tests__/helpers/validators';

describe('Validator test helper tests', () => {
  it('should return false if body, headers or statusCode is empty', () => {
    const response = {
      body: '',
      headers: '',
      statusCode: '',
    };

    expect(isApiGatewayResponse(response)).toBe(false);
  });

  it('should return false if statusCode is not a number', () => {
    const response = {
      body: 'akjlska',
      headers: 'asls',
      statusCode: 'sfdsdf',
    };

    expect(isApiGatewayResponse(response)).toBe(false);
  });

  it('should return false if body is not a string', () => {
    const response = {
      body: 4005,
      headers: 'asls',
      statusCode: 402,
    };

    expect(isApiGatewayResponse(response)).toBe(false);
  });

  it('should return false if header properties are incorrect', () => {
    const response1 = {
      body: '4045',
      headers: {
        'Content-Type': 'notjson',
      },
      statusCode: 203,
    };

    const response2 = {
      body: '4045',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods': 'incorrect',
      },
      statusCode: 203,
    };

    const response3 = {
      body: '4045',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': 'incorrect',
      },
      statusCode: 203,
    };

    expect(isApiGatewayResponse(response1)).toBe(false);
    expect(isApiGatewayResponse(response2)).toBe(false);
    expect(isApiGatewayResponse(response3)).toBe(false);
  });
});
