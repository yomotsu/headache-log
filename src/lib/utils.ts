const DEFAULT_TZ = 'Asia/Tokyo';

export function formatDate( dateStr: string, timezone?: string | null ): string {

	const date = new Date( dateStr );
	return date.toLocaleDateString( 'ja-JP', {
		timeZone: timezone ?? DEFAULT_TZ,
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		weekday: 'short',
	} );

}

export function formatTime( dateStr: string, timezone?: string | null ): string {

	const date = new Date( dateStr );
	return date.toLocaleTimeString( 'ja-JP', {
		timeZone: timezone ?? DEFAULT_TZ,
		hour: '2-digit',
		minute: '2-digit',
	} );

}

export function formatPainLabel( level: number ): string {

	if ( level === 0 ) return '治まった';
	return `痛み ${level}`;

}

export function painLevelDescription( level: number ): string {

	const descriptions: Record<number, string> = {
		0: '治まった',
		1: '痛いかも。薬なしで行動できる',
		2: '少し痛い。薬を飲むか迷う',
		3: 'ずきずきする。寝れば薬なしでも耐えられるかも',
		4: '頭が割れそう。吐ききそう。すぐ薬を飲みたい',
		5: 'それ以上。病院に行ったほうがいい？',
	};
	return descriptions[ level ] ?? '';

}

export function painLevelColor( level: number ): string {

	const colors: Record<number, string> = {
		0: 'bg-emerald-600 hover:bg-emerald-700 text-white',
		1: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900',
		2: 'bg-orange-400 hover:bg-orange-500 text-white',
		3: 'bg-orange-500 hover:bg-orange-600 text-white',
		4: 'bg-red-500 hover:bg-red-600 text-white',
		5: 'bg-red-700 hover:bg-red-800 text-white',
	};
	return colors[ level ] ?? 'bg-gray-400 text-white';

}

export function painLevelBadge( level: number ): string {

	const colors: Record<number, string> = {
		0: 'bg-emerald-900 text-emerald-300',
		1: 'bg-yellow-900 text-yellow-300',
		2: 'bg-orange-900 text-orange-300',
		3: 'bg-orange-800 text-orange-200',
		4: 'bg-red-900 text-red-300',
		5: 'bg-red-800 text-red-200',
	};
	return colors[ level ] ?? 'bg-gray-800 text-gray-300';

}

export function weatherCodeLabel( code: number ): string {

	if ( code === 0 ) return '快晴';
	if ( code === 1 ) return '晴れ';
	if ( code === 2 ) return '一部曇り';
	if ( code === 3 ) return '曇り';
	if ( code <= 48 ) return '霧';
	if ( code <= 55 ) return '霧雨';
	if ( code <= 57 ) return '凍霧雨';
	if ( code <= 65 ) return '雨';
	if ( code <= 67 ) return '凍雨';
	if ( code <= 75 ) return '雪';
	if ( code === 77 ) return '霰';
	if ( code <= 82 ) return 'にわか雨';
	if ( code <= 86 ) return 'にわか雪';
	if ( code >= 95 ) return '雷雨';
	return '不明';

}

export function groupLogsByDate<T extends { recorded_at: string }>( logs: T[] ): Record<string, T[]> {

	const groups: Record<string, T[]> = {};

	for ( const log of logs ) {

		const dateKey = log.recorded_at.slice( 0, 10 );
		if ( ! groups[ dateKey ] ) groups[ dateKey ] = [];
		groups[ dateKey ].push( log );

	}

	return groups;

}
