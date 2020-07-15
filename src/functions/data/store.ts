import DBConnection from '~/connections/DBConnection';
import NotificationService from '~/services/NotificationService/NotificationService';
import { parseAndValidateRequest, response } from '~/common/helpers/helpers';
import SNSNotificationService from '~/services/NotificationService/SNS/SNSNotificationService';
import DynamoDBConnection from '~/connections/DynamoDB/DynamoDBConnection';
import PacketRepository from '~/repositories/Packet/PacketRepository';
import ThresholdRepository from '~/repositories/Threshold/ThresholdRepository';
import ErrorHandler from '~/common/ErrorHandler/ErrorHandler';
import AWSErrorHandler from '~/common/ErrorHandler/AWS/AWSErrorHandler';

const storeFunctionFactory = (
  dbConnection: DBConnection,
  notificationService: NotificationService,
  errorHandler: ErrorHandler,
) => async (event: any): Promise<any> => {
  const validationMap = {
    sensorId: 'string',
    time: 'number',
    value: 'number',
  };

  try {
    const packetRepository = new PacketRepository(dbConnection);
    const thresholdRepository = new ThresholdRepository(dbConnection);

    const { sensorId, time, value } = parseAndValidateRequest(
      event,
      validationMap,
    );

    await packetRepository.savePacket({ sensorId, time, value });
    const { Item } = await thresholdRepository.getThreshold({ sensorId });

    if (Item && isThresholdTripped(value, Item.threshold)) {
      const body = `Threshold tripped for ${sensorId}. Limit is ${Item.threshold} but the value received was ${value}.`;
      const subject = `Threshold for ${sensorId} Tripped!!!`;

      await notificationService.notify({ body, subject });
    }

    return response(204);
  } catch (e) {
    return errorHandler.handle(e, event);
  }
};

const isThresholdTripped = (value: number, threshold: number): boolean => {
  if (
    (threshold < 0 && value < threshold) ||
    (threshold > 0 && value > threshold)
  ) {
    return true;
  }
  return false;
};

export const store = storeFunctionFactory(
  new DynamoDBConnection(),
  new SNSNotificationService(),
  new AWSErrorHandler(),
);

export default store;
