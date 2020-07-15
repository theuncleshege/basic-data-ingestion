import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import ValidationError from '~/common/errors/ValidationError';
import { ErrorWithCodeProp } from '~/types';
import { response } from '~/common/helpers/helpers';
import ErrorHandler from '~/common/ErrorHandler/ErrorHandler';

export default class AWSErrorHandler implements ErrorHandler {
  public handle(
    error: Error | ErrorWithCodeProp,
    event?: APIGatewayEvent,
  ): APIGatewayProxyResult {
    let res: any;

    if (
      (error as ErrorWithCodeProp).code === 'ConditionalCheckFailedException'
    ) {
      res = {
        statusCode: 409,
        body: 'Duplicate entry',
      };
    } else if (error instanceof ValidationError) {
      res = {
        statusCode: 400,
        body: error.message,
      };
    } else {
      console.error('An event caused an unexpected exception:', error, event);
      res = {
        statusCode: 500,
        body: 'Internal Server Error',
      };
    }

    return response(res.statusCode, res.body);
  }
}
