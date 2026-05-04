import { z } from 'zod';
import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import { FormManageWorkSession } from '@/app/(dashboard)/dashboard/work-session/form-manage-work-session.component';
import { SetupWorkSessionVehicles } from '@/app/(dashboard)/dashboard/work-session/setup-work-session-vehicles.component';
import { ViewWorkSession } from '@/app/(dashboard)/dashboard/work-session/view-work-session.component';
import type {
	DataSourceConfigType,
	DataTableColumnType,
	DataTableValueOptionsType,
} from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import {
	combineDateAndTime,
	formatDate,
	stringToDate,
} from '@/helpers/date.helper';
import {
	getFormDataAsNumber,
	getFormDataAsString,
} from '@/helpers/form.helper';
import { arrayHasValue } from '@/helpers/objects.helper';
import {
	requestCreate,
	requestDelete,
	requestFind,
	requestRestore,
	requestUpdate,
	requestUpdateStatus,
} from '@/helpers/services.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import {
	displayWorkSessionDuration,
	getWorkSessionDisplayName,
	START_AT_MAX_PAST_SECONDS,
	type WorkSessionFormValuesType,
	type WorkSessionModel,
	type WorkSessionStatus,
	WorkSessionStatusEnum,
} from '@/models/work-session.model';
import type { FindFunctionParamsType } from '@/types/action.type';
import type { FormStateType, ValidatorOutput } from '@/types/form.type';

const translations = await translateBatch(
	[
		'create.title',
		'update.title',
		'view.title',
		'delete.title',
		'restore.title',
		'close.title',
		'viewUser.title',
		'setupVehicles.title',
	] as const,
	'work-session.action',
);

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_user_id',
		'invalid_user',
		'invalid_start_at',
		'invalid_start_at_time',
		'invalid_end_at_time',
	] as const,
	'work-session.validation',
);

class WorkSessionValidator extends BaseValidator<typeof validatorMessages> {
	create = (isSubmit: boolean = true) =>
		z
			.object({
				user_id: this.validateId(this.getMessage('invalid_user_id'), {
					required: false, // Further check is done in superRefine
				}),
				user: this.validateString(this.getMessage('invalid_user')),
				start_at: this.validateDate(
					this.getMessage('invalid_start_at'),
					{
						required: true,
						maxFutureSeconds: START_AT_MAX_PAST_SECONDS,
					},
				),
				start_at_time: this.validateTime(
					this.getMessage('invalid_start_at_time'),
					{
						required: true,
					},
				),
				end_at_time: this.validateTime(
					this.getMessage('invalid_end_at_time'),
					{
						required: false,
					},
				),
			})
			.superRefine((data, ctx) => {
				if (isSubmit && data.user && !data.user_id) {
					ctx.addIssue({
						path: ['user'],
						message: this.getMessage('invalid_user_id'),
						code: 'custom',
					});
				}
			});

	update = (isSubmit: boolean = true) =>
		z
			.object({
				user_id: this.validateId(this.getMessage('invalid_user_id'), {
					required: false,
				}),
				user: this.validateString(this.getMessage('invalid_user')),
				start_at: this.validateDate(
					this.getMessage('invalid_start_at'),
					{
						required: true,
					},
				),
				start_at_time: this.validateTime(
					this.getMessage('invalid_start_at_time'),
					{
						required: true,
					},
				),
				end_at_time: this.validateTime(
					this.getMessage('invalid_end_at_time'),
					{
						required: false,
					},
				),
			})
			.superRefine((data, ctx) => {
				if (isSubmit && data.user && !data.user_id) {
					ctx.addIssue({
						path: ['user'],
						message: this.getMessage('invalid_user_id'),
						code: 'custom',
					});
				}
			});
}

function validateFormCreate(
	values: WorkSessionFormValuesType,
	isSubmit: boolean = true,
) {
	const validator = new WorkSessionValidator(validatorMessages);

	return validator.create(isSubmit).safeParse(values);
}

function validateFormUpdate(
	values: WorkSessionFormValuesType,
	isSubmit: boolean = true,
) {
	const validator = new WorkSessionValidator(validatorMessages);

	return validator.update(isSubmit).safeParse(values);
}

function getFormValues(formData: FormData): WorkSessionFormValuesType {
	return {
		user_id: getFormDataAsNumber(formData, 'user_id'),
		user: getFormDataAsString(formData, 'user'),
		start_at: getFormDataAsString(formData, 'start_at'),
		start_at_time: getFormDataAsString(formData, 'start_at_time'),
		end_at_time: getFormDataAsString(formData, 'end_at_time'),
	};
}

function getFormState(
	data?: WorkSessionModel,
): FormStateType<WorkSessionFormValuesType> {
	return {
		errors: {},
		message: null,
		situation: null,
		values: {
			user_id: data?.user?.id ?? null,
			user: data?.user ? data?.user?.name : null,
			start_at: formatDate(data?.start_at, 'default') ?? null,
			start_at_time: formatDate(data?.start_at, 'time') ?? null,
			end_at_time: formatDate(data?.end_at, 'time') ?? null,
		},
	};
}

function determineStartAt(start_at: Date, start_at_time: string) {
	return combineDateAndTime(start_at, start_at_time);
}

function determineEndAt(
	start_at: Date,
	start_at_time: string,
	end_at_time: string,
) {
	const isOverMidnight = end_at_time < start_at_time;

	const end_at = new Date(start_at);

	if (isOverMidnight) {
		end_at.setDate(end_at.getDate() + 1);
	}

	return combineDateAndTime(end_at, end_at_time);
}

type WorkSessionCreateOutput = ValidatorOutput<WorkSessionValidator, 'create'>;
type WorkSessionUpdateOutput = ValidatorOutput<WorkSessionValidator, 'update'>;

function prepareParamsFromFormValues(
	data: WorkSessionCreateOutput | WorkSessionUpdateOutput,
) {
	const { user, start_at, start_at_time, end_at_time, ...prepareParams } =
		data;

	const date_start_at = stringToDate(start_at);
	const determined_start_at = determineStartAt(date_start_at, start_at_time);
	const determined_end_at = end_at_time
		? determineEndAt(date_start_at, start_at_time, end_at_time)
		: null;

	return {
		...prepareParams,
		start_at: determined_start_at,
		end_at: determined_end_at,
	};
}

export type WorkSessionDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	user: { value: string | null; matchMode: 'equals' };
	user_id: { value: number | null; matchMode: 'equals' };
	status: { value: WorkSessionStatus | null; matchMode: 'equals' };
	start_at_start: { value: string | null; matchMode: 'equals' };
	start_at_end: { value: string | null; matchMode: 'equals' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

function displayButtonViewUser(
	entry: WorkSessionModel,
): DataTableValueOptionsType<WorkSessionModel>['displayButton'] {
	if (!entry.user) {
		return undefined;
	}

	return {
		action: 'view',
		dataSource: 'user',
		altTitle: translations['viewUser.title'],
		alternateEntryId: entry.user.id,
	};
}

export const dataSourceConfigWorkSession: DataSourceConfigType<
	WorkSessionModel,
	WorkSessionFormValuesType,
	WorkSessionCreateOutput | WorkSessionUpdateOutput
> = {
	dataTable: {
		state: {
			first: 0,
			rows: 10,
			sortField: 'id',
			sortOrder: -1 as const,
			filters: {
				global: { value: null, matchMode: 'contains' },
				user: { value: '', matchMode: 'equals' },
				user_id: { value: null, matchMode: 'equals' },
				status: { value: null, matchMode: 'equals' },
				start_at_start: { value: null, matchMode: 'equals' },
				start_at_end: { value: null, matchMode: 'equals' },
				is_deleted: { value: false, matchMode: 'equals' },
			} satisfies WorkSessionDataTableFiltersType,
		},
		columns: [
			{
				field: 'id',
				header: 'ID',
				sortable: true,
				body: (
					entry: WorkSessionModel,
					column: DataTableColumnType<WorkSessionModel>,
				) =>
					DataTableValue(entry, column, {
						markDeleted: true,
						displayButton: {
							action: 'view',
							dataSource: 'work-session',
						},
					}),
			},
			{
				field: 'user',
				header: 'User',
				body: (
					entry: WorkSessionModel,
					column: DataTableColumnType<WorkSessionModel>,
				) =>
					DataTableValue(entry, column, {
						customValue: entry.user.name,
						displayButton: displayButtonViewUser(entry),
					}),
			},
			{
				field: 'start_at',
				header: 'Start At',
				body: (
					entry: WorkSessionModel,
					column: DataTableColumnType<WorkSessionModel>,
				) =>
					DataTableValue(entry, column, {
						displayDate: true,
					}),
			},
			{
				field: 'end_at',
				header: 'End At',
				body: (
					entry: WorkSessionModel,
					column: DataTableColumnType<WorkSessionModel>,
				) =>
					DataTableValue(entry, column, {
						displayDate: true,
					}),
			},
			{
				field: 'duration',
				header: 'Duration',
				body: (
					entry: WorkSessionModel,
					column: DataTableColumnType<WorkSessionModel>,
				) =>
					DataTableValue(entry, column, {
						customValue: displayWorkSessionDuration(entry),
					}),
			},
			{
				field: 'status',
				header: 'Status',
				body: (
					entry: WorkSessionModel,
					column: DataTableColumnType<WorkSessionModel>,
				) =>
					DataTableValue(entry, column, {
						isStatus: true,
						markDeleted: true,
						displayButton: {
							action: (entry: WorkSessionModel) => {
								if (entry.deleted_at) {
									return 'restore';
								}

								if (
									entry.status ===
									WorkSessionStatusEnum.ACTIVE
								) {
									return 'close';
								}

								return undefined;
							},
							dataSource: 'work-session',
						},
					}),
				style: {
					minWidth: '8rem',
					maxWidth: '8rem',
				},
			},
		],
		find: (params: FindFunctionParamsType) =>
			requestFind<WorkSessionModel>('work-session', params),
	},
	displayEntryLabel: (entry: WorkSessionModel) => {
		return getWorkSessionDisplayName(entry);
	},
	actions: {
		create: {
			windowType: 'form',
			windowTitle: translations['create.title'],
			windowComponent: FormManageWorkSession,
			permission: 'work-session.create',
			entriesSelection: 'free',
			operationFunction: (values: WorkSessionCreateOutput) => {
				const params = prepareParamsFromFormValues(values);

				return requestCreate<WorkSessionModel, typeof params>(
					'work-session',
					params,
				);
			},
			buttonPosition: 'right',
			button: {
				variant: 'info',
			},
			getFormValues: getFormValues,
			validateForm: validateFormCreate,
			getFormState: getFormState,
		},
		update: {
			windowType: 'form',
			windowTitle: translations['update.title'],
			windowComponent: FormManageWorkSession,
			permission: 'work-session.update',
			entriesSelection: 'single',
			operationFunction: (
				values: WorkSessionUpdateOutput,
				id: number,
			) => {
				const params = prepareParamsFromFormValues(values);

				return requestUpdate<WorkSessionModel, typeof params>(
					'work-session',
					params,
					id,
				);
			},
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'success',
			},
			getFormValues: getFormValues,
			validateForm: validateFormUpdate,
			getFormState: getFormState,
		},
		delete: {
			windowType: 'action',
			windowTitle: translations['delete.title'],
			permission: 'work-session.delete',
			entriesSelection: 'single',
			customEntryCheck: (entry: WorkSessionModel) => !entry.deleted_at, // Return true if the entry is not deleted
			operationFunction: (entry: WorkSessionModel) =>
				requestDelete('work-session', entry),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		restore: {
			windowType: 'action',
			windowTitle: translations['restore.title'],
			permission: 'work-session.delete',
			entriesSelection: 'single',
			customEntryCheck: (entry: WorkSessionModel) => !!entry.deleted_at, // Return true if the entry is deleted
			operationFunction: (entry: WorkSessionModel) =>
				requestRestore('work-session', entry),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'info',
			},
		},
		close: {
			windowType: 'action',
			windowTitle: translations['close.title'],
			permission: 'work-session.update',
			entriesSelection: 'single',
			customEntryCheck: (entry: WorkSessionModel) =>
				!entry.deleted_at &&
				arrayHasValue(entry.status, [WorkSessionStatusEnum.ACTIVE]),
			operationFunction: (entry: WorkSessionModel) =>
				requestUpdateStatus('work-session', entry, 'closed'),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		view: {
			windowType: 'view',
			windowTitle: translations['view.title'],
			windowComponent: ViewWorkSession,
			windowConfigProps: {
				size: 'xl',
			},
			permission: 'work-session.read',
			entriesSelection: 'single',
			buttonPosition: 'hidden',
		},
		setupVehicles: {
			windowType: 'other',
			windowTitle: translations['setupVehicles.title'],
			windowComponent: SetupWorkSessionVehicles,
			windowConfigProps: {
				size: 'x2l',
			},
			permission: 'work-session-vehicle.update',
			entriesSelection: 'single',
			customEntryCheck: (entry: WorkSessionModel) =>
				entry.status === WorkSessionStatusEnum.ACTIVE,
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'info',
			},
		},
	},
};
