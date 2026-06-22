'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordForm() {

	const [ email, setEmail ] = useState( '' );
	const [ loading, setLoading ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ sent, setSent ] = useState( false );

	async function handleSubmit( e: React.FormEvent ) {

		e.preventDefault();
		setLoading( true );
		setError( '' );

		const supabase = createClient();
		const redirectTo = `${location.origin}/auth/callback?next=/reset-password`;

		const { error: resetError } = await supabase.auth.resetPasswordForEmail( email, {
			redirectTo,
		} );

		setLoading( false );

		if ( resetError ) {

			setError( resetError.message );

		} else {

			setSent( true );

		}

	}

	if ( sent ) {

		return (
			<p className='rounded-lg bg-green-950 px-3 py-3 text-sm text-green-400'>
				{email} 宛にパスワード再設定用のメールを送信しました。メール内のリンクからパスワードを再設定してください。
			</p>
		);

	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
			<p className='text-sm text-gray-400'>
				登録済みのメールアドレスを入力してください。パスワード再設定用のリンクを送信します。
			</p>
			<div className='flex flex-col gap-1'>
				<label htmlFor='email' className='text-sm font-medium text-gray-300'>
					メールアドレス
				</label>
				<input
					id='email'
					type='email'
					value={email}
					onChange={( e ) => setEmail( e.target.value )}
					required
					className='rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-base text-gray-100 placeholder-gray-600 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'
					placeholder='you@example.com'
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
				{loading ? '送信中...' : 'リセットメールを送信'}
			</button>
		</form>
	);

}
