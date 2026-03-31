'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useModalStore } from '@/app/(dashboard)/_stores/modal.store';
import { LoadingComponent } from '@/components/status.component';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { PermissionModel } from '@/models/permission.model';
import type { UserModel } from '@/models/user.model';
import { useToast } from '@/providers/toast.provider';
import { findPermissions } from '@/services/permissions.service';
import {
	createUserPermissions,
	deleteUserPermission,
	getUserPermissions,
} from '@/services/users.service';

export function SetupPermissionsUser() {
	const { current } = useModalStore();

	const actionEntries = current?.actionEntries;
	const user = (actionEntries?.[0] as UserModel) ?? null;

	const translationsKeys = useMemo(
		() =>
			[
				'app.text.loading',
				'app.text.error_title',
				'app.text.success_title',
				'users.error.no_permissions_defined',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);
	const { showToast } = useToast();

	const {
		data: permissionsData,
		isLoading: isLoadingPermissions,
		error: permissionsError,
	} = useQuery({
		queryKey: [
			'permissions',
			{ order_by: 'id', direction: 'ASC', limit: 999 },
		],
		queryFn: () =>
			findPermissions({ order_by: 'id', direction: 'ASC', limit: 999 }),
	});

	const {
		data: userPermissionsData,
		isLoading: isLoadingUserPermissions,
		error: userPermissionsError,
	} = useQuery({
		queryKey: ['user-permissions', user.id],
		queryFn: () =>
			getUserPermissions(user.id, {
				order_by: 'permission_id',
				direction: 'ASC',
				limit: 999,
			}),
		enabled: !!user.id,
	});

	const isLoading = isLoadingPermissions || isLoadingUserPermissions;
	const permissions = permissionsData?.entries ?? [];

	const [userPermissions, setUserPermissions] = useState<number[]>([]);

	useEffect(() => {
		if (userPermissionsData?.entries) {
			setUserPermissions([
				...new Set(
					userPermissionsData.entries.map((p) =>
						Number(p.permission_id),
					),
				),
			]);
		}
	}, [userPermissionsData]);

	useEffect(() => {
		const error = permissionsError ?? userPermissionsError;

		if (error) {
			showToast({
				severity: 'error',
				summary: translations['app.text.error_title'],
				detail: (error as Error).message,
			});
		}
	}, [permissionsError, userPermissionsError, showToast, translations]);

	const listPermissions = useMemo(
		() =>
			permissions.reduce<Record<string, PermissionModel[]>>((acc, p) => {
				if (!acc[p.entity]) acc[p.entity] = [];
				acc[p.entity].push(p);
				return acc;
			}, {}),
		[permissions],
	);

	const sortedPermissions = useMemo(
		() =>
			Object.entries(listPermissions).sort(([a], [b]) =>
				a.localeCompare(b),
			),
		[listPermissions],
	);

	const handleToggleEntity = useCallback(
		async (entity: string, checked: boolean) => {
			if (!user.id) {
				return;
			}

			const entityPerms = listPermissions[entity];
			const entityPermIds = entityPerms.map((p) => Number(p.id));

			setUserPermissions((prev) =>
				checked
					? [...new Set([...prev, ...entityPermIds])]
					: prev.filter((id) => !entityPermIds.includes(id)),
			);

			try {
				if (checked) {
					await createUserPermissions(user.id, entityPermIds);

					showToast({
						severity: 'success',
						summary: translations['app.text.success_title'],
						detail: `All '${entity}' permissions granted`,
					});
				} else {
					await Promise.all(
						entityPermIds.map((id) =>
							deleteUserPermission(user.id, id),
						),
					);
					showToast({
						severity: 'info',
						summary: translations['app.text.success_title'],
						detail: `All '${entity}' permissions revoked`,
					});
				}
			} catch (err) {
				setUserPermissions((prev) =>
					checked
						? prev.filter((id) => !entityPermIds.includes(id))
						: [...new Set([...prev, ...entityPermIds])],
				);
				showToast({
					severity: 'error',
					summary: translations['app.text.error_title'],
					detail: (err as Error).message,
				});
			}
		},
		[user.id, listPermissions, showToast, translations],
	);

	const handleTogglePermission = useCallback(
		async (permission_id: number, checked: boolean, label: string) => {
			if (!user.id) {
				return;
			}

			const numericId = Number(permission_id);

			setUserPermissions((prev) =>
				checked
					? [...new Set([...prev, numericId])]
					: prev.filter((id) => id !== numericId),
			);

			try {
				if (checked) {
					await createUserPermissions(user.id, [numericId]);

					showToast({
						severity: 'success',
						summary: translations['app.text.success_title'],
						detail: `'${label}' granted`,
					});
				} else {
					await deleteUserPermission(user.id, numericId);

					showToast({
						severity: 'info',
						summary: translations['app.text.success_title'],
						detail: `'${label}' revoked`,
					});
				}
			} catch (err) {
				setUserPermissions((prev) =>
					checked
						? prev.filter((id) => id !== numericId)
						: [...new Set([...prev, numericId])],
				);
				showToast({
					severity: 'error',
					summary: translations['app.text.error_title'],
					detail: (err as Error).message,
				});
			}
		},
		[user.id, showToast, translations],
	);

	if (isLoading) {
		return (
			<LoadingComponent description={translations['app.text.loading']} />
		);
	}

	if (!permissions.length) {
		return (
			<div className="min-h-48 flex items-center justify-center">
				{translations['users.error.no_permissions_defined']}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{sortedPermissions.map(([entity, perms]) => {
				const allChecked = perms.every((perm) =>
					userPermissions.includes(Number(perm.id)),
				);

				return (
					<div
						key={entity}
						className="bg-base-200 p-4 border-b border-line last:border-b-0"
					>
						<div className="flex items-center gap-2 font-semibold text-lg mb-1">
							<button
								type="button"
								className="capitalize"
								onClick={() =>
									handleToggleEntity(entity, !allChecked)
								}
							>
								{entity}
							</button>
							<div className="text-sm">
								(
								{
									perms.filter((perm) =>
										userPermissions.includes(
											Number(perm.id),
										),
									).length
								}
								/{perms.length})
							</div>
						</div>

						<div className="flex flex-wrap gap-2">
							{perms.map((perm) => {
								const checked = userPermissions.includes(
									Number(perm.id),
								);

								return (
									<Label
										key={perm.id}
										htmlFor={`permission-${perm.id}`}
										className="flex items-center gap-2 cursor-pointer p-2 hover:rounded-md hover:bg-base-300"
									>
										<Checkbox
											id={`permission-${perm.id}`}
											checked={checked}
											onCheckedChange={(checked) =>
												handleTogglePermission(
													Number(perm.id),
													checked === true,
													`${entity}.${perm.operation}`,
												)
											}
										/>
										<span className="capitalize">
											{perm.operation}
										</span>
									</Label>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
