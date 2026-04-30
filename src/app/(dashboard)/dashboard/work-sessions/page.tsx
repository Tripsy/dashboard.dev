import type { Metadata } from 'next';
import BreadcrumbSetter from '@/app/(dashboard)/_components/breadcrumb.setter';
import type { BreadcrumbType } from '@/app/(dashboard)/_providers/breadcrumb.provider';
import { DataTableWorkSessions } from '@/app/(dashboard)/dashboard/work-sessions/data-table-work-sessions.component';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('work-sessions.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	const items: BreadcrumbType[] = [
		{ label: await translate('dashboard.labels.work-sessions') },
	];

	return (
		<>
			<BreadcrumbSetter page="work-sessions" items={items} />
			<DataTableWorkSessions />
		</>
	);
}
