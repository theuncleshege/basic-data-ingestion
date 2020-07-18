import ValidationError from '@Shared/errors/ValidationError';

export const response = (
  statusCode: number,
  body: { [name: string]: any } = {},
) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
    },
    body: JSON.stringify(body),
  };
};

export const parseAndValidateRequest = (
  request: { [name: string]: any },
  data: { [name: string]: any },
) => {
  let requestBody: any = {};

  if (request && request.body) {
    requestBody = JSON.parse(request.body);
  } else {
    requestBody = request;
  }

  validateRequestBody(requestBody, data);

  return requestBody;
};

const validateRequestBody = (
  requestBody: { [name: string]: any },
  data: { [name: string]: any },
) => {
  for (const key in data) {
    if (typeof requestBody[key] !== data[key]) {
      throw new ValidationError(`${key} is invalid`);
    }

    if (!requestBody[key]) {
      if (key !== 'value' && key !== 'threshold') {
        throw new ValidationError(`${key} is invalid`);
      }
    }
  }
};
