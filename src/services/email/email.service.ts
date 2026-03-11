import templates from '@/config/nunjucks.config';
import { Configuration } from '@/config/settings.config';
import { SesEmailService } from '@/services/email/email-ses.service';
import { SmtpEmailService } from '@/services/email/email-smtp.service';
import {
	type EmailContent,
	EmailProvider,
	type EmailService,
	type EmailTemplate,
} from '@/types/email.type';

export function prepareEmailContent(template: EmailTemplate): EmailContent {
	try {
		const emailSubject = templates.renderString(
			template.content.subject,
			template.vars || {},
		);
		const emailContent = templates.renderString(
			template.content.html,
			template.vars || {},
		);

		return {
			subject: emailSubject,
			text: template.content.text
				? templates.renderString(
						template.content.text,
						template.vars || {},
					)
				: undefined,
			html: template.content.layout
				? templates.render(`emails/${template.content.layout}.html`, {
						language: template.language,
						emailSubject: emailSubject,
						emailContent: emailContent,
					})
				: emailContent,
		};
	} catch (error: unknown) {
		console.error(error);

		throw new Error('Template render error');
	}
}

let currentServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
	const provider =
		(Configuration.get('mail.provider') as EmailProvider) ||
		EmailProvider.SES;

	if (currentServiceInstance) {
		return currentServiceInstance;
	}

	switch (provider) {
		case EmailProvider.SMTP:
			currentServiceInstance = new SmtpEmailService();
			break;
		default:
			currentServiceInstance = new SesEmailService();
			break;
	}

	return currentServiceInstance;
}
