export interface Sensor {
    id: number;
    nom: string;
    origin: string;
    apiKey: string;
    type: string;
    localisation: Point;
    dateInstallation: Date;
    status: boolean;
}

interface Point {
  type: 'Point';
  coordinates: [number, number];
}