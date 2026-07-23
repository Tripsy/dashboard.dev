import { useCallback } from 'react';
import { useDriverCashBalance } from '@/app/(public)/_hooks/use-driver-cash-balance.hook';
import { useWorkSession } from '@/app/(public)/_providers/work-session.provider';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import { DisplayAmount, DisplayStatus } from '@/helpers/display.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import {
	CashFlowDirectionEnum,
	CashFlowMethodEnum,
	type CashFlowModel,
	CashFlowStatusEnum,
} from '@/models/cash-flow.model';
import { displayClientLabel } from '@/models/client.model';
import { displayVendorLabel } from '@/models/vendor.model';
import { useModalStore } from '@/stores/window.store';
import { CurrencyEnum } from '@/types/common.type';
import { DataSourceSectionEnum } from '@/types/data-source.type';

export function DriverPanelSessionCashFlow({
	entries,
}: {
	entries: CashFlowModel[];
}) {
	const { invalidate: ronInvalidate } = useDriverCashBalance(
		CurrencyEnum.RON,
	);
	const { invalidate: eurInvalidate } = useDriverCashBalance(
		CurrencyEnum.EUR,
	);
	const { invalidate: usdInvalidate } = useDriverCashBalance(
		CurrencyEnum.USD,
	);

	const invalidateBalance = useCallback(
		async (currency: string) => {
			switch (currency) {
				case CurrencyEnum.RON:
					await ronInvalidate();
					break;
				case CurrencyEnum.EUR:
					await eurInvalidate();
					break;
				case CurrencyEnum.USD:
					await usdInvalidate();
					break;
			}
		},
		[ronInvalidate, eurInvalidate, usdInvalidate],
	);

	return (
		<>
			{/*<div className="mb-4">*/}
			{/*	<div className="flex items-center gap-4 bg-lime-100/40 shadow-lg rounded-lg p-4">*/}
			{/*		<div className="font-semibold">Balance:</div>*/}
			{/*		<div className="flex gap-6 font-semibold">*/}
			{/*			{balances*/}
			{/*				.filter(({ balance }) => balance && balance !== 0)*/}
			{/*				.map(({ currency, balance }) => (*/}
			{/*					<div key={currency}>*/}
			{/*						<DisplayAmount*/}
			{/*							amount={balance}*/}
			{/*							currencyCode={currency}*/}
			{/*							classNamePositive="text-success dark:text-success"*/}
			{/*						/>*/}
			{/*					</div>*/}
			{/*				))}*/}
			{/*		</div>*/}
			{/*	</div>*/}
			{/*</div>*/}
			<div className="space-y-4">
				{entries.map((m) => (
					<div
						key={m.id}
						className="bg-surface border border-border rounded-lg p-4"
					>
						<DriverPanelSessionCashFlowEntry
							entry={m}
							onBalanceInvalidate={invalidateBalance}
						/>
					</div>
				))}
			</div>
		</>
	);
}

function DriverPanelSessionCashFlowEntry({
	entry,
	onBalanceInvalidate,
}: {
	entry: CashFlowModel;
	onBalanceInvalidate: (currency: string) => Promise<void>;
}) {
	const { open } = useModalStore();
	const { refetchSessionCashFlowEntries } = useWorkSession();

	const handleUpdateCashFlow = useCallback(
		(entry: CashFlowModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cash-flow',
				action: 'update',
				data: {
					entries: [entry],
				},
				events: {
					success: async () => {
						await refetchSessionCashFlowEntries();
					},
				},
			});
		},
		[open, refetchSessionCashFlowEntries],
	);

	const handleCompleteCashFlow = useCallback(
		(entry: CashFlowModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cash-flow',
				action: 'complete',
				data: {
					entries: [entry],
				},
				events: {
					success: async () => {
						await refetchSessionCashFlowEntries();

						if (entry.method === CashFlowMethodEnum.CASH) {
							await onBalanceInvalidate(entry.currency);
						}
					},
				},
			});
		},
		[open, refetchSessionCashFlowEntries, onBalanceInvalidate],
	);

	const handleCancelCashFlow = useCallback(
		(entry: CashFlowModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cash-flow',
				action: 'cancel',
				data: {
					entries: [entry],
				},
				events: {
					success: async () => {
						await refetchSessionCashFlowEntries();
					},
				},
			});
		},
		[open, refetchSessionCashFlowEntries],
	);

	return (
		<div className="flex justify-between">
			<div className="flex flex-col justify-between items-start self-stretch gap-2">
				<h3 className="font-semibold text-surface-foreground flex items-center gap-4">
					<div className="flex items-center gap-1">
						{entry.direction === CashFlowDirectionEnum.IN ? (
							<Icons.Direction.ArrowRight className="h-4 w-4 text-success" />
						) : (
							<Icons.Direction.ArrowLeft className="h-4 w-4 text-danger dark:text-warning" />
						)}
						{formatEnumLabel(entry.method)} #{entry.id}
					</div>
					<div>
						<DisplayStatus
							status={entry.status}
							dataSource="cash-flow"
						/>
					</div>
				</h3>
				{entry.operational_records?.client && (
					<div>
						<span className="text-muted">Client:</span>
						<span className="ml-2 font-mono">
							{displayClientLabel(
								entry.operational_records.client,
							)}
						</span>
					</div>
				)}
				<div>
					<span className="text-muted">Amount:</span>
					<span className="ml-2 font-mono">
						<DisplayAmount
							amount={entry.grossAmount}
							currencyCode={entry.currency}
							classNamePositive="text-success"
						/>
					</span>
				</div>
				{entry.external_reference && (
					<div>
						<span className="text-muted">Reference:</span>
						<span className="ml-2 font-mono">
							{entry.external_reference}
						</span>
					</div>
				)}
				{entry.operational_records?.vendor && (
					<div>
						<span className="text-muted">Vendor:</span>
						<span className="ml-2 font-mono">
							{displayVendorLabel(
								entry.operational_records.vendor,
							)}
						</span>
					</div>
				)}
				{entry.notes && (
					<div>
						<span className="text-muted">Notes:</span>
						<span className="ml-2 font-mono">{entry.notes}</span>
					</div>
				)}
			</div>

			<div className="flex flex-col justify-start gap-4">
				{entry.status === CashFlowStatusEnum.PENDING && (
					<Button
						variant="secondary"
						hover="default"
						onClick={() => handleUpdateCashFlow(entry)}
						className="cursor-pointer"
						title="Update payment"
					>
						<Icons.Action.Update className="h-4 w-4" />
					</Button>
				)}
				{entry.status === CashFlowStatusEnum.PENDING &&
					entry.method === CashFlowMethodEnum.CASH && (
						<>
							<Button
								variant="secondary"
								hover="default"
								onClick={() => handleCompleteCashFlow(entry)}
								className="cursor-pointer"
								title="Mark as complete"
							>
								<Icons.Action.Complete className="h-4 w-4" />
							</Button>
							<Button
								variant="secondary"
								hover="error"
								onClick={() => handleCancelCashFlow(entry)}
								className="cursor-pointer"
								title="Mark as canceled"
							>
								<Icons.Action.Cancel className="h-4 w-4" />
							</Button>
						</>
					)}
			</div>
		</div>
	);
}
