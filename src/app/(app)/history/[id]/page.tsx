import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { painLevelBadge, weatherCodeLabel } from '@/lib/utils';
import MemoEditor from '@/components/MemoEditor';
import PainLevelEditor from '@/components/PainLevelEditor';
import DateTimeEditor from '@/components/DateTimeEditor';
import DeleteButton from '@/components/DeleteButton';
import WeatherFetcher from '@/components/WeatherFetcher';
import Link from 'next/link';
import type { Log } from '@/lib/types';

export default async function LogDetailPage( {
	params,
}: {
	params: Promise<{ id: string }>;
} ) {

	const { id } = await params;
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	const { data: logData } = await supabase
		.from( 'logs' )
		.select( '*' )
		.eq( 'id', id )
		.eq( 'user_id', user!.id )
		.single();
	const log = logData as Log | null;

	if ( ! log ) notFound();

	return (
		<div className='flex flex-col gap-6'>
			<div className='flex items-center justify-between'>
				<Link href='/history' className='text-sm text-gray-500 hover:text-gray-300'>
					← 履歴
				</Link>
				<DeleteButton logId={log.id} />
			</div>
			<div className='rounded-2xl bg-gray-900 p-5'>
				<div className='flex items-center gap-4'>
					<span
						className={[
							'flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold',
							painLevelBadge( log.pain_level ),
						].join( ' ' )}
					>
						{log.pain_level}
					</span>
					<div>
						<DateTimeEditor logId={log.id} initialRecordedAt={log.recorded_at} initialTimezone={log.timezone} />
					</div>
				</div>
				{( log.temperature !== null || log.pressure !== null || log.weather_code !== null ) && (
					<div className='mt-4 flex flex-wrap gap-3 rounded-lg bg-gray-800 px-3 py-2 text-xs text-gray-400'>
						{log.weather_code !== null && <span>天気: {weatherCodeLabel( log.weather_code )}</span>}
						{log.temperature !== null && <span>気温: {Number( log.temperature ).toFixed( 1 )}°C</span>}
						{log.pressure !== null && <span>気圧: {Number( log.pressure ).toFixed( 1 )} hPa</span>}
					</div>
				)}
				{( log.latitude !== null && log.longitude !== null ) && (
					<div className='mt-2 rounded-lg bg-gray-800 px-3 py-2 text-xs text-gray-500'>
						<span className='font-medium'>GPS: </span>
						{log.latitude.toFixed( 5 )}, {log.longitude.toFixed( 5 )}
					</div>
				)}
				{log.temperature === null && log.latitude !== null && log.longitude !== null && (
					<WeatherFetcher logId={log.id} />
				)}
			</div>
			<div className='rounded-2xl bg-gray-900 p-5'>
				<MemoEditor logId={log.id} initialMemo={log.memo} />
			</div>
			<div className='rounded-2xl bg-gray-900 p-5'>
				<PainLevelEditor logId={log.id} initialLevel={log.pain_level} />
			</div>
		</div>
	);

}
