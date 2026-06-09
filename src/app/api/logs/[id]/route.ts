import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchWeather } from '@/lib/weather';

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if ( ! user ) {

		return NextResponse.json( { error: 'Unauthorized' }, { status: 401 } );

	}

	const { id } = await params;
	const body = await request.json();
	const { memo, pain_level, recorded_at } = body;

	const update: { memo?: string | null; pain_level?: number; recorded_at?: string } = {};
	if ( 'memo' in body ) update.memo = memo ?? null;
	if ( 'pain_level' in body ) {

		if ( typeof pain_level !== 'number' || pain_level < 0 || pain_level > 5 ) {

			return NextResponse.json( { error: 'Invalid pain_level' }, { status: 400 } );

		}
		update.pain_level = pain_level;

	}
	if ( 'recorded_at' in body ) {

		const ts = Date.parse( recorded_at );
		if ( isNaN( ts ) ) {

			return NextResponse.json( { error: 'Invalid recorded_at' }, { status: 400 } );

		}
		update.recorded_at = new Date( ts ).toISOString();

	}

	const { data, error } = await supabase
		.from( 'logs' )
		.update( update )
		.eq( 'id', id )
		.eq( 'user_id', user.id )
		.select()
		.single();

	if ( error ) {

		return NextResponse.json( { error: error.message }, { status: 500 } );

	}

	if ( ! data ) {

		return NextResponse.json( { error: 'Not found' }, { status: 404 } );

	}

	if ( 'recorded_at' in body && data.latitude != null && data.longitude != null ) {

		const weather = await fetchWeather( data.latitude, data.longitude, data.recorded_at );

		if ( weather ) {

			const { data: updated } = await supabase
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

			if ( updated ) return NextResponse.json( updated );

		}

	}

	return NextResponse.json( data );

}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if ( ! user ) {

		return NextResponse.json( { error: 'Unauthorized' }, { status: 401 } );

	}

	const { id } = await params;

	const { error } = await supabase
		.from( 'logs' )
		.delete()
		.eq( 'id', id )
		.eq( 'user_id', user.id );

	if ( error ) {

		return NextResponse.json( { error: error.message }, { status: 500 } );

	}

	return new NextResponse( null, { status: 204 } );

}
