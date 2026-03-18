import { useMemo } from 'react';
import { formatDate } from '@/helpers/date.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { ClientModel } from '@/models/client.model';

export function ClientDetails({
	entry,
}: {
	entry: ClientModel | undefined;
}) {
	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.text.no_entry_selected',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	if (!entry) {
		return (
			<div className="min-h-48 flex items-center justify-center">
				{translations['dashboard.text.no_entry_selected']}
			</div>
		);
	}

	console.log(entry)

	return (
		<div className="space-y-6">
			<div className="space-y-1 text-sm">
				<div>
					<span className="font-semibold">
						ID
					</span>{' '}
					{entry.id}
				</div>
				<div>
					<span className="font-semibold">
						Type
					</span>{' '}
					{formatEnumLabel(entry.client_type)}
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Contact Details
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">
							Name
						</span>{' '}
						{entry.contact_name}
					</div>
					<div>
						<span className="font-semibold">
							Email
						</span>{' '}
						{entry.contact_email}
					</div>
					<div>
						<span className="font-semibold">
							Phone
						</span>{' '}
						{entry.contact_phone}
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Financial Details
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">
							IBAN
						</span>{' '}
						{entry.iban}
					</div>
					<div>
						<span className="font-semibold">
							Bank Name
						</span>{' '}
						{entry.bank_name}
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Address Details
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">
							Place
						</span>{' '}
						{entry.address_location}
					</div>
					<div>
						<span className="font-semibold">
							Location
						</span>{' '}
						{entry.address_info}
					</div>
					<div>
						<span className="font-semibold">
							Postal Code
						</span>{' '}
						{entry.address_postal_code}
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Timestamps
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">
							Created At
						</span>{' '}
						{formatDate(entry.created_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">
							Updated At
						</span>{' '}
						{formatDate(entry.updated_at, 'date-time')}
					</div>
					{entry.deleted_at && (
						<div>
							<span className="font-semibold">
								Deleted At
							</span>{' '}
							<span className="text-red-500">
								{formatDate(entry.deleted_at, 'date-time')}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
