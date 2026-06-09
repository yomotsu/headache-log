import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchWeather } from '@/lib/weather';

export async function POST(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if ( ! user ) {

		return NextResponse.json( { error: 'Unauthorized' }, { status: 401 } );

	}

	const { id } = await params;

	const { data: log } = await supabase
		.from( 'logs' )
		.select( 'recorded_at, latitude, longitude' )
		.eq( 'id', id )
		.eq( 'user_id', user.id )
		.single();

	if ( ! log || log.latitude == null || log.longitude == null ) {

		return NextResponse.json( { error: 'No GPS data' }, { status: 400 } );

	}

	const weather = await fetchWeather( log.latitude, log.longitude, log.recorded_at );

	if ( ! weather ) {

		return NextResponse.json( { error: 'Weather fetch failed' }, { status: 502 } );

	}

	const { data, error } = await supabase
		.from( 'logs' )
		.update( {
			temperature: weather.temperature,
			pressure: weather.pressure,
			weather_code: weather.weatherCode,
		} )
		.eq( 'id', id )
		.eq( 'user_id', user.id )
		.select()
		.single();

	if ( error ) {

		return NextResponse.json( { error: error.message }, { status: 500 } );

	}

	return NextResponse.json( data );

}
