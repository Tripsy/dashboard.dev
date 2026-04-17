import { LANGUAGE_DEFAULT, type LanguageEnum } from '@/models/user.model';

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

// Full place model with relations
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
	contents?: PlaceContent[];

	// Timestamps
	created_at: D;
	updated_at: D;
	deleted_at: D;
};

export type PlaceFormValuesType = {
	place_type: PlaceTypeEnum;
	code: string | null;
	parent_id: number | null;

	name: string;
	type_label: string;
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
