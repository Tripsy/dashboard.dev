import type { Metadata } from 'next';
import NavBreadcrumbSetter from '@/app/(dashboard)/_components/nav-breadcrumb.setter';
import type { BreadcrumbType } from '@/app/(dashboard)/_providers/breadcrumb.provider';
import { DataTableLogData } from '@/app/(dashboard)/dashboard/log-data/data-table-log-data.component';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('log-data.meta.title', {
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
		{ label: await translate('dashboard.labels.log-data') },
	];

	return (
		<>
			<NavBreadcrumbSetter items={items} />
			<DataTableLogData />
		</>
	);
}
