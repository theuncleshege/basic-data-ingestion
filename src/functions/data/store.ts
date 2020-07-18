import NotificationService from '~/services/Notification/NotificationService';
import { parseAndValidateRequest, response } from '~/common/helpers/helpers';
import SNSNotificationService from '~/services/Notification/SNS/SNSNotificationService';
import DynamoDBConnection from '~/connections/DynamoDB/DynamoDBConnection';
import ErrorHandler from '~/common/ErrorHandler/ErrorHandler';
import AWSErrorHandler from '~/common/ErrorHandler/AWS/AWSErrorHandler';
import PacketService from '~/services/Packet/PacketService';

const storeFunctionFactory = (
  dbConnection: DynamoDBConnection,
  errorHandler: ErrorHandler,
  notificationService: NotificationService,
) => async (event: any): Promise<any> => {
  const validationMap = {
    sensorId: 'string',
    time: 'number',
    value: 'number',
  };

  try {
    const { sensorId, time, value } = parseAndValidateRequest(
      event,
      validationMap,
    );

    const packetService = new PacketService(dbConnection);

    await packetService.save({ sensorId, time, value });
    await packetService.notifyIfThresholdIsTripped(
      notificationService,
      sensorId,
      value,
    );

    return response(204);
  } catch (e) {
    return errorHandler.handle(e, event);
  }
};

export const store = storeFunctionFactory(
  new DynamoDBConnection(),
  new AWSErrorHandler(),
  new SNSNotificationService(),
);

export default store;
