import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import type { FormStateType } from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import { safeHtml } from '@/helpers/form.helper';
import { parseJson } from '@/helpers/string.helper';
import type { ValidationReturnType } from '@/hooks/use-form-validation.hook';
import {
	type TemplateFormValuesType,
	TemplateLayoutEmailEnum,
	TemplateLayoutPageEnum,
	type TemplateModel,
	TemplateTypeEnum,
} from '@/models/template.model';
import { LanguageEnum } from '@/models/user.model';
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

export function getFormValuesTemplates(
	formData: FormData,
): TemplateFormValuesType {
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

export type TemplateDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	language: { value: string | null; matchMode: 'equals' };
	type: { value: TemplateTypeEnum | null; matchMode: 'equals' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

export const templatesDataTableFilters: TemplateDataTableFiltersType = {
	global: { value: null, matchMode: 'contains' },
	language: { value: null, matchMode: 'equals' },
	type: { value: null, matchMode: 'equals' },
	is_deleted: { value: false, matchMode: 'equals' },
};

export const dataSourceConfigTemplates = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: templatesDataTableFilters,
	},
	dataTableColumns: [
		{
			field: 'id',
			header: translations['templates.data_table.column_id'],
			sortable: true,
			body: (
				entry: TemplateModel,
				column: DataTableColumnType<TemplateModel>,
			) =>
				DataTableValue(entry, column, {
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
			body: (
				entry: TemplateModel,
				column: DataTableColumnType<TemplateModel>,
			) =>
				DataTableValue(entry, column, {
					capitalize: true,
				}),
		},
		{
			field: 'created_at',
			header: translations['templates.data_table.column_created_at'],
			sortable: true,
			body: (
				entry: TemplateModel,
				column: DataTableColumnType<TemplateModel>,
			) =>
				DataTableValue(entry, column, {
					displayDate: true,
				}),
		},
	],
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
		} as TemplateFormValuesType,
		errors: {},
		message: null,
		situation: null,
	},
	functions: {
		find: findTemplates,
		getFormValues: getFormValuesTemplates,
		validateForm: (
			values: TemplateFormValuesType,
		): ValidationReturnType<TemplateFormValuesType> => {
			return ValidateSchemaTemplates.safeParse(
				values,
			) as ValidationReturnType<TemplateFormValuesType>;
		},
		syncFormState: (
			state: FormStateType<
				'templates',
				TemplateModel,
				TemplateFormValuesType
			>,
			model: TemplateModel,
		): FormStateType<
			'templates',
			TemplateModel,
			TemplateFormValuesType
		> => {
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
			buttonProps: {
				variant: 'info' as const,
			},
		},
		update: {
			mode: 'form' as const,
			permission: 'template.update',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: updateTemplate,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		delete: {
			mode: 'action' as const,
			permission: 'template.delete',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: TemplateModel) => !entry.deleted_at, // Return true if the entry is not deleted
			position: 'left' as const,
			function: deleteTemplate,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		restore: {
			mode: 'action' as const,
			permission: 'template.delete',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: TemplateModel) => !!entry.deleted_at, // Return true if the entry is deleted
			position: 'left' as const,
			function: restoreTemplate,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'info' as const,
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
