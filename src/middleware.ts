import { NextResponse, type NextRequest } from 'next/server';

const APP_ROUTES = [ '/log', '/history', '/calendar' ];

function hasAuthCookie( request: NextRequest ): boolean {

	return request.cookies.getAll().some(
		( cookie ) => cookie.name.startsWith( 'sb-' ) && cookie.name.includes( 'auth-token' )
	);

}

export function middleware( request: NextRequest ) {

	const { pathname } = request.nextUrl;

	const isAppRoute = APP_ROUTES.some(
		( route ) => pathname === route || pathname.startsWith( route + '/' )
	);
	const isApiRoute = pathname.startsWith( '/api/' );

	if ( ( isAppRoute || isApiRoute ) && ! hasAuthCookie( request ) ) {

		if ( isApiRoute ) {

			return NextResponse.json( { error: 'Unauthorized' }, { status: 401 } );

		}

		return NextResponse.redirect( new URL( '/login', request.url ) );

	}

	return NextResponse.next();

}

export const config = {
	matcher: [ '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png).*)', ],
};
