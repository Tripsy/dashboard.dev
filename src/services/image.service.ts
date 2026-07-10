import { Configuration } from '@/config/settings.config';
import { ApiRequest, resolveRequestPath } from '@/helpers/api.helper';
import {
	type ImageModel,
	type ImageSection,
	type ImageStorage,
	ImageStorageEnum,
} from '@/models/image.model';
import type { ApiResponseFetch } from '@/types/api.type';

export function showImage(path: string, storage?: ImageStorage) {
	if (storage === ImageStorageEnum.LOCAL) {
		return `${Configuration.get('images.local.view')}/${path}`;
	}

	return path;
}

export async function createImage<P>(
	params: Partial<P>,
	section: ImageSection,
	entity_id: number,
): Promise<ApiResponseFetch<ImageModel>> {
	return await new ApiRequest().doFetch(
		`/${resolveRequestPath('image')}/${section}/${entity_id}`,
		{
			method: 'POST',
			body: JSON.stringify(params),
		},
	);
}

export async function orderUpdate(
	section: ImageSection,
	entity_id: number,
	positions: { id: number; sort_order: number }[],
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
