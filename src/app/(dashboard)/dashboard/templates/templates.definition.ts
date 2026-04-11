import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import { FormManageTemplate } from '@/app/(dashboard)/dashboard/templates/form-manage-template.component';
import { ViewTemplate } from '@/app/(dashboard)/dashboard/templates/view-template.component';
import { getFormDataAsEnum, getFormDataAsString } from '@/helpers/form.helper';
import { parseJson } from '@/helpers/string.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import {
	type TemplateFormValuesType,
	TemplateLayoutEmailEnum,
	TemplateLayoutPageEnum,
	type TemplateModel,
	TemplateTypeEnum,
} from '@/models/template.model';
import { LANGUAGE_DEFAULT, LanguageEnum } from '@/models/user.model';
import {
	createTemplate,
	deleteTemplate,
	findTemplates,
	restoreTemplate,
	updateTemplate,
} from '@/services/templates.service';

const validatorMessages = await BaseValidator.getValidatorMessages(
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
	] as const,
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
				html: this.validateString(this.getMessage('invalid_page_html')),
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
	const type =
		getFormDataAsEnum(formData, 'type', TemplateTypeEnum) ||
		TemplateTypeEnum.EMAIL;

	const base = {
		label: getFormDataAsString(formData, 'label'),
		language:
			getFormDataAsEnum(formData, 'language', LanguageEnum) ||
			LANGUAGE_DEFAULT,
		html: getFormDataAsString(formData, 'html'),
	};

	if (type === TemplateTypeEnum.EMAIL) {
		return {
			...base,
			type: TemplateTypeEnum.EMAIL,
			subject: getFormDataAsString(formData, 'subject'),
			html: getFormDataAsString(formData, 'html'),
			layout:
				getFormDataAsEnum(
					formData,
					'layout',
					TemplateLayoutEmailEnum,
				) || TemplateLayoutEmailEnum.DEFAULT,
		};
	}

	return {
		...base,
		type: TemplateTypeEnum.PAGE,
		title: getFormDataAsString(formData, 'title'),
		layout:
			getFormDataAsEnum(formData, 'layout', TemplateLayoutPageEnum) ||
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
		getFormState: (
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
			windowType: 'form' as const,
			component: FormManageTemplate,
			modalProps: {
				size: 'x4l' as const,
			},
			permission: 'template.create',
			entriesSelection: 'free' as const,
			buttonPosition: 'right' as const,
			operationFunction: createTemplate,
			button: {
				variant: 'info' as const,
			},
		},
		update: {
			windowType: 'form' as const,
			component: FormManageTemplate,
			modalProps: {
				size: 'x4l' as const,
			},
			permission: 'template.update',
			entriesSelection: 'single' as const,
			buttonPosition: 'left' as const,
			operationFunction: updateTemplate,
			button: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		delete: {
			windowType: 'action' as const,
			permission: 'template.delete',
			entriesSelection: 'single' as const,
			customEntryCheck: (entry: TemplateModel) => !entry.deleted_at, // Return true if the entry is not deleted
			buttonPosition: 'left' as const,
			operationFunction: deleteTemplate,
			button: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		restore: {
			windowType: 'action' as const,
			permission: 'template.delete',
			entriesSelection: 'single' as const,
			customEntryCheck: (entry: TemplateModel) => !!entry.deleted_at, // Return true if the entry is deleted
			buttonPosition: 'left' as const,
			operationFunction: restoreTemplate,
			button: {
				variant: 'outline' as const,
				hover: 'info' as const,
			},
		},
		view: {
			windowType: 'view' as const,
			component: ViewTemplate,
			modalProps: {
				size: 'x4l' as const,
			},
			permission: 'template.read',
			entriesSelection: 'single' as const,
			buttonPosition: 'hidden' as const,
		},
	},
};
