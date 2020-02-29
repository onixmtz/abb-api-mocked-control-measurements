import MeasurementStatus from "../enums/MeasuredFeatureStatus";


export type IControlThresholds = {
  [MeasurementStatus.OK]: number;
  [MeasurementStatus.Warning]: number;
}

export type IControl = {
  id: string;
  dev: string;
  devOutTot: string;
  status: MeasurementStatus;
  name: string;
  targetDev: number;
  thresholds: IControlThresholds;
};