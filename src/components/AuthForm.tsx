'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'signup';

export default function AuthForm( { mode }: { mode: Mode } ) {

	const router = useRouter();
	const [ email, setEmail ] = useState( '' );
	const [ password, setPassword ] = useState( '' );
	const [ loading, setLoading ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ message, setMessage ] = useState( '' );

	async function handleSubmit( e: React.FormEvent ) {

		e.preventDefault();
		setLoading( true );
		setError( '' );
		setMessage( '' );

		const supabase = createClient();

		if ( mode === 'signup' ) {

			const { error: signUpError } = await supabase.auth.signUp( {
				email,
				password,
				options: { emailRedirectTo: `${location.origin}/auth/callback` },
			} );

			if ( signUpError ) {

				setError( signUpError.message );

			} else {

				setMessage( '確認メールを送信しました。メールをご確認ください。' );

			}

		} else {

			const { error: signInError } = await supabase.auth.signInWithPassword( {
				email,
				password,
			} );

			if ( signInError ) {

				setError( 'メールアドレスまたはパスワードが正しくありません。' );

			} else {

				router.push( '/log' );
				router.refresh();

			}

		}

		setLoading( false );

	}

	async function handleGoogle() {

		const supabase = createClient();
		await supabase.auth.signInWithOAuth( {
			provider: 'google',
			options: { redirectTo: `${location.origin}/auth/callback` },
		} );

	}

	return (
		<div className='flex flex-col gap-4'>
			<button
				type='button'
				onClick={handleGoogle}
				className='flex w-full items-center justify-center gap-3 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-700'
			>
				<svg width='18' height='18' viewBox='0 0 48 48'>
					<path fill='#FFC107' d='M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z'/>
					<path fill='#FF3D00' d='M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z'/>
					<path fill='#4CAF50' d='M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.1C9.5 35.6 16.2 44 24 44z'/>
					<path fill='#1976D2' d='M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C41.2 35.3 44 30 44 24c0-1.3-.1-2.6-.4-3.9z'/>
				</svg>
				Googleでログイン
			</button>
			<div className='flex items-center gap-3 text-xs text-gray-600'>
				<div className='flex-1 border-t border-gray-800' />
				またはメールで
				<div className='flex-1 border-t border-gray-800' />
			</div>
		<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
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
			<div className='flex flex-col gap-1'>
				<label htmlFor='password' className='text-sm font-medium text-gray-300'>
					パスワード
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
			{error && (
				<p className='rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400'>
					{error}
				</p>
			)}
			{message && (
				<p className='rounded-lg bg-green-950 px-3 py-2 text-sm text-green-400'>
					{message}
				</p>
			)}
			<button
				type='submit'
				disabled={loading}
				className='mt-2 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50'
			>
				{loading ? '処理中...' : mode === 'signup' ? 'アカウントを作成' : 'ログイン'}
			</button>
		</form>
		</div>
	);

}
