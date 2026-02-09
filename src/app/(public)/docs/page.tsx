import type { Metadata } from 'next';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import { formatDate } from '@/helpers/date.helper';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('docs.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

export default async function Page() {
	return (
		<div className="default-container page-default">
			<div className="text-sm italic text-right">
				Last update: {formatDate(new Date(), 'default')}
			</div>
		</div>
	);
}
