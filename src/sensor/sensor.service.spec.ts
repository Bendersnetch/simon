import { Test, TestingModule } from '@nestjs/testing';
import { SensorService } from './sensor.service';
import { Sensor } from './sensor.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from 'node:test';

describe('SensorService', () => {
  let service: SensorService;
  let repo: Repository<Sensor>;
  
    const mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensorService,
        {
          provide: getRepositoryToken(Sensor),
          useValue: mockRepository,
        }
      ],
    }).compile();

    service = module.get<SensorService>(SensorService);
    repo = module.get<Repository<Sensor>>(getRepositoryToken(Sensor));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /*
  describe('createSensor'), () => {
    it("should create and return a sensor", async () => {
      const sensor = { id: 1, nom: "Sensor-41", type: "Qualité de l'air", localisation: "Paris", dateInstallation: new Date(), status: false } as Sensor;


    })
  } */
});
