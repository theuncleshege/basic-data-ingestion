import ValidationError from '@Shared/errors/ValidationError';
import { parseAndValidateRequest } from '@Shared/helpers/helpers';
import ErrorHandler from '@Shared/ErrorHandler/AWS/AWSErrorHandler';
import eventBodyGenerator from '@Tests/helpers/eventBodyGenerator';

describe('ErrorHandler Tests', () => {
  it('should return proper error message for duplicate entires', () => {
    const error = {
      code: 'ConditionalCheckFailedException',
    };

    const response = {
      statusCode: 409,
      body: JSON.stringify('Duplicate entry'),
    };

    expect(new ErrorHandler().handle(error)).toMatchObject(response);
  });

  it('should return proper error message for validation errors', () => {
    const error = new ValidationError('Hey! Invalid value there!');

    const response = {
      statusCode: 400,
      body: JSON.stringify('Hey! Invalid value there!'),
    };

    expect(new ErrorHandler().handle(error)).toMatchObject(response);
  });

  it('should throw ValidationError if validation fails', () => {
    const event = {
      body: JSON.stringify({ hello: 45 }),
    };

    const validMap = {
      hello: 'string',
    };

    expect(() => parseAndValidateRequest(event, validMap)).toThrow(
      ValidationError,
    );
  });

  it('should throw ValidationError if request is empty', () => {
    const event = {};

    const validMap = {
      hello: 'string',
      age: 'number',
    };

    expect(() => parseAndValidateRequest(event, validMap)).toThrow(
      ValidationError,
    );
  });

  it('should return proper generic Error response', () => {
    const originalError = console.error;
    console.error = jest.fn();

    const response = {
      statusCode: 500,
      body: JSON.stringify('Internal Server Error'),
    };

    const event = eventBodyGenerator({
      body: {
        sensorId: 'sdfsdf',
      },
    });

    expect(new ErrorHandler().handle(new Error(), event)).toMatchObject(
      response,
    );

    console.error = originalError;
  });
});
