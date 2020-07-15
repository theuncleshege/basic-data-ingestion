import { Attributes } from '~/types';

export default interface DBConnection {
  create(model: any): Promise<any>;
  get(attributes: Attributes): Promise<any>;
  query(attributes: Attributes): Promise<any>;
}
