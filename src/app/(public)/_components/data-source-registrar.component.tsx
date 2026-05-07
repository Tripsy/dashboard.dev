'use client';

import { useEffect } from 'react';
import { dataSourceConfigWorkSession } from '@/app/(public)/_components/work-session/work-session.definition';
import { loadDataSource } from '@/config/data-source.config';
import { useModalStore } from '@/stores/window.store';
import { DataSourceSectionEnum } from '@/types/data-source.type';

loadDataSource(
	DataSourceSectionEnum.PUBLIC,
	'work-session',
	dataSourceConfigWorkSession,
);

export function DataSourceRegistrar() {
	useEffect(() => {
		useModalStore.persist.rehydrate();
	}, []);

	return null;
}
