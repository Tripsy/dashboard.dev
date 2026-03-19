import { formatAmount } from '@/helpers/string.helper';

export function DisplayAmount({
	cents,
	currencyCode,
	sign,
}: {
	cents: number;
	currencyCode: string;
	sign: 1 | -1;
}) {
	const formatted = formatAmount(cents, currencyCode, sign);

	return (
		<span style={{ color: formatted.sign === '-' ? 'red' : 'inherit' }}>
			{formatted.sign} {formatted.value} {formatted.currency}
		</span>
	);
}
