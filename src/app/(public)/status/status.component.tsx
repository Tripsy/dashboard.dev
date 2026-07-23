'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { ParamsType } from '@/app/(public)/status/[type]/page';
import {
	ErrorComponent,
	InfoComponent,
	LoadingComponent,
	SuccessComponent,
} from '@/components/status.component';
import Routes from '@/config/routes.setup';
import { useTranslation } from '@/hooks/use-translation.hook';

const COMPONENT_MAP = {
	error: ErrorComponent,
	success: SuccessComponent,
	info: InfoComponent,
} as const;

const TITLE_MAP: Record<ParamsType, string> = {
	error: 'Error',
	success: 'Success',
	info: 'Info',
} as const;

const HomeLink = () => (
	<div className="text-center mt-6">
		Go back to{' '}
		<Link
			href={Routes.get('home')}
			className="text-accent font-medium hover:underline"
		>
			home page
		</Link>
	</div>
);

export default function StatusComponent() {
	const params = useParams<{ type: ParamsType }>();
	const searchParams = useSearchParams();

	const type = params.type;
	const r = searchParams.get('r') || 'generic';
	const messageKey = `app.${type}.${r}`;

	const translationKeys = useMemo(() => [messageKey] as const, [messageKey]);
	const { translations, isTranslationLoading } =
		useTranslation(translationKeys);

	if (isTranslationLoading) {
		return <LoadingComponent />;
	}

	const StatusComponent = COMPONENT_MAP[type] ?? InfoComponent;
	const title = TITLE_MAP[type] ?? 'Info';

	return (
		<StatusComponent title={title} description={translations[messageKey]}>
			<HomeLink />
		</StatusComponent>
	);
}
