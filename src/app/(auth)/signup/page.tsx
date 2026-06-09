import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export default function SignupPage() {

	return (
		<div className='flex min-h-screen flex-col items-center justify-center px-4'>
			<div className='w-full max-w-sm'>
				<div className='mb-8 text-center'>
					<h1 className='text-2xl font-bold text-gray-100'>頭痛ログ</h1>
					<p className='mt-1 text-sm text-gray-500'>新しいアカウントを作成</p>
				</div>
				<div className='rounded-2xl bg-gray-900 p-6 shadow-lg'>
					<AuthForm mode='signup' />
					<p className='mt-4 text-center text-sm text-gray-500'>
						すでにアカウントをお持ちの方は{' '}
						<Link href='/login' className='font-medium text-blue-400 hover:underline'>
							ログイン
						</Link>
					</p>
				</div>
			</div>
		</div>
	);

}
