import { NotificationAttributes } from '~/types';

export default interface NotificationService {
  notify($attributes: NotificationAttributes): Promise<any>;
}
