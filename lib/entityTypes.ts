export interface PickRecord {
  id?: string;
  created_date?: string;
  updated_date?: string;
  created_by?: string;
  sport?: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff: string;
  market?: string;
  selection?: string;
  odds?: number | string | null;
  confidence?: number | string;
  risk_level?: string;
  reasoning?: string;
  status?: string;
  publish_date?: string;
  home_score?: number | null;
  away_score?: number | null;
  live_status?: string | null;
  minute_label?: string | null;
  live_updated_at?: string | null;
  provider_locked?: boolean;
  fixture_id?: number | null;
}

export interface SlipLegRecord {
  match: string;
  league?: string;
  market?: string;
  selection: string;
  odds: number | string | null;
  kickoff?: string;
  status?: string;
}

export interface SlipRecord {
  id?: string;
  created_date?: string;
  updated_date?: string;
  created_by?: string;
  title: string;
  target_odds: number | string | null;
  total_odds: number | string | null;
  sport?: string;
  legs: SlipLegRecord[];
  legs_count?: number;
  status?: string;
  publish_date?: string;
}
