import type { LanguageEnum } from '@/entities/user.model';

export enum TemplateTypeEnum {
	PAGE = 'page',
	EMAIL = 'email',
}

export enum TemplateLayoutEmailEnum {
	DEFAULT = 'default',
	SPECIAL = 'special',
}

export type TemplateContentEmailType = {
	subject: string;
	text?: string;
	html: string;
	layout: TemplateLayoutEmailEnum;
};

export enum TemplateLayoutPageEnum {
	DEFAULT = 'default',
	ARTICLE = 'article',
}

export type TemplateContentPageType = {
	title: string;
	html: string;
	layout: TemplateLayoutPageEnum;
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
