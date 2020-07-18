import { response, parseAndValidateRequest } from '@Shared/helpers/helpers';
import DynamoDBConnection from '@DBConnections/DynamoDB/DynamoDBConnection';
import ErrorHandler from '@Shared/ErrorHandler/ErrorHandler';
import AWSErrorHandler from '@Shared/ErrorHandler/AWS/AWSErrorHandler';
import PacketService from '@Services/Packet/PacketService';

export const getFunctionFactory = (
  dbConnection: DynamoDBConnection,
  errorHandler: ErrorHandler,
) => async (event: any): Promise<any> => {
  const validationMap = {
    sensorId: 'string',
    since: 'number',
    until: 'number',
  };

  const eventParams = {
    sensorId: event.pathParameters.sensorId,
    since: parseInt(event.queryStringParameters.since),
    until: parseInt(event.queryStringParameters.until),
  };

  try {
    const { sensorId, since, until } = parseAndValidateRequest(
      eventParams,
      validationMap,
    );

    const packetService = new PacketService(dbConnection);
    const result = await packetService.get({ sensorId, since, until });

    return response(200, result.Items);
  } catch (e) {
    return errorHandler.handle(e, event);
  }
};

export const get = getFunctionFactory(
  new DynamoDBConnection(),
  new AWSErrorHandler(),
);

export default get;
