export interface PropertyForm {
  MedInc: number;
  HouseAge: number;
  AveRooms: number;
  AveBedrms: number;
  Population: number;
  AveOccup: number;
  Latitude: number;
  Longitude: number;
}

export interface ValuationResponse {
  prediction_value: number;
  currency: string;
  scale: string;
  input_received?: Record<string, number>;
}

export interface ValuationRecord {
  id: string;
  timestamp: string;
  priceUSD: number;
  inputs: PropertyForm;
}

export const ARCHETYPES = [
  {
    name: 'Bay Area Suburban',
    tag: 'Popular',
    desc: 'Contemporary family home near East Bay tech hubs',
    data: { MedInc: 8.5, HouseAge: 18, AveRooms: 6.8, AveBedrms: 1.1, Population: 1400, AveOccup: 2.7, Latitude: 37.85, Longitude: -122.25 }
  },
  {
    name: 'Silicon Valley Executive',
    tag: 'Prime',
    desc: 'High-income estate in Palo Alto / Cupertino corridor',
    data: { MedInc: 12.4, HouseAge: 14, AveRooms: 8.2, AveBedrms: 1.2, Population: 950, AveOccup: 2.5, Latitude: 37.42, Longitude: -122.14 }
  },
  {
    name: 'SoCal Coastal Retreat',
    tag: 'Coastal',
    desc: 'Scenic seaside residence near Newport Beach',
    data: { MedInc: 9.6, HouseAge: 25, AveRooms: 7.2, AveBedrms: 1.2, Population: 1100, AveOccup: 2.6, Latitude: 33.65, Longitude: -117.88 }
  },
  {
    name: 'Central Valley Starter',
    tag: 'Affordable',
    desc: 'Established starter residence in suburban Fresno',
    data: { MedInc: 3.6, HouseAge: 28, AveRooms: 5.2, AveBedrms: 1.0, Population: 2100, AveOccup: 3.3, Latitude: 36.75, Longitude: -119.78 }
  }
];

export const FEATURE_IMPORTANCES = [
  { feature: 'Median Income (MedInc)', weight: 51, color: '#10b981' },
  { feature: 'Average Occupancy (AveOccup)', weight: 14, color: '#3b82f6' },
  { feature: 'Latitude (Geospatial)', weight: 12, color: '#6366f1' },
  { feature: 'Longitude (Geospatial)', weight: 11, color: '#8b5cf6' },
  { feature: 'House Age (HouseAge)', weight: 6, color: '#f59e0b' },
  { feature: 'Average Rooms (AveRooms)', weight: 6, color: '#ec4899' },
];

export const MARKET_TRENDS = [
  { incomeTier: '< $30k', avgPrice: 135, sampleCount: 420 },
  { incomeTier: '$30k - $50k', avgPrice: 198, sampleCount: 890 },
  { incomeTier: '$50k - $75k', avgPrice: 278, sampleCount: 1320 },
  { incomeTier: '$75k - $100k', avgPrice: 382, sampleCount: 940 },
  { incomeTier: '$100k - $130k', avgPrice: 465, sampleCount: 520 },
  { incomeTier: '$130k+', avgPrice: 530, sampleCount: 280 },
];
