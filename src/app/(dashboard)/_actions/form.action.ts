import {
	type CreateFunctionType,
	type DataSourceFormValues,
	type DataSourceType,
	type FormStateType,
	getDataSourceConfig,
	type UpdateFunctionType,
} from '@/config/data-source';
import { translate } from '@/config/lang';
import { ApiError } from '@/exceptions/api.error';
import ValueError from '@/exceptions/value.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import type { ValidationReturnType } from '@/hooks';

export function getFormValues<K extends keyof DataSourceType>(
	dataSource: K,
	formData: FormData,
): DataSourceFormValues<K> {
	const functions = getDataSourceConfig(dataSource, 'functions');

	if (!('getFormValues' in functions)) {
		throw new ValueError(
			`'getFormValues' function is not defined for ${dataSource}`,
		);
	}

	const getFormValuesFunction = functions.getFormValues;

	// Fighting with TypeScript & Eslint
	if (!getFormValuesFunction) {
		throw new ValueError(
			`'getFormValues' function is not defined for ${dataSource}`,
		);
	}

	return getFormValuesFunction(formData) as DataSourceFormValues<K>;
}

export function handleValidate<K extends keyof DataSourceType>(
	dataSource: K,
	values: DataSourceFormValues<K>,
	id?: number,
): ValidationReturnType<DataSourceFormValues<K>> {
	const functions = getDataSourceConfig(dataSource, 'functions');

	if (!('validateForm' in functions)) {
		throw new ValueError(
			`'validateForm' function is not defined for ${dataSource}`,
		);
	}

	const validateFormFunction = functions.validateForm;

	// Fighting with TypeScript & Eslint
	if (!validateFormFunction) {
		throw new ValueError(
			`'validateForm' function is not defined for ${dataSource}`,
		);
	}

	return validateFormFunction(values, id);
}

export async function formAction<K extends keyof DataSourceType>(
	state: FormStateType<K>,
	formData: FormData,
): Promise<FormStateType<K>> {
	async function executeFetch(data: FormStateType<K>['values'], id?: number) {
		const actions = getDataSourceConfig(state.dataSource, 'actions');

		if (id) {
			const updateFunction = actions?.update?.function as
				| UpdateFunctionType<K>
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
			| CreateFunctionType<K>
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
		const values = getFormValues(state.dataSource, formData);
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
			const errors = accumulateZodErrors<DataSourceFormValues<K>>(
				validated.error,
			);

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
	} catch (error: unknown) {
		console.error(error);

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
