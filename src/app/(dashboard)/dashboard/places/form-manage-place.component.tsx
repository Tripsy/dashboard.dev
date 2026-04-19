import { useRef, useState } from 'react';
import {
	FormComponentAutoComplete,
	FormComponentInput,
	FormComponentRadio,
} from '@/components/form/form-element.component';
import { Icons } from '@/components/icon.component';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { requestFind } from '@/helpers/services.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useRemoteAutocomplete } from '@/hooks/use-remote-autocomplete';
import {
	displayPlaceLabel,
	getParentPlaceType,
	type PlaceContent,
	type PlaceFormValuesType,
	type PlaceModel,
	PlaceTypeEnum,
} from '@/models/place.model';
import { LANGUAGE_DEFAULT, LanguageEnum } from '@/models/user.model';
import { useWindowForm } from '@/providers/window-form.provider';
import type { FindFunctionResponseType } from '@/types/action.type';

const languages = Object.values(LanguageEnum);

const placeTypes = toOptionsFromEnum(PlaceTypeEnum, {
	formatter: formatEnumLabel,
});

export function FormManagePlace() {
	const { formValues, errors, handleChange, pending } =
		useWindowForm<PlaceFormValuesType>();

	const elementIds = useElementIds([
		'placeType',
		'code',
		'parent',
		'contents',
	]);

	const previousParentsRef = useRef<
		Partial<
			Record<
				PlaceTypeEnum,
				{ parent: string | null; parent_id: number | null }
			>
		>
	>({});

	const handlePlaceTypeChange = (value: PlaceTypeEnum) => {
		if (formValues.parent_id) {
			previousParentsRef.current[formValues.place_type] = {
				parent: formValues.parent,
				parent_id: formValues.parent_id,
			};
		}

		// Restore selection if was set previously
		const previous = previousParentsRef.current[value];

		handleChange('place_type', value);
		handleChange('parent', previous?.parent ?? null);
		handleChange('parent_id', previous?.parent_id ?? null);
		setSearchParentPlaces('');
	};

	const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_DEFAULT);
	const [searchParentPlaces, setSearchParentPlaces] = useState('');

	const parentPlaceType = getParentPlaceType(formValues.place_type);

	const {
		suggestions: parentPlacesSuggestions,
		isFetching: isParentPlacesFetching,
	} = useRemoteAutocomplete<PlaceModel>({
		query: parentPlaceType ? searchParentPlaces : '', // Do not query if no parent type
		queryKey: ['s-parent-places', parentPlaceType],
		queryFn: async (q) => {
			const res: FindFunctionResponseType<PlaceModel> | undefined =
				await requestFind('places', {
					filter: { term: q, place_type: parentPlaceType },
					limit: 10,
				});

			return res?.entries ?? [];
		},
		minLength: 3,
	});

	// Derive map from formValues
	const [contentsMap, setContentsMap] = useState<
		Partial<Record<LanguageEnum, PlaceContent>>
	>(
		() =>
			Object.fromEntries(
				(formValues.contents ?? []).map((c) => [c.language, c]),
			) as Partial<Record<LanguageEnum, PlaceContent>>,
	);

	// // Sync contentsMap when formValues.contents is updated from outside (e.g. reloaded entry)
	// const prevContentsRef = useRef(formValues.contents);
	//
	// if (prevContentsRef.current !== formValues.contents) {
	// 	prevContentsRef.current = formValues.contents;
	//
	// 	setContentsMap(
	// 		Object.fromEntries(
	// 			(formValues.contents ?? []).map((c) => [c.language, c])
	// 		) as Partial<Record<LanguageEnum, PlaceContent>>
	// 	);
	// }

	const handleContentChange = (
		language: LanguageEnum,
		field: keyof PlaceContent,
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
			Object.values(updated).filter((c): c is PlaceContent => !!c),
		);
	};

	return (
		<>
			<FormComponentRadio<PlaceFormValuesType>
				labelText="Type"
				id={elementIds.placeType}
				fieldName="place_type"
				fieldValue={formValues.place_type}
				options={placeTypes}
				disabled={pending}
				onChange={(value) =>
					handlePlaceTypeChange(value as PlaceTypeEnum)
				}
				error={errors.place_type}
			/>

			<FormComponentInput<PlaceFormValuesType>
				id={elementIds.code}
				labelText="Code"
				fieldName="code"
				fieldValue={formValues.code ?? ''}
				className="pl-8"
				isRequired={true}
				placeholderText="eg: RO"
				icons={{
					left: <Icons.Code className="opacity-40 h-4.5 w-4.5" />,
				}}
				disabled={pending}
				onChange={(e) => handleChange('code', e.target.value)}
				error={errors.code}
			/>

			{parentPlaceType && (
				<>
					<input
						type="hidden"
						name="parent_id"
						value={formValues.parent_id ?? ''}
					/>
					<FormComponentAutoComplete<PlaceFormValuesType, PlaceModel>
						labelText="Parent"
						id={elementIds.parent}
						fieldName="parent"
						fieldValue={formValues.parent ?? ''}
						className="pl-8"
						isRequired={false}
						disabled={pending}
						error={errors.parent}
						onInputChange={(value) => {
							handleChange('parent', value);
							handleChange('parent_id', null);
							setSearchParentPlaces(value);
						}}
						autoCompleteProps={{
							suggestions: parentPlacesSuggestions,
							isLoading: isParentPlacesFetching,
							onSelect: (p) => {
								handleChange(
									'parent',
									displayPlaceLabel(p, selectedLanguage),
								);
								handleChange('parent_id', p.id);
							},
							getOptionLabel: (p) =>
								displayPlaceLabel(p, selectedLanguage),
							getOptionKey: (p) => p.id,
						}}
						icons={{
							left: (
								<Icons.Location className="opacity-40 h-4.5 w-4.5" />
							),
						}}
					/>
				</>
			)}

			<input
				type="hidden"
				name="contents"
				value={JSON.stringify(
					Object.values(formValues.contents).filter(
						Boolean,
					) as PlaceContent[],
				)}
			/>
			<Tabs
				defaultValue={LANGUAGE_DEFAULT}
				onValueChange={(value) =>
					setSelectedLanguage(value as LanguageEnum)
				}
				className="w-full"
			>
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
					const contentIndex = formValues.contents.findIndex(
						(c) => c.language === language,
					);

					return (
						<TabsContent key={`form-${language}`} value={language}>
							<div className="form-section">
								<FormComponentInput<PlaceContent>
									id={`${elementIds.contents}-${language}-name`}
									labelText="Name"
									fieldName="name"
									fieldValue={
										contentsMap[language]?.name ?? ''
									}
									isRequired={true}
									disabled={pending}
									onChange={(e) =>
										handleContentChange(
											language,
											'name',
											e.target.value,
										)
									}
									error={
										contentIndex >= 0
											? errors.contents?.[contentIndex]
													?.name
											: undefined
									}
								/>

								<FormComponentInput<PlaceContent>
									id={`${elementIds.contents}-${language}-type_label`}
									labelText="Type Label"
									fieldName="type_label"
									fieldValue={
										contentsMap[language]?.type_label ?? ''
									}
									isRequired={true}
									disabled={pending}
									onChange={(e) =>
										handleContentChange(
											language,
											'type_label',
											e.target.value,
										)
									}
									error={
										contentIndex >= 0
											? errors.contents?.[contentIndex]
													?.type_label
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
