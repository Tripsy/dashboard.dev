'use client';

import { useQuery } from '@tanstack/react-query';
import { Configuration } from '@/config/settings.config';
import { formatDate } from '@/helpers/date.helper';
import { DisplayAmount, DisplayStatus } from '@/helpers/display.helper';
import { requestFind } from '@/helpers/services.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import {
	CashFlowCategoryEnum,
	type CashFlowModel,
	CashFlowStatusEnum,
} from '@/models/cash-flow.model';
import { displayClientLabel } from '@/models/client.model';
import { displayCmrLabel } from '@/models/cmr.model';
import { displayCompanyVehicleLabel } from '@/models/company-vehicle.model';
import type { OperationalRecordModel } from '@/models/operational-record.model';
import { displayUserLabel } from '@/models/user.model';
import { displayVendorLabel } from '@/models/vendor.model';
import { requestOperationalRecords } from '@/services/cash-flow.service';

function ViewCashFlowRefunds({ refunds }: { refunds: CashFlowModel[] }) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr>
						<th className="text-left py-2 px-2 font-medium">
							Refund ID
						</th>
						<th className="text-left py-2 px-2 font-medium">
							Net Amount
						</th>
						<th className="text-left py-2 px-2 font-medium">
							Reference
						</th>
						<th className="text-left py-2 px-2 font-medium">
							Date
						</th>
					</tr>
				</thead>
				<tbody>
					{refunds.map((r) => (
						<tr
							key={`refund-${r.id}`}
							className="border-t border-line hover:bg-surface-secondary/30"
						>
							<td className="py-2 px-3">#{r.id}</td>
							<td className="py-2 px-3">
								<DisplayAmount
									amount={r.netAmount}
									currencyCode={r.currency}
								/>
							</td>
							<td className="py-2 px-3">
								{r.external_reference || '-'}
							</td>
							<td className="py-2 px-3">
								{formatDate(r.created_at, 'date-time')}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function ViewCashFlowOperationalRecords({
	operationalRecords,
}: {
	operationalRecords: OperationalRecordModel[];
}) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr>
						<th className="text-left py-2 px-2 font-medium">ID</th>
						<th className="text-left py-2 px-2 font-medium">
							Type
						</th>
						<th className="text-left py-2 px-2 font-medium">
							Reference
						</th>
						<th className="text-left py-2 px-2 font-medium">
							Date
						</th>
					</tr>
				</thead>
				<tbody>
					{operationalRecords.map((m) => (
						<tr
							key={`operational-record-${m.id}`}
							className="border-t border-line hover:bg-surface-secondary/30"
						>
							<td className="py-2 px-3">#{m.id}</td>
							<td className="py-2 px-3">
								{formatEnumLabel(m.operational_record_type)}
							</td>
							<td className="py-2 px-3">
								{(() => {
									switch (m.operational_record_type) {
										case 'client':
											return m.client
												? displayClientLabel(m.client)
												: '-';
										case 'vendor':
											return m.vendor
												? displayVendorLabel(m.vendor)
												: '-';
										case 'employee':
											return m.employee
												? displayUserLabel(m.employee)
												: '-';
										case 'company_vehicle':
											return m.company_vehicle
												? displayCompanyVehicleLabel(
														m.company_vehicle,
													)
												: '-';
										case 'cmr':
											return m.cmr
												? displayCmrLabel(m.cmr)
												: '-';
									}
								})()}
							</td>
							<td className="py-2 px-3">
								{formatDate(m.created_at, 'date-time')}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function ViewCashFlow({ entry }: { entry: CashFlowModel }) {
	const { data: refunds, isLoading: isRefundsLoading } = useQuery({
		queryKey: ['cash-flow', 'refunds', entry.id],
		queryFn: () => {
			if (
				entry.status !== CashFlowStatusEnum.COMPLETED ||
				entry.category === CashFlowCategoryEnum.REFUND
			) {
				return Promise.resolve(undefined);
			}

			return requestFind<CashFlowModel>('cash-flow', {
				filter: {
					parent_id: entry.id,
				},
			});
		},
		enabled:
			entry.status === CashFlowStatusEnum.COMPLETED &&
			entry.category !== CashFlowCategoryEnum.REFUND,
	});

	const { data: operationalRecords, isLoading: isOperationalRecordsLoading } =
		useQuery({
			queryKey: ['cash-flow', 'operational-records', entry.id],
			queryFn: () => {
				return requestOperationalRecords(entry.id);
			},
		});

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div className="flex items-center gap-2">
					<span className="font-semibold">Status</span>{' '}
					<div className="max-w-60">
						<DisplayStatus
							status={entry.status}
							dataSource="cash-flow"
						/>
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
						{formatDate(entry.updated_at, 'date-time') || '-'}
					</div>
					{entry.deleted_at && (
						<div>
							<span className="font-semibold">Deleted At</span>{' '}
							<span className="text-danger">
								{formatDate(entry.deleted_at, 'date-time')}
							</span>
						</div>
					)}
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Info
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Direction</span>{' '}
						{formatEnumLabel(entry.direction)}
					</div>
					<div>
						<span className="font-semibold">Type</span>{' '}
						{formatEnumLabel(entry.category_type)}
					</div>
					<div>
						<span className="font-semibold">Category</span>{' '}
						{formatEnumLabel(entry.category)}
					</div>
					<div>
						<span className="font-semibold">Net Amount</span>{' '}
						<DisplayAmount
							amount={entry.netAmount}
							currencyCode={entry.currency}
						/>
					</div>
					<div>
						<span className="font-semibold">Gross Amount</span>{' '}
						<DisplayAmount
							amount={entry.grossAmount}
							currencyCode={entry.currency}
						/>
					</div>
					{entry.currency !== Configuration.currency() && (
						<div>
							<span className="font-semibold">Exchange Rate</span>{' '}
							{entry.exchange_rate}
						</div>
					)}
					{entry.external_reference && (
						<div>
							<span className="font-semibold">Reference</span>{' '}
							{entry.external_reference}
						</div>
					)}
					{entry.notes && (
						<div>
							<span className="font-semibold">Notes</span>{' '}
							{entry.notes}
						</div>
					)}
				</div>
			</div>

			{!isRefundsLoading && refunds && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						Operational Records
					</h3>
					<ViewCashFlowRefunds refunds={refunds.entries} />
				</div>
			)}

			{!isOperationalRecordsLoading && operationalRecords && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						Operational Records
					</h3>
					<ViewCashFlowOperationalRecords
						operationalRecords={operationalRecords}
					/>
				</div>
			)}
		</div>
	);
}
