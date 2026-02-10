'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import {
	ErrorComponent,
	InfoComponent,
	LoadingComponent,
	SuccessComponent,
} from '@/components/status.component';
import Routes from '@/config/routes.setup';
import { useTranslation } from '@/hooks/use-translation.hook';

type ParamsType = 'error' | 'info' | 'success';

export default function Page() {
	const params = useParams<{ type: ParamsType }>();
	const searchParams = useSearchParams();

	const type = params.type;
	const r = searchParams.get('r') || 'generic';

	const messageKey = `app.${type}.${r}`;

	const translationsKeys = useMemo(() => [messageKey] as const, [messageKey]);

	const { translations, isTranslationLoading } =
		useTranslation(translationsKeys);

	if (isTranslationLoading) {
		return <LoadingComponent />;
	}

	switch (type) {
		case 'error':
			return (
				<ErrorComponent
					title="Error"
					description={translations[messageKey]}
				>
					<div className="text-center mt-6">
						Go back to{' '}
						<Link
							href={Routes.get('home')}
							className="text-primary font-medium hover:underline"
						>
							home page
						</Link>
					</div>
				</ErrorComponent>
			);
		case 'success':
			return (
				<SuccessComponent
					title="Success"
					description={translations[messageKey]}
				>
					<div className="text-center mt-6">
						Go back to{' '}
						<Link
							href={Routes.get('home')}
							className="text-primary font-medium hover:underline"
						>
							home page
						</Link>
					</div>
				</SuccessComponent>
			);
		case 'info':
			return (
				<InfoComponent
					title="Info"
					description={translations[messageKey]}
				>
					<div className="text-center mt-6">
						Go back to{' '}
						<Link
							href={Routes.get('home')}
							className="text-primary font-medium hover:underline"
						>
							home page
						</Link>
					</div>
				</InfoComponent>
			);
	}
}
