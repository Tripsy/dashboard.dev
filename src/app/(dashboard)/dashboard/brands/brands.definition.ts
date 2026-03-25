import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import type { FormStateType } from '@/config/data-source.config';
import { getFormDataAsEnum, getFormDataAsString } from '@/helpers/form.helper';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import {
	type BrandFormValuesType,
	type BrandModel,
	BrandStatusEnum,
	BrandTypeEnum,
} from '@/models/brand.model';
import {
	CashFlowCategoryEnum,
	CashFlowMethodEnum,
	CurrencyEnum,
} from '@/models/cash-flow.model';
import {
	createBrand,
	deleteBrand,
	findBrands,
	updateBrand,
} from '@/services/brands.service';

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_language',
		'invalid_description',
		'invalid_meta_title',
		'invalid_meta_description',
		'invalid_meta_keywords',
		'invalid_name',
		'invalid_slug',
		'invalid_status',
		'invalid_type',
	] as const,
	'brands.validation',
);

class CashFlowValidator extends BaseValidator<typeof validatorMessages> {
	readonly contentSchema = z.object({
		language: this.validateLanguage(this.getMessage('invalid_language')),
		description: this.validateString(
			this.getMessage('invalid_description'),
			{ required: false },
		),
		meta: this.validateMeta({
			invalid_meta_title: this.getMessage('invalid_meta_title'),
			invalid_meta_description: this.getMessage(
				'invalid_meta_description',
			),
			invalid_meta_keywords: this.getMessage('invalid_meta_keywords'),
		}),
	});

	manage = z.object({
		name: this.validateString(this.getMessage('invalid_name')),
		slug: this.validateString(this.getMessage('invalid_slug')).transform(
			(val) => val.trim().toLowerCase(),
		),
		type: this.validateEnum(BrandTypeEnum, this.getMessage('invalid_type')),
		content: this.contentSchema.array(),
	});
}

export function getFormValuesBrand(formData: FormData): BrandFormValuesType {
	// const detailsJson = getFormDataAsString(formData, 'details');
	// let details: BrandFormValuesType['details'] = null;
	//
	// if (detailsJson) {
	// 	try {
	// 		details = JSON.parse(detailsJson) as BrandFormValuesType['details'];
	// 	} catch {
	// 		details = null;
	// 	}
	// }
	//
	// const contentsJson = getFormDataAsString(formData, 'contents')
	// let contents: BrandFormValuesType['contents'] = [];
	//
	// if (contentsJson) {
	// 	try {
	// 		const parsed = JSON.parse(contentsJson) as Array<{
	// 			language: string;
	// 			description?: string | null;
	// 		}>;
	//
	// 		contents = parsed.map((c) => ({
	// 			language: c.language,
	// 			description: c.description ?? null,
	// 			meta: null,
	// 		}));
	// 	} catch {
	// 		contents = [];
	// 	}
	// }

	return {
		name: getFormDataAsString(formData, 'name'),
		slug: getFormDataAsString(formData, 'slug'),
		type: getFormDataAsEnum(formData, 'type', BrandTypeEnum),
		details,
		contents,
	};
}

export type BrandsDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	status: { value: BrandStatusEnum | null; matchMode: 'equals' };
	type: { value: BrandTypeEnum | null; matchMode: 'equals' };
	create_date_start: { value: string | null; matchMode: 'equals' };
	create_date_end: { value: string | null; matchMode: 'equals' };
};

export const brandsDataTableFilters: BrandsDataTableFiltersType = {
	global: { value: null, matchMode: 'contains' },
	status: { value: null, matchMode: 'equals' },
	type: { value: null, matchMode: 'equals' },
	create_date_start: { value: null, matchMode: 'equals' },
	create_date_end: { value: null, matchMode: 'equals' },
};

export const dataSourceConfigBrands = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: brandsDataTableFilters,
	},
	dataTableColumns: [
		{
			field: 'id',
			header: 'ID',
			sortable: true,
			body: (
				entry: BrandModel,
				column: DataTableColumnType<BrandModel>,
			) =>
				DataTableValue(entry, column, {
					markDeleted: true,
				}),
		},
		{
			field: 'name',
			header: 'Name',
			sortable: true,
		},
		{
			field: 'status',
			header: 'Status',
			sortable: true,
			body: (
				entry: BrandModel,
				column: DataTableColumnType<BrandModel>,
			) =>
				DataTableValue(entry, column, {
					capitalize: true,
				}),
		},
		{
			field: 'type',
			header: 'Type',
			sortable: true,
			body: (
				entry: BrandModel,
				column: DataTableColumnType<BrandModel>,
			) =>
				DataTableValue(entry, column, {
					customValue: capitalizeFirstLetter(entry.type),
				}),
		},
	],
	formState: {
		dataSource: 'brands' as const,
		id: undefined,
		values: {
			name: '',
			slug: '',
			status: BrandStatusEnum.ACTIVE,
			type: BrandTypeEnum.PRODUCT,
			sort_order: 0,
			details: null,
			contents: [],
		} as BrandFormValuesType,
		errors: {},
		message: null,
		situation: null,
	},
	functions: {
		find: findBrands,
		getFormValues: getFormValuesBrand,
		validateForm: (values: BrandFormValuesType) => {
			// return ValidateSchemaBrands.safeParse(values);
		},
		syncFormState: (
			state: FormStateType<'brands', BrandModel, BrandFormValuesType>,
			model: BrandModel,
		): FormStateType<'brands', BrandModel, BrandFormValuesType> => {
			return {
				...state,
				id: model.id,
				values: {
					...state.values,
					name: model.name,
					slug: model.slug,
					status: model.status,
					type: model.type,
					sort_order: model.sort_order,
					details: model.details,
					contents:
						model.contents?.map((c) => ({
							language: c.language,
							description: c.description ?? null,
							meta: c.meta ?? null,
						})) ?? [],
				},
			};
		},
	},
	actions: {
		create: {
			mode: 'form' as const,
			permission: 'brand.create',
			allowedEntries: 'free' as const,
			position: 'right' as const,
			function: createBrand,
			buttonProps: {
				variant: 'info' as const,
			},
		},
		update: {
			mode: 'form' as const,
			permission: 'brand.update',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: updateBrand,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		delete: {
			mode: 'action' as const,
			permission: 'brand.delete',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: deleteBrand,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
	},
};
