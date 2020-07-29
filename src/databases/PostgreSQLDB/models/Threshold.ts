import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Threshold {
  @PrimaryColumn()
  sensorId: string;

  @Column({ type: 'numeric' })
  threshold: number;
}
