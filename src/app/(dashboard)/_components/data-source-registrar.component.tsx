'use client';

import { useEffect } from 'react';
import { registerDataSource } from '@/config/data-source.register';
import { useModalStore } from '@/stores/window.store';

// Module-level call — runs once when this client module loads, before any component renders
registerDataSource();

export function DataSourceRegistrar() {
	useEffect(() => {
		useModalStore.persist.rehydrate();
	}, []);

	return null;
}
