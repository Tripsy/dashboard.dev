import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { isDriver } from '@/models/auth.model';
import { useAuth } from '@/providers/auth.provider';
import { requestDriverCashBalance } from '@/services/driver-session.service';
import type { Currency } from '@/types/common.type';

const REFRESH_INTERVAL_CASH_BALANCE = 1000 * 60 * 30; // 30 minutes

export function useDriverCashBalance(currency: Currency) {
	const { auth } = useAuth();
	const queryClient = useQueryClient();
	const userId = auth?.id;

	const query = useQuery({
		queryKey: ['driver-cash-balance', userId, currency],
		queryFn: async () => {
			if (!userId) {
				throw new Error('No auth');
			}

			return requestDriverCashBalance(userId, currency);
		},
		enabled: isDriver(auth) && !!userId,
		staleTime: REFRESH_INTERVAL_CASH_BALANCE,
	});

	const invalidate = useCallback(() => {
		return queryClient.invalidateQueries({
			queryKey: ['driver-cash-balance', userId, currency],
		});
	}, [queryClient, userId, currency]);

	const invalidateAll = useCallback(() => {
		return queryClient.invalidateQueries({
			queryKey: ['driver-cash-balance', userId],
		});
	}, [queryClient, userId]);

	const refetch = useCallback(async () => {
		await queryClient.refetchQueries({
			queryKey: ['driver-cash-balance', userId, currency],
		});
	}, [queryClient, userId, currency]);

	return {
		...query,
		invalidate,
		invalidateAll,
		refetch,
	};
}
