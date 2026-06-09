import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geistSans = Geist( {
	variable: '--font-geist-sans',
	subsets: [ 'latin' ],
} );

export const metadata: Metadata = {
	title: '頭痛ログ',
	description: '頭痛の痛さを記録するアプリ',
	appleWebApp: {
		capable: true,
		title: '頭痛ログ',
		statusBarStyle: 'black-translucent',
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	themeColor: '#0d0d0d',
};

export default function RootLayout( {
	children,
}: Readonly<{
	children: React.ReactNode;
}> ) {

	return (
		<html lang='ja' className={`${geistSans.variable} h-full`}>
			<body className='min-h-full flex flex-col antialiased'>
				{children}
			</body>
		</html>
	);

}
