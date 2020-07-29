import { NotificationAttributes } from '~/types';
import NotificationService from '@Services/Notification/NotificationService';
import notifier from 'node-notifier';

export default class NodeNotificationService implements NotificationService {
  public async notify(attributes: NotificationAttributes): Promise<string> {
    notifier.notify({
      title: attributes.subject,
      message: attributes.body,
      sound: true,
    });

    return 'Notification Sent Successfully';
  }
}
