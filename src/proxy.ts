import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy( request: NextRequest ) {

	let supabaseResponse = NextResponse.next( { request } );

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {

					return request.cookies.getAll();

				},
				setAll( cookiesToSet ) {

					cookiesToSet.forEach( ( { name, value } ) =>
						request.cookies.set( name, value )
					);
					supabaseResponse = NextResponse.next( { request } );
					cookiesToSet.forEach( ( { name, value, options } ) =>
						supabaseResponse.cookies.set( name, value, options )
					);

				},
			},
		}
	);

	const { data: { user } } = await supabase.auth.getUser();

	const { pathname } = request.nextUrl;
	const isAppRoute = pathname === '/log' || pathname.startsWith( '/log/' ) || pathname === '/history' || pathname.startsWith( '/history/' ) || pathname === '/calendar' || pathname.startsWith( '/calendar/' );
	const isApiRoute = pathname.startsWith( '/api/' );

	if ( ! user && isAppRoute ) {

		return NextResponse.redirect( new URL( '/login', request.url ) );

	}

	if ( ! user && isApiRoute ) {

		return NextResponse.json( { error: 'Unauthorized' }, { status: 401 } );

	}

	return supabaseResponse;

}

export const config = {
	matcher: [ '/((?!_next/static|_next/image|favicon.ico).*)', ],
};
