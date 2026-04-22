import { arrayHasValue } from '@/helpers/objects.helper';
import type { Currency } from '@/types/common.type';

export const VAT_RATE_DEFAULT = 24;

export const CashFlowDirectionEnum = {
	IN: 'in', // money received relative to company
	OUT: 'out', // money sent relative to company
} as const;

export type CashFlowDirection =
	(typeof CashFlowDirectionEnum)[keyof typeof CashFlowDirectionEnum];

export const CashFlowCategoryTypeEnum = {
	REVENUE: 'revenue',
	EXPENSE: 'expense',
	CORRECTION: 'correction',
} as const;

export type CashFlowCategoryType =
	(typeof CashFlowCategoryTypeEnum)[keyof typeof CashFlowCategoryTypeEnum];

export const CashFlowCategoryEnum = {
	// Revenue
	CUSTOMER: 'customer', // When company receive money from customer (invoice based)

	// Operational Expenses
	FUEL: 'fuel', // Vehicle fuel
	MAINTENANCE: 'maintenance', // Vehicle repairs
	TOLLS: 'tolls', // Road tolls

	// Personnel
	EMPLOYEE_SALARY: 'employee_salary',

	// Business Expenses
	VENDOR: 'vendor', // Third-party services
	INSURANCE: 'insurance',
	TAXES: 'taxes',

	// Correction
	CORRECTION: 'correction',
	REFUND: 'refund',
	EMPLOYEE_REIMBURSEMENT: 'employee_reimbursement',
} as const;

export type CashFlowCategory =
	(typeof CashFlowCategoryEnum)[keyof typeof CashFlowCategoryEnum];

export const CashFlowStatusEnum = {
	PENDING: 'pending', // Created, waiting for gateway or user redirect
	AUTHORIZED: 'authorized', // CashFlow authorized but not captured
	COMPLETED: 'completed', // Money captured
	FAILED: 'failed',
	CANCELED: 'canceled', // User canceled before completion
	EXPIRED: 'expired', // Authorization expired
	REQUIRES_ACTION: 'requires_action', // 3D Secure, etc.
} as const;

export type CashFlowStatus =
	(typeof CashFlowStatusEnum)[keyof typeof CashFlowStatusEnum];

export const CashFlowGatewayEnum = {
	DIRECT: 'direct',
	// STRIPE: 'stripe',
	// PAYPAL: 'paypal',
} as const;

export type CashFlowGateway =
	(typeof CashFlowGatewayEnum)[keyof typeof CashFlowGatewayEnum];

export const CashFlowMethodEnum = {
	// // Card methods
	// CREDIT_CARD: 'credit_card',
	// DEBIT_CARD: 'debit_card',
	//
	// // Digital wallets
	// PAYPAL: 'paypal',

	// Traditional
	CASH: 'cash',
	BANK_TRANSFER: 'bank_transfer',
	// CHECK: 'check',

	// // Other
	// CRYPTO: 'crypto',
	// GIFT_CARD: 'gift_card',
} as const;

export type CashFlowMethod =
	(typeof CashFlowMethodEnum)[keyof typeof CashFlowMethodEnum];

export const getExpectedCategoryType = (
	category: CashFlowCategory,
): CashFlowCategoryType => {
	const revenueCategories = [CashFlowCategoryEnum.CUSTOMER];
	const expenseCategories = [
		CashFlowCategoryEnum.FUEL,
		CashFlowCategoryEnum.MAINTENANCE,
		CashFlowCategoryEnum.TOLLS,
		CashFlowCategoryEnum.EMPLOYEE_SALARY,
		CashFlowCategoryEnum.VENDOR,
		CashFlowCategoryEnum.INSURANCE,
		CashFlowCategoryEnum.TAXES,
	];
	const correctionCategories = [
		CashFlowCategoryEnum.CORRECTION,
		CashFlowCategoryEnum.REFUND,
		CashFlowCategoryEnum.EMPLOYEE_REIMBURSEMENT,
	];

	if (arrayHasValue(category, revenueCategories)) {
		return CashFlowCategoryTypeEnum.REVENUE;
	}

	if (arrayHasValue(category, expenseCategories)) {
		return CashFlowCategoryTypeEnum.EXPENSE;
	}

	if (arrayHasValue(category, correctionCategories)) {
		return CashFlowCategoryTypeEnum.CORRECTION;
	}

	throw new Error(`Unknown category: ${category}`);
};

export const getExpectedDirection = (
	categoryType: CashFlowCategoryType,
): CashFlowDirection | null => {
	switch (categoryType) {
		case CashFlowCategoryTypeEnum.REVENUE:
			return CashFlowDirectionEnum.IN;
		case CashFlowCategoryTypeEnum.EXPENSE:
			return CashFlowDirectionEnum.OUT;
		case CashFlowCategoryTypeEnum.CORRECTION:
			// Correction can be both, so no specific direction
			return null;
	}
};

export type CashFlowTracking = {
	external_reference: string | null;
	parent_id: number | null;
};

export type CashFlowGatewayData = {
	transaction_id: string | null;
	gateway_response: Record<string, unknown> | null;
	fail_reason: string | null;
};

export type CashFlowDates<D = Date | string> = {
	captured_at: D | null;
	authorized_at: D | null;
};

export type CashFlowModel<D = Date | string> = {
	id: number;

	// Classification
	direction: CashFlowDirection;
	category_type: CashFlowCategoryType;
	category: CashFlowCategory;

	// Payment metadata
	gateway: CashFlowGateway;
	method: CashFlowMethod;
	status: CashFlowStatus;

	// Amount data
	amount: number; // stored in cents
	vat_rate: number;

	currency: Currency;
	exchange_rate: number;

	// Other
	notes: string | null;

	// Timestamps
	created_at: D;
	updated_at: D;
	deleted_at: D;
} & CashFlowGatewayData &
	CashFlowTracking &
	CashFlowDates;

export type CashFlowFormValuesType = {
	category: CashFlowCategory;
	method: CashFlowMethod;

	amount: number | null;
	vat_rate: number | null;

	currency: Currency;

	external_reference: string | null;

	notes: string | null;
};
