'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import Routes from '@/config/routes.setup';
import { cn } from '@/helpers/css.helper';

type LanguageSwitcherProps = {
	currentLanguage: string;
	supportedLanguages: string[];
};

export function LanguageSwitcher({
	currentLanguage,
	supportedLanguages,
}: LanguageSwitcherProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const switchLanguage = (language: string) => {
		if (language === currentLanguage || isPending) {
			return;
		}

		startTransition(async () => {
			const response = await fetch(Routes.get('language'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ language }),
				credentials: 'include',
			});

			if (response.ok) {
				router.refresh();
			}
		});
	};

	if (supportedLanguages.length === 1) {
		return null;
	}

	return (
		<div className="flex items-center gap-2 rounded-lg glass p-1">
			{supportedLanguages.map((language) => (
				<Button
					key={language}
					type="button"
					variant="ghost"
					size="sm"
					disabled={isPending}
					onClick={() => switchLanguage(language)}
					className={cn(
						'relative min-w-10 px-2.5 text-xs font-semibold uppercase transition-all duration-200 rounded-md hover:scale-105',
						currentLanguage === language
							? 'bg-warning text-warning-foreground shadow-md hover:bg-warning/90 hover:text-warning-foreground'
							: 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground hover:shadow-sm',
					)}
					aria-label={language.toUpperCase()}
					aria-current={
						currentLanguage === language ? 'true' : undefined
					}
				>
					{language.toUpperCase()}
				</Button>
			))}
		</div>
	);
}
