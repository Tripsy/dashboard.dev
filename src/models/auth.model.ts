import { normalizeDates } from '@/helpers/model.helper';
import { type UserModel, UserRoleEnum } from '@/models/user.model';

export type AuthModel =
	| (UserModel<Date> & {
			permissions: string[];
	  })
	| null;

export function isAdmin(data: AuthModel): boolean {
	return data?.role === UserRoleEnum.ADMIN;
}

export function isOperator(data: AuthModel): boolean {
	return data?.role === UserRoleEnum.OPERATOR;
}

export function isAuthenticated(auth: AuthModel): boolean {
	return auth !== null;
}

export function hasPermission(auth: AuthModel, permission?: string): boolean {
	if (!isAuthenticated(auth)) {
		return false;
	}

	if (isAdmin(auth)) {
		return true;
	}

	if (isOperator(auth)) {
		if (permission) {
			return auth?.permissions.includes(permission) || false;
		} else {
			return true;
		}
	}

	return false;
}

export function prepareAuthModel(data: AuthModel): AuthModel {
	return normalizeDates(data) as AuthModel;
}
