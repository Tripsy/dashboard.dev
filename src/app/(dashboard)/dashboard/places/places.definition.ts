import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import type { FormStateType } from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import { toTitleCase } from '@/helpers/string.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import {
	type PlaceFormValuesType,
	type PlaceModel,
	PlaceTypeEnum,
} from '@/models/place.model';
import {
	createPlace,
	deletePlace,
	findPlaces,
	updatePlace,
} from '@/services/places.service';

const translationValidation = await translateBatch(
	[
		'places.validation.place_type_invalid',
		'places.validation.code_invalid',
		'places.validation.invalid_name',
		'places.validation.contents_invalid',
	],
	'places.validation.',
);

class PlaceValidator extends BaseValidator {
	constructor(private readonly message: Record<string, string>) {
		super();
	}

	manage() {
		return z.object({
			place_type: this.validateEnum(
				PlaceTypeEnum,
				this.message.invalid_place_type,
			),
			client_id: this.validateId(this.message.invalid_client_id),
			city_id: this.validateId(this.message.invalid_city_id, false),
			details: this.validateString(this.message.invalid_details),
			postal_code: this.validatePostalCode(
				this.message.invalid_postal_code,
				{
					required: false,
				},
			),
			notes: this.validateString(this.message.invalid_notes, {
				required: false,
			}),
		});
	}
}

// const ValidateSchemaPlaceBase = z.object({
// 	type: validateEnum(
// 		PlaceTypeEnum,
// 		translations['places.validation.type_invalid'],
// 	),
// 	code: validateString(translations['places.validation.type_invalid'])
// 		.max(3, translations['places.validation.type_invalid'])
// 		.nullable()
// 		.optional(),
// 	parent_id: validateId(
// 		translations['places.validation.parent_id_invalid'],
// 	).optional(),
// });
//
// const ValidateSchemaContent = z.object({
// 	language: validateEnum(
// 		LanguageEnum,
// 		translations['places.validation.language_valid'],
// 	),
// 	name: validateString(translations['places.validation.invalid_name']),
// 	type_label: validateString(
// 		translations['places.validation.type_label_invalid'],
// 	),
// });
//
// const ValidateSchemaPlace = ValidateSchemaPlaceBase.extend({
// 	contents: z.array(ValidateSchemaContent).min(1, {
// 		message: translations['places.validation.contents_invalid'],
// 	}),
// });

export function getFormValuesPlace(formData: FormData): PlaceFormValuesType {
	const placeTypeRaw = formData.get('place_type') as PlaceTypeEnum | null;
	const place_type = Object.values(PlaceTypeEnum).includes(
		placeTypeRaw as PlaceTypeEnum,
	)
		? (placeTypeRaw as PlaceTypeEnum)
		: PlaceTypeEnum.COUNTRY;

	const parentIdRaw = formData.get('parent_id');

	const contentsJson = formData.get('contents') as string | null;
	let contents: PlaceFormValuesType['contents'] = [];

	if (contentsJson) {
		try {
			const parsed = JSON.parse(contentsJson) as Array<{
				language: string;
				name: string;
				type_label: string;
			}>;

			contents = parsed.map((c) => ({
				language: c.language,
				name: c.name,
				type_label: c.type_label,
			}));
		} catch {
			contents = [];
		}
	}

	return {
		place_type,
		code: (formData.get('code') as string) || null,
		parent_id: parentIdRaw ? Number(parentIdRaw) : null,
		contents,
	};
}

export type PlacesDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	place_type: { value: PlaceTypeEnum | null; matchMode: 'equals' };
	create_date_start: { value: string | null; matchMode: 'equals' };
	create_date_end: { value: string | null; matchMode: 'equals' };
};

export const placesDataTableFilters: PlacesDataTableFiltersType = {
	global: { value: null, matchMode: 'contains' },
	place_type: { value: null, matchMode: 'equals' },
	create_date_start: { value: null, matchMode: 'equals' },
	create_date_end: { value: null, matchMode: 'equals' },
};

function getPlaceDisplayName(place: PlaceModel): string {
	const firstContent = place.contents?.[0];

	return firstContent?.name ?? '';
}

export const dataSourceConfigPlaces = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: placesDataTableFilters,
	},
	dataTableColumns: [
		{
			field: 'id',
			header: 'ID',
			sortable: true,
			body: (
				entry: PlaceModel,
				column: DataTableColumnType<PlaceModel>,
			) =>
				DataTableValue(entry, column, {
					markDeleted: true,
				}),
		},
		{
			field: 'place_type',
			header: 'Type',
			sortable: true,
			body: (
				entry: PlaceModel,
				column: DataTableColumnType<PlaceModel>,
			) =>
				DataTableValue(entry, column, {
					customValue: toTitleCase(entry.place_type),
				}),
		},
		{
			field: 'code',
			header: 'Code',
			sortable: true,
		},
		{
			field: 'name',
			header: 'Name',
			body: (
				entry: PlaceModel,
				column: DataTableColumnType<PlaceModel>,
			) =>
				DataTableValue(entry, column, {
					customValue: getPlaceDisplayName(entry),
				}),
		},
		{
			field: 'created_at',
			header: 'Created At',
			sortable: true,
			body: (
				entry: PlaceModel,
				column: DataTableColumnType<PlaceModel>,
			) =>
				DataTableValue(entry, column, {
					displayDate: true,
				}),
		},
	],
	formState: {
		dataSource: 'places' as const,
		id: undefined,
		values: {
			place_type: PlaceTypeEnum.COUNTRY,
			code: null,
			parent_id: null,
			contents: [],
		} as PlaceFormValuesType,
		errors: {},
		message: null,
		situation: null,
	},
	functions: {
		find: findPlaces,
		getFormValues: getFormValuesPlace,
		validateForm: (values: PlaceFormValuesType) => {
			const validator = new PlaceValidator(translationValidation);

			return validator.manage().safeParse(values);
		},
		syncFormState: (
			state: FormStateType<'places', PlaceModel, PlaceFormValuesType>,
			model: PlaceModel,
		): FormStateType<'places', PlaceModel, PlaceFormValuesType> => {
			return {
				...state,
				id: model.id,
				values: {
					...state.values,
					place_type: model.place_type,
					code: model.code,
					parent_id: model.parent_id,
					contents:
						model.contents?.map((c) => ({
							language: c.language,
							name: c.name,
							type_label: c.type_label,
						})) ?? [],
				},
			};
		},
	},
	actions: {
		create: {
			mode: 'form' as const,
			permission: 'place.create',
			allowedEntries: 'free' as const,
			position: 'right' as const,
			function: createPlace,
			buttonProps: {
				variant: 'info' as const,
			},
		},
		update: {
			mode: 'form' as const,
			permission: 'place.update',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: updatePlace,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		delete: {
			mode: 'action' as const,
			permission: 'place.delete',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: deletePlace,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
	},
};
