'use client';

import { useState } from 'react';

type Props = {
	logId: string;
	initialMemo: string | null;
};

export default function MemoEditor( { logId, initialMemo }: Props ) {

	const [ memo, setMemo ] = useState( initialMemo ?? '' );
	const [ saving, setSaving ] = useState( false );
	const [ saved, setSaved ] = useState( false );
	const [ error, setError ] = useState( '' );

	async function handleSave() {

		setSaving( true );
		setSaved( false );
		setError( '' );

		const res = await fetch( `/api/logs/${logId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { memo: memo || null } ),
		} );

		setSaving( false );

		if ( res.ok ) {

			setSaved( true );
			setTimeout( () => setSaved( false ), 2000 );

		} else {

			setError( '保存に失敗しました。' );

		}

	}

	return (
		<div className='flex flex-col gap-3'>
			<label className='text-sm font-semibold text-gray-400'>メモ</label>
			<textarea
				value={memo}
				onChange={( e ) => { setMemo( e.target.value ); setSaved( false ); }}
				rows={4}
				placeholder='症状、気になること、食事、天気など...'
				className='w-full resize-none rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-base text-gray-200 placeholder-gray-600 focus:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600'
			/>
			<div className='flex items-center gap-3'>
				<button
					onClick={handleSave}
					disabled={saving}
					className='rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-600 disabled:opacity-50'
				>
					{saving ? '保存中...' : '保存'}
				</button>
				{saved && <span className='text-sm text-green-500'>保存しました</span>}
				{error && <span className='text-sm text-red-400'>{error}</span>}
			</div>
		</div>
	);

}
