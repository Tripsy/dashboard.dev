import type { Metadata } from 'next';
import AccountEdit from '@/app/(public)/account/edit/account-edit.component';
import ProtectedRoute from '@/components/protected-route.component';
import { RouteAuth } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('account-edit.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	return (
		<ProtectedRoute routeAuth={RouteAuth.AUTHENTICATED}>
			<div className="bg-gradient-hero">
				<AccountEdit />
			</div>
		</ProtectedRoute>
	);
}
