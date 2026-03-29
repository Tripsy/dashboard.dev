'use client';

import { FormManage } from '@/app/(dashboard)/_components/form-manage.component';
import { FormManageClient } from '@/app/(dashboard)/dashboard/clients/form-manage-client.component';
import {ClientContact, ClientFinancial, ClientFormValuesType, ClientModel, ClientTypeEnum} from "@/models/client.model";

export function FormManageClientAddressClientComponent() {
	return (
		<FormManageClient actionName={"create"} formValues={{
			client_type: ClientTypeEnum.COMPANY,
			company_name: null,
			company_cui: null,
			company_reg_com: null,
			iban: null,
			bank_name: null,
			contact_name: null,
			contact_email: null,
			contact_phone: null,
			notes: null,
		}} errors={undefined} handleChange={function(field: "client_type" | "company_name" | "company_cui" | "company_reg_com" | "person_name" | "person_identification_number" | "notes" | keyof ClientFinancial | keyof ClientContact, value: string | boolean | number | Date | null): void {
            throw new Error("Function not implemented.");
        } } pending={false} />);

	// return (
	// 	<FormManage<"clients", ClientModel, ClientFormValuesType>
	// 		key="form-embedded-client-create"
	// 		// onSuccessComplete={(resultData) => {
	// 		// 	if (
	// 		// 		resultData &&
	// 		// 		typeof resultData === 'object' &&
	// 		// 		'id' in resultData &&
	// 		// 		typeof (resultData as { id: unknown }).id === 'number'
	// 		// 	) {
	// 		// 		window.dispatchEvent(
	// 		// 			new CustomEvent<ClientAddressNewClientCreatedDetail>(
	// 		// 				CLIENT_ADDRESS_NEW_CLIENT_CREATED_EVENT,
	// 		// 				{
	// 		// 					detail: {
	// 		// 						client: resultData as Partial<ClientModel>,
	// 		// 					},
	// 		// 				},
	// 		// 			),
	// 		// 		);
	// 		// 	}
	// 		//
	// 		// 	onOuterClose();
	// 		// }}
	// 	>
	// 		{clientForm}
	// 	</FormManage>
	// );
}