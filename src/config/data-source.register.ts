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
import { dataSourceConfigUser } from '@/app/(dashboard)/dashboard/user/user.definition';
import { dataSourceConfigVehicle } from '@/app/(dashboard)/dashboard/vehicle/vehicle.definition';
import { dataSourceConfigWorkSession } from '@/app/(dashboard)/dashboard/work-session/work-session.definition';
import { dataSourceConfigWorkSessionVehicle } from '@/app/(dashboard)/dashboard/work-session-vehicle/work-session-vehicle.definition';
import { registerDataSource } from '@/config/data-source.config';

/**
 * Register all data sources for the dashboard
 * This avoids circular dependencies
 */
export function registerDashboardDataSource() {
	registerDataSource('brand', dataSourceConfigBrand);
	registerDataSource('cash-flow', dataSourceConfigCashFlow);
	registerDataSource('client-address', dataSourceConfigClientAddress);
	registerDataSource('client', dataSourceConfigClient);
	registerDataSource('cron-history', dataSourceConfigCronHistory);
	registerDataSource('log-data', dataSourceConfigLogData);
	registerDataSource('log-history', dataSourceConfigLogHistory);
	registerDataSource('mail-queue', dataSourceConfigMailQueue);
	registerDataSource('permission', dataSourceConfigPermission);
	registerDataSource('place', dataSourceConfigPlace);
	registerDataSource('template', dataSourceConfigTemplate);
	registerDataSource('user', dataSourceConfigUser);
	registerDataSource('vehicle', dataSourceConfigVehicle);
	registerDataSource('company-vehicle', dataSourceConfigCompanyVehicle);
	registerDataSource('work-session', dataSourceConfigWorkSession);
	registerDataSource(
		'work-session-vehicle',
		dataSourceConfigWorkSessionVehicle,
	);
}
