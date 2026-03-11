import type { LanguageEnum } from '@/models/user.model';
import type { PageMeta } from '@/types/page-meta.type';

export enum BrandStatusEnum {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

// Status transition configuration
export const BRAND_STATUS_TRANSITIONS: Record<
	BrandStatusEnum,
	BrandStatusEnum[]
> = {
	[BrandStatusEnum.ACTIVE]: [BrandStatusEnum.INACTIVE],
	[BrandStatusEnum.INACTIVE]: [BrandStatusEnum.ACTIVE],
};

export enum BrandTypeEnum {
	PRODUCT = 'product',
}

// Content types
export type BrandContent = {
	language: LanguageEnum | string;
	description: string | null;
	meta: PageMeta | null;
};

// Form input for brand content
export type BrandContentInput = {
	language: LanguageEnum | string;
	description?: string | null;
	meta?: PageMeta | null;
};

// Brand base type without relations
type BrandBase<D = Date | string> = {
	id: number;
	name: string;
	slug: string;
	status: BrandStatusEnum;
	type: BrandTypeEnum;
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
	status: BrandStatusEnum;
	type: BrandTypeEnum;
	sort_order: number;
	details: Record<string, string | number | boolean> | null;

	contents: BrandContentInput[];
};

// Type for product brands (specific type)
export type ProductBrandModel<D = Date | string> = BrandModel<D> & {
	type: BrandTypeEnum.PRODUCT;
};

// Discriminated union for brand types (if you add more types later)
export type TypedBrandModel<D = Date | string> = ProductBrandModel<D>;

// Type guard for product brands
export const isProductBrand = <D = Date | string>(
	brand: BrandModel<D>,
): brand is ProductBrandModel<D> => brand.type === BrandTypeEnum.PRODUCT;

// Simplified type for lists
export type BrandListItem = Pick<
	BrandModel,
	'id' | 'name' | 'slug' | 'status' | 'type' | 'sort_order' | 'created_at'
>;

// For dropdown/select components
export type BrandOption = Pick<BrandModel, 'id' | 'name' | 'slug' | 'type'>;

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
