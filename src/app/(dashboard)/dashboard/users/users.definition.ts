import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import { FormManageUser } from '@/app/(dashboard)/dashboard/users/form-manage-user.component';
import { SetupPermissionsUser } from '@/app/(dashboard)/dashboard/users/setup-permissions-user.component';
import { ViewUser } from '@/app/(dashboard)/dashboard/users/view-user.component';
import type { FormStateType } from '@/config/data-source.config';
import { Configuration } from '@/config/settings.config';
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

function getFormValuesUser(formData: FormData): UserFormValuesType {
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

export const dataSourceConfigUsers = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: usersDataTableFilters,
	},
	dataTableColumns: [
		{
			field: 'id',
			header: 'ID',
			sortable: true,
			body: (entry: UserModel, column: DataTableColumnType<UserModel>) =>
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
			body: (entry: UserModel, column: DataTableColumnType<UserModel>) =>
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
			body: (entry: UserModel, column: DataTableColumnType<UserModel>) =>
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
			body: (entry: UserModel, column: DataTableColumnType<UserModel>) =>
				DataTableValue(entry, column, {
					displayDate: true,
				}),
		},
	],
	formState: {
		dataSource: 'users' as const,
		id: undefined,
		values: {
			name: '',
			email: '',
			password: '',
			password_confirm: '',
			language: LanguageEnum.EN,
			role: UserRoleEnum.MEMBER,
			operator_type: null,
		},
		errors: {},
		message: null,
		situation: null,
	},
	functions: {
		find: findUsers,
		// onRowSelect: (entry: UserModel) => console.log('selected', entry),
		// onRowUnselect: (entry: UserModel) => console.log('unselected', entry),
		getFormValues: getFormValuesUser,
		validateForm: (values: UserFormValuesType, id: number) => {
			const validator = new UserValidator(validatorMessages);

			if (id) {
				return validator.update.safeParse(values);
			}

			return validator.create.safeParse(values);
		},
		syncFormState: (
			state: FormStateType<'users', UserModel, UserFormValuesType>,
			model: UserModel,
		): FormStateType<'users', UserModel, UserFormValuesType> => {
			return {
				...state,
				id: model.id,
				values: {
					...state.values,
					name: model.name,
					email: model.email,
					language: model.language,
					role: model.role,
					operator_type: model.operator_type,
				},
			};
		},
		displayActionEntries: (entries: UserModel[]) => {
			return entries.map((entry) => ({
				id: entry.id,
				label: entry.name,
			}));
		},
	},
	actions: {
		create: {
			mode: 'form' as const,
			component: FormManageUser,
			permission: 'user.create',
			allowedEntries: 'free' as const,
			position: 'right' as const,
			function: createUser,
			buttonProps: {
				variant: 'info' as const,
			},
		},
		update: {
			mode: 'form' as const,
			component: FormManageUser,
			permission: 'user.update',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: updateUser,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		delete: {
			mode: 'action' as const,
			permission: 'user.delete',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: UserModel) => !entry.deleted_at, // Return true if the entry is not deleted
			position: 'left' as const,
			function: deleteUser,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		enable: {
			mode: 'action' as const,
			permission: 'user.update',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: UserModel) =>
				!entry.deleted_at &&
				[UserStatusEnum.PENDING, UserStatusEnum.INACTIVE].includes(
					entry.status,
				),
			position: 'left' as const,
			function: enableUser,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'info' as const,
			},
		},
		disable: {
			mode: 'action' as const,
			permission: 'user.update',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: UserModel) =>
				!entry.deleted_at &&
				[UserStatusEnum.PENDING, UserStatusEnum.ACTIVE].includes(
					entry.status,
				),
			position: 'left' as const,
			function: disableUser,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		restore: {
			mode: 'action' as const,
			permission: 'user.delete',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: UserModel) => !!entry.deleted_at, // Return true if the entry is deleted
			position: 'left' as const,
			function: restoreUser,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'info' as const,
			},
		},
		permissions: {
			mode: 'other' as const,
			component: SetupPermissionsUser,
			modalProps: {
				size: 'lg' as const,
			},
			permission: 'permission.update',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: UserModel) =>
				entry.role === UserRoleEnum.OPERATOR,
			position: 'left' as const,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		view: {
			mode: 'view' as const,
			component: ViewUser,
			modalProps: {
				size: 'xl' as const,
			},
			permission: 'user.read',
			allowedEntries: 'single' as const,
			position: 'hidden' as const,
		},
	},
};
