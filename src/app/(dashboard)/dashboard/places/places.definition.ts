import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import type { FormStateType } from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import { toTitleCase } from '@/helpers/string.helper';
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

const translations = await translateBatch([
	'places.validation.type_invalid',
	'places.validation.code_invalid',
	'places.validation.name_invalid',
	'places.validation.contents_invalid',
]);

// TODO contents / validation
const ValidateSchemaPlaceBase = z.object({
	type: z.enum(PlaceTypeEnum, translations['places.validation.type_invalid']),
	code: z.string(translations['places.validation.type_invalid']).trim().max(3, translations['places.validation.type_invalid']).nullable().optional(),
	parent_id: z.number().nullable(),
});

const ValidateSchemaContent = z.object({
	language: z.string(),
	name: z
		.string()
		.trim()
		.nonempty({ message: translations['places.validation.name_invalid'] }),
	type_label: z.string().trim().nonempty(),
});

const ValidateSchemaPlace = ValidateSchemaPlaceBase.extend({
	contents: z
		.array(ValidateSchemaContent)
		.min(1, {
			message: translations['places.validation.contents_invalid'],
		}),
});

export function getFormValuesPlace(formData: FormData): PlaceFormValuesType {
	const typeRaw = formData.get('type') as PlaceTypeEnum | null;
	const type = Object.values(PlaceTypeEnum).includes(typeRaw as PlaceTypeEnum)
		? (typeRaw as PlaceTypeEnum)
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
		type,
		code: (formData.get('code') as string) || null,
		parent_id: parentIdRaw ? Number(parentIdRaw) : null,
		contents,
	};
}

export type PlacesDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	type: { value: PlaceTypeEnum | null; matchMode: 'equals' };
	create_date_start: { value: string | null; matchMode: 'equals' };
	create_date_end: { value: string | null; matchMode: 'equals' };
};

export const placesDataTableFilters: PlacesDataTableFiltersType = {
	global: { value: null, matchMode: 'contains' },
	type: { value: null, matchMode: 'equals' },
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
			header: "ID",
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
			field: 'type',
			header: "Type",
			sortable: true,
			body: (
				entry: PlaceModel,
				column: DataTableColumnType<PlaceModel>,
			) =>
				DataTableValue(entry, column, {
					customValue: toTitleCase(entry.type),
				}),
		},
		{
			field: 'code',
			header: "Code",
			sortable: true,
		},
		{
			field: 'name',
			header: "Name",
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
			header: "Created At",
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
			type: PlaceTypeEnum.COUNTRY,
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
			return ValidateSchemaPlace.safeParse(values);
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
					type: model.type,
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
