import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST( request: Request ) {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if ( ! user ) {

		return NextResponse.json( { error: 'Unauthorized' }, { status: 401 } );

	}

	const body = await request.json();
	const { pain_level, latitude, longitude } = body;

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
		} )
		.select()
		.single();

	if ( error ) {

		return NextResponse.json( { error: error.message }, { status: 500 } );

	}

	return NextResponse.json( data, { status: 201 } );

}
