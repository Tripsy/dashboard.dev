import type { LanguageEnum } from '@/models/user.model';

export enum PlaceTypeEnum {
	COUNTRY = 'country',
	REGION = 'region',
	CITY = 'city',
}

// Content types
export type PlaceContent = {
	language: LanguageEnum | string; // Using LanguageEnum if available, otherwise string
	name: string;
	type_label: string;
	details?: Record<string, string | number | boolean> | null;
};

// Form input for place content (when creating/editing)
export type PlaceContentInput = {
	language: LanguageEnum | string;
	name: string;
	type_label: string;
};

// Place base type without relations
type PlaceBase<D = Date | string> = {
	id: number;
	place_type: PlaceTypeEnum;
	code: string | null; // Abbreviation

	// Timestamps
	created_at: D;
	updated_at: D;
	deleted_at: D;
};

// Full place model with relations
export type PlaceModel<D = Date | string> = PlaceBase<D> & {
	// Parent relationship
	parent_id: number | null;
	parent?: PlaceModel<D> | null;

	// Children relationships
	children?: PlaceModel<D>[];

	// Content translations
	contents?: PlaceContent[];
};

// Form values type for creating/editing a place
export type PlaceFormValuesType = {
	place_type: PlaceTypeEnum;
	code: string | null;
	parent_id: number | null;

	// Content translations (at least one required)
	contents: PlaceContentInput[];
};

// Helper types for specific place types
export type CountryModel<D = Date | string> = PlaceModel<D> & {
	place_type: PlaceTypeEnum.COUNTRY;
	parent_id: null; // Countries have no parent
	parent?: never; // Countries should not have a parent
};

export type RegionModel<D = Date | string> = PlaceModel<D> & {
	place_type: PlaceTypeEnum.REGION;
	parent_id: number; // Region must have a parent (country)
	parent?: PlaceModel<D>; // Parent should be a country
};

export type CityModel<D = Date | string> = PlaceModel<D> & {
	place_type: PlaceTypeEnum.CITY;
	parent_id: number; // City must have a parent (region or country)
	parent?: PlaceModel<D>; // Parent can be region or country
};

// Discriminated union for place types (if you need strict type checking)
export type TypedPlaceModel<D = Date | string> =
	| CountryModel<D>
	| RegionModel<D>
	| CityModel<D>;

// Type guards
export const isCountry = <D = Date | string>(
	place: PlaceModel<D>,
): place is CountryModel<D> => place.place_type === PlaceTypeEnum.COUNTRY;

export const isRegion = <D = Date | string>(
	place: PlaceModel<D>,
): place is RegionModel<D> => place.place_type === PlaceTypeEnum.REGION;

export const isCity = <D = Date | string>(
	place: PlaceModel<D>,
): place is CityModel<D> => place.place_type === PlaceTypeEnum.CITY;

// Simplified types for lists/tree views
export type PlaceListItem = Pick<
	PlaceModel,
	'id' | 'place_type' | 'code' | 'created_at'
> & {
	name?: string;
};

// Tree node type for hierarchical selects/tree views
export type PlaceTreeNode = PlaceListItem & {
	children?: PlaceTreeNode[];
	parent_id: number | null;
};

// For forms, you might want a type that ensures at least one content
export type PlaceFormValuesWithContent = PlaceFormValuesType & {
	contents: [PlaceContentInput, ...PlaceContentInput[]]; // At least one content
};

// Place type display names (for UI)
export const PLACE_TYPE_LABELS: Record<PlaceTypeEnum, string> = {
	[PlaceTypeEnum.COUNTRY]: 'Country',
	[PlaceTypeEnum.REGION]: 'Region',
	[PlaceTypeEnum.CITY]: 'City',
};
