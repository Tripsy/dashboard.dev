import { dataSourceConfigBrand } from '@/app/(dashboard)/dashboard/brand/brand.definition';
import { dataSourceConfigCashFlow } from '@/app/(dashboard)/dashboard/cash-flow/cash-flow.definition';
import { dataSourceConfigClient } from '@/app/(dashboard)/dashboard/client/client.definition';
import { dataSourceConfigClientAddress } from '@/app/(dashboard)/dashboard/client-address/client-address.definition';
import { dataSourceConfigCompanyVehicle } from '@/app/(dashboard)/dashboard/company-vehicle/company-vehicle.definition';
import { dataSourceConfigCronHistory } from '@/app/(dashboard)/dashboard/cron-history/cron-history.definition';
import { dataSourceConfigLogData } from '@/app/(dashboard)/dashboard/log-data/log-data.definition';
import { dataSourceConfigLogHistory } from '@/app/(dashboard)/dashboard/log-history/log-history.definition';
import { dataSourceConfigMailQueue } from '@/app/(dashboard)/dashboard/mail-queue/mail-queue.definition';
import { dataSourceConfigPermission } from '@/app/(dashboard)/dashboard/permission/permission.definition';
import { dataSourceConfigPlace } from '@/app/(dashboard)/dashboard/place/place.definition';
import { dataSourceConfigTemplate } from '@/app/(dashboard)/dashboard/template/template.definition';
// import { dataSourceConfigUser } from '@/app/(dashboard)/dashboard/user/user.definition';
import { dataSourceConfigVehicle } from '@/app/(dashboard)/dashboard/vehicle/vehicle.definition';
import { dataSourceConfigWorkSession } from '@/app/(dashboard)/dashboard/work-session/work-session.definition';
import { dataSourceConfigWorkSessionVehicle } from '@/app/(dashboard)/dashboard/work-session-vehicle/work-session-vehicle.definition';
import {
	DataSourceSectionEnum,
	loadDataSource,
} from '@/config/data-source.config';

/**
 * Register all data sources for the dashboard
 * This avoids circular dependencies
 */
export function registerDataSource() {
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'brand',
		dataSourceConfigBrand,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'cash-flow',
		dataSourceConfigCashFlow,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'client-address',
		dataSourceConfigClientAddress,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'client',
		dataSourceConfigClient,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'cron-history',
		dataSourceConfigCronHistory,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'log-data',
		dataSourceConfigLogData,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'log-history',
		dataSourceConfigLogHistory,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'mail-queue',
		dataSourceConfigMailQueue,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'permission',
		dataSourceConfigPermission,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'place',
		dataSourceConfigPlace,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'template',
		dataSourceConfigTemplate,
	);
	// loadDataSource(
	// 	DataSourceSectionEnum.DASHBOARD,
	// 	'user',
	// 	dataSourceConfigUser,
	// );
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'vehicle',
		dataSourceConfigVehicle,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'company-vehicle',
		dataSourceConfigCompanyVehicle,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'work-session',
		dataSourceConfigWorkSession,
	);
	loadDataSource(
		DataSourceSectionEnum.DASHBOARD,
		'work-session-vehicle',
		dataSourceConfigWorkSessionVehicle,
	);
}
