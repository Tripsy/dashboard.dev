import type { Metadata } from 'next';
import EmailUpdate from '@/app/(public)/account/email-update/email-update.component';
import ProtectedRoute from '@/components/protected-route.component';
import { translate } from '@/config/lang';
import { RouteAuth } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('account_email_update.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	return (
		<section className="fit-container">
			<ProtectedRoute routeAuth={RouteAuth.AUTHENTICATED}>
				<div className="standard-box p-4 sm:p-8 shadow-md md:w-[28rem]">
					<EmailUpdate />
				</div>
			</ProtectedRoute>
		</section>
	);
}
