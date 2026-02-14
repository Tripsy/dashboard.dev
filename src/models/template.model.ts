import type { LanguageEnum } from '@/models/user.model';

export enum TemplateTypeEnum {
	PAGE = 'page',
	EMAIL = 'email',
}

export enum TemplateLayoutEmailEnum {
	DEFAULT = 'default',
	SPECIAL = 'special',
}

export enum TemplateLayoutPageEnum {
	DEFAULT = 'default',
	ARTICLE = 'article',
}

export type TemplateContentPageType = {
	title: string;
	html: string;
	layout: TemplateLayoutPageEnum;
};

export type TemplateContentEmailType = {
	subject: string;
	layout: TemplateLayoutEmailEnum;
	html: string;
	text?: string;
	vars: Record<string, unknown>;
};

export type TemplateModel<D = Date | string> = {
	id: number;
	label: string;
	language: LanguageEnum;
	type: TemplateTypeEnum;
	content: string;
	created_at: D;
	updated_at: D;
	deleted_at: D;
};

export type TemplateFormValuesType = {
	label: string;
	language: LanguageEnum;
	type: TemplateTypeEnum;

	subject?: string; // Email specific
	title?: string; // Page specific

	layout: TemplateLayoutEmailEnum | TemplateLayoutPageEnum;
	html: string;
};
