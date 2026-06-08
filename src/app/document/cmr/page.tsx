import type { Metadata } from 'next';
import { DocumentCmrPrint } from '@/app/document/cmr/document-cmr-print.component';
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
		<DocumentCmrPrint
			props={{
				signed: true,
				data: {
					id: String(478).padStart(6, '0'),
					pickupAddress: 'Bucuresti, str Zorelelor nr 44',
					deliveryAddress: 'Craiova, str Biruintei nr 256',
					work_session_users: [
						'Gheorghe Constantin',
						'Maria Popescu',
					],
					auto_license_plate: 'RO-123456',
					trailer_license_plate: '',
				},
			}}
		/>
	);
}
