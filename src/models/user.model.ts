export enum UserRoleEnum {
	ADMIN = 'admin',
	MEMBER = 'member',
	OPERATOR = 'operator',
}

export enum UserStatusEnum {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	PENDING = 'pending',
}

export enum LanguageEnum {
	EN = 'en',
	RO = 'ro',
}

export enum UserOperatorTypeEnum {
	SELLER = 'seller',
	PRODUCT_MANAGER = 'product_manager',
	CONTENT_EDITOR = 'content_editor',
}

export type UserModel<D = Date | string> = {
	id: number;
	name: string;
	email: string;
	email_verified_at: D;
	password_updated_at: D;
	status: UserStatusEnum;
	language: LanguageEnum;
	role: UserRoleEnum;
	operator_type: UserOperatorTypeEnum | null;
	created_at: D;
	updated_at: D;
	deleted_at: D;
};

export type UserFormValuesType = {
	name: string;
	email: string;
	password?: string;
	password_confirm?: string;
	language: LanguageEnum;
	role: UserRoleEnum;
	operator_type: UserOperatorTypeEnum | null;
};
