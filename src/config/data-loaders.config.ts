// import {DataSourceSection, DataSourceSectionEnum} from '@/types/data-source.type';
//
//
// export const DATA_LOADERS: Record<
// 	DataSourceSection,
// 	Partial<Record<string, () => Promise<unknown>>>
// > = {
// 	[DataSourceSectionEnum.DASHBOARD]: {
// 		address: () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/address/address.definition'
// 			).then((m) => m.dataSourceConfigAddress),
// 		brand: () =>
// 			import('@/app/(dashboard)/dashboard/brand/brand.definition').then(
// 				(m) => m.dataSourceConfigBrand,
// 			),
// 		'cash-flow': async () => {
// 			const [{ dataSourceConfigCashFlow }, { cashFlowComponents }] = await Promise.all([
// 				import('@/app/(dashboard)/dashboard/cash-flow/cash-flow.definition'),
// 				import('@/app/(dashboard)/dashboard/cash-flow/cash-flow.components'),
// 			]);
//
// 			return mergeComponents(dataSourceConfigCashFlow, cashFlowComponents);
// 		},
// 		client: () =>
// 			import('@/app/(dashboard)/dashboard/client/client.definition').then(
// 				(m) => m.dataSourceConfigClient,
// 			),
// 		cmr: () =>
// 			import('@/app/(dashboard)/dashboard/cmr/cmr.definition').then(
// 				(m) => m.dataSourceConfigCmr,
// 			),
// 		'cmr-session': () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/cmr-session/cmr-session.definition'
// 			).then((m) => m.dataSourceConfigCmrSession),
// 		'cmr-vehicle': () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/cmr-vehicle/cmr-vehicle.definition'
// 			).then((m) => m.dataSourceConfigCmrVehicle),
// 		'company-vehicle': () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/company-vehicle/company-vehicle.definition'
// 			).then((m) => m.dataSourceConfigCompanyVehicle),
// 		'cron-history': () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/cron-history/cron-history.definition'
// 			).then((m) => m.dataSourceConfigCronHistory),
// 		'log-data': () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/log-data/log-data.definition'
// 			).then((m) => m.dataSourceConfigLogData),
// 		'log-history': () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/log-history/log-history.definition'
// 			).then((m) => m.dataSourceConfigLogHistory),
// 		'mail-queue': () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/mail-queue/mail-queue.definition'
// 			).then((m) => m.dataSourceConfigMailQueue),
// 		permission: () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/permission/permission.definition'
// 			).then((m) => m.dataSourceConfigPermission),
// 		place: () =>
// 			import('@/app/(dashboard)/dashboard/place/place.definition').then(
// 				(m) => m.dataSourceConfigPlace,
// 			),
// 		template: () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/template/template.definition'
// 			).then((m) => m.dataSourceConfigTemplate),
// 		user: () =>
// 			import('@/app/(dashboard)/dashboard/user/user.definition').then(
// 				(m) => m.dataSourceConfigUser,
// 			),
// 		vehicle: () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/vehicle/vehicle.definition'
// 			).then((m) => m.dataSourceConfigVehicle),
// 		vendor: () =>
// 			import('@/app/(dashboard)/dashboard/vendor/vendor.definition').then(
// 				(m) => m.dataSourceConfigVendor,
// 			),
// 		'work-session': () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/work-session/work-session.definition'
// 			).then((m) => m.dataSourceConfigWorkSession),
// 		'work-session-vehicle': () =>
// 			import(
// 				'@/app/(dashboard)/dashboard/work-session-vehicle/work-session-vehicle.definition'
// 			).then((m) => m.dataSourceConfigWorkSessionVehicle),
// 	},
// 	[DataSourceSectionEnum.PUBLIC]: {
// 		address: () =>
// 			import(
// 				'@/app/(public)/_components/address/address.definition'
// 			).then((m) => m.dataSourceConfigAddress),
// 		client: () =>
// 			import('@/app/(public)/_components/client/client.definition').then(
// 				(m) => m.dataSourceConfigClient,
// 			),
// 		cmr: () =>
// 			import('@/app/(public)/_components/cmr/cmr.definition').then(
// 				(m) => m.dataSourceConfigCmr,
// 			),
// 		'cmr-session': () =>
// 			import(
// 				'@/app/(public)/_components/cmr-session/cmr-session.definition'
// 			).then((m) => m.dataSourceConfigCmrSession),
// 		'cmr-vehicle': () =>
// 			import(
// 				'@/app/(public)/_components/cmr-vehicle/cmr-vehicle.definition'
// 			).then((m) => m.dataSourceConfigCmrVehicle),
// 		'work-session': () =>
// 			import(
// 				'@/app/(public)/_components/work-session/work-session.definition'
// 			).then((m) => m.dataSourceConfigWorkSession),
// 		'work-session-vehicle': () =>
// 			import(
// 				'@/app/(public)/_components/work-session-vehicle/work-session-vehicle.definition'
// 			).then((m) => m.dataSourceConfigWorkSessionVehicle),
// 	},
// };
