import type { Metadata } from 'next';
import PasswordRecoverChange from '@/app/(public)/account/password-recover-change/[token]/password-recover-change.component';
import ProtectedRoute from '@/components/protected-route.component';
import { RouteAuth } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('password_recover_change.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
		robots: 'noindex, nofollow',
	};
}

export default async function Page() {
	return (
		<ProtectedRoute routeAuth={RouteAuth.UNAUTHENTICATED}>
			<div className="bg-gradient-hero">
				<PasswordRecoverChange />
			</div>
		</ProtectedRoute>
	);
}
