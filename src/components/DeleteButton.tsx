'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton( { logId }: { logId: string } ) {

	const router = useRouter();
	const [ confirm, setConfirm ] = useState( false );
	const [ deleting, setDeleting ] = useState( false );

	async function handleDelete() {

		setDeleting( true );
		const res = await fetch( `/api/logs/${logId}`, { method: 'DELETE' } );

		if ( res.ok ) {

			router.push( '/history' );
			router.refresh();

		} else {

			setDeleting( false );
			setConfirm( false );

		}

	}

	return (
		<>
			<button
				onClick={() => setConfirm( true )}
				className='text-sm text-gray-600 hover:text-red-400'
			>
				削除
			</button>
			{confirm && (
				<div
					className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6'
					onClick={( e ) => { if ( e.target === e.currentTarget && ! deleting ) setConfirm( false ); }}
				>
					<div className='w-full max-w-xs rounded-2xl bg-gray-900 p-6'>
						<p className='mb-1 text-base font-semibold text-gray-100'>この記録を削除しますか？</p>
						<p className='mb-6 text-sm text-gray-500'>削除したデータは元に戻せません。</p>
						<div className='flex flex-col gap-2'>
							<button
								onClick={handleDelete}
								disabled={deleting}
								className='w-full rounded-xl bg-red-900 py-3 text-sm font-semibold text-red-300 hover:bg-red-800 disabled:opacity-50'
							>
								{deleting ? '削除中...' : '削除する'}
							</button>
							<button
								onClick={() => setConfirm( false )}
								disabled={deleting}
								className='w-full rounded-xl border border-gray-700 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 disabled:opacity-50'
							>
								キャンセル
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);

}
