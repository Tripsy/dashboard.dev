import { dataSourceConfigCronHistory } from '@/app/(dashboard)/dashboard/cron-history/cron-history.definition';
import { dataSourceConfigLogData } from '@/app/(dashboard)/dashboard/log-data/log-data.definition';
import { dataSourceConfigLogHistory } from '@/app/(dashboard)/dashboard/log-history/log-history.definition';
import { dataSourceConfigMailQueue } from '@/app/(dashboard)/dashboard/mail-queue/mail-queue.definition';
import { dataSourceConfigPermissions } from '@/app/(dashboard)/dashboard/permissions/permissions.definition';
import { dataSourceConfigTemplates } from '@/app/(dashboard)/dashboard/templates/templates.definition';
import { dataSourceConfigUsers } from '@/app/(dashboard)/dashboard/users/users.definition';
import { registerDataSource } from '@/config/data-source.config';

export function registerDashboardDataSource() {
	registerDataSource('cron-history', dataSourceConfigCronHistory);
	registerDataSource('log-data', dataSourceConfigLogData);
	registerDataSource('log-history', dataSourceConfigLogHistory);
	registerDataSource('mail-queue', dataSourceConfigMailQueue);
	registerDataSource('permissions', dataSourceConfigPermissions);
	registerDataSource('templates', dataSourceConfigTemplates);
	registerDataSource('users', dataSourceConfigUsers);
}
