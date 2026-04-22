'use client';

import { formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { type ClientModel, ClientTypeEnum } from '@/models/client.model';

export function ViewClient({ entry }: { entry: ClientModel }) {
	return (
		<div className="space-y-6">
			<div className="space-y-1 text-sm">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div>
					<span className="font-semibold">Type</span>{' '}
					{formatEnumLabel(entry.client_type)}
				</div>
				<div className="flex items-center gap-2">
					<span className="font-semibold">Status</span>{' '}
					<div className="max-w-60">
						<DisplayStatus status={entry.status} />
					</div>
				</div>
				{entry.client_type === ClientTypeEnum.COMPANY && (
					<>
						<div>
							<span className="font-semibold">Name</span>{' '}
							{entry.company_name}
						</div>
						<div>
							<span className="font-semibold">CUI</span>{' '}
							{entry.company_cui}
						</div>
						<div>
							<span className="font-semibold">Reg. Com</span>{' '}
							{entry.company_reg_com}
						</div>
					</>
				)}
				{entry.client_type === ClientTypeEnum.PERSON && (
					<>
						<div>
							<span className="font-semibold">Name</span>{' '}
							{entry.person_name}
						</div>
						{entry.person_identification_number && (
							<div>
								<span className="font-semibold">
									Personal ID
								</span>{' '}
								{entry.person_identification_number}
							</div>
						)}
					</>
				)}
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Contact Details
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Name</span>{' '}
						{entry.contact_name}
					</div>
					<div>
						<span className="font-semibold">Email</span>{' '}
						{entry.contact_email}
					</div>
					<div>
						<span className="font-semibold">Phone</span>{' '}
						{entry.contact_phone}
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Financial Details
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">IBAN</span> {entry.iban}
					</div>
					<div>
						<span className="font-semibold">Bank Name</span>{' '}
						{entry.bank_name}
					</div>
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
						{formatDate(entry.updated_at, 'date-time')}
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
		</div>
	);
}
