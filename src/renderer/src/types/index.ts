export interface Match {
  id?: number;
  match_date: string;
  player_rank: string;
  player_group?: string;
  player_cr?: number;
  player_mp?: number;
  player_class: string;
  player_archetype?: string;
  opponent_class: string;
  opponent_archetype?: string;
  is_first: number; // 1 for first, 0 for second
  result: number; // 1 for win, 0 for lose
  notes?: string;
}

export interface Archetype {
  id?: number;
  name: string;
  class_name: string;
  default_cr?: number;
}
