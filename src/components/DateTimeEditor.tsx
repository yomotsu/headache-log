'use client';

import { useState } from 'react';
import { formatDate, formatTime } from '@/lib/utils';

type Props = {
	logId: string;
	initialRecordedAt: string;
};

function toDatetimeLocalValue( isoString: string ): string {

	const date = new Date( isoString );
	const offset = date.getTimezoneOffset() * 60000;
	const local = new Date( date.getTime() - offset );
	return local.toISOString().slice( 0, 16 );

}

export default function DateTimeEditor( { logId, initialRecordedAt }: Props ) {

	const [ recordedAt, setRecordedAt ] = useState( initialRecordedAt );
	const [ editing, setEditing ] = useState( false );
	const [ value, setValue ] = useState( toDatetimeLocalValue( initialRecordedAt ) );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( '' );

	function handleEdit() {

		setValue( toDatetimeLocalValue( recordedAt ) );
		setError( '' );
		setEditing( true );

	}

	async function handleSave() {

		setSaving( true );
		setError( '' );

		const res = await fetch( `/api/logs/${logId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { recorded_at: new Date( value ).toISOString() } ),
		} );

		setSaving( false );

		if ( res.ok ) {

			setRecordedAt( new Date( value ).toISOString() );
			setEditing( false );

		} else {

			setError( '保存に失敗しました。' );

		}

	}

	if ( editing ) {

		return (
			<div className='flex flex-col gap-2'>
				<input
					type='datetime-local'
					value={value}
					onChange={( e ) => setValue( e.target.value )}
					className='rounded-lg border border-gray-700 bg-gray-800 px-2 py-1 text-base text-gray-200 focus:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600'
				/>
				<div className='flex items-center gap-2'>
					<button
						onClick={handleSave}
						disabled={saving}
						className='rounded-lg bg-gray-700 px-3 py-1 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-600 disabled:opacity-50'
					>
						{saving ? '保存中...' : '保存'}
					</button>
					<button
						onClick={() => setEditing( false )}
						disabled={saving}
						className='text-sm text-gray-500 hover:text-gray-300 disabled:opacity-50'
					>
						キャンセル
					</button>
				</div>
				{error && <span className='text-xs text-red-400'>{error}</span>}
			</div>
		);

	}

	return (
		<div className='flex items-center gap-2'>
			<p className='text-sm text-gray-500'>
				{formatDate( recordedAt )} {formatTime( recordedAt )}
			</p>
			<button
				onClick={handleEdit}
				className='text-xs text-gray-600 hover:text-gray-400'
			>
				編集
			</button>
		</div>
	);

}
