import { z } from 'zod';
import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import type { DataTableColumnType, FormStateType } from '@/config/data-source';
import { translateBatch } from '@/config/lang';
import {
	type TemplateContentEmailType,
	type TemplateContentPageType,
	TemplateLayoutEmailEnum,
	TemplateLayoutPageEnum,
	type TemplateModel,
	TemplateTypeEnum,
} from '@/entities/template.model';
import { LanguageEnum } from '@/entities/user.model';
import { safeHtml } from '@/helpers/form.helper';
import { parseJson } from '@/helpers/string.helper';
import {
	createTemplate,
	deleteTemplate,
	findTemplates,
	restoreTemplate,
	updateTemplate,
} from '@/services/templates.service';

const translations = await translateBatch([
	'templates.validation.label_invalid',
	'templates.validation.language_invalid',
	'templates.validation.type_invalid',
	'templates.validation.email_subject_invalid',
	'templates.validation.email_html_invalid',
	'templates.validation.email_layout_invalid',
	'templates.validation.page_title_invalid',
	'templates.validation.page_body_invalid',
	'templates.validation.page_layout_invalid',
	'templates.data_table.column_id',
	'templates.data_table.column_label',
	'templates.data_table.column_language',
	'templates.data_table.column_type',
	'templates.data_table.column_created_at',
]);

const ValidateSchemaBaseTemplates = z.object({
	label: z.string().nonempty({
		message: translations['templates.validation.label_invalid'],
	}),
	language: z.enum(LanguageEnum, {
		message: translations['templates.validation.language_invalid'],
	}),
	type: z.enum(TemplateTypeEnum, {
		message: translations['templates.validation.type_invalid'],
	}),
});

const ValidateSchemaEmailTemplates = ValidateSchemaBaseTemplates.extend({
	type: z.literal(TemplateTypeEnum.EMAIL),
	content: z.object({
		subject: z.string().nonempty({
			message: translations['templates.validation.email_subject_invalid'],
		}),
		text: z
			.string({
				message:
					translations['templates.validation.email_text_invalid'],
			})
			.optional(),
		html: z
			.string()
			.nonempty({
				message:
					translations['templates.validation.email_html_invalid'],
			})
			.transform((val) => safeHtml(val)),
		layout: z
			.string({
				message:
					translations['templates.validation.email_layout_invalid'],
			})
			.optional(),
	}),
});

const ValidateSchemaPageTemplates = ValidateSchemaBaseTemplates.extend({
	type: z.literal(TemplateTypeEnum.PAGE),
	content: z.object({
		title: z.string().nonempty({
			message: translations['templates.validation.page_title_invalid'],
		}),
		html: z
			.string()
			.nonempty({
				message: translations['templates.validation.page_html_invalid'],
			})
			.transform((val) => safeHtml(val)),
		layout: z
			.string({
				message:
					translations['templates.validation.page_layout_invalid'],
			})
			.optional(),
	}),
});

export const ValidateSchemaTemplates = z.union([
	ValidateSchemaEmailTemplates,
	ValidateSchemaPageTemplates,
]);

type TemplateFormEmail = {
	label: string;
	language: LanguageEnum;
	type: TemplateTypeEnum.EMAIL;
	content: TemplateContentEmailType;
};

type TemplateFormPage = {
	label: string;
	language: LanguageEnum;
	type: TemplateTypeEnum.PAGE;
	content: TemplateContentPageType;
};

export type TemplateFormValues = TemplateFormEmail | TemplateFormPage;

export function getFormValuesTemplates(formData: FormData): TemplateFormValues {
	const language = formData.get('language');
	const validLanguages = Object.values(LanguageEnum);

	const type = formData.get('type');
	const validTypes = Object.values(TemplateTypeEnum);

	// Fallback-safe values
	const selectedLanguage = validLanguages.includes(language as LanguageEnum)
		? (language as LanguageEnum)
		: LanguageEnum.EN;

	const selectedType = validTypes.includes(type as TemplateTypeEnum)
		? (type as TemplateTypeEnum)
		: TemplateTypeEnum.EMAIL;

	if (selectedType === TemplateTypeEnum.EMAIL) {
		return {
			label: (formData.get('label') as string) ?? '',
			language: selectedLanguage,
			type: TemplateTypeEnum.EMAIL,
			content: {
				subject: (formData.get('content[subject]') as string) ?? '',
				html: (formData.get('content[html]') as string) ?? '',
				layout:
					(formData.get(
						'content[layout]',
					) as TemplateLayoutEmailEnum) ??
					TemplateLayoutEmailEnum.DEFAULT,
			},
		};
	}

	return {
		label: (formData.get('label') as string) ?? '',
		language: selectedLanguage,
		type: TemplateTypeEnum.PAGE,
		content: {
			title: (formData.get('content[title]') as string) ?? '',
			html: (formData.get('content[html]') as string) ?? '',
			layout:
				(formData.get('content[layout]') as TemplateLayoutPageEnum) ??
				TemplateLayoutPageEnum.DEFAULT,
		},
	};
}

const DataTableColumnsTemplates: DataTableColumnType<TemplateModel>[] = [
	{
		field: 'id',
		header: translations['templates.data_table.column_id'],
		sortable: true,
		body: (entry, column) =>
			DataTableValue<'templates'>(entry, column, {
				markDeleted: true,
				action: {
					name: 'view',
					source: 'templates',
				},
			}),
	},
	{
		field: 'label',
		header: translations['templates.data_table.column_label'],
		sortable: true,
	},
	{
		field: 'language',
		header: translations['templates.data_table.column_language'],
	},
	{
		field: 'type',
		header: translations['templates.data_table.column_type'],
		body: (entry, column) =>
			DataTableValue<'templates'>(entry, column, {
				capitalize: true,
			}),
	},
	{
		field: 'created_at',
		header: translations['templates.data_table.column_created_at'],
		sortable: true,
		body: (entry, column) =>
			DataTableValue<'templates'>(entry, column, {
				displayDate: true,
			}),
	},
];

const DataTableTemplatesFilters = {
	global: { value: null, matchMode: 'contains' },
	language: { value: null, matchMode: 'equals' },
	type: { value: null, matchMode: 'equals' },
	is_deleted: { value: null, matchMode: 'equals' },
};

export type DataSourceTemplatesType = {
	tableFilter: typeof DataTableTemplatesFilters;
	model: TemplateModel;
	formState: FormStateType<'templates'>;
	formValues: TemplateFormValues;
};

export const DataSourceConfigTemplates = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: DataTableTemplatesFilters,
	},
	dataTableColumns: DataTableColumnsTemplates,
	formState: {
		dataSource: 'templates' as const,
		id: undefined,
		values: {
			label: '',
			language: LanguageEnum.EN,
			type: TemplateTypeEnum.EMAIL,
			content: {
				subject: '',
				html: '',
				layout: TemplateLayoutEmailEnum.DEFAULT,
			},
		} as TemplateFormValues,
		errors: {},
		message: null,
		situation: null,
	},
	functions: {
		find: findTemplates,
		getFormValues: getFormValuesTemplates,
		validateForm: (
			values: TemplateFormValues,
		): ValidationReturnType<TemplateFormValues> => {
			return ValidateSchemaTemplates.safeParse(
				values,
			) as ValidationReturnType<TemplateFormValues>;
		},
		syncFormState: (
			state: FormStateType<'templates'>,
			model: TemplateModel,
		): FormStateType<'templates'> => {
			return {
				...state,
				id: model.id,
				values: {
					...state.values,
					label: model.label,
					language: model.language,
					type: model.type,
					content: parseJson(model.content),
				},
			};
		},
		displayActionEntries: (entries: TemplateModel[]) => {
			return entries.map((entry) => ({
				id: entry.id,
				label: `(${entry.type}) ${entry.label}`,
			}));
		},
	},
	actions: {
		create: {
			mode: 'form' as const,
			permission: 'template.create',
			allowedEntries: 'free' as const,
			position: 'right' as const,
			function: createTemplate,
			button: {
				className: 'btn btn-action-create',
			},
		},
		update: {
			mode: 'form' as const,
			permission: 'template.update',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: updateTemplate,
			button: {
				className: 'btn btn-action-update',
			},
		},
		delete: {
			mode: 'action' as const,
			permission: 'template.delete',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: TemplateModel) => !entry.deleted_at, // Return true if the entry is not deleted
			position: 'left' as const,
			function: deleteTemplate,
			button: {
				className: 'btn btn-action-delete',
			},
		},
		restore: {
			mode: 'action' as const,
			permission: 'template.delete',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: TemplateModel) => !!entry.deleted_at, // Return true if the entry is deleted
			position: 'left' as const,
			function: restoreTemplate,
			button: {
				className: 'btn btn-action-restore',
			},
		},
		view: {
			mode: 'other' as const,
			permission: 'template.read',
			allowedEntries: 'single' as const,
			position: 'hidden' as const,
		},
	},
};
