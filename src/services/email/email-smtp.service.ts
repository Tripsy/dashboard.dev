import nodemailer, { type Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import {
	type EmailAddressType,
	type EmailContent,
	type EmailService,
	MailEncryptionEnum,
} from '@/types/email.type';

export class SmtpEmailService implements EmailService {
	private transporter: Transporter<SMTPTransport.SentMessageInfo> | null =
		null;

	private getTransporter() {
		if (!this.transporter) {
			const host = Configuration.get('mail.host');

			if (!host) {
				throw new Error('MAIL_HOST is not defined');
			}

			const encryption = Configuration.get('mail.encryption');

			this.transporter = nodemailer.createTransport({
				host: host,
				port: Configuration.get('mail.port'),
				// `secure` means implicit TLS from the first byte, which only the SSL
				// ports (465) speak. STARTTLS ports connect in the clear and upgrade,
				// so they need `requireTLS` instead — without it nodemailer upgrades
				// only opportunistically and silently accepts a plaintext session.
				secure: encryption === MailEncryptionEnum.SSL,
				requireTLS: encryption === MailEncryptionEnum.TLS,
				auth: {
					user: Configuration.get('mail.username'),
					pass: Configuration.get('mail.password'),
				},
				connectionTimeout: 10000,
				logger: true,
				debug: true,
			});
		}

		return this.transporter;
	}

	async sendEmail(
		content: EmailContent,
		from: EmailAddressType,
		to: EmailAddressType,
		replyTo: EmailAddressType,
	): Promise<void> {
		try {
			await this.getTransporter().sendMail({
				to: to,
				replyTo: replyTo,
				from: from,
				subject: content.subject,
				text: content.text,
				html: content.html,
			});

			console.debug(
				await translate('app.email.sent_success', {
					subject: content.subject,
					to: to.address,
				}),
			);
		} catch (error) {
			console.error('SMTP Error:', error);
			throw error;
		}
	}
}
