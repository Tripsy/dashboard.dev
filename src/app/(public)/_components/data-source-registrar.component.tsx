'use client';

import { useEffect } from 'react';
import { dataSourceConfigAddress } from '@/app/(public)/_components/address/address.definition';
import { dataSourceConfigClient } from '@/app/(public)/_components/client/client.definition';
import { dataSourceConfigCmr } from '@/app/(public)/_components/cmr/cmr.definition';
import { dataSourceConfigCmrSession } from '@/app/(public)/_components/cmr-session/cmr-session.definition';
import { dataSourceConfigCmrVehicle } from '@/app/(public)/_components/cmr-vehicle/cmr-vehicle.definition';
import { dataSourceConfigWorkSession } from '@/app/(public)/_components/work-session/work-session.definition';
import { dataSourceConfigWorkSessionVehicle } from '@/app/(public)/_components/work-session-vehicle/work-session-vehicle.definition';
import { loadDataSource } from '@/config/data-source.config';
import { useModalStore } from '@/stores/window.store';
import { DataSourceSectionEnum } from '@/types/data-source.type';

export function DataSourceRegistrar() {
	useEffect(() => {
		loadDataSource(
			DataSourceSectionEnum.PUBLIC,
			'address',
			dataSourceConfigAddress,
		);

		loadDataSource(
			DataSourceSectionEnum.PUBLIC,
			'client',
			dataSourceConfigClient,
		);

		loadDataSource(
			DataSourceSectionEnum.PUBLIC,
			'cmr',
			dataSourceConfigCmr,
		);

		loadDataSource(
			DataSourceSectionEnum.PUBLIC,
			'cmr-session',
			dataSourceConfigCmrSession,
		);

		loadDataSource(
			DataSourceSectionEnum.PUBLIC,
			'cmr-vehicle',
			dataSourceConfigCmrVehicle,
		);

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
