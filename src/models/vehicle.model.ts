export const VehicleStatusEnum = {
    DRAFT: 'draft',
    VERIFIED: 'verified',
} as const;

export type VehicleStatus =
    (typeof VehicleStatusEnum)[keyof typeof VehicleStatusEnum];

export const VehicleTypeEnum = {
    AUTO: 'auto',
    MOTO: 'moto',
    TRAILER: 'trailer',
} as const;

export type VehicleType =
    (typeof VehicleTypeEnum)[keyof typeof VehicleTypeEnum];

export type VehicleModel<D = Date | string> = {
    id: number;

    brand_id: number | null;
    model: string;

    vehicle_type: VehicleType;
    status: VehicleStatus;

    // details
    length: number | null;
    width: number | null;
    height: number | null;
    weight: number | null;

    created_at: D;
    updated_at: D;
    deleted_at: D;
};

export type VehicleFormValuesType = Pick<
    VehicleModel,
    'brand_id' | 'vehicle_type' | 'status'
> & {
    model: string | null;
    length: number | null;
    width: number | null;
    height: number | null;
    weight: number | null;
};
