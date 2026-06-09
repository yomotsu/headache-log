import { createClient } from '@/lib/supabase/server';
import { groupLogsByDate } from '@/lib/utils';
import DayGroup from '@/components/DayGroup';
import type { Log } from '@/lib/types';

export default async function HistoryPage() {

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	const { data: logsData } = await supabase
		.from( 'logs' )
		.select( '*' )
		.eq( 'user_id', user!.id )
		.order( 'recorded_at', { ascending: false } );
	const logs = logsData as Log[] | null;

	if ( ! logs || logs.length === 0 ) {

		return (
			<div className='flex flex-col items-center justify-center py-20 text-gray-600'>
				<p className='text-lg'>まだ記録がありません</p>
				<p className='mt-1 text-sm'>記録タブから痛さを記録してみましょう</p>
			</div>
		);

	}

	const groups = groupLogsByDate( logs );
	const dateKeys = Object.keys( groups ).sort( ( a, b ) => b.localeCompare( a ) );

	return (
		<div className='flex flex-col gap-6'>
			<h2 className='text-xl font-bold text-gray-100'>記録の履歴</h2>
			{dateKeys.map( ( dateKey ) => (
				<DayGroup key={dateKey} dateKey={dateKey} logs={groups[ dateKey ]} />
			) )}
		</div>
	);

}
