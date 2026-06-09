export function formatDate( dateStr: string ): string {

	const date = new Date( dateStr );
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		weekday: 'short',
	};
	return date.toLocaleDateString( 'ja-JP', options );

}

export function formatTime( dateStr: string ): string {

	const date = new Date( dateStr );
	return date.toLocaleTimeString( 'ja-JP', { hour: '2-digit', minute: '2-digit' } );

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
		0: 'bg-emerald-500 hover:bg-emerald-600 text-white',
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

export function groupLogsByDate<T extends { recorded_at: string }>( logs: T[] ): Record<string, T[]> {

	const groups: Record<string, T[]> = {};

	for ( const log of logs ) {

		const dateKey = log.recorded_at.slice( 0, 10 );
		if ( ! groups[ dateKey ] ) groups[ dateKey ] = [];
		groups[ dateKey ].push( log );

	}

	return groups;

}
