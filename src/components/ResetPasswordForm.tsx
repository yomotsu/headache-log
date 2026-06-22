'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordForm() {

	const router = useRouter();
	const [ password, setPassword ] = useState( '' );
	const [ confirm, setConfirm ] = useState( '' );
	const [ loading, setLoading ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ ready, setReady ] = useState( false );

	useEffect( () => {

		const supabase = createClient();
		supabase.auth.getSession().then( ( { data } ) => {

			if ( ! data.session ) {

				setError( 'リセットリンクが無効または期限切れです。再度メール送信をお試しください。' );

			}

			setReady( true );

		} );

	}, [] );

	async function handleSubmit( e: React.FormEvent ) {

		e.preventDefault();
		setError( '' );

		if ( password !== confirm ) {

			setError( '確認用パスワードが一致しません。' );
			return;

		}

		setLoading( true );

		const supabase = createClient();
		const { error: updateError } = await supabase.auth.updateUser( { password } );

		setLoading( false );

		if ( updateError ) {

			setError( updateError.message );
			return;

		}

		router.push( '/log' );
		router.refresh();

	}

	if ( ! ready ) {

		return <p className='text-sm text-gray-500'>読み込み中...</p>;

	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
			<div className='flex flex-col gap-1'>
				<label htmlFor='password' className='text-sm font-medium text-gray-300'>
					新しいパスワード
				</label>
				<input
					id='password'
					type='password'
					value={password}
					onChange={( e ) => setPassword( e.target.value )}
					required
					minLength={6}
					className='rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-base text-gray-100 placeholder-gray-600 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'
					placeholder='6文字以上'
				/>
			</div>
			<div className='flex flex-col gap-1'>
				<label htmlFor='confirm' className='text-sm font-medium text-gray-300'>
					新しいパスワード（確認）
				</label>
				<input
					id='confirm'
					type='password'
					value={confirm}
					onChange={( e ) => setConfirm( e.target.value )}
					required
					minLength={6}
					className='rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-base text-gray-100 placeholder-gray-600 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'
					placeholder='もう一度入力'
				/>
			</div>
			{error && (
				<p className='rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400'>
					{error}
				</p>
			)}
			<button
				type='submit'
				disabled={loading}
				className='mt-2 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50'
			>
				{loading ? '更新中...' : 'パスワードを更新'}
			</button>
		</form>
	);

}
