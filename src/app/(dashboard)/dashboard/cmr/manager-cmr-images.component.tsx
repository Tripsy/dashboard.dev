'use client';

import { ManagerImages } from '@/app/(dashboard)/dashboard/image/manager-images.component';
import type { CmrModel } from '@/models/cmr.model';
import { ImageSectionEnum, ImageTypeEnum } from '@/models/image.model';

const IMAGE_TYPES = [ImageTypeEnum.GALLERY, ImageTypeEnum.LOGO];

export function ManagerCmrImages({ entries }: { entries: CmrModel[] }) {
	const model = entries[0];

	return (
		<ManagerImages
			section={ImageSectionEnum.CMR}
			entity_id={model.id}
			types={IMAGE_TYPES}
		/>
	);
}
