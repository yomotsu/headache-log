'use client';

import { useRouter } from 'next/navigation';
import PainLevelPad from './PainLevelPad';

export default function PainLevelPadWrapper() {

	const router = useRouter();

	return <PainLevelPad onLogged={() => router.refresh()} />;

}
