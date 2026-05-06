import { resolveRequestPath } from '@/config/data-source.config';
import { ApiRequest } from '@/helpers/api.helper';
import type { ClientAddressModel } from '@/models/client-address.model';
import type { ApiResponseFetch } from '@/types/api.type';

export async function createClientAddress<P>(
	params: Partial<P>,
	client_id: number | null,
): Promise<ApiResponseFetch<ClientAddressModel>> {
	return await new ApiRequest().doFetch(
		`/${resolveRequestPath('client-address')}/${client_id}`,
		{
			method: 'POST',
			body: JSON.stringify(params),
		},
	);
}

export async function updateClientAddress<P>(
	params: Partial<P>,
	id: number,
	client_id: number | null,
): Promise<ApiResponseFetch<ClientAddressModel>> {
	return await new ApiRequest().doFetch(
		`/${resolveRequestPath('client-address')}/${client_id}/${id}`,
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
		`/${resolveRequestPath('client-address')}/${entry.client.id}/${entry.id}`,
		{
			method: 'DELETE',
		},
	);
}

export async function restoreClientAddress(
	entry: ClientAddressModel,
): Promise<ApiResponseFetch<null>> {
	return await new ApiRequest().doFetch(
		`/${resolveRequestPath('client-address')}/${entry.client.id}/${entry.id}/restore`,
		{
			method: 'DELETE',
		},
	);
}
