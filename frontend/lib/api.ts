/**
 * Secure API Client
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

interface PredictionRequest {
  MedInc: number;
  HouseAge: number;
  AveRooms: number;
  AveBedrms: number;
  Population: number;
  AveOccup: number;
  Latitude: number;
  Longitude: number;
}

interface PredictionResponse {
  prediction_value: number;
  currency: string;
  scale: string;
  request_id?: string;
  timestamp?: string;
}

interface HealthResponse {
  status: string;
  model_loaded: boolean;
  timestamp?: string;
}

class APIClient {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: 'Request failed',
          message: response.statusText,
        }));
        throw new Error(error.error || error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async predict(data: PredictionRequest): Promise<PredictionResponse> {
    return this.request<PredictionResponse>('/api/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Singleton instance
export const apiClient = new APIClient(API_URL, API_KEY);

// Export types
export type { PredictionRequest, PredictionResponse, HealthResponse };
