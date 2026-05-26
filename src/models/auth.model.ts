import { normalizeDates } from '@/helpers/model.helper';
import type {
	PermissionEntityType,
	PermissionOperationType,
} from '@/models/permission.model';
import { type UserModel, UserRoleEnum } from '@/models/user.model';

export type AuthModelPermissions = Record<
	PermissionEntityType,
	PermissionOperationType[]
>;

export type AuthModel = UserModel<Date> & {
	permissions: AuthModelPermissions;
};

export function isAdmin(data: AuthModel | null): boolean {
	return data?.role === UserRoleEnum.ADMIN;
}

export function isOperator(data: AuthModel | null): boolean {
	return data?.role === UserRoleEnum.OPERATOR;
}

export function isDriver(data: AuthModel | null): boolean {
	return data?.role === UserRoleEnum.DRIVER;
}

export function isAuthenticated(auth: AuthModel | null): boolean {
	return auth !== null;
}

export function hasPermission(
	auth: AuthModel | null,
	entity: PermissionEntityType,
	operation?: PermissionOperationType,
): boolean {
	if (!isAuthenticated(auth)) {
		return false;
	}

	if (isAdmin(auth)) {
		return true;
	}

	if (!isDriver(auth) && !isOperator(auth)) {
		return false;
	}

	if (!operation) {
		const entityPermissions = auth?.permissions?.[entity];

		return Array.isArray(entityPermissions) && entityPermissions.length > 0;
	}

	return auth?.permissions?.[entity]?.includes(operation) || false;
}

export function prepareAuthModel(data: AuthModel): AuthModel {
	return normalizeDates(data) as unknown as AuthModel;
}
