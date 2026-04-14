'use client';

import { formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { type UserModel, UserRoleEnum } from '@/models/user.model';

export function ViewUser({ entry }: { entry: UserModel }) {
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div>
					<span className="font-semibold">Name</span> {entry.name}
				</div>
				<div>
					<span className="font-semibold">Email</span> {entry.email}
				</div>
				<div>
					<span className="font-semibold">Language</span>{' '}
					{entry.language}
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Account Info
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Role</span>{' '}
						{formatEnumLabel(entry.role)}
						{entry.role === UserRoleEnum.OPERATOR &&
							entry.operator_type && (
								<span>
									/ {formatEnumLabel(entry.operator_type)}
								</span>
							)}
					</div>
					<div className="flex items-center gap-2">
						<span className="font-semibold">Status</span>{' '}
						<div className="max-w-60">
							<DisplayStatus status={entry.status} />
						</div>
					</div>
					{entry.deleted_at && (
						<div>
							<span className="font-semibold">Deleted At</span>{' '}
							<span className="text-red-500">
								{formatDate(entry.deleted_at, 'date-time')}
							</span>
						</div>
					)}
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Timestamps
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Created At</span>{' '}
						{formatDate(entry.created_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">Updated At</span>{' '}
						{formatDate(entry.updated_at, 'date-time') || '-'}
					</div>
				</div>
			</div>
		</div>
	);
}
