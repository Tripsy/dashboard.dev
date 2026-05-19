import { useState } from 'react';
import {
	FormComponentAutoComplete,
	FormComponentInput,
} from '@/components/form/form-element.component';
import { Icons } from '@/components/icon.component';
import { requestFind } from '@/helpers/services.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useRemoteAutocomplete } from '@/hooks/use-remote-autocomplete';
import {
	type CompanyVehicleModel,
	CompanyVehicleScopeEnum,
	CompanyVehicleStatusEnum,
	displayCompanyVehicleLabel,
} from '@/models/company-vehicle.model';
import { useWindowForm } from '@/providers/window-form.provider';
import type { FindFunctionResponseType } from '@/types/action.type';

export type OperationalRecordFormValuesType = {
	cash_flow_id: number | null;

	client_id: number | null;
	client: string | null;

	user_id: number | null;
	user: string | null;

	company_vehicle_id: number | null;
	company_vehicle: string | null;

	cmr_id: number | null;
	cmr: string | null;

	notes: string | null;
};

export function FormManageOperationalRecord() {
	const { formValues, errors, handleChange, pending } =
		useWindowForm<OperationalRecordFormValuesType>();

	const elementIds = useElementIds([
		'client',
		'user',
		'company_vehicle',
		'cmr',
		'notes',
	] as const);

	const [searchCompanyVehicle, setSearchCompanyVehicle] = useState('');

	const {
		suggestions: companyVehicleSuggestions,
		isFetching: isCompanyVehicleFetching,
	} = useRemoteAutocomplete<CompanyVehicleModel>({
		query: searchCompanyVehicle,
		queryKey: ['s-company-vehicle'],
		queryFn: async (q) => {
			const res:
				| FindFunctionResponseType<CompanyVehicleModel>
				| undefined = await requestFind('company-vehicle', {
				filter: {
					term: q,
					scope: CompanyVehicleScopeEnum.OPERATIONAL,
					status: CompanyVehicleStatusEnum.IN_USE,
				},
				limit: 10,
			});

			return res?.entries ?? [];
		},
		minLength: 3,
	});

	return (
		<>
			<input
				type="hidden"
				name="work_session_id"
				value={formValues.work_session_id ?? ''}
			/>

			<input
				type="hidden"
				name="company_vehicle_id"
				value={formValues.company_vehicle_id ?? ''}
			/>

			<input
				type="hidden"
				name="vehicle_type"
				value={formValues.vehicle_type ?? ''}
			/>

			<FormComponentAutoComplete<
				OperationalRecordFormValuesType,
				CompanyVehicleModel
			>
				labelText="Vehicle"
				id={elementIds.company_vehicle}
				fieldName="company_vehicle"
				fieldValue={formValues.company_vehicle ?? ''}
				className="pl-8"
				isRequired={true}
				disabled={pending}
				error={errors.company_vehicle}
				onInputChange={(value) => {
					handleChange('company_vehicle', value);
					handleChange('company_vehicle_id', null);
					setSearchCompanyVehicle(value);
				}}
				autoCompleteProps={{
					suggestions: companyVehicleSuggestions,
					isLoading: isCompanyVehicleFetching,
					onSelect: (m) => {
						handleChange(
							'company_vehicle',
							displayCompanyVehicleLabel(m),
						);
						handleChange('company_vehicle_id', m.id);
						handleChange('vehicle_type', m.vehicle.vehicle_type);
					},
					getOptionLabel: (m) => displayCompanyVehicleLabel(m),
					getOptionKey: (m) => m.id,
				}}
				icons={{
					left: (
						<Icons.CompanyVehicle className="opacity-40 h-4.5 w-4.5" />
					),
				}}
			/>

			{formValues.vehicle_type !== VehicleTypeEnum.TRAILER && (
				<div className="flex flex-wrap gap-2">
					<FormComponentInput<OperationalRecordFormValuesType>
						labelText="Start Km"
						id={elementIds.vehicle_km_start}
						fieldName="vehicle_km_start"
						fieldType="number"
						fieldValue={formValues.vehicle_km_start ?? null}
						disabled={pending}
						onChange={(e) =>
							handleChange(
								'vehicle_km_start',
								e.target.value === ''
									? null
									: Number(e.target.value),
							)
						}
						error={errors.vehicle_km_start}
					/>
					<FormComponentInput<OperationalRecordFormValuesType>
						labelText="End Km"
						id={elementIds.vehicle_km_end}
						fieldName="vehicle_km_end"
						fieldType="number"
						fieldValue={formValues.vehicle_km_end ?? null}
						disabled={pending}
						onChange={(e) =>
							handleChange(
								'vehicle_km_end',
								e.target.value === ''
									? null
									: Number(e.target.value),
							)
						}
						error={errors.vehicle_km_end}
					/>
				</div>
			)}
		</>
	);
}
