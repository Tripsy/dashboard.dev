import type { Metadata } from 'next';
import BreadcrumbSetter from '@/app/(dashboard)/_components/breadcrumb.setter';
import type { BreadcrumbType } from '@/app/(dashboard)/_providers/breadcrumb.provider';
import { DataTableOperationalRecord } from '@/app/(dashboard)/dashboard/operational-record/data-table-operational-record.component';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('operational-record.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	const items: BreadcrumbType[] = [
		{ label: await translate('dashboard.labels.operational-record') },
	];

	return (
		<>
			<BreadcrumbSetter page="operational-record" items={items} />
			<DataTableOperationalRecord />
		</>
	);
}
