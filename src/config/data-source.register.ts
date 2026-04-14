// // import { dataSourceConfigBrands } from '@/app/(dashboard)/dashboard/brands/brands.definition';
// // import { dataSourceConfigCashFlow } from '@/app/(dashboard)/dashboard/cash-flow/cash-flow.definition';
// import { dataSourceConfigClientAddress } from '@/app/(dashboard)/dashboard/client-address/client-address.definition';
import { dataSourceConfigClients } from '@/app/(dashboard)/dashboard/clients/clients.definition';
import { dataSourceConfigCronHistory } from '@/app/(dashboard)/dashboard/cron-history/cron-history.definition';
import { dataSourceConfigLogData } from '@/app/(dashboard)/dashboard/log-data/log-data.definition';
import { dataSourceConfigLogHistory } from '@/app/(dashboard)/dashboard/log-history/log-history.definition';
import { dataSourceConfigMailQueue } from '@/app/(dashboard)/dashboard/mail-queue/mail-queue.definition';
import { dataSourceConfigPermissions } from '@/app/(dashboard)/dashboard/permissions/permissions.definition';
// // import { dataSourceConfigPlaces } from '@/app/(dashboard)/dashboard/places/places.definition';
import { dataSourceConfigTemplates } from '@/app/(dashboard)/dashboard/templates/templates.definition';
import { dataSourceConfigUsers } from '@/app/(dashboard)/dashboard/users/users.definition';
import { registerDataSource } from '@/config/data-source.config';

/**
 * Register all data sources for the dashboard
 * This avoids circular dependencies
 */
export function registerDashboardDataSource() {
	// // registerDataSource('brands', dataSourceConfigBrands);
	// // registerDataSource('cash-flow', dataSourceConfigCashFlow);
	// registerDataSource('client-address', dataSourceConfigClientAddress);
	registerDataSource('clients', dataSourceConfigClients);
	registerDataSource('cron-history', dataSourceConfigCronHistory);
	registerDataSource('log-data', dataSourceConfigLogData);
	registerDataSource('log-history', dataSourceConfigLogHistory);
	registerDataSource('mail-queue', dataSourceConfigMailQueue);
	registerDataSource('permissions', dataSourceConfigPermissions);
	// // registerDataSource('places', dataSourceConfigPlaces);
	registerDataSource('templates', dataSourceConfigTemplates);
	registerDataSource('users', dataSourceConfigUsers);
}
