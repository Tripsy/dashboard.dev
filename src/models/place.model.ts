import { Configuration } from '@/config/settings.config';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import type { Language } from '@/types/common.type';

export const PlaceTypeEnum = {
	COUNTRY: 'country',
	REGION: 'region',
	CITY: 'city',
} as const;

export type PlaceType = (typeof PlaceTypeEnum)[keyof typeof PlaceTypeEnum];

export type PlaceContent = {
	language: Language;
	name: string;
	type_label: string;
};

export type PlaceModel<D = Date | string> = {
	id: number;
	place_type: PlaceType;
	code: string | null;

	// Parent relationship
	parent_id: number | null;
	parent?: PlaceModel<D> | null;

	// Children relationships
	children?: PlaceModel<D>[];

	// Content translations
	contents: PlaceContent[];

	// Timestamps
	created_at: D;
	updated_at: D;
	deleted_at: D;
};

export type PlaceFormValuesType = {
	place_type: PlaceType;
	code: string | null;
	parent_id: number | null;
	parent: string | null;
	contents: PlaceContent[];
};

// Helpers
export function getPlaceContentProp(
	place: PlaceModel,
	language: Language | string,
	prop: keyof Pick<PlaceContent, 'name' | 'type_label'> = 'name',
): string {
	if (!place.contents) {
		return '[unnamed city]';
	}

	const contentSelected = place.contents.find((c) => c.language === language);

	if (contentSelected) {
		return contentSelected[prop];
	}

	const contentDefault = place.contents.find(
		(c) => c.language === Configuration.language(),
	);

	if (contentDefault) {
		return contentDefault[prop];
	}

	const contentFirst = place.contents[0];

	return contentFirst[prop];
}

export function getParentPlaceType(place_type: PlaceType) {
	if (place_type === PlaceTypeEnum.COUNTRY) {
		return null;
	}

	if (place_type === PlaceTypeEnum.REGION) {
		return PlaceTypeEnum.COUNTRY;
	}

	if (place_type === PlaceTypeEnum.CITY) {
		return PlaceTypeEnum.REGION;
	}
}

export const displayPlaceLabel = (
	p: PlaceModel,
	selectedLanguage: Language,
) => {
	const name = getPlaceContentProp(p, selectedLanguage, 'name');
	const place_type =
		getPlaceContentProp(p, selectedLanguage, 'type_label') || p.place_type;

	return `${capitalizeFirstLetter(place_type)} / ${name}`;
};

export const CITY_DEFAULT = {
	code: null,
	parent_id: null,
	place_type: PlaceTypeEnum.CITY,
	contents: [
		{
			language: Configuration.language(),
			type_label: PlaceTypeEnum.CITY.toLowerCase(),
		},
	],
};
