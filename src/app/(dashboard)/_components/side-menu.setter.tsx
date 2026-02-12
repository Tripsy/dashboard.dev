'use client';

import { useEffect } from 'react';
import { useSideMenu } from '@/app/(dashboard)/_providers/side-menu.provider';

export default function SideMenuSetter(): null {
	const { status } = useSideMenu();

	useEffect(() => {
		const mainContainerElement: Element | null =
			document.querySelector('main.main-section');

		if (mainContainerElement) {
			if (status === 'open') {
				mainContainerElement.classList.add('side-menu-open');
				mainContainerElement.classList.remove('side-menu-closed');
			} else {
				mainContainerElement.classList.add('side-menu-closed');
				mainContainerElement.classList.remove('side-menu-open');
			}
		}

		return () => {
			if (mainContainerElement) {
				mainContainerElement.classList.remove(
					'side-menu-open',
					'side-menu-closed',
				);
			}
		};
	}, [status]);

	return null;
}
