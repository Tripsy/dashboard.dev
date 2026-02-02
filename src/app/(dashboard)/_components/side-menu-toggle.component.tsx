'use client';

import type React from 'react';
import { useSideMenu } from '@/app/(dashboard)/_providers/side-menu.provider';
import { Icons } from '@/components/icon.component';

export function SideMenuToggle() {
	const { status, toggleStatus } = useSideMenu();

	const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		toggleStatus(e.target.checked ? 'closed' : 'open');
	};

	return (
		<label className="swap swap-rotate pr-5">
			<input
				type="checkbox"
				checked={status === 'closed'}
				onChange={handleToggle}
			/>

			<div className="swap-off w-8 h-8 flex items-center justify-center rounded-full bg-base-200">
				{/* When menu is open (unchecked) */}
				<Icons.Design.SideMenuOpen />
			</div>

			<div className="swap-on w-8 h-8 flex items-center justify-center rounded-full bg-base-200">
				{/* When menu is closed (checked) */}
				<Icons.Design.SideMenuClosed className="opacity-50" />
			</div>
		</label>
	);
}
