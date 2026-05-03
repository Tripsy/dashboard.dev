import type { Metadata } from 'next';
import BreadcrumbSetter from '@/app/(dashboard)/_components/breadcrumb.setter';
import type { BreadcrumbType } from '@/app/(dashboard)/_providers/breadcrumb.provider';
import { DataTableWorkSessionVehicles } from '@/app/(dashboard)/dashboard/work-session-vehicles/data-table-work-session-vehicles.component';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('work-session-vehicles.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	const items: BreadcrumbType[] = [
		{ label: await translate('dashboard.labels.work-session-vehicles') },
	];

	return (
		<>
			<BreadcrumbSetter page="work-session-vehicles" items={items} />
			<DataTableWorkSessionVehicles />
		</>
	);
}
