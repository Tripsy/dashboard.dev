export const CompanyVehicleStatusEnum = {
    IN_USE: 'in_use',
    DAMAGED: 'damaged',
    SOLD: 'sold',
    SCRAPPED: 'scrapped',
} as const;

export type CompanyVehicleStatus =
    (typeof CompanyVehicleStatusEnum)[keyof typeof CompanyVehicleStatusEnum];

export const CompanyVehicleScopeEnum = {
    PERSONAL: 'personal',
    OPERATIONAL: 'operational',
} as const;

export type CompanyVehicleScope =
    (typeof CompanyVehicleScopeEnum)[keyof typeof CompanyVehicleScopeEnum];

export type CompanyVehicleModel<D = Date | string> = {
    id: number;

    vehicle_id: number;

    status: CompanyVehicleStatus;
    scope: CompanyVehicleScope;

    vin: string;
    license_plate: string | null;

    notes: string | null;

    created_at: D;
    updated_at: D;
    deleted_at: D;
};

export type CompanyVehicleFormValuesType = Pick<
    CompanyVehicleModel,
    'vehicle_id' | 'status' | 'scope'
> & {
    vin: string | null;
    license_plate: string | null;
    notes: string | null;
};
