import { useMemo } from 'react';
import { DisplayStatus } from '@/app/(dashboard)/_components/data-table-value';
import type { UserModel } from '@/entities/user.model';
import { UserRoleEnum } from '@/entities/user.model';
import { formatDate } from '@/helpers/date.helper';
import {
	capitalizeFirstLetter,
	formatEnumLabel,
} from '@/helpers/string.helper';
import { useTranslation } from '@/hooks';

export function UserDetails({ entry }: { entry: UserModel | undefined }) {
	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.text.no_entry_selected',
				'users.view.section_details',
				'users.view.label_id',
				'users.view.label_name',
				'users.view.label_email',
				'users.view.label_language',
				'users.view.section_info',
				'users.view.label_role',
				'users.view.label_status',
				'users.view.label_deleted_at',
				'users.view.section_timestamps',
				'users.view.label_created_at',
				'users.view.label_updated_at',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	if (!entry) {
		return (
			<div className="min-h-48 flex items-center justify-center">
				{translations['dashboard.text.no_entry_selected']}
			</div>
		);
	}

	const {
		id,
		name,
		email,
		role,
		status,
		language,
		operator_type,
		created_at,
		updated_at,
		deleted_at,
	} = entry;

	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					{translations['users.view.section_details']}
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">
							{translations['users.view.label_id']}
						</span>{' '}
						{id}
					</div>
					<div>
						<span className="font-semibold">
							{translations['users.view.label_name']}
						</span>{' '}
						{name}
					</div>
					<div>
						<span className="font-semibold">
							{translations['users.view.label_email']}
						</span>{' '}
						{email}
					</div>
					<div>
						<span className="font-semibold">
							{translations['users.view.label_language']}
						</span>{' '}
						{language}
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Account Info
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">
							{translations['users.view.label_role']}
						</span>{' '}
						{capitalizeFirstLetter(role)}
						{role === UserRoleEnum.OPERATOR && operator_type && (
							<span>/ {formatEnumLabel(operator_type)}</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						<span className="font-semibold">
							{translations['users.view.label_status']}
						</span>{' '}
						<div className="max-w-[240px]">
							<DisplayStatus status={status} />
						</div>
					</div>
					{deleted_at && (
						<div>
							<span className="font-semibold">
								{translations['users.view.label_deleted_at']}
							</span>{' '}
							<span className="text-red-500">
								{formatDate(deleted_at, 'date-time')}
							</span>
						</div>
					)}
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					{translations['users.view.section_timestamps']}
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">
							{translations['users.view.label_created_at']}
						</span>{' '}
						{formatDate(created_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">
							{translations['users.view.label_updated_at']}
						</span>{' '}
						{formatDate(updated_at, 'date-time') || '-'}
					</div>
				</div>
			</div>
		</div>
	);
}
