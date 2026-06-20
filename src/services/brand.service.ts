import { ApiRequest, resolveRequestPath } from '@/helpers/api.helper';
import type { BrandType } from '@/models/brand.model';
import type { ApiResponseFetch } from '@/types/api.type';

export async function orderUpdate(
	type: BrandType,
	positions: number[],
): Promise<ApiResponseFetch<null>> {
	return await new ApiRequest().doFetch(
		`/${resolveRequestPath('brand')}/${type}/order`,
		{
			method: 'PATCH',
			body: JSON.stringify({
				positions,
			}),
		},
	);
}
