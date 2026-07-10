import { Configuration } from '@/config/settings.config';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import type { Language } from '@/types/common.type';
import type { ImagePropertiesType } from '@/types/image.type';

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
	title: string;
	description?: string;
};

// Full image model with relations
export type ImageModel<D = Date | string> = {
	id: number;
	section: ImageSection;
	entity_id: number;
	image_type: ImageType;
	storage: ImageStorage;
	path: string;
	properties: ImagePropertiesType;
	status: ImageStatus;
	sort_order: number;

	// Timestamps
	created_at: D;
	updated_at: D;

	// Content translations
	contents: ImageContentType[];
};

// Helpers
export function getImageProperty(
	image: ImageModel,
	key: keyof ImagePropertiesType,
) {
	if (image.properties?.[key]) {
		return image.properties?.[key];
	}
}

export function getImageContent(
	image: ImageModel,
	language: Language,
): ImageContentType | undefined {
	if (!image.contents) {
		return;
	}

	const contentSelected = image.contents.find((c) => c.language === language);

	if (contentSelected) {
		return contentSelected;
	}

	const contentDefault = image.contents.find(
		(c) => c.language === Configuration.defaultLanguage(),
	);

	if (contentDefault) {
		return contentDefault;
	}

	const contentFirst = image.contents[0];

	if (contentFirst) {
		return contentFirst;
	}
}

export const displayImageLabel = (m: ImageModel) => {
	return `${capitalizeFirstLetter(m.section)} / ${m.path}`;
};
