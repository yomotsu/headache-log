'use client';

import { useState } from 'react';
import { painLevelColor } from '@/lib/utils';

const LEVELS = [ 0, 1, 2, 3, 4, 5 ] as const;

type Props = {
	logId: string;
	initialLevel: number;
};

export default function PainLevelEditor( { logId, initialLevel }: Props ) {

	const [ current, setCurrent ] = useState( initialLevel );
	const [ saving, setSaving ] = useState<number | null>( null );
	const [ error, setError ] = useState( '' );

	async function handleSelect( level: number ) {

		if ( level === current || saving !== null ) return;
		setSaving( level );
		setError( '' );

		const res = await fetch( `/api/logs/${logId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { pain_level: level } ),
		} );

		setSaving( null );

		if ( res.ok ) {

			setCurrent( level );

		} else {

			setError( '更新に失敗しました。' );

		}

	}

	return (
		<div className='flex flex-col gap-3'>
			<label className='text-sm font-semibold text-gray-400'>痛み度</label>
			<div className='grid grid-cols-6 gap-2'>
				{LEVELS.map( ( level ) => (
					<button
						key={level}
						onClick={() => handleSelect( level )}
						disabled={saving !== null}
						className={[
							'flex flex-col items-center justify-center rounded-xl py-3 text-xl font-bold transition-all disabled:opacity-50',
							level === current
								? painLevelColor( level ) + ' ring-2 ring-white/40 scale-105'
								: 'bg-gray-800 text-gray-400 hover:bg-gray-700',
							saving === level ? 'opacity-50' : '',
						].join( ' ' )}
					>
						{level}
					</button>
				) )}
			</div>
			{error && <p className='text-sm text-red-400'>{error}</p>}
		</div>
	);

}
