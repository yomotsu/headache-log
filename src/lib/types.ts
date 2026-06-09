export type Database = {
	public: {
		Tables: {
			logs: {
				Row: {
					id: string;
					user_id: string;
					pain_level: number;
					recorded_at: string;
					latitude: number | null;
					longitude: number | null;
					memo: string | null;
					timezone: string | null;
					temperature: number | null;
					pressure: number | null;
					weather_code: number | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					pain_level: number;
					recorded_at?: string;
					latitude?: number | null;
					longitude?: number | null;
					memo?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					memo?: string | null;
				};
			};
		};
	};
};

export type Log = Database['public']['Tables']['logs']['Row'];
