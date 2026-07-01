import { ApiRequest, resolveRequestPath } from '@/helpers/api.helper';
import type { ImageSection } from '@/models/image.model';
import type { ApiResponseFetch } from '@/types/api.type';

export async function orderUpdate(
	section: ImageSection,
	entity_id: number,
	positions: number[],
): Promise<ApiResponseFetch<null>> {
	return await new ApiRequest().doFetch(
		`/${resolveRequestPath('image')}/${section}/${entity_id}/order`,
		{
			method: 'PATCH',
			body: JSON.stringify({
				positions,
			}),
		},
	);
}
