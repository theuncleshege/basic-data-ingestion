import PacketRepository from '@Repositories/Packet/PacketRepository';
import DBConnection from '@DBConnections/DBConnection';
import ThresholdService from '@Services/Threshold/ThresholdService';
import NotificationService from '@Services/Notification/NotificationService';
import { PacketData, PacketQueryParams } from '~/types';

export default class PacketService {
  private packetRepository: PacketRepository;
  private dbConnection: DBConnection;

  constructor(dbConnection: DBConnection) {
    this.dbConnection = dbConnection;
    this.packetRepository = new PacketRepository(this.dbConnection);
  }

  public async get(queryParams: PacketQueryParams) {
    return this.packetRepository.get(queryParams);
  }

  public async save(data: PacketData) {
    return this.packetRepository.save(data);
  }

  public async notifyIfThresholdIsTripped(
    notificationService: NotificationService,
    sensorId: string,
    value: number,
  ) {
    const thresholdService = new ThresholdService(this.dbConnection);
    const { Item } = await thresholdService.get({ sensorId });

    if (Item && thresholdService.isThresholdTripped(value, Item.threshold)) {
      const body = `Threshold tripped for ${sensorId}. Limit is ${Item.threshold} but the value received was ${value}.`;
      const subject = `Threshold for ${sensorId} Tripped!!!`;

      notificationService.notify({ body, subject });
    }
  }
}
