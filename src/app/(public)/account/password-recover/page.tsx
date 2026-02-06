import type { Metadata } from 'next';
import PasswordRecover from '@/app/(public)/account/password-recover/password-recover.component';
import ProtectedRoute from '@/components/protected-route.component';
import { RouteAuth } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('password_recover.meta.title', {
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
					<PasswordRecover />
				</div>
			</ProtectedRoute>
		</section>
	);
}
