import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { LANGUAGE_DEFAULT, type Language } from '@/types/common.type';
import type { PageMeta } from '@/types/page-meta.type';

export const BrandStatusEnum = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
} as const;

export type BrandStatus =
	(typeof BrandStatusEnum)[keyof typeof BrandStatusEnum];

export const BrandTypeEnum = {
	PRODUCT: 'product',
} as const;

export type BrandType = (typeof BrandTypeEnum)[keyof typeof BrandTypeEnum];

export const BRAND_DEFAULT_TYPE = BrandTypeEnum.PRODUCT;

export type BrandContent = {
	language: Language | string;
	description: string | null;
	meta: PageMeta;
};

// Brand base type without relations
type BrandBase<D = Date | string> = {
	id: number;
	name: string;
	slug: string;
	status: BrandStatus;
	brand_type: BrandType;
	sort_order: number;
	details: Record<string, string | number | boolean> | null;

	// Timestamps
	created_at: D;
	updated_at: D;
	deleted_at: D;
};

// Full brand model with relations
export type BrandModel<D = Date | string> = BrandBase<D> & {
	// Content translations
	contents?: BrandContent[];
};

// Form values type for creating/editing a brand
export type BrandFormValuesType = {
	name: string | null;
	slug: string | null;
	brand_type: BrandType;

	contents: BrandContent[];
};

// Helpers
export function getBrandDescription(
	brand: BrandModel,
	language: Language | string,
): string {
	if (!brand.contents) {
		return '[empty description]';
	}

	const contentSelected = brand.contents.find((c) => c.language === language);

	if (contentSelected?.description) {
		return contentSelected.description;
	}

	const contentDefault = brand.contents.find(
		(c) => c.language === LANGUAGE_DEFAULT,
	);

	if (contentDefault?.description) {
		return contentDefault.description;
	}

	const contentFirst = brand.contents[0];

	if (contentFirst?.description) {
		return contentFirst.description;
	}

	return '[empty description]';
}

export const displayBrandLabel = (p: BrandModel) => {
	return `${capitalizeFirstLetter(p.brand_type)} / ${p.name}`;
};
