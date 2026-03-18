import type { Metadata } from 'next';
import BreadcrumbSetter from '@/app/(dashboard)/_components/breadcrumb.setter';
import type { BreadcrumbType } from '@/app/(dashboard)/_providers/breadcrumb.provider';
import { DataTablePlaces } from '@/app/(dashboard)/dashboard/places/data-table-places.component';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('places.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	const items: BreadcrumbType[] = [
		{ label: await translate('dashboard.labels.places') },
	];

	return (
		<>
			<BreadcrumbSetter page="places" items={items} />
			<DataTablePlaces />
		</>
	);
}
