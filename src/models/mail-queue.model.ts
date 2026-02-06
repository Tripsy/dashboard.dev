import type { TemplateContentEmailType } from '@/models/template.model';
import type { LanguageEnum } from '@/models/user.model';

export enum MailQueueStatusEnum {
	PENDING = 'pending',
	SENT = 'sent',
	ERROR = 'error',
}

export type MailQueueModel<D = Date | string> = {
	id: number;
	template: {
		id: number;
		label: string;
	} | null;
	language: LanguageEnum;
	content: TemplateContentEmailType & {
		vars: Record<string, unknown>;
	};
	to: {
		name: string;
		address: string;
	};
	from?: {
		name: string;
		address: string;
	};
	status: MailQueueStatusEnum;
	error: string | null;
	sent_at: D;
	created_at: D;
	updated_at: D;
};
