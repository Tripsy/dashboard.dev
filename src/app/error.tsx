'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ErrorWrapperComponent } from '@/components/error-wrapper.component';
import { Button } from '@/components/ui/button';
import Routes from '@/config/routes.setup';

export default function ErrorBoundary({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	useEffect(() => {
		console.error('Error:', error);
	}, [error]);

	return (
		<ErrorWrapperComponent description={error.message}>
			<div className="mt-8 text-center">
				<Button onClick={() => reset()}>Try Again</Button> or go back to
				the{' '}
				<Link href={Routes.get('home')} className="underline link">
					home page
				</Link>
			</div>
		</ErrorWrapperComponent>
	);
}
