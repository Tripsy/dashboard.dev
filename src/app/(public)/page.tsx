import type { Metadata } from 'next';
import HomeContent from '@/app/(public)/home-content.componen';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('home.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default function Page() {
	return <HomeContent />;
}
