import { Configuration } from '@/config/settings.config';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import type { Language } from '@/types/common.type';
import type {
	ImageAttributesType,
	ImagePropertiesType,
} from '@/types/image.type';

export const ImageSectionEnum = {
	CMR: 'cmr',
	CATEGORY: 'category',
	BRAND: 'brand',
} as const;

export const IMAGE_DEFAULT_SECTION = ImageSectionEnum.CMR;

export type ImageSection =
	(typeof ImageSectionEnum)[keyof typeof ImageSectionEnum];

export const ImageTypeEnum = {
	LOGO: 'logo',
	GALLERY: 'gallery',
} as const;

export const IMAGE_DEFAULT_TYPE = ImageTypeEnum.GALLERY;

export type ImageType = (typeof ImageTypeEnum)[keyof typeof ImageTypeEnum];

export const ImageStatusEnum = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
} as const;

export type ImageStatus =
	(typeof ImageStatusEnum)[keyof typeof ImageStatusEnum];

export const ImageStorageEnum = {
	LOCAL: 'local',
	S3: 's3',
} as const;

export type ImageStorage =
	(typeof ImageStorageEnum)[keyof typeof ImageStorageEnum];

export type ImageContentType = {
	language: string;
	storage: ImageStorage;
	path: string;
	properties?: ImagePropertiesType;
	attributes?: ImageAttributesType;
};

// Full image model with relations
export type ImageModel<D = Date | string> = {
	id: number;
	section: ImageSection;
	entity_id: number;
	image_type: ImageType;
	status: ImageStatus;
	sort_order: number;

	// Timestamps
	created_at: D;
	updated_at: D;
	deleted_at: D;

	// Content translations
	contents?: ImageContentType[];
};

// Helpers
export function getImageProperties(
	image: ImageModel,
	language: Language,
): ImagePropertiesType | undefined {
	if (!image.contents) {
		return;
	}

	const contentSelected = image.contents.find((c) => c.language === language);

	if (contentSelected?.properties) {
		return contentSelected.properties;
	}

	const contentDefault = image.contents.find(
		(c) => c.language === Configuration.language(),
	);

	if (contentDefault?.properties) {
		return contentDefault.properties;
	}

	const contentFirst = image.contents[0];

	if (contentFirst?.properties) {
		return contentFirst.properties;
	}
}

export function getImageProperty(
	image: ImageModel,
	language: Language,
	key: keyof ImagePropertiesType,
) {
	const properties = getImageProperties(image, language);

	if (properties?.[key]) {
		return properties?.[key];
	}
}

export function getImageAttributes(
	image: ImageModel,
	language: Language,
): ImageAttributesType | undefined {
	if (!image.contents) {
		return;
	}

	const contentSelected = image.contents.find((c) => c.language === language);

	if (contentSelected?.attributes) {
		return contentSelected.attributes;
	}

	const contentDefault = image.contents.find(
		(c) => c.language === Configuration.language(),
	);

	if (contentDefault?.attributes) {
		return contentDefault.attributes;
	}

	const contentFirst = image.contents[0];

	if (contentFirst?.attributes) {
		return contentFirst.attributes;
	}
}

export const displayImageLabel = (m: ImageModel) => {
	return `${capitalizeFirstLetter(m.section)} / ${m.contents?.[0]?.path}`;
};
