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

	return (
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
	);

}
