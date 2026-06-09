import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
	const { memo, pain_level } = body;

	const update: { memo?: string | null; pain_level?: number } = {};
	if ( 'memo' in body ) update.memo = memo ?? null;
	if ( 'pain_level' in body ) {

		if ( typeof pain_level !== 'number' || pain_level < 0 || pain_level > 5 ) {

			return NextResponse.json( { error: 'Invalid pain_level' }, { status: 400 } );

		}
		update.pain_level = pain_level;

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
