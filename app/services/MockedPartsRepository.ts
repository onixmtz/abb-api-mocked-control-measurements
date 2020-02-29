import MeasurementStatus from "../../lib/entities/enums/MeasuredFeatureStatus";
import { IControl, IControlThresholds } from "../../lib/entities/interfaces/IControl";
import { IMeasuredFeature } from "../../lib/entities/interfaces/IMeasuredFeature";
import IPart from "../../lib/entities/interfaces/IPart";
import IPartsRepository from "../../lib/entities/interfaces/IPartsRepository";


type IAnonymousControl = {
  name: string,
  dev: string,
  devOutTot: string,
  targetDev: number,
  thresholds: IControlThresholds;
};

class MockedPartsRepository implements IPartsRepository {
  static SIMULATION_SPEED_FACTOR = 1;
  static DEV_OUT_TOTAL_LAST_ITERATIONS = 30;

  static getInstance() {
    recalculateNewRandomizedDeviations(10);
    setInterval(() => recalculateNewRandomizedDeviations(MockedPartsRepository.SIMULATION_SPEED_FACTOR), 10000);
    return new MockedPartsRepository();
  }

  list() {
    return mockedParts.map(part => ({ partId: part.id }));
  }

  get(partId: string): IPart {
    return mockedParts.filter(part => part.id === partId)[0];
  }

  set(part: IPart) {
    const { id: partId } = part;
    if (partId && mockedParts){
      const previousPart = mockedParts.filter(part => part.id === partId);
      if (previousPart.length === 1) {
        const previousIndex = mockedParts.indexOf(previousPart[0]);
        mockedParts[previousIndex] = part;
      } else {
        mockedParts.push(part);
      }
    }
  }
}

const generateRandomControl = (type: number): IAnonymousControl => {
  return {
    ...mockedControlTypes[type][Math.round(Math.random() * 100) % 4],
  };
};

const generateMockedControls = (featureId: string, controls: number): IControl[] => {
  let iteration = 0;
  const array = new Array(controls).fill(0);
  return array.map(() => {
    iteration++;
    return {
      id: `fe${featureId.replace(/[^\d]+/, '')}_ctl${iteration}`,
      ...generateRandomControl(iteration % 3),
      status: MeasurementStatus.OK
    }
  });
};

const generateMockedFeature = (id: string, controls: number): IMeasuredFeature => {
  return {
    id,
    name: `Feature #${id}`,
    status: MeasurementStatus.OK,
    controls: generateMockedControls(id, controls),
  }
};

const generateMockedPart = (id: string, name: string, featureControls: number[]): IPart => {
  let featureId = 1;
  return {
    id: id,
    name: name,
    features: featureControls.map(controlsLength => {
      featureId++;
      return generateMockedFeature(featureId.toString(), controlsLength);
    })
  };
}

const getRandomNumber = () => {
  return Math.round((Math.random() > .5 ? Math.random() : -Math.random()) * 20) / 500;
};

const getStatus = (
  dev: number,
  targetDev: number,
  thresholds: IControlThresholds
): MeasurementStatus => {

  let devPercent = (dev * 100) / targetDev;
  if (devPercent > 100) {
    devPercent = 100 - (devPercent - 100);
  }
  return devPercent < thresholds[MeasurementStatus.Warning] ?
    MeasurementStatus.Alarm : (
      devPercent < thresholds[MeasurementStatus.OK] ? MeasurementStatus.Warning : MeasurementStatus.OK
    )
}

const recalculateNewRandomizedDeviations = (iterations?: number) => {
  runs++;
  if (runs > MockedPartsRepository.DEV_OUT_TOTAL_LAST_ITERATIONS) {
    runs = MockedPartsRepository.DEV_OUT_TOTAL_LAST_ITERATIONS;
  }
  if (iterations && iterations > 1) {
    for (let i = 0; i < iterations; i++) {
      recalculateNewRandomizedDeviations();
    }
    return;
  }
  mockedParts.forEach(part => {
    part.features.forEach(feature => {
      feature.status = MeasurementStatus.OK;
      feature.controls.forEach(control => {
        const dev = (parseFloat(control.dev) + getRandomNumber());
        const prevDevOut = parseFloat(control.devOutTot);
        const accDevOut = prevDevOut * (runs - 1);
        const devOutTot = (accDevOut + dev) / runs;
        control.dev = dev.toFixed(3);
        control.devOutTot = devOutTot.toFixed(3);
        control.status = getStatus(devOutTot, control.targetDev, control.thresholds);
        if (control.status > feature.status) {
          feature.status = control.status;
        }
      })
    });
  });
};

const getMockedThresholds = (targetDev: number): IControlThresholds => {
  const okThreshold = 100 - Math.random() * 10;
  const warningThreshold = okThreshold - Math.random() * 20;
  return {
    1: okThreshold,
    2: warningThreshold,
  }
};

let runs = 1;

const mockedControlTypes: IAnonymousControl[][] = [
  [
    { name: "Diameter", dev: "28.97", devOutTot: "29.1", targetDev: 29, thresholds: getMockedThresholds(29) },
    { name: "X", dev: "20.05", devOutTot: "20", targetDev: 20, thresholds: getMockedThresholds(20) },
    { name: "Y", dev: "40.09", devOutTot: "40.1", targetDev: 40, thresholds: getMockedThresholds(40) },
    { name: "Z", dev: "10.87", devOutTot: "11", targetDev: 11, thresholds: getMockedThresholds(11) }
  ],
  [
    { name: "Diameter", dev: "15.02", devOutTot: "15.05", targetDev: 15, thresholds: getMockedThresholds(15) },
    { name: "X", dev: "10.05", devOutTot: "10", targetDev: 10, thresholds: getMockedThresholds(10) },
    { name: "Y", dev: "11", devOutTot: "10.9", targetDev: 11, thresholds: getMockedThresholds(11) },
    { name: "Z", dev: "21.02", devOutTot: "19.99", targetDev: 21, thresholds: getMockedThresholds(21) }
  ],
  [
    { name: "Diameter", dev: "6", devOutTot: "6", targetDev: 6, thresholds: getMockedThresholds(6) },
    { name: "X", dev: "16.99", devOutTot: "17.02", targetDev: 17, thresholds: getMockedThresholds(17) },
    { name: "Y", dev: "40.09", devOutTot: "40.1", targetDev: 40, thresholds: getMockedThresholds(40) },
    { name: "Z", dev: "10.87", devOutTot: "11", targetDev: 11, thresholds: getMockedThresholds(11) }
  ],
];

const mockedParts: IPart[] = [generateMockedPart("1", "Part 1", [4, 12, 24, 4, 4, 12, 4])];

export default MockedPartsRepository; 