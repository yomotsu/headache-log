'use client';

import { useState } from 'react';
import { formatDate, formatTime } from '@/lib/utils';

type Props = {
	logId: string;
	initialRecordedAt: string;
	initialTimezone: string | null;
};

function toDatetimeLocalValue( isoString: string, timezone: string ): string {

	return new Intl.DateTimeFormat( 'sv-SE', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	} ).format( new Date( isoString ) ).replace( ' ', 'T' );

}

function fromDatetimeLocalValue( localValue: string, timezone: string ): string {

	const naiveUTC = new Date( localValue + ':00Z' );
	const tzLocalStr = new Intl.DateTimeFormat( 'sv-SE', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	} ).format( naiveUTC ).replace( ' ', 'T' ) + ':00Z';

	const diff = naiveUTC.getTime() - new Date( tzLocalStr ).getTime();
	return new Date( naiveUTC.getTime() + diff ).toISOString();

}

export default function DateTimeEditor( { logId, initialRecordedAt, initialTimezone }: Props ) {

	const tz = initialTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

	const [ recordedAt, setRecordedAt ] = useState( initialRecordedAt );
	const [ editing, setEditing ] = useState( false );
	const [ value, setValue ] = useState( toDatetimeLocalValue( initialRecordedAt, tz ) );
	const [ saving, setSaving ] = useState( false );
	const [ error, setError ] = useState( '' );

	function handleEdit() {

		setValue( toDatetimeLocalValue( recordedAt, tz ) );
		setError( '' );
		setEditing( true );

	}

	async function handleSave() {

		setSaving( true );
		setError( '' );

		const res = await fetch( `/api/logs/${logId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { recorded_at: fromDatetimeLocalValue( value, tz ) } ),
		} );

		setSaving( false );

		if ( res.ok ) {

			setRecordedAt( fromDatetimeLocalValue( value, tz ) );
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
				{formatDate( recordedAt, tz )} {formatTime( recordedAt, tz )}
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
