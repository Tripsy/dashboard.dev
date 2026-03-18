import { useMemo } from 'react';
import {
	FormComponentInput,
	FormComponentRadio,
	FormComponentTextarea,
} from '@/components/form/form-element.component';
import type { FormManageType } from '@/config/data-source.config';
import { capitalizeFirstLetter, toKebabCase } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import {
	type BrandContentInput,
	type BrandFormValuesType,
	BrandStatusEnum,
	BrandTypeEnum,
} from '@/models/brand.model';
import { LanguageEnum } from '@/models/user.model';

const statuses = Object.values(BrandStatusEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const types = Object.values(BrandTypeEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const languages = Object.values(LanguageEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export function FormManageBrand({
	formValues,
	errors,
	handleChange,
	pending,
}: FormManageType<BrandFormValuesType>) {
	const elementIds = useElementIds([
		'name',
		'slug',
		'status',
		'type',
		'sortOrder',
		'details',
		'contents',
	]);

	const contents: BrandContentInput[] =
		formValues.contents && formValues.contents.length > 0
			? formValues.contents
			: [
					{
						language: LanguageEnum.EN,
						description: '',
					},
				];

	const setContents = (updated: BrandContentInput[]) => {
		handleChange('contents', updated);
	};

	const updateContentAt = (
		index: number,
		patch: Partial<BrandContentInput>,
	) => {
		const updated = contents.map((c, i) =>
			i === index ? { ...c, ...patch } : c,
		);

		setContents(updated);
	};

	const addContent = () => {
		const updated = [
			...contents,
			{
				language: LanguageEnum.EN,
				description: '',
			},
		];

		setContents(updated);
	};

	const removeContent = (index: number) => {
		if (contents.length <= 1) {
			return;
		}

		const updated = contents.filter((_, i) => i !== index);

		setContents(updated);
	};

	return (
		<>
			<FormComponentInput<BrandFormValuesType>
				labelText={translations['brands.form_manage.label_name']}
				id={elementIds.name}
				fieldName="name"
				fieldValue={formValues.name}
				isRequired={true}
				disabled={pending}
				onChange={(e) => {
					const value = e.target.value;

					handleChange('name', value);
					if (!formValues.slug) {
						handleChange('slug', toKebabCase(value));
					}
				}}
				error={errors.name}
			/>

			<FormComponentInput<BrandFormValuesType>
				labelText={translations['brands.form_manage.label_slug']}
				id={elementIds.slug}
				fieldName="slug"
				fieldValue={formValues.slug}
				isRequired={true}
				disabled={pending}
				onChange={(e) =>
					handleChange('slug', toKebabCase(e.target.value))
				}
				error={errors.slug}
			/>

			<div className="flex flex-wrap gap-4">
				<FormComponentRadio<BrandFormValuesType>
					labelText={translations['brands.form_manage.label_status']}
					id={elementIds.status}
					fieldName="status"
					fieldValue={formValues.status}
					options={statuses}
					disabled={pending}
					onValueChange={(value) =>
						handleChange('status', value as BrandStatusEnum)
					}
					error={errors.status}
				/>

				<FormComponentRadio<BrandFormValuesType>
					labelText={translations['brands.form_manage.label_type']}
					id={elementIds.type}
					fieldName="type"
					fieldValue={formValues.type}
					options={types}
					disabled={pending}
					onValueChange={(value) =>
						handleChange('type', value as BrandTypeEnum)
					}
					error={errors.type}
				/>
			</div>

			<FormComponentInput<BrandFormValuesType>
				labelText={translations['brands.form_manage.label_sort_order']}
				id={elementIds.sortOrder}
				fieldName="sort_order"
				fieldValue={String(formValues.sort_order)}
				fieldType="number"
				isRequired={false}
				disabled={pending}
				onChange={(e) =>
					handleChange(
						'sort_order',
						e.target.value ? Number(e.target.value) : 0,
					)
				}
				error={errors.sort_order}
			/>

			<FormComponentTextarea<BrandFormValuesType>
				labelText={translations['brands.form_manage.label_details']}
				id={elementIds.details}
				fieldName="details"
				fieldValue={
					formValues.details
						? JSON.stringify(formValues.details, null, 2)
						: ''
				}
				isRequired={false}
				disabled={pending}
				onChange={(e) => {
					try {
						const value = e.target.value
							? (JSON.parse(e.target.value) as Record<
									string,
									string | number | boolean
								>)
							: null;

						handleChange('details', value);
					} catch {
						handleChange('details', formValues.details);
					}
				}}
				error={errors.details}
				rows={4}
			/>

			<div className="space-y-3">
				<p className="font-semibold">
					{translations['brands.form_manage.label_contents']}
				</p>

				{contents.map((content, index) => {
					const contentId = `${elementIds.contents}-${index}`;

					return (
						<div
							key={contentId}
							className="rounded-md border border-line p-3 space-y-2"
						>
							<select
								className="min-w-32 rounded border border-input bg-background px-3 py-2 text-sm"
								value={content.language}
								disabled={pending}
								onChange={(e) =>
									updateContentAt(index, {
										language: e.target.value,
									})
								}
							>
								<option value="" disabled>
									{
										translations[
											'brands.form_manage.label_content_language'
										]
									}
								</option>
								{languages.map((lang) => (
									<option key={lang.value} value={lang.value}>
										{lang.label}
									</option>
								))}
							</select>

							<FormComponentTextarea<BrandFormValuesType>
								labelText={
									translations[
										'brands.form_manage.label_content_description'
									]
								}
								id={`${contentId}-description`}
								fieldName={`contents[${index}][description]`}
								fieldValue={content.description ?? ''}
								isRequired={false}
								disabled={pending}
								onChange={(e) =>
									updateContentAt(index, {
										description: e.target.value,
									})
								}
								error={undefined}
								rows={3}
							/>

							<button
								type="button"
								className="text-xs text-error hover:underline"
								onClick={() => removeContent(index)}
								disabled={pending || contents.length <= 1}
							>
								{
									translations[
										'brands.form_manage.label_content_remove'
									]
								}
							</button>
						</div>
					);
				})}

				<button
					type="button"
					className="text-xs text-info hover:underline"
					onClick={addContent}
					disabled={pending}
				>
					{translations['brands.form_manage.label_content_add']}
				</button>
			</div>
		</>
	);
}
