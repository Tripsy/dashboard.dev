import type { Metadata } from 'next';
import NavBreadcrumbSetter from '@/app/(dashboard)/_components/nav-breadcrumb.setter';
import type { BreadcrumbType } from '@/app/(dashboard)/_providers/breadcrumb.provider';
import { DataTableCronHistory } from '@/app/(dashboard)/dashboard/cron-history/data-table-cron-history.component';
import { translate } from '@/config/lang';
import RoutesSetup from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('cron_history.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}
export default async function Page() {
	const items: BreadcrumbType[] = [
		{
			label: await translate('dashboard.labels.dashboard'),
			href: RoutesSetup.get('dashboard'),
		},
		{ label: await translate('dashboard.labels.cron_history') },
	];

	return (
		<>
			<NavBreadcrumbSetter items={items} />
			<DataTableCronHistory />
		</>
	);
}
