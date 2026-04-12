import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import { FormManageUser } from '@/app/(dashboard)/dashboard/users/form-manage-user.component';
import { SetupPermissionsUser } from '@/app/(dashboard)/dashboard/users/setup-permissions-user.component';
import { ViewUser } from '@/app/(dashboard)/dashboard/users/view-user.component';
import type { DataSourceConfigType } from '@/config/data-source.config';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import { getFormDataAsEnum, getFormDataAsString } from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import {
	LANGUAGE_DEFAULT,
	LanguageEnum,
	type UserFormValuesType,
	type UserModel,
	UserOperatorTypeEnum,
	UserRoleEnum,
	UserStatusEnum,
} from '@/models/user.model';
import {
	createUser,
	deleteUser,
	disableUser,
	enableUser,
	findUsers,
	restoreUser,
	updateUser,
} from '@/services/users.service';
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
	],
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
	],
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
		language: this.validateEnum(
			LanguageEnum,
			this.getMessage('invalid_language'),
		),
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

function getFormValues(formData: FormData): UserFormValuesType {
	return {
		name: getFormDataAsString(formData, 'name'),
		email: getFormDataAsString(formData, 'email'),
		password: getFormDataAsString(formData, 'password'),
		password_confirm: getFormDataAsString(formData, 'password_confirm'),
		language:
			getFormDataAsEnum(formData, 'language', LanguageEnum) ||
			LANGUAGE_DEFAULT,
		role:
			getFormDataAsEnum(formData, 'role', UserRoleEnum) ||
			UserRoleEnum.MEMBER,
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
			name: data?.name ?? '',
			email: data?.email ?? '',
			password: '',
			password_confirm: '',
			language: data?.language ?? LanguageEnum.EN,
			role: data?.role ?? UserRoleEnum.MEMBER,
			operator_type: data?.operator_type ?? null,
		},
	};
}

function validateFormCreate(values: UserFormValuesType) {
	const validator = new UserValidator(validatorMessages);

	return validator.create.safeParse(values);
}

function validateFormUpdate(values: UserFormValuesType) {
	const validator = new UserValidator(validatorMessages);

	return validator.create.safeParse(values);
}

export type UsersDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	role: { value: UserRoleEnum | null; matchMode: 'equals' };
	status: { value: UserStatusEnum | null; matchMode: 'equals' };
	create_date_start: { value: string | null; matchMode: 'equals' };
	create_date_end: { value: string | null; matchMode: 'equals' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

export const usersDataTableFilters: UsersDataTableFiltersType = {
	global: { value: null, matchMode: 'contains' },
	role: { value: null, matchMode: 'equals' },
	status: { value: null, matchMode: 'equals' },
	create_date_start: { value: null, matchMode: 'equals' },
	create_date_end: { value: null, matchMode: 'equals' },
	is_deleted: { value: false, matchMode: 'equals' },
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
			filters: usersDataTableFilters,
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
						action: {
							name: 'view',
							source: 'users',
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
						action: {
							name: (entry: UserModel) => {
								return entry.role === UserRoleEnum.OPERATOR
									? 'permissions'
									: null;
							},
							source: 'users',
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
						action: {
							name: (entry: UserModel) => {
								return entry.deleted_at
									? 'restore'
									: entry.status === UserStatusEnum.ACTIVE
										? 'disable'
										: 'enable';
							},
							source: 'users',
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
		find: findUsers,
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
			operationFunction: createUser,
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
			operationFunction: updateUser,
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
			operationFunction: deleteUser,
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		enable: {
			windowType: 'action',
			windowTitle: translations['enable.title'],
			permission: 'user.update',
			entriesSelection: 'single',
			customEntryCheck: (entry: UserModel) =>
				!entry.deleted_at &&
				[UserStatusEnum.PENDING, UserStatusEnum.INACTIVE].includes(
					entry.status,
				),
			operationFunction: enableUser,
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
				[UserStatusEnum.PENDING, UserStatusEnum.ACTIVE].includes(
					entry.status,
				),
			operationFunction: disableUser,
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
			operationFunction: restoreUser,
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'info',
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
