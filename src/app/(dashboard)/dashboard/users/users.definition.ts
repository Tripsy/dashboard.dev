import { z } from 'zod';
import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import { FormManageUser } from '@/app/(dashboard)/dashboard/users/form-manage-user.component';
import { SetupPermissionsUser } from '@/app/(dashboard)/dashboard/users/setup-permissions-user.component';
import { ViewUser } from '@/app/(dashboard)/dashboard/users/view-user.component';
import type {
	DataSourceConfigType,
	DataTableColumnType,
} from '@/config/data-source.config';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import { getFormDataAsEnum, getFormDataAsString } from '@/helpers/form.helper';
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
	type UserFormValuesType,
	type UserModel,
	UserOperatorTypeEnum,
	type UserRole,
	UserRoleEnum,
	type UserStatus,
	UserStatusEnum,
} from '@/models/user.model';
import type { FindFunctionParamsType } from '@/types/action.type';
import { LanguageEnum } from '@/types/common.type';
import type { FormStateType } from '@/types/form.type';

const translations = await translateBatch(
	[
		'create.title',
		'update.title',
		'view.title',
		'delete.title',
		'restore.title',
		'enable.title',
		'disable.title',
		'permissions.title',
	] as const,
	'users.action',
);

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_name',
		'name_min',
		'invalid_email',
		'invalid_language',
		'invalid_role',
		'invalid_password',
		'password_min',
		'password_condition_capital_letter',
		'password_condition_number',
		'password_condition_special_character',
		'password_confirm_required',
		'password_confirm_mismatch',
		'invalid_operator_type',
	] as const,
	'users.validation',
);

class UserValidator extends BaseValidator<typeof validatorMessages> {
	baseSchema = z.object({
		name: this.validateString(
			{
				invalid: this.getMessage('invalid_name'),
				min_chars: this.getMessage('name_min', {
					min: Configuration.get('user.nameMinChars') as string,
				}),
			},
			{
				minChars: Configuration.get('user.nameMinChars') as number,
			},
		),
		email: this.validateEmail(this.getMessage('invalid_email')),
		language: this.validateLanguage(this.getMessage('invalid_language')),
		role: this.validateEnum(UserRoleEnum, this.getMessage('invalid_role')),
		operator_type: this.validateEnum(
			UserOperatorTypeEnum,
			this.getMessage('invalid_operator_type'),
			{ required: false },
		),
	});

	create = this.baseSchema
		.extend({
			password: this.validatePassword(
				{
					invalid_password: this.getMessage('invalid_password'),
					password_min: this.getMessage('password_min', {
						min: Configuration.get(
							'user.passwordMinChars',
						) as string,
					}),
					password_condition_capital_letter: this.getMessage(
						'password_condition_capital_letter',
					),
					password_condition_number: this.getMessage(
						'password_condition_number',
					),
					password_condition_special_character: this.getMessage(
						'password_condition_special_character',
					),
				},
				{
					minLength: Configuration.get(
						'user.passwordMinChars',
					) as number,
				},
			),
			password_confirm: this.validateString(
				this.getMessage('password_confirm_required'),
			),
		})
		.superRefine(({ password, password_confirm }, ctx) => {
			if (password !== password_confirm) {
				ctx.addIssue({
					code: 'custom',
					path: ['password_confirm'],
					message: this.getMessage('password_confirm_mismatch'),
				});
			}
		})
		.superRefine(({ role, operator_type }, ctx) => {
			if (role === UserRoleEnum.OPERATOR && !operator_type) {
				ctx.addIssue({
					code: 'custom',
					path: ['operator_type'],
					message: this.getMessage('invalid_operator_type'),
				});
			}
		});

	update = this.baseSchema
		.extend({
			password: this.validatePassword(
				{
					invalid_password: this.getMessage('invalid_password'),
					password_min: this.getMessage('password_min', {
						min: Configuration.get(
							'user.passwordMinChars',
						) as string,
					}),
					password_condition_capital_letter: this.getMessage(
						'password_condition_capital_letter',
					),
					password_condition_number: this.getMessage(
						'password_condition_number',
					),
					password_condition_special_character: this.getMessage(
						'password_condition_special_character',
					),
				},
				{
					required: false,
					minLength: Configuration.get(
						'user.passwordMinChars',
					) as number,
				},
			),
			password_confirm: this.validateString(
				this.getMessage('password_confirm_required'),
				{ required: false },
			),
		})
		.superRefine(({ password, password_confirm }, ctx) => {
			if (password || password_confirm) {
				if (!password_confirm) {
					ctx.addIssue({
						code: 'custom',
						path: ['password_confirm'],
						message: this.getMessage('password_confirm_required'),
					});
				} else if (password !== password_confirm) {
					ctx.addIssue({
						code: 'custom',
						path: ['password_confirm'],
						message: this.getMessage('password_confirm_mismatch'),
					});
				}
			}
		})
		.superRefine(({ role, operator_type }, ctx) => {
			if (role === UserRoleEnum.OPERATOR && !operator_type) {
				ctx.addIssue({
					code: 'custom',
					path: ['operator_type'],
					message: this.getMessage('invalid_operator_type'),
				});
			}
		});
}

function validateFormCreate(values: UserFormValuesType) {
	const validator = new UserValidator(validatorMessages);

	return validator.create.safeParse(values);
}

function validateFormUpdate(values: UserFormValuesType) {
	const validator = new UserValidator(validatorMessages);

	return validator.update.safeParse(values);
}

function getFormValues(formData: FormData): UserFormValuesType {
	return {
		name: getFormDataAsString(formData, 'name'),
		email: getFormDataAsString(formData, 'email'),
		password: getFormDataAsString(formData, 'password'),
		password_confirm: getFormDataAsString(formData, 'password_confirm'),
		language:
			getFormDataAsEnum(formData, 'language', LanguageEnum) ||
			Configuration.language(),
		role:
			getFormDataAsEnum(formData, 'role', UserRoleEnum) ||
			UserRoleEnum.DRIVER,
		operator_type: getFormDataAsEnum(
			formData,
			'operator_type',
			UserOperatorTypeEnum,
		),
	};
}

function getFormState(data?: UserModel): FormStateType<UserFormValuesType> {
	return {
		errors: {},
		message: null,
		situation: null,
		values: {
			name: data?.name ?? null,
			email: data?.email ?? null,
			password: null,
			password_confirm: null,
			language: data?.language ?? LanguageEnum.EN,
			role: data?.role ?? UserRoleEnum.DRIVER,
			operator_type: data?.operator_type ?? null,
		},
	};
}

export type UsersDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	role: { value: UserRole | null; matchMode: 'equals' };
	status: { value: UserStatus | null; matchMode: 'equals' };
	create_at_start: { value: string | null; matchMode: 'equals' };
	create_at_end: { value: string | null; matchMode: 'equals' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

export const dataSourceConfigUsers: DataSourceConfigType<
	UserModel,
	UserFormValuesType
> = {
	dataTable: {
		state: {
			first: 0,
			rows: 10,
			sortField: 'id',
			sortOrder: -1 as const,
			filters: {
				global: { value: null, matchMode: 'contains' },
				role: { value: null, matchMode: 'equals' },
				status: { value: null, matchMode: 'equals' },
				create_at_start: { value: null, matchMode: 'equals' },
				create_at_end: { value: null, matchMode: 'equals' },
				is_deleted: { value: false, matchMode: 'equals' },
			} satisfies UsersDataTableFiltersType,
		},
		columns: [
			{
				field: 'id',
				header: 'ID',
				sortable: true,
				body: (
					entry: UserModel,
					column: DataTableColumnType<UserModel>,
				) =>
					DataTableValue(entry, column, {
						markDeleted: true,
						displayButton: {
							action: 'view',
							dataSource: 'users',
						},
					}),
			},
			{
				field: 'name',
				header: 'Name',
				sortable: true,
			},
			{
				field: 'email',
				header: 'Email',
			},
			{
				field: 'role',
				header: 'Role',
				body: (
					entry: UserModel,
					column: DataTableColumnType<UserModel>,
				) =>
					DataTableValue(entry, column, {
						capitalize: true,
						displayButton: {
							action: (entry: UserModel) => {
								return entry.role === UserRoleEnum.OPERATOR
									? 'permissions'
									: undefined;
							},
							dataSource: 'users',
						},
					}),
			},
			{
				field: 'status',
				header: 'Status',
				body: (
					entry: UserModel,
					column: DataTableColumnType<UserModel>,
				) =>
					DataTableValue(entry, column, {
						isStatus: true,
						markDeleted: true,
						displayButton: {
							action: (entry: UserModel) => {
								return entry.deleted_at
									? 'restore'
									: entry.status === UserStatusEnum.ACTIVE
										? 'disable'
										: 'enable';
							},
							dataSource: 'users',
						},
					}),
				style: {
					minWidth: '8rem',
					maxWidth: '8rem',
				},
			},
			{
				field: 'created_at',
				header: 'Created At',
				sortable: true,
				body: (
					entry: UserModel,
					column: DataTableColumnType<UserModel>,
				) =>
					DataTableValue(entry, column, {
						displayDate: true,
					}),
			},
		],
		find: (params: FindFunctionParamsType) =>
			requestFind<UserModel>('users', params),
		// onRowSelect: (entry: UserModel) => console.log('selected', entry),
		// onRowUnselect: (entry: UserModel) => console.log('unselected', entry),
	},
	displayEntryLabel: (entry: UserModel) => {
		return entry.name;
	},
	actions: {
		create: {
			windowType: 'form',
			windowTitle: translations['create.title'],
			windowComponent: FormManageUser,
			permission: 'user.create',
			entriesSelection: 'free',
			operationFunction: (params: UserFormValuesType) =>
				requestCreate<UserModel, UserFormValuesType>('users', params),
			buttonPosition: 'right',
			button: {
				variant: 'info',
			},
			getFormValues: getFormValues,
			validateForm: validateFormCreate,
			getFormState: getFormState,
			// events: {
			// 	success: (resultData: UserModel) => {
			// 		console.log('onCreateSuccess', resultData);
			// 	},
			// },
		},
		update: {
			windowType: 'form',
			windowTitle: translations['update.title'],
			windowComponent: FormManageUser,
			permission: 'user.update',
			entriesSelection: 'single',
			operationFunction: (params: UserFormValuesType, id: number) =>
				requestUpdate<UserModel, UserFormValuesType>(
					'users',
					params,
					id,
				),
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
			permission: 'user.delete',
			entriesSelection: 'single',
			customEntryCheck: (entry: UserModel) => !entry.deleted_at, // Return true if the entry is not deleted
			operationFunction: (entry: UserModel) =>
				requestDelete('users', entry),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		restore: {
			windowType: 'action',
			windowTitle: translations['restore.title'],
			permission: 'user.delete',
			entriesSelection: 'single',
			customEntryCheck: (entry: UserModel) => !!entry.deleted_at, // Return true if the entry is deleted
			operationFunction: (entry: UserModel) =>
				requestRestore('users', entry),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'info',
			},
		},
		enable: {
			windowType: 'action',
			windowTitle: translations['enable.title'],
			permission: 'user.update',
			entriesSelection: 'single',
			customEntryCheck: (entry: UserModel) =>
				!entry.deleted_at &&
				arrayHasValue(entry.status, [
					UserStatusEnum.PENDING,
					UserStatusEnum.INACTIVE,
				]),
			operationFunction: (entry: UserModel) =>
				requestUpdateStatus('users', entry, 'active'),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'info',
			},
		},
		disable: {
			windowType: 'action',
			windowTitle: translations['disable.title'],
			permission: 'user.update',
			entriesSelection: 'single',
			customEntryCheck: (entry: UserModel) =>
				!entry.deleted_at &&
				arrayHasValue(entry.status, [
					UserStatusEnum.PENDING,
					UserStatusEnum.ACTIVE,
				]),
			operationFunction: (entry: UserModel) =>
				requestUpdateStatus('users', entry, 'inactive'),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		view: {
			windowType: 'view',
			windowTitle: translations['view.title'],
			windowComponent: ViewUser,
			windowConfigProps: {
				size: 'xl',
			},
			permission: 'user.read',
			entriesSelection: 'single',
			buttonPosition: 'hidden',
		},
		permissions: {
			windowType: 'other',
			windowTitle: translations['permissions.title'],
			windowComponent: SetupPermissionsUser,
			windowConfigProps: {
				size: 'lg',
			},
			permission: 'permission.update',
			entriesSelection: 'single',
			customEntryCheck: (entry: UserModel) =>
				entry.role === UserRoleEnum.OPERATOR,
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'success',
			},
		},
	},
};
