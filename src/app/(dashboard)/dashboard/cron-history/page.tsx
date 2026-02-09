import type { Metadata } from 'next';
import NavBreadcrumbSetter from '@/app/(dashboard)/_components/nav-breadcrumb.setter';
import type { BreadcrumbType } from '@/app/(dashboard)/_providers/breadcrumb.provider';
import { DataTableCronHistory } from '@/app/(dashboard)/dashboard/cron-history/data-table-cron-history.component';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

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
			href: Routes.get('dashboard'),
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
