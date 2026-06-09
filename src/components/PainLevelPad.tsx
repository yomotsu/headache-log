'use client';

import { useState } from 'react';
import { painLevelColor, painLevelDescription } from '@/lib/utils';

const LEVELS = [ 0, 1, 2, 3, 4, 5 ] as const;

type Props = {
	onLogged: () => void;
};

function getLocation(): Promise<{ latitude: number; longitude: number } | null> {

	return new Promise( ( resolve ) => {

		if ( ! navigator.geolocation ) {

			resolve( null );
			return;

		}

		const timeout = setTimeout( () => resolve( null ), 5000 );

		navigator.geolocation.getCurrentPosition(
			( pos ) => {

				clearTimeout( timeout );
				resolve( { latitude: pos.coords.latitude, longitude: pos.coords.longitude } );

			},
			() => {

				clearTimeout( timeout );
				resolve( null );

			},
			{ timeout: 5000, maximumAge: 60000 }
		);

	} );

}

export default function PainLevelPad( { onLogged }: Props ) {

	const [ loadingLevel, setLoadingLevel ] = useState<number | null>( null );
	const [ lastLogged, setLastLogged ] = useState<{ level: number; time: string } | null>( null );
	const [ error, setError ] = useState( '' );

	async function handlePress( level: number ) {

		if ( loadingLevel !== null ) return;
		setLoadingLevel( level );
		setError( '' );

		const location = await getLocation();

		const res = await fetch( '/api/logs', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( {
				pain_level: level,
				latitude: location?.latitude ?? null,
				longitude: location?.longitude ?? null,
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			} ),
		} );

		setLoadingLevel( null );

		if ( res.ok ) {

			const now = new Date().toLocaleTimeString( 'ja-JP', { hour: '2-digit', minute: '2-digit' } );
			setLastLogged( { level, time: now } );
			onLogged();

		} else {

			setError( '記録に失敗しました。もう一度お試しください。' );

		}

	}

	return (
		<div className='flex flex-col gap-6'>
			<div className='grid grid-cols-3 gap-3'>
				{LEVELS.map( ( level ) => (
					<button
						key={level}
						onClick={() => handlePress( level )}
						disabled={loadingLevel !== null}
						className={[
							'flex min-h-[90px] flex-col items-center justify-start rounded-2xl px-2 pt-4 pb-3 transition-transform active:scale-95 disabled:opacity-60',
							painLevelColor( level ),
						].join( ' ' )}
					>
						{loadingLevel === level ? (
							<span className='text-sm'>記録中...</span>
						) : (
							<>
								<span className='text-3xl font-bold'>{level}</span>
								<span className='mt-1 text-[10px] font-bold leading-snug opacity-90 mx-auto w-fit text-left'>
									{painLevelDescription( level )}
								</span>
							</>
						)}
					</button>
				) )}
			</div>
			{lastLogged !== null && (
				<p className='text-center text-sm text-gray-500'>
					{lastLogged.time} に「{painLevelDescription( lastLogged.level )}」を記録しました
				</p>
			)}
			{error && (
				<p className='text-center text-sm text-red-400'>{error}</p>
			)}
		</div>
	);

}
