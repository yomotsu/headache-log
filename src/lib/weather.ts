export type WeatherData = {
	temperature: number;
	pressure: number;
	weatherCode: number;
};

type HourlyData = {
	time: string[];
	temperature_2m: ( number | null )[];
	surface_pressure: ( number | null )[];
	weathercode: ( number | null )[];
};

function extractClosest( hourly: HourlyData, recordedAt: Date ): WeatherData | null {

	const target = recordedAt.getTime();
	let closestIdx = 0;
	let closestDiff = Infinity;

	for ( let i = 0; i < hourly.time.length; i++ ) {

		const diff = Math.abs( new Date( hourly.time[ i ] + 'Z' ).getTime() - target );
		if ( diff < closestDiff ) {

			closestDiff = diff;
			closestIdx = i;

		}

	}

	const temperature = hourly.temperature_2m[ closestIdx ];
	const pressure = hourly.surface_pressure[ closestIdx ];
	const weatherCode = hourly.weathercode[ closestIdx ];

	if ( temperature == null || pressure == null || weatherCode == null ) return null;
	return { temperature, pressure, weatherCode };

}

export async function fetchWeather(
	latitude: number,
	longitude: number,
	recordedAt: string,
): Promise<WeatherData | null> {

	try {

		const date = new Date( recordedAt );
		const diffDays = ( Date.now() - date.getTime() ) / 86400000;
		if ( diffDays < 0 ) return null;

		let url: string;

		if ( diffDays <= 90 ) {

			const pastDays = Math.min( 92, Math.max( 1, Math.ceil( diffDays ) + 1 ) );
			const params = new URLSearchParams( {
				latitude: String( latitude ),
				longitude: String( longitude ),
				hourly: 'temperature_2m,surface_pressure,weathercode',
				timezone: 'UTC',
				past_days: String( pastDays ),
				forecast_days: '1',
			} );
			url = `https://api.open-meteo.com/v1/forecast?${params}`;

		} else {

			const dateStr = date.toISOString().slice( 0, 10 );
			const params = new URLSearchParams( {
				latitude: String( latitude ),
				longitude: String( longitude ),
				hourly: 'temperature_2m,surface_pressure,weathercode',
				timezone: 'UTC',
				start_date: dateStr,
				end_date: dateStr,
			} );
			url = `https://archive-api.open-meteo.com/v1/archive?${params}`;

		}

		const res = await fetch( url );
		if ( ! res.ok ) return null;

		const data = await res.json() as { hourly: HourlyData };
		if ( ! data.hourly?.time?.length ) return null;

		return extractClosest( data.hourly, date );

	} catch {

		return null;

	}

}
