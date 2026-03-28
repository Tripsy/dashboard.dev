import { FormManage } from '@/app/(dashboard)/_components/form-manage.component';
import { FormManageClient } from '@/app/(dashboard)/dashboard/clients/form-manage-client.component';

export function FormManageClientAddressClientComponent() {
	return (
		<FormManage key="form-createClient">
			<FormManageClient />
		</FormManage>
	);
}
