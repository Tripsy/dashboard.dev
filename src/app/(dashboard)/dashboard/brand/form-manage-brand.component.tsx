import { useState } from 'react';
import {
	FormComponentInput,
	FormComponentRadio,
} from '@/components/form/form-element.component';
import { Icons } from '@/components/icon.component';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Configuration } from '@/config/settings.config';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import {
	type BrandContent,
	type BrandFormValuesType,
	type BrandType,
	BrandTypeEnum,
} from '@/models/brand.model';
import { useWindowForm } from '@/providers/window-form.provider';
import { type Language, LanguageEnum } from '@/types/common.type';
import type { PageMeta } from '@/types/page-meta.type';

const languages = Object.values(LanguageEnum);

const brandTypes = toOptionsFromEnum(BrandTypeEnum, {
	formatter: formatEnumLabel,
});

export function FormManageBrand() {
	const { formValues, errors, handleChange, pending } =
		useWindowForm<BrandFormValuesType>();

	const elementIds = useElementIds([
		'brandType',
		'name',
		'parent',
		'contents',
	] as const);

	// Derive map from formValues
	const [contentsMap, setContentsMap] = useState<
		Partial<Record<Language, BrandContent>>
	>(
		() =>
			Object.fromEntries(
				(formValues.contents ?? []).map((m) => [m.language, m]),
			) as Partial<Record<Language, BrandContent>>,
	);

	const handleContentChange = (
		language: Language,
		field: keyof BrandContent,
		value: string,
	) => {
		const updated = {
			...contentsMap,
			[language]: {
				...contentsMap[language],
				language,
				[field]: value,
			},
		};

		setContentsMap(updated);

		// Sync back to formValues as array
		handleChange(
			'contents',
			Object.values(updated).filter((m): m is BrandContent => !!m),
		);
	};

	const handleMetaChange = (
		language: Language,
		field: keyof PageMeta,
		value: string,
	) => {
		const updated = {
			...contentsMap,
			[language]: {
				...contentsMap[language],
				language,
				meta: {
					...contentsMap[language]?.meta,
					[field]: value,
				},
			},
		};

		setContentsMap(updated);

		handleChange(
			'contents',
			Object.values(updated).filter((c): c is BrandContent => !!c),
		);
	};

	return (
		<>
			<FormComponentRadio<BrandFormValuesType>
				labelText="Type"
				id={elementIds.brandType}
				fieldName="brand_type"
				fieldValue={formValues.brand_type}
				options={brandTypes}
				disabled={pending}
				onChange={(value) =>
					handleChange('brand_type', value as BrandType)
				}
				error={errors.brand_type}
			/>

			<FormComponentInput<BrandFormValuesType>
				id={elementIds.name}
				labelText="Name"
				fieldName="name"
				fieldValue={formValues.name ?? ''}
				className="pl-8"
				isRequired={true}
				placeholderText="eg: RO"
				icons={{
					left: <Icons.Brand className="opacity-40 h-4.5 w-4.5" />,
				}}
				disabled={pending}
				onChange={(e) => handleChange('name', e.target.value)}
				error={errors.name}
			/>

			<input
				type="hidden"
				name="contents"
				value={JSON.stringify(
					Object.values(formValues.contents).filter(
						Boolean,
					) as BrandContent[],
				)}
			/>
			<Tabs defaultValue={Configuration.language()} className="w-full">
				<div className="flex items-center justify-center border-b border-line pb-2 mb-4">
					<h3 className="font-bold whitespace-nowrap">
						Language specific
					</h3>
					<TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
						{languages.map((language) => (
							<TabsTrigger key={language} value={language}>
								{language.toUpperCase()}
							</TabsTrigger>
						))}
					</TabsList>
				</div>
				{languages.map((language) => {
					const findIndex = formValues.contents.findIndex(
						(c) => c.language === language,
					);
					const contentIndex =
						findIndex === -1 &&
						language === Configuration.language()
							? 0
							: findIndex;

					return (
						<TabsContent key={`form-${language}`} value={language}>
							<div className="form-section">
								<FormComponentInput<BrandContent>
									id={`${elementIds.contents}-${language}-description`}
									labelText="Description"
									fieldName="description"
									fieldValue={
										contentsMap[language]?.description ?? ''
									}
									disabled={pending}
									onChange={(e) =>
										handleContentChange(
											language,
											'description',
											e.target.value,
										)
									}
									error={
										contentIndex >= 0
											? errors.contents?.[contentIndex]
													?.description
											: undefined
									}
								/>

								<FormComponentInput<PageMeta>
									id={`${elementIds.contents}-${language}-meta-title`}
									labelText="Meta Title"
									fieldName="title"
									fieldValue={
										contentsMap[language]?.meta?.title ?? ''
									}
									disabled={pending}
									onChange={(e) =>
										handleMetaChange(
											language,
											'title',
											e.target.value,
										)
									}
									error={
										contentIndex >= 0
											? errors.contents?.[contentIndex]
													?.meta?.title
											: undefined
									}
								/>

								<FormComponentInput<PageMeta>
									id={`${elementIds.contents}-${language}-meta-description`}
									labelText="Meta Description"
									fieldName="description"
									fieldValue={
										contentsMap[language]?.meta
											?.description ?? ''
									}
									disabled={pending}
									onChange={(e) =>
										handleMetaChange(
											language,
											'description',
											e.target.value,
										)
									}
									error={
										contentIndex >= 0
											? errors.contents?.[contentIndex]
													?.meta?.description
											: undefined
									}
								/>

								<FormComponentInput<PageMeta>
									id={`${elementIds.contents}-${language}-meta-keywords`}
									labelText="Meta Keywords"
									fieldName="keywords"
									fieldValue={
										contentsMap[language]?.meta?.keywords ??
										''
									}
									disabled={pending}
									onChange={(e) =>
										handleMetaChange(
											language,
											'keywords',
											e.target.value,
										)
									}
									error={
										contentIndex >= 0
											? errors.contents?.[contentIndex]
													?.meta?.keywords
											: undefined
									}
								/>
							</div>
						</TabsContent>
					);
				})}
			</Tabs>
		</>
	);
}
