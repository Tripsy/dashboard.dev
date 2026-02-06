'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Notice } from '@/components/notice.component';
import { useTranslation } from '@/hooks/use-translation.hook';

type ParamsType = 'error' | 'warning' | 'info' | 'success';

export default function Page() {
	const params = useParams<{ type: ParamsType }>();
	const searchParams = useSearchParams();

	const type = params.type;
	const r = searchParams.get('r') || 'generic';

	const messageKey = `app.${type}.${r}`;

	const translationsKeys = useMemo(() => [messageKey] as const, [messageKey]);

	const { translations } = useTranslation(translationsKeys);

	return (
		<div className="fit-container max-w-[32rem]">
			<Notice type={type} message={translations[messageKey]} />
		</div>
	);
}
