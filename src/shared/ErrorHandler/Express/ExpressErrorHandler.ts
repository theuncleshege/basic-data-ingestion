import express from 'express';
import ValidationError from '@Shared/errors/ValidationError';
import { ErrorWithCodeProp } from '~/types';
import ErrorHandler from '@Shared/ErrorHandler/ErrorHandler';

export default class ExpressErrorHandler implements ErrorHandler {
  public handle(
    error: Error | ErrorWithCodeProp,
    event?: express.Request,
  ): any {
    let res: any;

    if ((error as ErrorWithCodeProp).code === '23505') {
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

    return res;
  }
}
