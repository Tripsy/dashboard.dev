'use client';

import { Checkbox } from 'primereact/checkbox';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { Loading } from '@/components/loading.component';
import type { PermissionModel } from '@/entities/permission.model';
import { useTranslation } from '@/hooks';
import { useToast } from '@/providers/toast.provider';
import { findPermissions } from '@/services/permissions.service';
import {
	createUserPermissions,
	deleteUserPermission,
	getUserPermissions,
} from '@/services/users.service';

export function SetupPermissionsUser() {
	const translationsKeys = useMemo(
		() =>
			[
				'app.text.loading',
				'app.text.error_title',
				'app.text.success_title',
				'users.validation.no_permissions_defined',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	const { showToast } = useToast();

	const { dataTableStore } = useDataTable<'users'>();
	const actionEntry = useStore(dataTableStore, (state) => state.actionEntry);

	const user_id = actionEntry?.id;

	const [permissions, setPermissions] = useState<PermissionModel[]>([]);
	const [userPermissions, setUserPermissions] = useState<number[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!user_id) {
			return;
		}

		const abortController = new AbortController();

		(async () => {
			try {
				setLoading(true);

				const [permissionsResp, userPermissionsResp] =
					await Promise.all([
						findPermissions({
							order_by: 'id',
							direction: 'ASC',
							limit: 999,
						}),
						getUserPermissions(user_id, {
							order_by: 'permission_id',
							direction: 'ASC',
							limit: 999,
						}),
					]);

				if (abortController.signal.aborted) {
					return;
				}

				setPermissions(permissionsResp?.entries ?? []);

				// Normalize permission IDs as numbers and remove duplicates
				const normalizedUserPerms = [
					...new Set(
						userPermissionsResp?.entries.map((p) =>
							Number(p.permission_id),
						) ?? [],
					),
				];

				setUserPermissions(normalizedUserPerms);
			} catch (error) {
				if (!abortController.signal.aborted) {
					console.error(error);

					showToast({
						severity: 'error',
						summary: translations['app.text.error_title'],
						detail: (error as Error).message,
					});
				}
			} finally {
				if (!abortController.signal.aborted) {
					setLoading(false);
				}
			}
		})();

		return () => {
			abortController.abort();
		};
	}, [user_id, showToast, translations]);

	// Group by entity
	const listPermissions = useMemo(() => {
		return permissions.reduce<Record<string, PermissionModel[]>>(
			(acc, p) => {
				if (!acc[p.entity]) acc[p.entity] = [];
				acc[p.entity].push(p);
				return acc;
			},
			{},
		);
	}, [permissions]);

	const sortedPermissions = Object.entries(listPermissions).sort(([a], [b]) =>
		a.localeCompare(b),
	);

	// Toggle all permissions under an entity
	const handleToggleEntity = useCallback(
		async (entity: string, checked: boolean) => {
			if (!user_id) {
				return;
			}

			const entityPerms = listPermissions[entity];
			const entityPermIds = entityPerms.map((p) => Number(p.id));

			// Optimistic UI update
			setUserPermissions((prev) =>
				checked
					? [...new Set([...prev, ...entityPermIds])]
					: prev.filter((id) => !entityPermIds.includes(id)),
			);

			try {
				if (checked) {
					await createUserPermissions(user_id, entityPermIds);

					showToast({
						severity: 'success',
						summary: translations['app.text.success_title'],
						detail: `All '${entity}' permissions granted`,
					});
				} else {
					await Promise.all(
						entityPermIds.map((id) =>
							deleteUserPermission(user_id, id),
						),
					);

					showToast({
						severity: 'info',
						summary: translations['app.text.success_title'],
						detail: `All '${entity}' permissions revoked`,
					});
				}
			} catch (err) {
				// Rollback
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
		[user_id, listPermissions, showToast, translations],
	);

	// Toggle a single permission
	const handleTogglePermission = useCallback(
		async (permission_id: number, checked: boolean, label: string) => {
			if (!user_id) return;

			const numericId = Number(permission_id);

			setUserPermissions((prev) =>
				checked
					? [...new Set([...prev, numericId])]
					: prev.filter((id) => id !== numericId),
			);

			try {
				if (checked) {
					await createUserPermissions(user_id, [numericId]);

					showToast({
						severity: 'success',
						summary: translations['app.text.success_title'],
						detail: `'${label}' granted`,
					});
				} else {
					await deleteUserPermission(user_id, numericId);

					showToast({
						severity: 'info',
						summary: translations['app.text.success_title'],
						detail: `'${label}' revoked`,
					});
				}
			} catch (err) {
				// Rollback on failure
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
		[user_id, showToast, translations],
	);

	if (loading) {
		return (
			<Loading
				text={translations['app.text.loading']}
				className="min-h-64 flex items-center justify-center"
			/>
		);
	}

	if (!permissions.length) {
		return (
			<div className="min-h-48 flex items-center justify-center">
				{translations['users.validation.no_permissions_defined']}
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
									<label
										key={perm.id}
										className="flex items-center gap-2 cursor-pointer p-2 hover:rounded-md hover:bg-base-300/30"
										htmlFor={`permission-${perm.id}`}
									>
										<Checkbox
											inputId={`permission-${perm.id}`}
											checked={checked}
											onChange={(e) =>
												handleTogglePermission(
													Number(perm.id),
													e.checked ?? false,
													`${entity}.${perm.operation}`,
												)
											}
										/>
										<span className="capitalize">
											{perm.operation}
										</span>
									</label>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
