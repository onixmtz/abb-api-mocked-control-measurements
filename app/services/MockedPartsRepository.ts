import MeasurementStatus from "../../lib/entities/enums/MeasuredFeatureStatus";
import { IControl, IControlThresholds } from "../../lib/entities/interfaces/IControl";
import IMeasurementThresholds from "../../lib/entities/interfaces/IMeasurementThresholds";
import IPart from "../../lib/entities/interfaces/IPart";
import IPartsRepository from "../../lib/entities/interfaces/IPartsRepository";
import { IAnonymousControl } from "../../lib/entities/interfaces/IAnonymousControl";


class MockedPartsRepository implements IPartsRepository {
  static SIMULATION_SPEED_FACTOR = 1;
  static SIMULATION_UPDATE_MS = 1000;
  static DEV_OUT_TOTAL_LAST_ITERATIONS = 30;
  private runs = 20;
  private static seedInterval?: NodeJS.Timeout;
  private static instance: MockedPartsRepository;
  private mockedControlTypes = [
    [
      { name: "Diameter", dev: "28.97", devOutTot: "29.1", targetDev: 29 },
      { name: "X", dev: "20.05", devOutTot: "20", targetDev: 20 },
      { name: "Y", dev: "40.09", devOutTot: "40.1", targetDev: 40 },
      { name: "Z", dev: "10.87", devOutTot: "11", targetDev: 11 }
    ],
    [
      { name: "Diameter", dev: "15.02", devOutTot: "15.05", targetDev: 15 },
      { name: "X", dev: "10.05", devOutTot: "10", targetDev: 10 },
      { name: "Y", dev: "11", devOutTot: "10.9", targetDev: 11 },
      { name: "Z", dev: "21.02", devOutTot: "19.99", targetDev: 21 }
    ],
    [
      { name: "Diameter", dev: "6", devOutTot: "6", targetDev: 6 },
      { name: "X", dev: "16.99", devOutTot: "17.02", targetDev: 17 },
      { name: "Y", dev: "40.09", devOutTot: "40.1", targetDev: 40 },
      { name: "Z", dev: "10.87", devOutTot: "11", targetDev: 11 }
    ],
  ];
  private mockedParts: IPart[] = [];

  static getInstance(reset?: boolean) {
    if (!MockedPartsRepository.instance || reset) {
      MockedPartsRepository.instance = new MockedPartsRepository()
    }
    return MockedPartsRepository.instance;
  }

  constructor() {
    this.init();
  }

  reset() {
    if (MockedPartsRepository.seedInterval) {
      clearInterval(MockedPartsRepository.seedInterval);
    }
    MockedPartsRepository.getInstance(true);
    this.init();
  }

  init() {
    this.mockedParts[0] = this.generateMockedPart("1", "Part 1", [24, 4, 12, 4, 4, 4]);
    this.recalculateNewRandomizedDeviations(10);
    MockedPartsRepository.seedInterval = setInterval(() => MockedPartsRepository.getInstance()
      .recalculateNewRandomizedDeviations(MockedPartsRepository.SIMULATION_SPEED_FACTOR), MockedPartsRepository.SIMULATION_UPDATE_MS);
  }

  list() {
    return this.mockedParts.map(part => ({ partId: part.id }));
  }

  get(partId: string): IPart {
    return this.mockedParts.filter(part => part.id === partId)[0];
  }

  set(part: IPart) {
    const { id: partId } = part;
    if (partId && this.mockedParts) {
      const previousPart = this.mockedParts.filter(part => part.id === partId);
      if (previousPart.length === 1) {
        const previousIndex = this.mockedParts.indexOf(previousPart[0]);
        this.mockedParts[previousIndex] = part;
      } else {
        this.mockedParts.push(part);
      }
    }
  }

  recalculateNewRandomizedDeviations(iterations?: number): void {
    this.runs++;
    if (this.runs > MockedPartsRepository.DEV_OUT_TOTAL_LAST_ITERATIONS) {
      this.runs = MockedPartsRepository.DEV_OUT_TOTAL_LAST_ITERATIONS;
    }
    if (iterations && iterations > 1) {
      for (let i = 0; i < iterations; i++) {
        this.recalculateNewRandomizedDeviations();
      }
      return;
    }
    this.mockedParts.forEach(part => {
      part.features.forEach(feature => {
        feature.status = MeasurementStatus.OK;
        feature.controls.forEach((control: IControl) => {
          const dev = (parseFloat(control.dev) + this.getRandomNumber());
          const prevDevOut = parseFloat(control.devOutTot);
          const accDevOut = prevDevOut * (this.runs - 1);
          const devOutTot = (accDevOut + dev) / this.runs;
          control.dev = dev.toFixed(3);
          control.devOutTot = devOutTot.toFixed(3);
          control.status = this.getStatus(devOutTot, control.targetDev, control.thresholds);
          if (control.status > feature.status) {
            feature.status = control.status;
          }
        });
      });
    });
  }

  generateRandomControl(type: number): IAnonymousControl {
    return {
      ...this.mockedControlTypes[type][Math.round(Math.random() * 100) % 4],
    };
  };

  generateMockedControls(featureId: string, controls: number): IControl[] {
    let iteration = 0;
    const array = new Array(controls).fill(0);
    return array.map((): IControl => {
      iteration++;
      return {
        id: `fe${featureId.replace(/[^\d]+/, '')}_ctl${iteration}`,
        ...this.generateRandomControl(iteration % 3),
        thresholds: this.getMockedThresholds(),
        status: MeasurementStatus.OK
      };
    });
  };

  generateMockedFeature(id: string, controls: number) {
    return {
      id,
      name: `Feature #${id}`,
      status: MeasurementStatus.OK,
      controls: this.generateMockedControls(id, controls),
    };
  };

  generateMockedPart(id: string, name: string, featureControls: number[]): IPart {
    let featureId = 0;
    return {
      id: id,
      name: name,
      features: featureControls.map((controlsLength: number) => {
        featureId++;
        return this.generateMockedFeature(featureId.toString(), controlsLength);
      })
    };
  }
  getRandomNumber(): number {
    return Math.round((Math.random() > .5 ? Math.random() : -Math.random()) * 20) / 500;
  };

  getStatus(dev: number, targetDev: number, thresholds: IMeasurementThresholds): MeasurementStatus {
    let devPercent = (dev * 100) / targetDev;
    if (devPercent > 100) {
      devPercent = 100 - (devPercent - 100);
    }
    return devPercent < thresholds[MeasurementStatus.Warning] ?
      MeasurementStatus.Alarm : (devPercent < thresholds[MeasurementStatus.OK] ? MeasurementStatus.Warning : MeasurementStatus.OK);
  }
  getMockedThresholds(): IControlThresholds {
    const okThreshold = 100 - Math.random() * 10;
    const warningThreshold = okThreshold - Math.random() * 20;
    return {
      1: okThreshold,
      2: warningThreshold,
    };
  }
}

export default MockedPartsRepository; 