import Link from 'next/link';
import { formatTime, painLevelBadge } from '@/lib/utils';
import type { Log } from '@/lib/types';

export default function LogEntry( { log }: { log: Log } ) {

	return (
		<Link
			href={`/history/${log.id}`}
			className='flex items-center justify-between rounded-xl bg-gray-900 px-4 py-3 transition-colors hover:bg-gray-800'
		>
			<div className='flex items-center gap-3'>
				<span
					className={[
						'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold',
						painLevelBadge( log.pain_level ),
					].join( ' ' )}
				>
					{log.pain_level}
				</span>
				<div>
					{log.memo && (
						<p className='max-w-[200px] truncate text-xs text-gray-500'>{log.memo}</p>
					)}
				</div>
			</div>
			<span className='flex-shrink-0 text-sm text-gray-600'>{formatTime( log.recorded_at, log.timezone )}</span>
		</Link>
	);

}
