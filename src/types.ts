export type PacketData = {
  sensorId: string;
  time: number;
  value: number;
};

export type ThresholdData = {
  sensorId: string;
  threshold: number;
};

export type ErrorWithCodeProp = {
  code: string;
  message?: string;
};

export type PacketQueryParams = {
  sensorId: string;
  since: number;
  until: number;
};

export type PacketModel<T> = {
  tableName: string;
} & T;

export type ThresholdQueryParams = {
  sensorId: string;
};

export type ThresholdModel<T> = {
  tableName: string;
} & T;

export type Attributes =
  | PacketModel<PacketQueryParams>
  | ThresholdModel<ThresholdQueryParams>;

export type NotificationAttributes = {
  to?: string;
  from?: string;
  subject?: string;
  body: string;
};

export type NotificationData = {
  sensorId: string;
  to: string;
};
