import { getConnection } from 'typeorm';
import { createDBConnection } from '@DBConnections/PostgreSQLDB/PostgreSQLDBConnection';

const dbConnection = {
  async create() {
    await createDBConnection();
  },

  async close() {
    await getConnection().close();
  },

  async emptyDBTables() {
    const connection = getConnection();
    const entities = connection.entityMetadatas;

    entities.forEach(async (entity) => {
      const repository = connection.getRepository(entity.name);
      await repository.query(`TRUNCATE ${entity.tableName} CASCADE`);
    });
  },
};

export default dbConnection;
