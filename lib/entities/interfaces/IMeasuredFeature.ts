import MeasurementStatus from "../enums/MeasuredFeatureStatus";
import { IControl } from "./IControl";


export type IMeasuredFeature = {
  id: string;
  status: MeasurementStatus;
  name: string;
  controls: IControl[];
};