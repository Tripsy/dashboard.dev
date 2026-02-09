import type { Metadata } from 'next';
import NavBreadcrumbSetter from '@/app/(dashboard)/_components/nav-breadcrumb.setter';
import type { BreadcrumbType } from '@/app/(dashboard)/_providers/breadcrumb.provider';
import { DataTableLogHistory } from '@/app/(dashboard)/dashboard/log-history/data-table-log-history.component';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('log_history.meta.title', {
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
		{ label: await translate('dashboard.labels.log_history') },
	];

	return (
		<>
			<NavBreadcrumbSetter items={items} />
			<DataTableLogHistory />
		</>
	);
}
