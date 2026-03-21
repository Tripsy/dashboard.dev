import { useMemo, useState } from 'react';
import {
	FormComponentInput,
	FormComponentRadio,
	FormComponentTextarea,
} from '@/components/form/form-element.component';
import type { FormManageType } from '@/config/data-source.config';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import {
	type PlaceContentInput,
	type PlaceFormValuesType,
	PlaceTypeEnum,
} from '@/models/place.model';
import { LanguageEnum } from '@/models/user.model';

const placeTypes = Object.values(PlaceTypeEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const languages = Object.values(LanguageEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export function FormManagePlace({
	formValues,
	errors,
	handleChange,
	pending,
}: FormManageType<PlaceFormValuesType>) {
	const elementIds = useElementIds([
		'placeType',
		'code',
		'parentId',
		'contents',
	]);

	const [contents, setContents] = useState<PlaceContentInput[]>(
		formValues.contents.length > 0
			? formValues.contents
			: [
					{
						language: LanguageEnum.EN,
						name: '',
						type_label: '',
					},
				],
	);

	const syncContents = (updated: PlaceContentInput[]) => {
		setContents(updated);
		handleChange('contents', updated);
	};

	const updateContentAt = (
		index: number,
		patch: Partial<PlaceContentInput>,
	) => {
		const updated = contents.map((c, i) =>
			i === index ? { ...c, ...patch } : c,
		);

		syncContents(updated);
	};

	const addContent = () => {
		const updated = [
			...contents,
			{
				language: LanguageEnum.EN,
				name: '',
				type_label: '',
			},
		];

		syncContents(updated);
	};

	const removeContent = (index: number) => {
		if (contents.length <= 1) {
			return;
		}

		const updated = contents.filter((_, i) => i !== index);

		syncContents(updated);
	};

	return (
		<>
			<FormComponentRadio<PlaceFormValuesType>
				labelText={translations['places.form_manage.label_type']}
				id={elementIds.placeType}
				fieldName="place_type"
				fieldValue={formValues.place_type}
				options={placeTypes}
				disabled={pending}
				onValueChange={(value) => handleChange('place_type', value)}
				error={errors.place_type}
			/>

			<FormComponentInput<PlaceFormValuesType>
				labelText={translations['places.form_manage.label_code']}
				id={elementIds.code}
				fieldName="code"
				fieldValue={formValues.code ?? ''}
				isRequired={false}
				disabled={pending}
				onChange={(e) => handleChange('code', e.target.value)}
				error={errors.code}
			/>

			<FormComponentInput<PlaceFormValuesType>
				labelText={translations['places.form_manage.label_parent_id']}
				id={elementIds.parentId}
				fieldName="parent_id"
				fieldValue={
					formValues.parent_id !== null &&
					formValues.parent_id !== undefined
						? String(formValues.parent_id)
						: ''
				}
				fieldType="number"
				isRequired={false}
				disabled={pending}
				onChange={(e) =>
					handleChange(
						'parent_id',
						e.target.value ? Number(e.target.value) : null,
					)
				}
				error={errors.parent_id}
			/>

			<div className="space-y-3">
				<p className="font-semibold">
					{translations['places.form_manage.label_contents']}
				</p>

				{contents.map((content, index) => {
					const contentId = `${elementIds.contents}-${index}`;

					return (
						<div
							key={contentId}
							className="rounded-md border border-line p-3 space-y-2"
						>
							<div className="flex flex-wrap gap-4">
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
												'places.form_manage.label_content_language'
											]
										}
									</option>
									{languages.map((lang) => (
										<option
											key={lang.value}
											value={lang.value}
										>
											{lang.label}
										</option>
									))}
								</select>
							</div>

							<FormComponentInput<PlaceFormValuesType>
								labelText={
									translations[
										'places.form_manage.label_content_name'
									]
								}
								id={`${contentId}-name`}
								fieldName={`contents[${index}][name]`}
								fieldValue={content.name}
								isRequired={true}
								disabled={pending}
								onChange={(e) =>
									updateContentAt(index, {
										name: e.target.value,
									})
								}
								error={undefined}
							/>

							<FormComponentInput<PlaceFormValuesType>
								labelText={
									translations[
										'places.form_manage.label_content_type_label'
									]
								}
								id={`${contentId}-type-label`}
								fieldName={`contents[${index}][type_label]`}
								fieldValue={content.type_label}
								isRequired={true}
								disabled={pending}
								onChange={(e) =>
									updateContentAt(index, {
										type_label: e.target.value,
									})
								}
								error={undefined}
							/>

							<button
								type="button"
								className="text-xs text-error hover:underline"
								onClick={() => removeContent(index)}
								disabled={pending || contents.length <= 1}
							>
								{
									translations[
										'places.form_manage.label_content_remove'
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
					{translations['places.form_manage.label_content_add']}
				</button>
			</div>
		</>
	);
}
