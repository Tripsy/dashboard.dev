import type { Metadata } from 'next';
import BreadcrumbSetter from '@/app/(dashboard)/_components/breadcrumb.setter';
import type { BreadcrumbType } from '@/app/(dashboard)/_providers/breadcrumb.provider';
import { DataTableImageOrder } from '@/app/(dashboard)/dashboard/image/order/data-table-image-order.component';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('image-order.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	const items: BreadcrumbType[] = [
		{
			label: await translate('dashboard.labels.image'),
			href: Routes.get('image'),
		},
		{
			label: await translate('dashboard.labels.image-order'),
		},
	];

	return (
		<>
			<BreadcrumbSetter page="image" items={items} />
			<DataTableImageOrder />
		</>
	);
}
