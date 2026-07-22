'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Switch } from '@/components/ui/switch';
import Routes from '@/config/routes.setup';

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

	// The switch toggles between the first two supported languages (e.g. en / ro).
	if (supportedLanguages.length < 2) {
		return null;
	}

	const [langOff, langOn] = supportedLanguages;
	const isOn = currentLanguage === langOn;

	return (
		<Switch
			size="lg"
			isSelected={isOn}
			isDisabled={isPending}
			onChange={(selected) => switchLanguage(selected ? langOn : langOff)}
			aria-label="Switch language"
			thumbIcon={
				<span className="text-[10px] font-bold uppercase">
					{isOn ? langOn : langOff}
				</span>
			}
		/>
	);
}
