import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface HealthCheckResponse {
  status: string;
  checks: { name: string; status: string; description: string }[];
}

@Injectable({ providedIn: 'root' })
export class HealthCheckService {
  private readonly http = inject(HttpClient);
  private readonly _isHealthy = signal<boolean | null>(null);

  readonly isHealthy = this._isHealthy.asReadonly();

  async checkHealth(): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.http.get<HealthCheckResponse>('/cvapwebform/hc'));
      const healthy = response.checks.every((c) => c.status === 'Healthy');
      this._isHealthy.set(healthy);
      return healthy;
    } catch {
      this._isHealthy.set(false);
      return false;
    }
  }
}
