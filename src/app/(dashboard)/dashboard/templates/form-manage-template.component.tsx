import { useMemo } from 'react';
import {
	FormComponentInput,
	FormComponentSelect,
	FormComponentTextarea,
} from '@/components/form/form-element.component';
import { Icons } from '@/components/icon.component';
import type { FormManageType } from '@/config/data-source.config';
import { capitalizeFirstLetter, toKebabCase } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import {
	type TemplateFormValuesType,
	TemplateLayoutEmailEnum,
	TemplateTypeEnum,
} from '@/models/template.model';
import { LanguageEnum } from '@/models/user.model';

const languages = Object.values(LanguageEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const types = Object.values(TemplateTypeEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const emailLayouts = Object.values(TemplateLayoutEmailEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export function FormManageTemplate({
	formValues,
	errors,
	handleChange,
	pending,
}: FormManageType<TemplateFormValuesType>) {
	const translationsKeys = useMemo(
		() =>
			[
				'templates.form_manage.label_label',
				'templates.form_manage.label_language',
				'templates.form_manage.label_type',
				'templates.form_manage.label_email_subject',
				'templates.form_manage.label_email_html',
				'templates.form_manage.label_email_layout',
				'templates.form_manage.label_page_title',
				'templates.form_manage.label_page_html',
				'templates.form_manage.label_page_layout',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	const elementIds = useElementIds(['label', 'language', 'type', 'content']);

	return (
		<>
			<FormComponentInput<TemplateFormValuesType>
				id={elementIds.label}
				labelText={translations['templates.form_manage.label_label']}
				fieldName="label"
				fieldValue={formValues.label}
				isRequired={true}
				className="pl-8"
				placeholderText="eg: password-recover"
				disabled={pending}
				onChange={(e) => {
					const value = toKebabCase(e.target.value);

					handleChange('label', value);
				}}
				error={errors.label}
				icons={{
					left: <Icons.Tag className="opacity-40 h-4.5 w-4.5" />,
				}}
			/>

			<div className="flex flex-wrap gap-4">
				<FormComponentSelect<TemplateFormValuesType>
					labelText={
						translations['templates.form_manage.label_language']
					}
					id={elementIds.language}
					fieldName="language"
					fieldValue={formValues.language}
					className="min-w-32"
					disabled={pending}
					options={languages}
					onValueChange={(value) => handleChange('language', value)}
					error={errors.language}
				/>
				<FormComponentSelect<TemplateFormValuesType>
					labelText={translations['templates.form_manage.label_type']}
					id={elementIds.type}
					fieldName="type"
					fieldValue={formValues.type}
					className="min-w-32"
					disabled={pending}
					options={types}
					onValueChange={(value) => handleChange('type', value)}
					error={errors.type}
				/>
			</div>

			{formValues.type === TemplateTypeEnum.EMAIL && (
				<>
					<FormComponentInput<TemplateFormValuesType>
						id={`${elementIds.content}-subject`}
						labelText={
							translations[
								'templates.form_manage.label_email_subject'
							]
						}
						fieldName="subject"
						fieldValue={formValues.subject ?? ''}
						isRequired={true}
						placeholderText="eg: Recover password"
						disabled={pending}
						onChange={(e) =>
							handleChange('subject', e.target.value)
						}
						error={errors.subject}
					/>

					<FormComponentSelect<TemplateFormValuesType>
						labelText={
							translations[
								'templates.form_manage.label_email_layout'
							]
						}
						id={`${elementIds.content}-layout`}
						fieldName="layout"
						fieldValue={formValues.layout}
						className="max-w-64"
						disabled={pending}
						options={emailLayouts}
						onValueChange={(value) => handleChange('layout', value)}
						error={errors.layout}
					/>

					<FormComponentTextarea<TemplateFormValuesType>
						id={`${elementIds.content}-html`}
						labelText={
							translations[
								'templates.form_manage.label_email_html'
							]
						}
						fieldName="html"
						fieldValue={formValues.html}
						isRequired={true}
						disabled={pending}
						onChange={(e) => handleChange('html', e.target.value)}
						error={errors.html}
						rows={6}
					/>
				</>
			)}

			{formValues.type === TemplateTypeEnum.PAGE && (
				<>
					<FormComponentInput<TemplateFormValuesType>
						id={`${elementIds.content}-title`}
						labelText={
							translations[
								'templates.form_manage.label_page_title'
							]
						}
						fieldName="title"
						fieldValue={formValues.title ?? ''}
						isRequired={true}
						placeholderText="eg: Terms & Conditions"
						disabled={pending}
						onChange={(e) => handleChange('title', e.target.value)}
						error={errors.title}
					/>

					<FormComponentSelect<TemplateFormValuesType>
						labelText={
							translations[
								'templates.form_manage.label_page_layout'
							]
						}
						id={`${elementIds.content}-layout`}
						fieldName="layout"
						fieldValue={formValues.layout}
						className="max-w-64"
						disabled={pending}
						options={emailLayouts}
						onValueChange={(value) => handleChange('layout', value)}
						error={errors.layout}
					/>

					<FormComponentTextarea<TemplateFormValuesType>
						id={`${elementIds.content}-html`}
						labelText={
							translations[
								'templates.form_manage.label_email_html'
							]
						}
						fieldName="html"
						fieldValue={formValues.html}
						isRequired={true}
						disabled={pending}
						onChange={(e) => handleChange('html', e.target.value)}
						error={errors.html}
						rows={11}
					/>
				</>
			)}
		</>
	);
}
