import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { ExecutionError } from '@/exceptions/execution.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import type { ApiResponseFetch } from '@/types/api.type';
import type {
	FormErrorsType,
	FormSituationType,
	FormStateType,
	FormValuesType,
	GetFormValuesFnType,
	ValidateFormFnType,
} from '@/types/form.type';

/**
 * Create (`values`) and update (`values`, `entryId`) requests both reach the
 * pipeline through this shape. The entry type is deliberately not tracked —
 * `processForm` only forwards the response through as `resultData`, which is
 * `unknown` on `FormStateType` anyway; carrying an `Entry` generic here would
 * force a cast at every call site whose service returns `ApiResponseFetch<null>`.
 */
type FormOperationFnType<FormValues> =
	| ((values: FormValues) => Promise<ApiResponseFetch<unknown>>)
	| ((
			values: FormValues,
			entryId: number,
	  ) => Promise<ApiResponseFetch<unknown>>);

/**
 * Per-flow translation of a backend `ApiError` into form state. Every field is
 * optional — whatever is left out falls back to the pipeline defaults
 * (`fallbackErrorKey` for the message, `serverError` for the situation).
 */
export type MapApiErrorFnType<Situation extends string | null> = (
	error: ApiError,
) => Promise<{
	message?: string;
	situation?: Situation;
	resultData?: unknown;
}>;

type ProcessFormOptionsType<
	FormValues extends FormValuesType,
	Situation extends string | null,
> = {
	getFormValues: GetFormValuesFnType<FormValues>;
	validateForm: ValidateFormFnType<FormValues>;
	operationFunction: FormOperationFnType<FormValues>;
	/** Only set for update operations — passed as the second argument to `operationFunction`. */
	entryId?: number;
	/**
	 * Required for unauthenticated (auth-entry) forms. Authenticated forms are
	 * covered by the `Sec-Fetch-Site` / origin check in `src/proxy.ts` instead,
	 * so they leave this off.
	 */
	requireCsrf?: boolean;
	mapApiError?: MapApiErrorFnType<Situation>;
	/** Translation key for the generic failure message. */
	fallbackErrorKey?: string;
};

/**
 * The single submit pipeline: optional CSRF gate → parse → validate → request →
 * error mapping. Used by `WindowForm` for every dashboard/account entity form and
 * by each `<flow>.action.ts` for the unauthenticated auth-entry flows.
 */
export async function processForm<
	FormValues extends FormValuesType,
	State extends FormStateType<FormValues, string | null>,
>(
	formState: State,
	formData: FormData,
	// `State['situation']` rather than a separate `Situation` parameter: it has no
	// other inference site, so a standalone parameter would silently collapse to
	// its default and reject a flow's extra situations.
	options: ProcessFormOptionsType<FormValues, State['situation']>,
): Promise<State> {
	const {
		getFormValues,
		validateForm,
		operationFunction,
		entryId,
		requireCsrf = false,
		mapApiError,
		fallbackErrorKey = 'app.error.form',
	} = options;

	// Flow-specific state fields (e.g. the recovery `token`) must survive every
	// branch, so each result spreads the incoming state. TypeScript can't narrow a
	// spread back to the generic `State`, hence the single assertion kept here.
	const buildState = (patch: {
		values?: FormValues;
		errors?: FormErrorsType<FormValues>;
		message?: string | null;
		situation?: State['situation'] | FormSituationType;
		resultData?: unknown;
	}): State => ({ ...formState, ...patch }) as State;

	if (requireCsrf && !(await isValidCsrfToken(formData))) {
		return buildState({
			message: await translate('app.error.csrf'),
			situation: 'csrfError',
		});
	}

	// Held outside the try so a failed request echoes the user's input back
	// instead of reverting the form to the previously submitted values.
	let values: FormValues = formState.values;

	try {
		values = getFormValues(formData);

		const validated = await validateForm(values);

		if (!validated.success) {
			return buildState({
				values,
				situation: 'failedValidation',
				message: await translate('app.error.validation'),
				errors: accumulateZodErrors<FormValues>(validated.error),
			});
		}

		values = validated.data;

		// An entryId means an update — pass it as the second argument.
		const fetchResponse =
			entryId !== undefined
				? await (
						operationFunction as (
							values: FormValues,
							entryId: number,
						) => Promise<ApiResponseFetch<unknown>>
					)(values, entryId)
				: await (
						operationFunction as (
							values: FormValues,
						) => Promise<ApiResponseFetch<unknown>>
					)(values);

		return buildState({
			values,
			message: fetchResponse?.message || null,
			situation: fetchResponse?.success ? 'success' : 'serverError',
			resultData: fetchResponse?.data,
		});
	} catch (error) {
		const mapped =
			mapApiError && error instanceof ApiError
				? await mapApiError(error)
				: undefined;

		let message = mapped?.message;

		// Without a per-flow mapping, only a conflict or an explicit execution
		// failure carry a message that is safe to surface verbatim.
		if (
			!message &&
			!mapApiError &&
			((error instanceof ApiError && error.status === 409) ||
				error instanceof ExecutionError)
		) {
			message = error.message;
		}

		return buildState({
			values,
			message: message || (await translate(fallbackErrorKey)),
			situation: mapped?.situation ?? 'serverError',
			errors: {},
			resultData: mapped?.resultData,
		});
	}
}
