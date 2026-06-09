'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function WeatherFetcher( { logId }: { logId: string } ) {

	const router = useRouter();
	const done = useRef( false );

	useEffect( () => {

		if ( done.current ) return;
		done.current = true;

		fetch( `/api/logs/${logId}/weather`, { method: 'POST' } )
			.then( ( res ) => { if ( res.ok ) router.refresh(); } )
			.catch( () => {} );

	}, [ logId, router ] );

	return null;

}
