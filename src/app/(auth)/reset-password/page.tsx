import Link from 'next/link';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export default function ResetPasswordPage() {

	return (
		<div className='flex min-h-screen flex-col items-center justify-center px-4'>
			<div className='w-full max-w-sm'>
				<div className='mb-8 text-center'>
					<h1 className='text-2xl font-bold text-gray-100'>新しいパスワードを設定</h1>
					<p className='mt-1 text-sm text-gray-500'>これからログインに使うパスワードを入力してください</p>
				</div>
				<div className='rounded-2xl bg-gray-900 p-6 shadow-lg'>
					<ResetPasswordForm />
					<p className='mt-4 text-center text-sm text-gray-500'>
						<Link href='/login' className='font-medium text-blue-400 hover:underline'>
							ログイン画面に戻る
						</Link>
					</p>
				</div>
			</div>
		</div>
	);

}
