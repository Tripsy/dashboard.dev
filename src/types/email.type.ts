export type EmailContent = {
	subject: string;
	text?: string;
	html: string;
	layout?: string;
};

export type TemplateVars = Record<
	string,
	string | number | boolean | string[] | Record<string, string>
>;

export type EmailTemplate = {
	language: string;
	content: EmailContent;
	vars?: TemplateVars;
};

export type EmailAddressType = {
	name: string;
	address: string;
};

export const EmailProviderEnum = {
	SMTP: 'smtp',
	SES: 'ses',
} as const;

export type EmailProvider =
	(typeof EmailProviderEnum)[keyof typeof EmailProviderEnum];

/**
 * How the SMTP connection is encrypted:
 * - `ssl` — implicit TLS, encrypted from the first byte (usually port 465)
 * - `tls` — plain connection upgraded via STARTTLS (usually port 587 or 2525)
 * - `none` — no encryption
 */
export const MailEncryptionEnum = {
	NONE: 'none',
	TLS: 'tls',
	SSL: 'ssl',
} as const;

export type MailEncryption =
	(typeof MailEncryptionEnum)[keyof typeof MailEncryptionEnum];

export interface EmailService {
	sendEmail(
		content: EmailContent,
		from: EmailAddressType,
		to: EmailAddressType,
		replyTo: EmailAddressType,
	): Promise<void>;
}
