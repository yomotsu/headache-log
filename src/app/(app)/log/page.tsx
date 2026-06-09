import { createClient } from '@/lib/supabase/server';
import { formatPainLabel, formatTime, painLevelBadge } from '@/lib/utils';
import PainLevelPadWrapper from '@/components/PainLevelPadWrapper';
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
							<div
								key={log.id}
								className='flex items-center justify-between rounded-xl bg-gray-900 px-4 py-3'
							>
								<div className='flex items-center gap-3'>
									<span
										className={[
											'flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold',
											painLevelBadge( log.pain_level ),
										].join( ' ' )}
									>
										{log.pain_level}
									</span>
									<span className='text-sm font-medium text-gray-300'>
										{formatPainLabel( log.pain_level )}
									</span>
								</div>
								<span className='text-sm text-gray-600'>{formatTime( log.recorded_at )}</span>
							</div>
						) )}
					</div>
				</div>
			)}
		</div>
	);

}
