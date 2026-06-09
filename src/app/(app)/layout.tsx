import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default async function AppLayout( {
	children,
}: {
	children: React.ReactNode;
} ) {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if ( ! user ) redirect( '/login' );

	return (
		<div className='flex min-h-screen flex-col'>
			<header className='sticky top-0 z-10 border-b border-gray-800 bg-gray-950'>
				<div className='mx-auto flex max-w-lg items-center justify-between px-4 py-3'>
					<Link href='/log' className='text-lg font-bold text-gray-100'>
						頭痛ログ
					</Link>
					<nav className='flex items-center gap-4'>
						<Link
							href='/log'
							className='text-sm font-medium text-gray-400 hover:text-gray-100'
						>
							記録
						</Link>
						<Link
							href='/history'
							className='text-sm font-medium text-gray-400 hover:text-gray-100'
						>
							履歴
						</Link>
						<Link
							href='/calendar'
							className='text-sm font-medium text-gray-400 hover:text-gray-100'
						>
							カレンダー
						</Link>
						<LogoutButton />
					</nav>
				</div>
			</header>
			<main className='mx-auto w-full max-w-lg flex-1 px-4 py-6'>
				{children}
			</main>
		</div>
	);

}
