import type { Metadata } from 'next';
import PasswordUpdate from '@/app/(public)/account/password-update/password-update.component';
import ProtectedRoute from '@/components/protected-route.component';
import { RouteAuth } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('account_password_update.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	return (
		<section className="fit-container">
			<ProtectedRoute routeAuth={RouteAuth.AUTHENTICATED}>
				<div className="standard-box p-4 sm:p-8 shadow-md md:w-[28rem]">
					<PasswordUpdate />
				</div>
			</ProtectedRoute>
		</section>
	);
}
