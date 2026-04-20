import type { Language } from '@/models/user.model';
import type { PageMeta } from '@/types/page-meta.type';

export const BrandStatusEnum = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
} as const;

export type BrandStatus =
	(typeof BrandStatusEnum)[keyof typeof BrandStatusEnum];

// Status transition configuration
export const BRAND_STATUS_TRANSITIONS: Record<BrandStatus, BrandStatus[]> = {
	[BrandStatusEnum.ACTIVE]: [BrandStatusEnum.INACTIVE],
	[BrandStatusEnum.INACTIVE]: [BrandStatusEnum.ACTIVE],
};

export const BrandTypeEnum = {
	PRODUCT: 'product',
} as const;

export type BrandType = (typeof BrandTypeEnum)[keyof typeof BrandTypeEnum];

// Content types
export type BrandContent = {
	language: Language | string;
	description: string | null;
	meta: PageMeta | null;
};

// Form input for brand content
export type BrandContentInput = {
	language: Language | string;
	description?: string | null;
	meta?: PageMeta | null;
};

// Brand base type without relations
type BrandBase<D = Date | string> = {
	id: number;
	name: string;
	slug: string;
	status: BrandStatus;
	type: BrandType;
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
	name: string;
	slug: string;
	status: BrandStatus;
	type: BrandType;
	sort_order: number;
	details: Record<string, string | number | boolean> | null;

	contents: BrandContentInput[];
};

// For forms, ensure at least one content if required
export type BrandFormValuesWithContent = BrandFormValuesType & {
	contents: [BrandContentInput, ...BrandContentInput[]]; // At least one content
};

// // Helper function to get content for specific language
// export const getBrandContentByLanguage = (
//     brand: BrandModel,
//     language: LanguageEnum | string
// ): BrandContent | undefined => {
//     return brand.contents?.find(content => content.language === language);
// };
//
// // Helper function to get brand name with optional language fallback
// export const getBrandDisplayName = (
//     brand: BrandModel,
//     currentLanguage: LanguageEnum | string,
//     fallbackLanguage: LanguageEnum | string = 'en'
// ): string => {
//     // Try current language
//     const currentContent = getBrandContentByLanguage(brand, currentLanguage);
//     if (currentContent?.description) {
//         return currentContent.description;
//     }
//
//     // Try fallback language
//     const fallbackContent = getBrandContentByLanguage(brand, fallbackLanguage);
//     if (fallbackContent?.description) {
//         return fallbackContent.description;
//     }
//
//     // Fall back to brand name
//     return brand.name;
// };
