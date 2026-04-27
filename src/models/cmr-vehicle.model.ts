export type CmrVehicleModel<D = Date | string> = {
	id: number;

	cmr_id: number;
	vehicle_id: number;

	vin: string | null;
	license_plate: string | null;

	notes: string | null;

	created_at: D;
	updated_at: D | null;
};

export type CmrVehicleFormValuesType = Pick<
	CmrVehicleModel,
	'cmr_id' | 'vehicle_id'
> & {
	vin: string | null;
	license_plate: string | null;
	notes: string | null;
};
