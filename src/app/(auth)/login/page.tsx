import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {

	return (
		<div className='flex min-h-screen flex-col items-center justify-center px-4'>
			<div className='w-full max-w-sm'>
				<div className='mb-8 text-center'>
					<h1 className='text-2xl font-bold text-gray-100'>頭痛ログ</h1>
					<p className='mt-1 text-sm text-gray-500'>ログインして記録を続ける</p>
				</div>
				<div className='rounded-2xl bg-gray-900 p-6 shadow-lg'>
					<AuthForm mode='login' />
					<p className='mt-4 text-center text-sm text-gray-500'>
						アカウントがない方は{' '}
						<Link href='/signup' className='font-medium text-blue-400 hover:underline'>
							新規登録
						</Link>
					</p>
				</div>
			</div>
		</div>
	);

}
