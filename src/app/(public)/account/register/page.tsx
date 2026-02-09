import type { Metadata } from 'next';
import Register from '@/app/(public)/account/register/register.component';
import ProtectedRoute from '@/components/protected-route.component';
import { RouteAuth } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('register.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	return (
		<ProtectedRoute routeAuth={RouteAuth.UNAUTHENTICATED}>
			<div className="bg-gradient-hero">
				<Register />
			</div>
		</ProtectedRoute>
	);
}
