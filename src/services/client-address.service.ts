import { ApiRequest } from '@/helpers/api.helper';
import type {
	ClientAddressFormValuesType,
	ClientAddressModel,
} from '@/models/client-address.model';
import type { ApiResponseFetch } from '@/types/api.type';

export const createClientAddress = async (
	params: Partial<ClientAddressFormValuesType>,
	client_id: number | null,
): Promise<ApiResponseFetch<ClientAddressModel>> => {
	return await new ApiRequest().doFetch(`/client-address/${client_id}`, {
		method: 'POST',
		body: JSON.stringify(params),
	});
};

export async function updateClientAddress(
	params: Partial<ClientAddressFormValuesType>,
	id: number,
	client_id: number | null,
): Promise<ApiResponseFetch<ClientAddressModel>> {
	return await new ApiRequest().doFetch(
		`/client-address/${client_id}/${id}`,
		{
			method: 'PUT',
			body: JSON.stringify(params),
		},
	);
}

export async function deleteClientAddress(
	entry: ClientAddressModel,
): Promise<ApiResponseFetch<null>> {
	return await new ApiRequest().doFetch(
		`/client-address/${entry.client.id}/${entry.id}`,
		{
			method: 'DELETE',
		},
	);
}

export async function restoreClientAddress(
	entry: ClientAddressModel,
): Promise<ApiResponseFetch<null>> {
	return await new ApiRequest().doFetch(
		`/client-address/${entry.client.id}/${entry.id}/restore`,
		{
			method: 'DELETE',
		},
	);
}
