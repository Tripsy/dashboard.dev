export const OperationalRecordStatusEnum = {
    DRAFT: 'draft',
    RECORDED: 'recorded',
} as const;

export type OperationalRecordStatus =
    (typeof OperationalRecordStatusEnum)[keyof typeof OperationalRecordStatusEnum];

export type OperationalRecordModel<D = Date | string> = {
    id: number;

    cash_flow_id: number;

    status: OperationalRecordStatus;

    cmr_id: number | null;
    driver_id: number | null;
    company_vehicle_id: number | null;
    client_id: number | null;

    recorded_at: D;

    notes: string | null;

    created_at: D;
    updated_at: D;
    deleted_at: D;
};

export type OperationalRecordFormValuesType = Pick<
    OperationalRecordModel,
    | 'cash_flow_id'
    | 'status'
    | 'cmr_id'
    | 'driver_id'
    | 'company_vehicle_id'
    | 'client_id'
> & {
    recorded_at: string | null;
    notes: string | null;
};
