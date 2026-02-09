import type { Metadata } from 'next';
import EmailConfirmSend from '@/app/(public)/account/email-confirm-send/email-confirm-send.component';
import ProtectedRoute from '@/components/protected-route.component';
import { RouteAuth } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('email_confirm_send.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
		robots: 'noindex, nofollow',
	};
}

export default async function Page() {
	return (
		<ProtectedRoute routeAuth={RouteAuth.UNAUTHENTICATED}>
			<div className="bg-gradient-hero">
				<EmailConfirmSend />
			</div>
		</ProtectedRoute>
	);
}
