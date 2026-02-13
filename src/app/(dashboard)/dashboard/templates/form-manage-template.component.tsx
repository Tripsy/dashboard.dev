import React, { useMemo } from 'react';
import {
	FormComponentInput,
	FormComponentSelect,
	FormElement,
} from '@/components/form/form-element.component';
import { FormElementError } from '@/components/form/form-element-error.component';
import { Icons } from '@/components/icon.component';
import type { FormManageType } from '@/config/data-source.config';
import { cn } from '@/helpers/css.helper';
import { getNestedError } from '@/helpers/form.helper';
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
				'templates.form_manage.label_email_content_subject',
				'templates.form_manage.label_email_content_html',
				'templates.form_manage.label_email_content_layout',
				'templates.form_manage.label_page_content_title',
				'templates.form_manage.label_page_content_html',
				'templates.form_manage.label_page_content_layout',
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
						labelText={translations['templates.form_manage.label_email_content_subject']}
						fieldName="content[subject]"
						fieldValue={formValues.content.subject}
						isRequired={true}
						className="pl-8"
						placeholderText="eg: Recover password"
						disabled={pending}
						onChange={(e) => handleChange('content.subject', e.target.value)}
						error={getNestedError(errors, 'content.subject')}
						icons={{
							left: <Icons.Tag className="opacity-40 h-4.5 w-4.5" />,
						}}
					/>

					<FormComponentSelect<TemplateFormValuesType>
						labelText={translations['templates.form_manage.label_email_content_layout']}
						id={`${elementIds.content}-layout`}
						fieldName="content[layout]"
						fieldValue={formValues.content.layout}
						className="max-w-64"
						disabled={pending}
						options={emailLayouts}
						onValueChange={(value) => handleChange('content.layout', value)}
						error={getNestedError(errors, 'content.layout')}
					/>

					{/*<FormPart>*/}
					{/*	<FormElement*/}
					{/*		labelText={*/}
					{/*			translations[*/}
					{/*				'templates.form_manage.label_email_content_html'*/}
					{/*			]*/}
					{/*		}*/}
					{/*		labelFor={`${elementIds.content}-html`}*/}
					{/*	>*/}
					{/*		<div>*/}
					{/*			<InputTextarea*/}
					{/*				id={`${elementIds.content}-html`}*/}
					{/*				name="content[html]"*/}
					{/*				value={formValues.content.html ?? ''}*/}
					{/*				onChange={(e) =>*/}
					{/*					handleChange(*/}
					{/*						'content.html',*/}
					{/*						e.target.value ?? '',*/}
					{/*					)*/}
					{/*				}*/}
					{/*				style={{ width: '100%', height: '320px' }}*/}
					{/*			/>*/}
					{/*			<FormElementError*/}
					{/*				messages={getNestedError(*/}
					{/*					errors,*/}
					{/*					'content.html',*/}
					{/*				)}*/}
					{/*			/>*/}
					{/*		</div>*/}
					{/*	</FormElement>*/}
					{/*</FormPart>*/}

				</>
			)}

			{/*{formValues.type === TemplateTypeEnum.PAGE && (*/}
			{/*	<>*/}
			{/*		<FormComponentInput*/}
			{/*			labelText={*/}
			{/*				translations[*/}
			{/*					'templates.form_manage.label_page_content_title'*/}
			{/*				]*/}
			{/*			}*/}
			{/*			id={`${elementIds.content}-title`}*/}
			{/*			fieldName="content[title]"*/}
			{/*			fieldValue={formValues.content.title ?? ''}*/}
			{/*			placeholderText="eg: Terms & conditions"*/}
			{/*			disabled={pending}*/}
			{/*			onChange={(e) =>*/}
			{/*				handleChange('content.title', e.target.value)*/}
			{/*			}*/}
			{/*			error={getNestedError(errors, 'content.title')}*/}
			{/*		/>*/}

			{/*		<FormPart>*/}
			{/*			<FormElement*/}
			{/*				labelText={*/}
			{/*					translations[*/}
			{/*						'templates.form_manage.label_page_content_html'*/}
			{/*					]*/}
			{/*				}*/}
			{/*				labelFor={`${elementIds.content}-html`}*/}
			{/*			>*/}
			{/*				<div>*/}
			{/*					<InputTextarea*/}
			{/*						id={`${elementIds.content}-html`}*/}
			{/*						name="content[html]"*/}
			{/*						value={formValues.content.html ?? ''}*/}
			{/*						onChange={(e) =>*/}
			{/*							handleChange(*/}
			{/*								'content.html',*/}
			{/*								e.target.value ?? '',*/}
			{/*							)*/}
			{/*						}*/}
			{/*						style={{ width: '100%', height: '320px' }}*/}
			{/*					/>*/}
			{/*					<FormElementError*/}
			{/*						messages={getNestedError(*/}
			{/*							errors,*/}
			{/*							'content.html',*/}
			{/*						)}*/}
			{/*					/>*/}
			{/*				</div>*/}
			{/*			</FormElement>*/}
			{/*		</FormPart>*/}

			{/*		<FormComponentSelect*/}
			{/*			labelText={*/}
			{/*				translations[*/}
			{/*					'templates.form_manage.label_page_content_layout'*/}
			{/*				]*/}
			{/*			}*/}
			{/*			id={`${elementIds.content}-layout`}*/}
			{/*			fieldName="content[layout]"*/}
			{/*			fieldValue={formValues.content.layout}*/}
			{/*			options={emailLayouts}*/}
			{/*			disabled={pending}*/}
			{/*			onChange={(e) =>*/}
			{/*				handleChange('content.layout', e.target.value)*/}
			{/*			}*/}
			{/*			error={getNestedError(errors, 'content.layout')}*/}
			{/*		/>*/}
			{/*	</>*/}
			{/*)}*/}
		</>
	);
}
