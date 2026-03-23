import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import type { FormStateType } from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import { parseJson } from '@/helpers/string.helper';
import { BaseValidator } from '@/helpers/validator.helper';
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

const validatorMessages = await translateBatch(
	[
		'invalid_label',
		'invalid_language',
		'invalid_email_subject',
		'invalid_email_text',
		'invalid_email_html',
		'invalid_email_layout',
		'invalid_page_title',
		'invalid_page_html',
		'invalid_page_layout',
	],
	'templates.validation',
);

class TemplateValidator extends BaseValidator<typeof validatorMessages> {
	baseSchema = {
		label: this.validateString(this.getMessage('invalid_label')),
		language: this.validateEnum(
			LanguageEnum,
			this.getMessage('invalid_language'),
		),
	};

	manage = z.discriminatedUnion('type', [
		// Email schema
		z
			.object({
				type: z.literal(TemplateTypeEnum.EMAIL),
				subject: this.validateString(
					this.getMessage('invalid_email_subject'),
				),
				text: this.validateString(
					this.getMessage('invalid_email_text'),
					{
						required: false,
					},
				),
				html: this.validateString(
					this.getMessage('invalid_email_html'),
				),
				layout: this.validateEnum(
					TemplateLayoutEmailEnum,
					this.getMessage('invalid_email_layout'),
				),
			})
			.extend(this.baseSchema),

		// Page schema
		z
			.object({
				type: z.literal(TemplateTypeEnum.PAGE),
				title: this.validateString(
					this.getMessage('invalid_page_title'),
				),
				html: this.validateString(
					this.getMessage('invalid_page_html'),
				),
				layout: this.validateEnum(
					TemplateLayoutPageEnum,
					this.getMessage('invalid_page_layout'),
				),
			})
			.extend(this.baseSchema),
	]);
}

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
			subject: (formData.get('subject') as string) ?? '',
			html: (formData.get('html') as string) ?? '',
			layout:
				(formData.get('layout') as TemplateLayoutEmailEnum) ??
				TemplateLayoutEmailEnum.DEFAULT,
		};
	}

	return {
		label: (formData.get('label') as string) ?? '',
		language: selectedLanguage,
		type: TemplateTypeEnum.PAGE,
		title: (formData.get('title') as string) ?? '',
		html: (formData.get('html') as string) ?? '',
		layout:
			(formData.get('layout') as TemplateLayoutPageEnum) ??
			TemplateLayoutPageEnum.DEFAULT,
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
			header: 'ID',
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
			header: 'Label',
			sortable: true,
		},
		{
			field: 'language',
			header: 'Language',
		},
		{
			field: 'type',
			header: 'Type',
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
			header: 'Created At',
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
			subject: '',
			html: '',
			layout: TemplateLayoutEmailEnum.DEFAULT,
		} as TemplateFormValuesType,
		errors: {},
		message: null,
		situation: null,
	},
	functions: {
		find: findTemplates,
		getFormValues: getFormValuesTemplates,
		validateForm: (values: TemplateFormValuesType) => {
			const validator = new TemplateValidator(validatorMessages);

			return validator.manage.safeParse(values);
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
			const parsed = parseJson(model.content);

			if (model.type === TemplateTypeEnum.EMAIL) {
				return {
					...state,
					id: model.id,
					values: {
						label: model.label,
						language: model.language,
						type: TemplateTypeEnum.EMAIL,
						subject: parsed.subject ?? '',
						html: parsed.html ?? '',
						layout:
							parsed.layout ?? TemplateLayoutEmailEnum.DEFAULT,
					},
				};
			}

			return {
				...state,
				id: model.id,
				values: {
					label: model.label,
					language: model.language,
					type: TemplateTypeEnum.PAGE,
					title: parsed.title ?? '',
					html: parsed.html ?? '',
					layout: parsed.layout ?? TemplateLayoutPageEnum.DEFAULT,
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
