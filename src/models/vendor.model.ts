import type { StatusTransitions } from '@/types/common.type';

export const VendorStatusEnum = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	PENDING: 'pending',
} as const;

export type VendorStatus =
	(typeof VendorStatusEnum)[keyof typeof VendorStatusEnum];

// Allowed status transition configuration
export const STATUS_TRANSITIONS: StatusTransitions<VendorStatus> = {
	[VendorStatusEnum.ACTIVE]: [VendorStatusEnum.INACTIVE],
	[VendorStatusEnum.INACTIVE]: [VendorStatusEnum.ACTIVE],
	[VendorStatusEnum.PENDING]: [
		VendorStatusEnum.ACTIVE,
		VendorStatusEnum.INACTIVE,
	],
};

export type VendorModel<D = Date | string> = {
	id: number;

	name: string;
	status: VendorStatus;

	created_at: D;
	updated_at: D;
	deleted_at: D;
};

export const displayVendorLabel = (entry: VendorModel) => {
	return entry.name;
};
