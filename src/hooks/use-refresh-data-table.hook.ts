import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { DataSourceKey } from '@/config/data-source.config';

export function useRefreshDataTable() {
	const queryClient = useQueryClient();

	return useCallback(
		(dataSourceKey: DataSourceKey) =>
			queryClient.invalidateQueries({
				queryKey: ['dataTable', dataSourceKey],
			}),
		[queryClient],
	);
}
