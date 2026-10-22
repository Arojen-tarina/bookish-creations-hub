export interface AnalyticsRow { client_id: string; session_id: string; event_name: string; payload: Record<string, unknown>; platform: string; app_version: string }
export type UploadResult = 'SENT' | 'REFUSED' | 'FAILED';
export interface AnalyticsUploader { insert(rows: AnalyticsRow[]): Promise<UploadResult> }

export class SupabaseAnalyticsUploader implements AnalyticsUploader {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}
  async insert(rows: AnalyticsRow[]): Promise<UploadResult> {
    if (!this.baseUrl || !this.apiKey || rows.length === 0) return 'FAILED';
    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/rest/v1/analytics_events`, {
        method: 'POST', headers: { apikey: this.apiKey, Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(rows),
      });
      if (response.ok) return 'SENT';
      return response.status === 408 || response.status === 429 || response.status >= 500 ? 'FAILED' : 'REFUSED';
    } catch { return 'FAILED'; }
  }
}
