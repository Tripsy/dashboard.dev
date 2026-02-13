import type { Metadata } from 'next';
import NavBreadcrumbSetter from '@/app/(dashboard)/_components/nav-breadcrumb.setter';
import type { BreadcrumbType } from '@/app/(dashboard)/_providers/breadcrumb.provider';
import { DataTableTemplates } from '@/app/(dashboard)/dashboard/templates/data-table-templates.component';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('templates.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	// TODO update this & also add the label to be used in the menu component
	const items: BreadcrumbType[] = [
		{
			label: await translate('dashboard.labels.dashboard'),
			href: Routes.get('dashboard'),
		},
		{ label: await translate('dashboard.labels.templates') },
	];

	return (
		<>
			<NavBreadcrumbSetter items={items} />
			<DataTableTemplates />
		</>
	);
}
