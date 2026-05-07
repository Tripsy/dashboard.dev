import type { Metadata } from 'next';
import { DriverPanel } from '@/app/(public)/_components/driver-panel.component';
import { WorkSessionProvider } from '@/app/(public)/_providers/work-session.provider';
import ProtectedRoute from '@/components/protected-route.component';
import { RouteAuthEnum } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('home.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	return (
		<ProtectedRoute routeAuth={RouteAuthEnum.AUTHENTICATED}>
			<WorkSessionProvider>
				<DriverPanel />
			</WorkSessionProvider>
		</ProtectedRoute>
	);
}
