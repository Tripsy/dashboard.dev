import {
	type CreateFunctionType,
	type DataSourceKey,
	type FormStateType,
	type FormStateValuesType,
	getDataSourceConfig,
	type UpdateFunctionType,
	type ValidateGetFormValuesFunctionType,
} from '@/config/data-source';
import { translate } from '@/config/lang';
import { ApiError } from '@/exceptions/api.error';
import ValueError from '@/exceptions/value.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import type {
	ValidateFormFunctionType,
	ValidationReturnType,
} from '@/hooks/use-form-validation.hook';

export function getFormValues<K extends DataSourceKey, FormValues>(
	dataSource: K,
	formData: FormData,
): FormValues {
	const functions = getDataSourceConfig(dataSource, 'functions');

	if (
		!('getFormValues' in functions) ||
		typeof functions.getFormValues !== 'function'
	) {
		throw new ValueError(
			`'getFormValues' function is not defined for ${dataSource}`,
		);
	}

	return (
		functions.getFormValues as ValidateGetFormValuesFunctionType<FormValues>
	)(formData);
}

export function handleValidate<K extends DataSourceKey, FormValues>(
	dataSource: K,
	values: FormValues,
	id?: number,
): ValidationReturnType<FormValues> {
	const functions = getDataSourceConfig(dataSource, 'functions');

	if (
		!('validateForm' in functions) ||
		typeof functions.validateForm !== 'function'
	) {
		throw new ValueError(
			`'validateForm' function is not defined for ${dataSource}`,
		);
	}

	return (functions.validateForm as ValidateFormFunctionType<FormValues>)(
		values,
		id,
	);
}

export async function formAction<
	K extends DataSourceKey,
	Entity,
	FormValues extends FormStateValuesType,
	FormState extends FormStateType<K, Entity, FormValues>,
>(state: FormState, formData: FormData): Promise<FormState> {
	async function executeFetch(data: FormValues, id?: number) {
		const actions = getDataSourceConfig(state.dataSource, 'actions');

		if (id) {
			const updateFunction = actions?.update?.function as
				| UpdateFunctionType<Entity, FormValues>
				| undefined;

			// Not all the entities have an `update` function
			if (!updateFunction) {
				throw new ValueError(
					`'update' function is not defined for ${state.dataSource}`,
				);
			}

			return updateFunction(data, id);
		}

		const createFunction = actions?.create?.function as
			| CreateFunctionType<Entity, FormValues>
			| undefined;

		// Not all the entities have a `create` function
		if (!createFunction) {
			throw new ValueError(
				`'create' function is not defined for ${state.dataSource}`,
			);
		}

		return createFunction(data);
	}

	try {
		const values = getFormValues<K, FormValues>(state.dataSource, formData);
		const validated = handleValidate(state.dataSource, values, state.id);

		if (!validated) {
			return {
				...state,
				situation: 'error',
				message: await translate('app.error.validation'),
			};
		}

		const result = {
			...state, // Spread existing state
			values, // Override with new values
		};

		if (!validated.success) {
			const errors = accumulateZodErrors<FormValues>(validated.error);

			return {
				...result,
				situation: 'error',
				message: await translate('app.error.validation'),
				errors,
			};
		}

		const fetchResponse = await executeFetch(validated.data, state.id);

		return {
			...result,
			errors: {},
			message: fetchResponse?.message || null,
			situation: fetchResponse?.success ? 'success' : 'error',
			resultData: fetchResponse?.data,
		};
	} catch (error) {
		const message =
			error instanceof ValueError || error instanceof ApiError
				? error.message
				: await translate('app.error.form');

		return {
			...state,
			message: message,
			situation: 'error',
		};
	}
}
