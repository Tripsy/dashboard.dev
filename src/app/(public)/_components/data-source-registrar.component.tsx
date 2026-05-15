'use client';

import { useEffect } from 'react';
import { dataSourceConfigWorkSession } from '@/app/(public)/_components/work-session/work-session.definition';
import { dataSourceConfigWorkSessionVehicle } from '@/app/(public)/_components/work-session-vehicle/work-session-vehicle.definition';
import { loadDataSource } from '@/config/data-source.config';
import { useModalStore } from '@/stores/window.store';
import { DataSourceSectionEnum } from '@/types/data-source.type';

export function DataSourceRegistrar() {
	useEffect(() => {
		loadDataSource(
			DataSourceSectionEnum.PUBLIC,
			'work-session',
			dataSourceConfigWorkSession,
		);

		loadDataSource(
			DataSourceSectionEnum.PUBLIC,
			'work-session-vehicle',
			dataSourceConfigWorkSessionVehicle,
		);

		useModalStore.persist.rehydrate();
	}, []);

	return null;
}
