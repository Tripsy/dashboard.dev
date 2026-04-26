export const WorkSessionVehicleStatusEnum = {
    ASSIGNED: 'assigned',
    RETURNED: 'returned',
} as const;

export type WorkSessionVehicleStatus =
    (typeof WorkSessionVehicleStatusEnum)[keyof typeof WorkSessionVehicleStatusEnum];

export type WorkSessionVehicleModel<D = Date | string> = {
    id: number;

    work_session_id: number;
    company_vehicle_id: number;

    vehicle_km_start: number;
    vehicle_km_end: number | null;

    status: WorkSessionVehicleStatus;

    // dates
    assigned_at: D;
    returned_at: D | null;

    // other
    notes: string | null;

    created_at: D;
    updated_at: D | null;
};

export type WorkSessionVehicleFormValuesType = Pick<
    WorkSessionVehicleModel,
    'work_session_id' | 'company_vehicle_id' | 'status'
> & {
    vehicle_km_start: number | null;
    vehicle_km_end: number | null;

    assigned_at: string | null;
    returned_at: string | null;

    notes: string | null;
};
