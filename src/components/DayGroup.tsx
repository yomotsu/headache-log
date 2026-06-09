import { formatDate } from '@/lib/utils';
import LogEntry from './LogEntry';
import type { Log } from '@/lib/types';

type Props = {
	dateKey: string;
	logs: Log[];
};

export default function DayGroup( { dateKey, logs }: Props ) {

	return (
		<div>
			<h3 className='mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600'>
				{formatDate( dateKey + 'T00:00:00' )}
			</h3>
			<div className='flex flex-col gap-2'>
				{logs.map( ( log ) => (
					<LogEntry key={log.id} log={log} />
				) )}
			</div>
		</div>
	);

}
