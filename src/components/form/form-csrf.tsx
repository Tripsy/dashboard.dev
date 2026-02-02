'use client';

import { useEffect, useState } from 'react';
import { ApiRequest } from '@/helpers/api.helper';

async function fetchCsrfToken() {
	try {
		const result = await new ApiRequest()
			.setRequestMode('same-site')
			.setRequestInit({
				credentials: 'same-origin',
			})
			.doFetch<{ csrfToken: string }>('csrf', {
				method: 'GET',
			});

		return result?.data?.csrfToken || '';
	} catch (error) {
		console.error('Failed to fetch CSRF token:', error);

		return '';
	}
}

export function FormCsrf({ inputName }: { inputName: string }) {
	const [csrfToken, setCsrfToken] = useState('');

	useEffect(() => {
		(async () => {
			const token = await fetchCsrfToken();

			setCsrfToken(token);
		})();
	}, []);

	return <input type="hidden" name={inputName} value={csrfToken} />;
}
