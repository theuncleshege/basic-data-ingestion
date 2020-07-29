import { mocked } from 'ts-jest/utils';
import notifier from 'node-notifier';

import NodeNotificationService from '@Services/Notification/Node/NodeNotificationService';
import { NotificationAttributes } from '~/types';

jest.mock('node-notifier', () => ({
  notify: jest.fn(),
}));

const mockedNotifier = mocked(notifier, true);

describe('NodeNotificationService Tests', () => {
  let nodeNotificationService: NodeNotificationService;
  const notifierNotifyMethod = mockedNotifier.notify;

  beforeEach(() => {
    notifierNotifyMethod.mockClear();
    nodeNotificationService = new NodeNotificationService();
  });

  it('should send notification successfully', async () => {
    const attributes: NotificationAttributes = {
      body: 'Testing Node Notifier Body',
      subject: 'Testing Node Notifier',
    };

    const nodeNotificationAttributes = {
      title: attributes.subject,
      message: attributes.body,
      sound: true,
    };

    const result = await nodeNotificationService.notify(attributes);

    expect(notifierNotifyMethod).toHaveBeenCalledTimes(1);
    expect(notifierNotifyMethod).toHaveBeenCalledWith({
      ...nodeNotificationAttributes,
    });
    expect(result).toStrictEqual('Notification Sent Successfully');
  });
});
