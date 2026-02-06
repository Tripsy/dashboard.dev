import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import {
	type DataTableFiltersType,
	type FormStateType,
	registerDataSource,
} from '@/config/data-source.config';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import {
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

const translations = await translateBatch([
	'users.validation.name_invalid',
	{
		key: 'users.validation.name_min',
		vars: {
			min: Configuration.get('user.nameMinLength') as string,
		},
	},
	'users.validation.email_invalid',
	'users.validation.language_invalid',
	'users.validation.role_invalid',
	{
		key: 'users.validation.password_invalid',
		vars: {
			min: Configuration.get('user.passwordMinLength') as string,
		},
	},
	{
		key: 'users.validation.password_min',
		vars: {
			min: Configuration.get('user.passwordMinLength') as string,
		},
	},
	'users.validation.password_condition_capital_letter',
	'users.validation.password_condition_number',
	'users.validation.password_condition_special_character',
	'users.validation.password_confirm_required',
	'users.validation.password_confirm_mismatch',
	'users.validation.operator_type_invalid',
	'users.data_table.column_id',
	'users.data_table.column_name',
	'users.data_table.column_email',
	'users.data_table.column_role',
	'users.data_table.column_status',
	'users.data_table.column_created_at',
]);

const ValidateSchemaBaseUsers = z.object({
	name: z
		.string({ message: translations['users.validation.name_invalid'] })
		.trim()
		.min(Configuration.get('user.nameMinLength') as number, {
			message: translations['users.validation.name_min'],
		}),
	email: z.email({
		message: translations['users.validation.email_invalid'],
	}),
	language: z.enum(LanguageEnum, {
		message: translations['users.validation.language_invalid'],
	}),
	role: z.enum(UserRoleEnum, {
		message: translations['users.validation.role_invalid'],
	}),
	operator_type: z
		.enum(UserOperatorTypeEnum, {
			message: translations['users.validation.operator_type_invalid'],
		})
		.nullable(),
});

const ValidateSchemaCreateUsers = ValidateSchemaBaseUsers.extend({
	password: z
		.string({ message: translations['users.validation.password_invalid'] })
		.trim()
		.min(Configuration.get('user.passwordMinLength') as number, {
			message: translations['users.validation.password_min'],
		})
		.refine((value) => /[A-Z]/.test(value), {
			message:
				translations[
					'users.validation.password_condition_capital_letter'
				],
		})
		.refine((value) => /[0-9]/.test(value), {
			message: translations['users.validation.password_condition_number'],
		})
		.refine((value) => /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(value), {
			message:
				translations[
					'users.validation.password_condition_special_character'
				],
		}),
	password_confirm: z
		.string({
			message: translations['users.validation.password_confirm_required'],
		})
		.trim()
		.nonempty({
			message: translations['users.validation.password_confirm_required'],
		}),
})
	.superRefine(({ password, password_confirm }, ctx) => {
		if (password !== password_confirm) {
			ctx.addIssue({
				code: 'custom',
				path: ['password_confirm'],
				message:
					translations['users.validation.password_confirm_mismatch'],
			});
		}
	})
	.superRefine(({ role, operator_type }, ctx) => {
		if (role === UserRoleEnum.OPERATOR && !operator_type) {
			ctx.addIssue({
				code: 'custom',
				path: ['operator_type'],
				message: translations['users.validation.operator_type_invalid'],
			});
		}
	});

const ValidateSchemaUpdateUsers = ValidateSchemaBaseUsers.extend({
	password: z.preprocess(
		(val) => (val === '' ? undefined : val),
		z
			.string({
				message: translations['users.validation.password_invalid'],
			})
			.trim()
			.min(Configuration.get('user.passwordMinLength') as number, {
				message: translations['users.validation.password_min'],
			})
			.refine((value) => /[A-Z]/.test(value), {
				message:
					translations[
						'users.validation.password_condition_capital_letter'
					],
			})
			.refine((value) => /[0-9]/.test(value), {
				message:
					translations['users.validation.password_condition_number'],
			})
			.refine((value) => /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(value), {
				message:
					translations[
						'users.validation.password_condition_special_character'
					],
			})
			.optional(),
	),
	password_confirm: z.preprocess(
		(val) => (val === '' ? undefined : val),
		z
			.string({
				message:
					translations['users.validation.password_confirm_required'],
			})
			.trim()
			.optional(),
	),
})
	.superRefine(({ password, password_confirm }, ctx) => {
		if (password || password_confirm) {
			if (!password_confirm) {
				ctx.addIssue({
					code: 'custom',
					path: ['password_confirm'],
					message:
						translations[
							'users.validation.password_confirm_required'
						],
				});
			} else if (password !== password_confirm) {
				ctx.addIssue({
					code: 'custom',
					path: ['password_confirm'],
					message:
						translations[
							'users.validation.password_confirm_mismatch'
						],
				});
			}
		}
	})
	.superRefine(({ role, operator_type }, ctx) => {
		if (role === UserRoleEnum.OPERATOR && !operator_type) {
			ctx.addIssue({
				code: 'custom',
				path: ['operator_type'],
				message: translations['users.validation.operator_type_invalid'],
			});
		}
	});

function getFormValuesUser(formData: FormData): UserFormValuesType {
	const language = formData.get('language');
	const validLanguages = Object.values(LanguageEnum);

	const role = formData.get('role');
	const validRoles = Object.values(UserRoleEnum);

	const operator_type = formData.get('operator_type');
	const validOperatorTypes = Object.values(UserOperatorTypeEnum);

	return {
		name: formData.get('name') as string,
		email: formData.get('email') as string,
		password: formData.get('password') as string,
		password_confirm: formData.get('password_confirm') as string,
		language: validLanguages.includes(language as LanguageEnum)
			? (language as LanguageEnum)
			: LanguageEnum.EN,
		role: validRoles.includes(role as UserRoleEnum)
			? (role as UserRoleEnum)
			: UserRoleEnum.MEMBER,
		operator_type:
			operator_type &&
			validOperatorTypes.includes(operator_type as UserOperatorTypeEnum)
				? (operator_type as UserOperatorTypeEnum)
				: null,
	};
}

export type UsersDataTableFiltersType = DataTableFiltersType & {
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

const dataSourceConfigUsers = {
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
			header: translations['users.data_table.column_id'],
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
			header: translations['users.data_table.column_name'],
			sortable: true,
		},
		{
			field: 'email',
			header: translations['users.data_table.column_email'],
		},
		{
			field: 'role',
			header: translations['users.data_table.column_role'],
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
			header: translations['users.data_table.column_status'],
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
			header: translations['users.data_table.column_created_at'],
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
		validateForm: (values: UserFormValuesType, id?: number) => {
			if (id) {
				return ValidateSchemaUpdateUsers.safeParse(values);
			}

			return ValidateSchemaCreateUsers.safeParse(values);
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
			permission: 'user.create',
			allowedEntries: 'free' as const,
			position: 'right' as const,
			function: createUser,
			button: {
				className: 'btn btn-action-create',
			},
		},
		update: {
			mode: 'form' as const,
			permission: 'user.update',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: updateUser,
			button: {
				className: 'btn btn-action-update',
			},
		},
		delete: {
			mode: 'action' as const,
			permission: 'user.delete',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: UserModel) => !entry.deleted_at, // Return true if the entry is not deleted
			position: 'left' as const,
			function: deleteUser,
			button: {
				className: 'btn btn-action-delete',
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
			button: {
				className: 'btn btn-action-enable',
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
			button: {
				className: 'btn btn-action-disable',
			},
		},
		restore: {
			mode: 'action' as const,
			permission: 'user.delete',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: UserModel) => !!entry.deleted_at, // Return true if the entry is deleted
			position: 'left' as const,
			function: restoreUser,
			button: {
				className: 'btn btn-action-restore',
			},
		},
		permissions: {
			mode: 'other' as const,
			permission: 'permission.update',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: UserModel) =>
				entry.role === UserRoleEnum.OPERATOR,
			position: 'left' as const,
			button: {
				className: 'btn btn-action-update',
			},
		},
		view: {
			mode: 'other' as const,
			permission: 'user.read',
			allowedEntries: 'single' as const,
			position: 'hidden' as const,
		},
	},
};

registerDataSource('users', dataSourceConfigUsers);
