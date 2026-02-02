import type { Metadata } from 'next';
import Logout from '@/app/(public)/account/logout/logout.component';
import { translate } from '@/config/lang';
import { Configuration } from '@/config/settings.config';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('logout.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default function Page() {
	return (
		<section className="fit-container">
			<div className="standard-box p-4 sm:p-8 shadow-md md:w-[22rem]">
				<Logout />
			</div>
		</section>
	);
}
