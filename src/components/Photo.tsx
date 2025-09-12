'use client';
import * as s from '@/styles/components/photo.css';
import type { ReactNode } from 'react';

export default function Photo() {
	return (
		<div className={s.photo}>
			<img src="/src/assets/images/portrait.jpeg" alt="Stéphane L. Developer" />
		</div>
	);
}
