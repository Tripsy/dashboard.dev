import { useState } from 'react';
import {
	FormComponentAutoComplete,
	FormComponentInput,
	FormComponentRadio,
} from '@/components/form/form-element.component';
import { Icons } from '@/components/icon.component';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { requestFind } from '@/helpers/services.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useRemoteAutocomplete } from '@/hooks/use-remote-autocomplete';
import { type BrandModel, BrandTypeEnum } from '@/models/brand.model';
import {
	type VehicleFormValuesType,
	type VehicleType,
	VehicleTypeEnum,
} from '@/models/vehicle.model';
import { useWindowForm } from '@/providers/window-form.provider';
import { useModalStore } from '@/stores/window.store';
import type { FindFunctionResponseType } from '@/types/action.type';

const vehicleTypes = toOptionsFromEnum(VehicleTypeEnum, {
	formatter: formatEnumLabel,
});

export function FormManageVehicle() {
	const { formValues, errors, handleChange, pending } =
		useWindowForm<VehicleFormValuesType>();

	const { open, focus, getCurrentWindow } = useModalStore();

	const window = getCurrentWindow();

	const elementIds = useElementIds([
		'vehicle_type',
		'brand',
		'model',
		'length',
		'width',
		'height',
		'weight',
	] as const);

	const [searchBrand, setSearchBrand] = useState('');

	const { suggestions: brandSuggestions, isFetching: isBrandsFetching } =
		useRemoteAutocomplete<BrandModel>({
			query: searchBrand,
			queryKey: ['s-brand'],
			queryFn: async (q) => {
				const res: FindFunctionResponseType<BrandModel> | undefined =
					await requestFind('brands', {
						filter: { term: q },
						limit: 10,
					});

				return res?.entries ?? [];
			},
			minLength: 3,
		});

	return (
		<>
			<FormComponentRadio<VehicleFormValuesType>
				labelText="Vehicle Type"
				id={elementIds.vehicle_type}
				fieldName="vehicle_type"
				fieldValue={formValues.vehicle_type}
				options={vehicleTypes}
				disabled={pending}
				onChange={(value) =>
					handleChange('vehicle_type', value as VehicleType)
				}
				error={errors.vehicle_type}
			/>

			<input
				type="hidden"
				name="brand_id"
				value={formValues.brand_id ?? ''}
			/>

			<FormComponentAutoComplete<VehicleFormValuesType, BrandModel>
				labelText="Brand"
				id={elementIds.brand}
				fieldName="brand"
				fieldValue={formValues.brand ?? ''}
				className="pl-8"
				isRequired={true}
				disabled={pending}
				error={errors.brand}
				onInputChange={(value) => {
					handleChange('brand', value);
					handleChange('brand_id', null);
					setSearchBrand(value);
				}}
				autoCompleteProps={{
					suggestions: brandSuggestions,
					isLoading: isBrandsFetching,
					onSelect: (b) => {
						handleChange('brand', b.name);
						handleChange('brand_id', b.id);
					},
					getOptionLabel: (b) => b.name,
					getOptionKey: (b) => b.id,

					allowCreate: true,

					onCreate: (value) => {
						open<BrandModel>({
							section: 'dashboard',
							dataSource: 'brands',
							action: 'create',
							minimized: false,
							data: {
								prefillEntry: {
									brand_type: BrandTypeEnum.VEHICLE,
									name: value,
								},
							},
							events: {
								success: (brand?: BrandModel) => {
									if (!brand) {
										return;
									}

									handleChange('brand', brand.name);
									handleChange('brand_id', brand.id);

									// Back to vehicle form
									if (window) {
										focus(window.uid);
									}
								},
							},
							props: {
								size: 'x2l',
							},
						});
					},
					createLabel: (value) => `Create brand "${value}"`,
				}}
				icons={{
					left: <Icons.Brand className="opacity-40 h-4.5 w-4.5" />,
				}}
			/>

			<FormComponentInput<VehicleFormValuesType>
				labelText="Model"
				id={elementIds.model}
				fieldName="model"
				fieldValue={formValues.model ?? ''}
				isRequired={true}
				placeholderText="e.g.: Logan"
				disabled={pending}
				onChange={(e) => handleChange('model', e.target.value)}
				error={errors.model}
			/>

			<div className="flex flex-wrap gap-2">
				<FormComponentInput<VehicleFormValuesType>
					labelText="Length (mm)"
					id={elementIds.length}
					fieldName="length"
					fieldType="number"
					step={1}
					fieldValue={formValues.length ?? null}
					disabled={pending}
					onChange={(e) =>
						handleChange('length', Number(e.target.value))
					}
					error={errors.length}
				/>
				<FormComponentInput<VehicleFormValuesType>
					labelText="Width (mm)"
					id={elementIds.width}
					fieldName="width"
					fieldType="number"
					step={1}
					fieldValue={formValues.width ?? null}
					disabled={pending}
					onChange={(e) =>
						handleChange('width', Number(e.target.value))
					}
					error={errors.width}
				/>
			</div>
			<div className="flex flex-wrap gap-2">
				<FormComponentInput<VehicleFormValuesType>
					labelText="Height (mm)"
					id={elementIds.height}
					fieldName="height"
					fieldType="number"
					step={1}
					fieldValue={formValues.height ?? null}
					disabled={pending}
					onChange={(e) =>
						handleChange('height', Number(e.target.value))
					}
					error={errors.height}
				/>
				<FormComponentInput<VehicleFormValuesType>
					labelText="Weight (kg)"
					id={elementIds.weight}
					fieldName="weight"
					fieldType="number"
					step={1}
					fieldValue={formValues.weight ?? null}
					disabled={pending}
					onChange={(e) =>
						handleChange('weight', Number(e.target.value))
					}
					error={errors.weight}
				/>
			</div>
		</>
	);
}
