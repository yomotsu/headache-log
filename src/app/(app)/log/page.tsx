import { createClient } from '@/lib/supabase/server';
import PainLevelPadWrapper from '@/components/PainLevelPadWrapper';
import LogEntry from '@/components/LogEntry';
import type { Log } from '@/lib/types';

export default async function LogPage() {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	const { data: recentData } = await supabase
		.from( 'logs' )
		.select( '*' )
		.eq( 'user_id', user!.id )
		.order( 'recorded_at', { ascending: false } )
		.limit( 3 );
	const recent = recentData as Log[] | null;

	return (
		<div className='flex flex-col gap-8'>
			<div>
				<h2 className='text-xl font-bold text-gray-100'>今どれくらい痛い？</h2>
			</div>
			<PainLevelPadWrapper />
			{recent && recent.length > 0 && (
				<div>
					<h3 className='mb-3 text-xs font-semibold uppercase tracking-wide text-gray-600'>
						直近の記録
					</h3>
					<div className='flex flex-col gap-2'>
						{recent.map( ( log ) => (
							<LogEntry key={log.id} log={log} />
						) )}
					</div>
				</div>
			)}
		</div>
	);

}
