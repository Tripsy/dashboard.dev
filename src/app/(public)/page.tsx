import type { Metadata } from 'next';
import Link from 'next/link';
import RoutesSetup from '@/config/routes.setup';
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
	return (
		<div>
			<main className="flex items-center">Lorem ipsum</main>
			<footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
				<Link
					href={RoutesSetup.get('register')}
					className="link link-info link-hover text-sm"
				>
					Create an account
				</Link>
				<Link
					href={RoutesSetup.get('dashboard')}
					className="link link-info link-hover text-sm"
				>
					Dashboard
				</Link>
			</footer>
		</div>
	);
}
