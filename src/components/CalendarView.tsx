'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { painLevelBadge } from '@/lib/utils';
import Link from 'next/link';

const WEEKDAYS = [ '日', '月', '火', '水', '木', '金', '土' ];

function startOfMonth( date: Date ): Date {

	return new Date( date.getFullYear(), date.getMonth(), 1 );

}

function endOfMonth( date: Date ): Date {

	return new Date( date.getFullYear(), date.getMonth() + 1, 0 );

}

function toDateKey( date: Date ): string {

	return date.toISOString().slice( 0, 10 );

}

export default function CalendarView() {

	const [ month, setMonth ] = useState( () => startOfMonth( new Date() ) );
	const [ maxByDay, setMaxByDay ] = useState<Record<string, number>>( {} );
	const [ loading, setLoading ] = useState( true );

	useEffect( () => {

		async function fetchMonth() {

			setLoading( true );
			const supabase = createClient();
			const from = startOfMonth( month ).toISOString();
			const to = endOfMonth( month ).toISOString();

			const { data } = await supabase
				.from( 'logs' )
				.select( 'pain_level, recorded_at' )
				.gte( 'recorded_at', from )
				.lte( 'recorded_at', to )
				.gt( 'pain_level', 0 );

			const map: Record<string, number> = {};
			for ( const log of data ?? [] ) {

				const key = log.recorded_at.slice( 0, 10 );
				map[ key ] = Math.max( map[ key ] ?? 0, log.pain_level );

			}

			setMaxByDay( map );
			setLoading( false );

		}

		fetchMonth();

	}, [ month ] );

	function prevMonth() {

		setMonth( ( m ) => new Date( m.getFullYear(), m.getMonth() - 1, 1 ) );

	}

	function nextMonth() {

		setMonth( ( m ) => new Date( m.getFullYear(), m.getMonth() + 1, 1 ) );

	}

	const year = month.getFullYear();
	const monthNum = month.getMonth() + 1;
	const firstWeekday = month.getDay();
	const daysInMonth = endOfMonth( month ).getDate();
	const today = toDateKey( new Date() );

	const cells: ( number | null )[] = [
		...Array( firstWeekday ).fill( null ),
		...Array.from( { length: daysInMonth }, ( _, i ) => i + 1 ),
	];

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<button
					onClick={prevMonth}
					className='rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100'
				>
					‹
				</button>
				<h2 className='text-lg font-bold text-gray-100'>
					{year}年 {monthNum}月
				</h2>
				<button
					onClick={nextMonth}
					className='rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100'
				>
					›
				</button>
			</div>
			<div className='grid grid-cols-7 text-center'>
				{WEEKDAYS.map( ( d, i ) => (
					<div
						key={d}
						className={[
							'py-1 text-xs font-semibold',
							i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500',
						].join( ' ' )}
					>
						{d}
					</div>
				) )}
			</div>
			<div className={[ 'grid grid-cols-7 gap-1', loading ? 'opacity-50' : '' ].join( ' ' )}>
				{cells.map( ( day, i ) => {

					if ( day === null ) {

						return <div key={`empty-${i}`} />;

					}

					const dateKey = `${year}-${String( monthNum ).padStart( 2, '0' )}-${String( day ).padStart( 2, '0' )}`;
					const maxLevel = maxByDay[ dateKey ];
					const isToday = dateKey === today;
					const hasRecord = maxLevel !== undefined;

					const inner = (
						<>
							<span className={[ 'text-sm', isToday ? 'font-bold text-gray-100' : 'text-gray-400' ].join( ' ' )}>
								{day}
							</span>
							{hasRecord ? (
								<span
									className={[
										'mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
										painLevelBadge( maxLevel ),
									].join( ' ' )}
								>
									{maxLevel}
								</span>
							) : (
								<span className='mt-1 h-6' />
							)}
						</>
					);

					const cellClass = [
						'flex flex-col items-center rounded-xl py-2',
						isToday ? 'ring-1 ring-gray-600' : '',
					].join( ' ' );

					return hasRecord ? (
						<Link
							key={dateKey}
							href={`/history?date=${dateKey}`}
							className={cellClass + ' transition-colors hover:bg-gray-800'}
						>
							{inner}
						</Link>
					) : (
						<div key={dateKey} className={cellClass}>
							{inner}
						</div>
					);

				} )}
			</div>
		</div>
	);

}
