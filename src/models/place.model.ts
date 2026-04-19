import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { LANGUAGE_DEFAULT, type LanguageEnum } from '@/models/user.model';

export enum PlaceTypeEnum {
	COUNTRY = 'country',
	REGION = 'region',
	CITY = 'city',
}

export type PlaceContent = {
	language: LanguageEnum;
	name: string;
	type_label: string;
};

export type PlaceModel<D = Date | string> = {
	id: number;
	place_type: PlaceTypeEnum;
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
	place_type: PlaceTypeEnum;
	code: string | null;
	parent_id: number | null;
	parent: string | null;
	contents: PlaceContent[];
};

// Helpers
export function getPlaceContentProp(
	place: PlaceModel,
	language: LanguageEnum | string,
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
		(c) => c.language === LANGUAGE_DEFAULT,
	);

	if (contentDefault) {
		return contentDefault[prop];
	}

	const contentFirst = place.contents[0];

	return contentFirst[prop];
}

export function getParentPlaceType(place_type: PlaceTypeEnum) {
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
	selectedLanguage: LanguageEnum,
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
			language: LANGUAGE_DEFAULT,
			type_label: PlaceTypeEnum.CITY.toLowerCase(),
		},
	],
};
