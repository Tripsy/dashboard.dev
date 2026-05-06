import type { Metadata } from 'next';
import { DriverPanel } from '@/app/(public)/driver-panel.component';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import { WorkSessionProvider } from '@/providers/work-session.provider';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('home.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	return (
		<WorkSessionProvider>
			<DriverPanel />
		</WorkSessionProvider>
	);
}
