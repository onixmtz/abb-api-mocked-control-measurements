import MeasurementStatus from "../enums/MeasuredFeatureStatus";


type IMeasurementThresholds = {
  [MeasurementStatus.OK]: number;
  [MeasurementStatus.Warning]: number;
}

export default IMeasurementThresholds;