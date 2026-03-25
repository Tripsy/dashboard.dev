export enum CurrencyEnum {
	RON = 'RON',
	EUR = 'EUR',
	USD = 'USD',
}

export const CURRENCY_DEFAULT = CurrencyEnum.RON;
export const VAT_RATE_DEFAULT = 24;

export enum CashFlowDirectionEnum { // relative to company
	IN = 'in', // money received
	OUT = 'out', // money sent
}

export enum CashFlowCategoryTypeEnum {
	REVENUE = 'revenue',
	EXPENSE = 'expense',
	CORRECTION = 'correction',
}

export enum CashFlowCategoryEnum {
	// Revenue
	CUSTOMER = 'customer', // When company receive money from customer (invoice based)

	// Operational Expenses
	FUEL = 'fuel', // Vehicle fuel
	MAINTENANCE = 'maintenance', // Vehicle repairs
	TOLLS = 'tolls', // Road tolls

	// Personnel
	EMPLOYEE_SALARY = 'employee_salary',

	// Business Expenses
	VENDOR = 'vendor', // Third-party services
	INSURANCE = 'insurance',
	TAXES = 'taxes',

	// Correction
	CORRECTION = 'correction',
	REFUND = 'refund',
	EMPLOYEE_REIMBURSEMENT = 'employee_reimbursement',
}

export enum CashFlowStatusEnum {
	PENDING = 'pending', // Created, waiting for gateway or user redirect
	AUTHORIZED = 'authorized', // CashFlow authorized but not captured
	COMPLETED = 'completed', // Money captured
	FAILED = 'failed',
	CANCELED = 'canceled', // User canceled before completion
	EXPIRED = 'expired', // Authorization expired
	REQUIRES_ACTION = 'requires_action', // 3D Secure, etc.
}

export enum CashFlowGatewayEnum {
	DIRECT = 'direct',
	// STRIPE = 'stripe',
	// PAYPAL = 'paypal',
}

export enum CashFlowMethodEnum {
	// // Card methods
	// CREDIT_CARD = 'credit_card',
	// DEBIT_CARD = 'debit_card',
	//
	// // Digital wallets
	// PAYPAL = 'paypal',

	// Traditional
	CASH = 'cash',
	BANK_TRANSFER = 'bank_transfer',
	// CHECK = 'check',

	// // Other
	// CRYPTO = 'crypto',
	// GIFT_CARD = 'gift_card',
}

export const getExpectedCategoryType = (
	category: CashFlowCategoryEnum,
): CashFlowCategoryTypeEnum => {
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

	if (revenueCategories.includes(category)) {
		return CashFlowCategoryTypeEnum.REVENUE;
	}

	if (expenseCategories.includes(category)) {
		return CashFlowCategoryTypeEnum.EXPENSE;
	}

	if (correctionCategories.includes(category)) {
		return CashFlowCategoryTypeEnum.CORRECTION;
	}

	throw new Error(`Unknown category: ${category}`);
};

export const getExpectedDirection = (
	categoryType: CashFlowCategoryTypeEnum,
): CashFlowDirectionEnum | null => {
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
	direction: CashFlowDirectionEnum;
	category_type: CashFlowCategoryTypeEnum;
	category: CashFlowCategoryEnum;

	// Payment metadata
	gateway: CashFlowGatewayEnum;
	method: CashFlowMethodEnum;
	status: CashFlowStatusEnum;

	// Amount data
	amount: number; // stored in cents
	vat_rate: number;

	currency: CurrencyEnum;
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
	category: CashFlowCategoryEnum;
	method: CashFlowMethodEnum;

	amount: number | null;
	vat_rate: number | null;

	currency: CurrencyEnum;

	external_reference: string | null;

	notes: string | null;
};
