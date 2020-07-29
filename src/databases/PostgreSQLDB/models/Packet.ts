import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Packet {
  @PrimaryColumn()
  sensorId: string;

  @PrimaryColumn({ type: 'bigint' })
  time: number;

  @Column({ type: 'numeric' })
  value: number;
}
