import { z } from 'zod';
import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import {
	type CmrSessionFormValuesType,
	FormManageCmrSession,
} from '@/app/(dashboard)/dashboard/cmr-session/form-manage-cmr-session.component';
import { ViewCmrSession } from '@/app/(dashboard)/dashboard/cmr-session/view-cmr-session.component';
import type {
	DataSourceConfigType,
	DataTableValueOptionsType,
} from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import {
	getFormDataAsNumber,
	getFormDataAsString,
} from '@/helpers/form.helper';
import { requestFind } from '@/helpers/services.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import {
	type CmrModel,
	type CmrStatus,
	displayCmrLabel,
} from '@/models/cmr.model';
import {
	type CmrSessionModel,
	displayCmrSessionLabel,
} from '@/models/cmr-session.model';
import {
	displayWorkSessionLabel,
	type WorkSessionModel,
	type WorkSessionStatus,
} from '@/models/work-session.model';
import {
	createCmrSession,
	deleteCmrSession,
} from '@/services/cmr-session.service';
import type { FindFunctionParamsType } from '@/types/action.type';
import type { FormStateType } from '@/types/form.type';

const translations = await translateBatch(
	[
		'create.title',
		'update.title',
		'delete.title',
		'view.title',
		'viewWorkSession.title',
		'viewCmr.title',
	] as const,
	'cmr-session.action',
);

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_cmr_id',
		'invalid_work_session_id',
		'invalid_work_session',
	] as const,
	'cmr-session.validation',
);

class CmrSessionValidator extends BaseValidator<typeof validatorMessages> {
	create = (isSubmit: boolean = true) =>
		z
			.object({
				cmr_id: this.validateId(this.getMessage('invalid_cmr_id')),
				work_session_id: this.validateId(
					this.getMessage('invalid_work_session_id'),
					{
						required: false, // Further check is done in superRefine
					},
				),
				work_session: this.validateString(
					this.getMessage('invalid_work_session'),
				),
			})
			.superRefine((data, ctx) => {
				if (isSubmit && data.work_session && !data.work_session_id) {
					ctx.addIssue({
						path: ['work_session'],
						message: this.getMessage('invalid_work_session_id'),
						code: 'custom',
					});
				}
			});
}

function validateForm(
	values: CmrSessionFormValuesType,
	isSubmit: boolean = true,
) {
	const validator = new CmrSessionValidator(validatorMessages);

	return validator.create(isSubmit).safeParse(values);
}

function getFormValues(formData: FormData): CmrSessionFormValuesType {
	return {
		cmr_id: getFormDataAsNumber(formData, 'cmr_id'),
		work_session_id: getFormDataAsNumber(formData, 'work_session_id'),
		work_session: getFormDataAsString(formData, 'work_session'),
	};
}

function getFormState(
	data?: CmrSessionModel,
): FormStateType<CmrSessionFormValuesType> {
	return {
		errors: {},
		message: null,
		situation: null,
		values: {
			cmr_id: data?.cmr?.id ?? null,
			work_session_id: data?.work_session?.id ?? null,
			work_session: data?.work_session
				? displayWorkSessionLabel(data?.work_session)
				: null,
		},
	};
}

export type CmrSessionDataTableFiltersType = {
	user: { value: string | null; matchMode: 'equals' };
	user_id: { value: number | null; matchMode: 'equals' };
	work_session_id: { value: string | null; matchMode: 'equals' };
	cmr_id: { value: string | null; matchMode: 'equals' };
	cmr_status: { value: CmrStatus | null; matchMode: 'equals' };
	work_session_status: {
		value: WorkSessionStatus | null;
		matchMode: 'equals';
	};
};

function displayButtonViewWorkSession(
	entry: CmrSessionModel,
): DataTableValueOptionsType<CmrSessionModel>['displayButton'] {
	if (!entry.work_session) {
		return undefined;
	}

	return {
		action: 'view',
		dataSource: 'work-session',
		altTitle: translations['viewWorkSession.title'],
		alternateEntryId: entry.work_session.id,
	};
}

function displayButtonViewCmr(
	entry: CmrSessionModel,
): DataTableValueOptionsType<CmrSessionModel>['displayButton'] {
	if (!entry.cmr) {
		return undefined;
	}

	return {
		action: 'view',
		dataSource: 'cmr',
		altTitle: translations['viewCmr.title'],
		alternateEntryId: entry.cmr.id,
	};
}

export const dataSourceConfigCmrSession: DataSourceConfigType<CmrSessionModel> =
	{
		dataTable: {
			state: {
				first: 0,
				rows: 10,
				sortField: 'id',
				sortOrder: -1 as const,
				filters: {
					user: { value: '', matchMode: 'equals' },
					user_id: { value: null, matchMode: 'equals' },
					work_session_id: { value: null, matchMode: 'equals' },
					cmr_id: { value: null, matchMode: 'equals' },
					cmr_status: { value: null, matchMode: 'equals' },
					work_session_status: { value: null, matchMode: 'equals' },
				} satisfies CmrSessionDataTableFiltersType,
			},
			columns: [
				{
					field: 'id',
					header: 'ID',
					sortable: true,
					body: (entry, column) =>
						DataTableValue(entry, column, {
							markDeleted: true,
							displayButton: {
								action: 'view',
								dataSource: 'cmr-session',
							},
						}),
				},
				{
					field: 'work_session',
					header: 'Work Session',
					body: (entry, column) =>
						DataTableValue(entry, column, {
							customValue: displayWorkSessionLabel(
								entry.work_session,
							),
							displayButton: displayButtonViewWorkSession(entry),
						}),
				},
				{
					field: 'work_session_status',
					header: 'Work Session Status',
					body: (entry) =>
						DataTableValue<WorkSessionModel>(
							entry.work_session,
							'status',
							{
								isStatus: true,
								dataSourceKey: 'work-session',
							},
						),
					style: {
						minWidth: '8rem',
						maxWidth: '8rem',
					},
				},
				{
					field: 'cmr',
					header: 'CMR',
					body: (entry, column) =>
						DataTableValue(entry, column, {
							customValue: displayCmrLabel(entry.cmr),
							displayButton: displayButtonViewCmr(entry),
						}),
				},
				{
					field: 'cmr_status',
					header: 'CMR Status',
					body: (entry) =>
						DataTableValue<CmrModel>(entry.cmr, 'status', {
							isStatus: true,
							dataSourceKey: 'cmr',
						}),
					style: {
						minWidth: '8rem',
						maxWidth: '8rem',
					},
				},
			],
			find: (params: FindFunctionParamsType) =>
				requestFind<CmrSessionModel>('cmr-session', params),
		},
		displayEntryLabel: (entry: CmrSessionModel) => {
			return displayCmrSessionLabel(entry);
		},
		actions: {
			create: {
				windowType: 'form',
				windowTitle: translations['create.title'],
				windowComponent: FormManageCmrSession,
				permission: 'cmr-session.create',
				entriesSelection: 'free',
				operationFunction: (params: CmrSessionFormValuesType) => {
					const { cmr_id, work_session, ...prepareParams } = params;

					return createCmrSession(prepareParams, cmr_id);
				},
				buttonPosition: 'hidden',
				button: {
					variant: 'info',
				},
				getFormValues: getFormValues,
				validateForm: validateForm,
				getFormState: getFormState,
			},
			delete: {
				windowType: 'action',
				windowTitle: translations['delete.title'],
				permission: 'cmr-session.delete',
				entriesSelection: 'single',
				operationFunction: (entry: CmrSessionModel) =>
					deleteCmrSession(entry),
				buttonPosition: 'left',
				button: {
					variant: 'outline',
					hover: 'error',
				},
			},
			view: {
				windowType: 'view',
				windowTitle: translations['view.title'],
				windowComponent: ViewCmrSession,
				windowConfigProps: {
					size: 'xl',
				},
				permission: 'cmr-session.read',
				entriesSelection: 'single',
				buttonPosition: 'hidden',
			},
		},
	};
