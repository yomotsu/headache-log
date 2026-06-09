import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchWeather } from '@/lib/weather';

export async function POST( request: Request ) {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if ( ! user ) {

		return NextResponse.json( { error: 'Unauthorized' }, { status: 401 } );

	}

	const body = await request.json();
	const { pain_level, latitude, longitude, timezone } = body;

	if ( typeof pain_level !== 'number' || pain_level < 0 || pain_level > 5 ) {

		return NextResponse.json( { error: 'Invalid pain_level' }, { status: 400 } );

	}

	const { data, error } = await supabase
		.from( 'logs' )
		.insert( {
			user_id: user.id,
			pain_level,
			latitude: latitude ?? null,
			longitude: longitude ?? null,
			timezone: typeof timezone === 'string' ? timezone : null,
		} )
		.select()
		.single();

	if ( error ) {

		return NextResponse.json( { error: error.message }, { status: 500 } );

	}

	if ( data && latitude != null && longitude != null ) {

		const weather = await fetchWeather( latitude, longitude, data.recorded_at );

		if ( weather ) {

			const { data: updated } = await supabase
				.from( 'logs' )
				.update( {
					temperature: weather.temperature,
					pressure: weather.pressure,
					weather_code: weather.weatherCode,
				} )
				.eq( 'id', data.id )
				.select()
				.single();

			if ( updated ) return NextResponse.json( updated, { status: 201 } );

		}

	}

	return NextResponse.json( data, { status: 201 } );

}
