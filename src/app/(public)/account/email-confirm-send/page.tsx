import type { Metadata } from 'next';
import EmailConfirmSend from '@/app/(public)/account/email-confirm-send/email-confirm-send.component';
import ProtectedRoute from '@/components/protected-route.component';
import { translate } from '@/config/lang';
import { RouteAuth } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';

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
		<section className="fit-container">
			<ProtectedRoute routeAuth={RouteAuth.UNAUTHENTICATED}>
				<div className="standard-box p-4 sm:p-8 shadow-md md:w-[22rem]">
					<EmailConfirmSend />
				</div>
			</ProtectedRoute>
		</section>
	);
}
