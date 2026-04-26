export const CmrStatusEnum = {
    ORDERED: 'ordered',
    PREPARING: 'preparing',
    TRANSIT: 'transit',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    DELAYED: 'delayed',
} as const;

export type CmrStatus =
    (typeof CmrStatusEnum)[keyof typeof CmrStatusEnum];

export const CmrTransportTypeEnum = {
    DOMESTIC: 'domestic',
    INTERNATIONAL: 'international',
} as const;

export type CmrTransportType =
    (typeof CmrTransportTypeEnum)[keyof typeof CmrTransportTypeEnum];

export type CmrModel<D = Date | string> = {
    id: number;

    status: CmrStatus;
    transport_type: CmrTransportType;

    client_id: number;
    pickup_address_id: number;
    delivery_address_id: number;

    // tracking
    tracking_number: string;
    tracking_url: string | null;

    // contact
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;

    // dates
    ordered_at: D | null;
    pick_scheduled_at: D | null;
    estimated_delivery_at: D | null;
    delivered_at: D | null;

    // other
    notes: string | null;

    // client related
    signed_at: D | null;
    signed_by: string | null;
    signed_data: string | null;

    created_at: D;
    updated_at: D;
    deleted_at: D;
};

export type CmrFormValuesType = Pick<
    CmrModel,
    | 'status'
    | 'transport_type'
    | 'client_id'
    | 'pickup_address_id'
    | 'delivery_address_id'
> & {
    tracking_number: string | null;
    tracking_url: string | null;

    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;

    ordered_at: string | null;
    pick_scheduled_at: string | null;
    estimated_delivery_at: string | null;
    delivered_at: string | null;

    notes: string | null;

    signed_at: string | null;
    signed_by: string | null;
    signed_data: string | null;
};
