import DBConnection from '~/connections/DBConnection';
import { response, parseAndValidateRequest } from '~/common/helpers/helpers';
import DynamoDBConnection from '~/connections/DynamoDB/DynamoDBConnection';
import PacketRepository from '~/repositories/Packet/PacketRepository';
import ErrorHandler from '~/common/ErrorHandler/ErrorHandler';
import AWSErrorHandler from '~/common/ErrorHandler/AWS/AWSErrorHandler';

export const getFunctionFactory = (
  dbConnection: DBConnection,
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

    const packetRepository = new PacketRepository(dbConnection);

    const result = await packetRepository.getPacket({ sensorId, since, until });

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
