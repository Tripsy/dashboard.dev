import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import { ViewImage } from '@/app/(dashboard)/dashboard/image/view-image.component';
import { translateBatch } from '@/config/translate.setup';
import {
	requestDelete,
	requestFind,
	requestUpdateStatus,
	requestView,
} from '@/helpers/services.helper';
import { type AuthModel, hasPermission } from '@/models/auth.model';
import {
	displayImageLabel,
	type ImageModel,
	type ImageSection,
	type ImageStatus,
	ImageStatusEnum,
	type ImageType,
} from '@/models/image.model';
import type { FindFunctionParamsType } from '@/types/action.type';
import type { Language } from '@/types/common.type';
import type {
	DataSourceConfigType,
	DataTableValueOptionsType,
} from '@/types/data-source.type';

// TODO clean up

// const validatorMessages = [
// 	'invalid_section',
// 	'invalid_entity_id',
// 	'invalid_image_type',
// 	'invalid_contents',
// 	'duplicate_contents',
// 	'invalid_language',
// 	'invalid_storage',
// 	'invalid_path',
// 	'invalid_width',
// 	'invalid_height',
// 	'invalid_size',
// 	'invalid_mime',
// 	'invalid_alt',
// 	'invalid_title',
// 	'invalid_description',
// ] as const;

// class ImageValidator extends BaseValidator<typeof validatorMessages> {
// 	protected validateProperties(
// 		message = {
// 			invalid_width: 'Invalid width',
// 			invalid_height: 'Invalid height',
// 			invalid_size: 'Invalid file size',
// 			invalid_mime: 'Invalid mime type',
// 		},
// 	) {
// 		return z.preprocess(
// 			(val) => val ?? {},
// 			z.object({
// 				width: this.validateNumber(message.invalid_width, {
// 					required: false,
// 				}),
// 				height: this.validateNumber(message.invalid_width, {
// 					required: false,
// 				}),
// 				size: this.validateNumber(message.invalid_width),
// 				mime: this.validateEnum(ImageMimeEnum, message.invalid_mime),
// 			}),
// 		);
// 	}
//
// 	protected validateAttributes(
// 		message = {
// 			invalid_alt: 'Invalid alt',
// 			invalid_title: 'Invalid title',
// 			invalid_description: 'Invalid description',
// 		},
// 	) {
// 		return z.preprocess(
// 			(val) => val ?? {},
// 			z.object({
// 				alt: this.validateString(message.invalid_alt, {
// 					required: false,
// 				}),
// 				title: this.validateString(message.invalid_title, {
// 					required: false,
// 				}),
// 				description: this.validateString(message.invalid_description, {
// 					required: false,
// 				}),
// 			}),
// 		);
// 	}
//
// 	protected contentsSchema() {
// 		return z.object({
// 			language: this.validateLanguage(
// 				this.getMessage('invalid_language'),
// 			),
// 			storage: this.validateEnum(
// 				ImageStorageEnum,
// 				this.getMessage('invalid_storage'),
// 			),
// 			path: this.validateString(this.getMessage('invalid_path')),
// 			properties: this.validateProperties({
// 				invalid_width: this.getMessage('invalid_width'),
// 				invalid_height: this.getMessage('invalid_height'),
// 				invalid_size: this.getMessage('invalid_size'),
// 				invalid_mime: this.getMessage('invalid_mime'),
// 			}),
// 			attributes: this.validateAttributes({
// 				invalid_alt: this.getMessage('invalid_alt'),
// 				invalid_title: this.getMessage('invalid_title'),
// 				invalid_description: this.getMessage('invalid_description'),
// 			}),
// 		});
// 	}
//
// 	update = () =>
// 		z.object({
// 			section: this.validateEnum(
// 				ImageSectionEnum,
// 				this.getMessage('invalid_section'),
// 			),
// 			entity_id: this.validateId(this.getMessage('invalid_entity_id')),
// 			image_type: this.validateEnum(
// 				ImageTypeEnum,
// 				this.getMessage('invalid_image_type'),
// 			),
// 			contents: this.contentsSchema().array(),
// 		});
// }

// async function validateFormUpdate(values: ImageFormValuesType) {
// 	const translations = await translateBatch(
// 		validatorMessages,
// 		'image.validation',
// 	);
//
// 	const validator = new ImageValidator(translations);
//
// 	const normalizedValues = {
// 		...values,
// 		contents: Object.values(values.contents).filter(
// 			(c): c is ImageContentType => !!c,
// 		),
// 	};
//
// 	return validator.update().safeParse(normalizedValues);
// }
//
// function getFormValues(formData: FormData): ImageFormValuesType {
// 	const contentsRaw = formData.get('contents');
//
// 	let contents: ImageContentType[] = [];
//
// 	if (typeof contentsRaw === 'string' && contentsRaw.length > 0) {
// 		try {
// 			contents = JSON.parse(contentsRaw) as ImageContentType[];
// 		} catch {
// 			contents = [];
// 		}
// 	}
//
// 	return {
// 		section:
// 			getFormDataAsEnum(formData, 'section', ImageSectionEnum) ||
// 			IMAGE_DEFAULT_SECTION,
// 		entity_id: getFormDataAsNumber(formData, 'entity_id'),
// 		image_type:
// 			getFormDataAsEnum(formData, 'image_type', ImageTypeEnum) ||
// 			IMAGE_DEFAULT_TYPE,
// 		contents: contents,
// 	};
// }
//
// function getFormState(data?: ImageModel): FormStateType<ImageFormValuesType> {
// 	return {
// 		errors: {},
// 		message: null,
// 		situation: null,
// 		values: {
// 			section: data?.section ?? IMAGE_DEFAULT_SECTION,
// 			entity_id: data?.entity_id ?? null,
// 			image_type: data?.image_type ?? IMAGE_DEFAULT_TYPE,
// 			contents: data?.contents ?? [],
// 		},
// 	};
// }

export type ImageDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	section: { value: ImageSection | null; matchMode: 'equals' };
	entity_id: { value: number | null; matchMode: 'equals' };
	image_type: { value: ImageType | null; matchMode: 'equals' };
	status: { value: ImageStatus | null; matchMode: 'equals' };
	language: { value: Language | null; matchMode: 'equals' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

export default async function dataSourceConfig(): Promise<
	DataSourceConfigType<ImageModel>
> {
	const translations = await translateBatch(
		[
			// TODO drop
			// 'create.title',
			// 'update.title',
			'view.title',
			'delete.title',
			'enable.title',
			'disable.title',
			// 'order.title',
		] as const,
		'image.action',
	);

	function displayButtonView(
		auth: AuthModel | null,
	): DataTableValueOptionsType<ImageModel>['displayButton'] {
		return {
			action: () =>
				hasPermission(auth, 'image', 'read') ? 'view' : undefined,
			dataSource: 'image',
		};
	}

	function displayButtonStatus(
		auth: AuthModel | null,
	): DataTableValueOptionsType<ImageModel>['displayButton'] {
		return {
			action: (entry: ImageModel) => {
				if (!hasPermission(auth, 'image', 'update')) {
					return undefined;
				}

				return entry.status === ImageStatusEnum.ACTIVE
					? 'disable'
					: 'enable';
			},
			dataSource: 'image',
		};
	}

	return {
		dataTable: {
			state: {
				first: 0,
				rows: 10,
				sortField: 'id',
				sortOrder: -1 as const,
				filters: {
					global: { value: null, matchMode: 'contains' },
					section: { value: null, matchMode: 'equals' },
					entity_id: { value: null, matchMode: 'equals' },
					image_type: { value: null, matchMode: 'equals' },
					status: { value: null, matchMode: 'equals' },
					language: { value: null, matchMode: 'equals' },
					is_deleted: { value: false, matchMode: 'equals' },
				} satisfies ImageDataTableFiltersType,
			},
			columns: [
				{
					field: 'id',
					header: 'ID',
					sortable: true,
					body: (entry, column, auth) =>
						DataTableValue(entry, column, {
							markDeleted: true,
							displayButton: displayButtonView(auth),
						}),
				},
				{
					field: 'image_type',
					header: 'Type',
					body: (entry, column) =>
						DataTableValue(entry, column, {
							capitalize: true,
						}),
				},
				{
					field: 'section',
					header: 'Section',
					body: (entry, column) =>
						DataTableValue(entry, column, {
							capitalize: true,
						}),
				},
				{
					field: 'entity_id',
					header: 'Entity ID',
				},
				{
					field: 'status',
					header: 'Status',
					body: (entry, column, auth) =>
						DataTableValue(entry, column, {
							dataSource: 'image',
							isStatus: true,
							markDeleted: true,
							displayButton: displayButtonStatus(auth),
						}),
					style: {
						minWidth: '8rem',
						maxWidth: '8rem',
					},
				},
				{
					field: 'created_at',
					header: 'Created At',
					body: (entry, column) =>
						DataTableValue(entry, column, {
							displayDate: true,
						}),
				},
			],
			find: (params: FindFunctionParamsType) =>
				requestFind<ImageModel>('image', params),
		},
		displayEntryLabel: (entry: ImageModel) => {
			return displayImageLabel(entry);
		},
		actions: {
			delete: {
				windowType: 'action',
				windowTitle: translations['delete.title'],
				permission: ['image', 'delete'],
				entriesSelection: 'single',
				operationFunction: (entry: ImageModel) =>
					requestDelete('image', entry),
				buttonPosition: 'left',
				button: {
					variant: 'outline',
					hover: 'error',
				},
			},
			enable: {
				windowType: 'action',
				windowTitle: translations['enable.title'],
				permission: ['image', 'update'],
				entriesSelection: 'single',
				customEntryCheck: (entry: ImageModel) =>
					entry.status === ImageStatusEnum.INACTIVE,
				operationFunction: (entry: ImageModel) =>
					requestUpdateStatus('image', entry, 'active'),
				buttonPosition: 'left',
				button: {
					variant: 'outline',
					hover: 'info',
				},
			},
			disable: {
				windowType: 'action',
				windowTitle: translations['disable.title'],
				permission: ['image', 'update'],
				entriesSelection: 'single',
				customEntryCheck: (entry: ImageModel) =>
					entry.status === ImageStatusEnum.ACTIVE,
				operationFunction: (entry: ImageModel) =>
					requestUpdateStatus('image', entry, 'inactive'),
				buttonPosition: 'left',
				button: {
					variant: 'outline',
					hover: 'error',
				},
			},
			view: {
				windowType: 'view',
				windowTitle: translations['view.title'],
				windowComponent: ViewImage,
				windowConfigProps: {
					size: 'xl',
				},
				permission: ['image', 'read'],
				entriesSelection: 'single',
				buttonPosition: 'hidden',
				reloadEntry: (id: number) =>
					requestView<ImageModel>('image', id),
			},
		},
	};
}
