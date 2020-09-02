import { Between, createConnection, getManager } from 'typeorm';

import DBConnection from '@DBConnections/DBConnection';

import {
  PacketQueryParams,
  PacketData,
  PacketModel,
  ThresholdModel,
  ThresholdQueryParams,
} from '~/types';
import { Threshold } from './models/Threshold';
import { Packet } from './models/Packet';

export const getDbOptions = () => {
  let options: any = {};
  const defaultOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'basicdataingestion',
    logging: false,
    entities: ['src/databases/PostgreSQLDB/models/**/*.ts'],
  };

  if (process.env.JEST_WORKER_ID) {
    options = {
      ...defaultOptions,
      database: process.env.TEST_DB_NAME || 'test',
      keepConnectionAlive: true,
    };
  } else if (process.env.IS_OFFLINE || process.env.NODE_ENV !== 'production') {
    options = {
      ...defaultOptions,
      synchronize: true,
    };
  } else {
    options = defaultOptions;
  }

  return options;
};

export const createDBConnection = async () => {
  await createConnection(getDbOptions());
};

export default class PostgreSQLDBConnection implements DBConnection {
  public async get(
    attributes: ThresholdModel<ThresholdQueryParams>,
  ): Promise<any> {
    const manager = getManager();

    const result = await manager.findOne(Threshold, {
      sensorId: attributes.sensorId,
    });

    return { Item: result };
  }

  public async query(attributes: PacketModel<PacketQueryParams>): Promise<any> {
    const manager = getManager();

    return await manager.find(Packet, {
      sensorId: attributes.sensorId,
      time: Between(attributes.since, attributes.until),
    });
  }

  public async create(model: PacketModel<PacketData>): Promise<any> {
    const manager = getManager();

    const modelMap: { [x: string]: any } = {
      packet: Packet,
      threshold: Threshold,
    };

    return await manager.insert(modelMap[model.tableName], model);
  }
}
