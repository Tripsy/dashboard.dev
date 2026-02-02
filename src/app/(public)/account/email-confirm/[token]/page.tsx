import type { Metadata } from 'next';
import Link from 'next/link';
import { Icons } from '@/components/icon.component';
import { translate } from '@/config/lang';
import RoutesSetup from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { ApiError } from '@/exceptions/api.error';
import { ApiRequest, type ResponseFetch } from '@/helpers/api.helper';

interface Props {
	params: Promise<{
		token: string;
	}>;
}

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('email_confirm.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
		robots: 'noindex, nofollow',
	};
}

export default async function Page(props: Props) {
	const { params } = props;

	const resolvedParams = await params;
	const token = resolvedParams.token;

	let message: string;
	let success = false;

	try {
		const fetchResponse: ResponseFetch<null> | undefined =
			await new ApiRequest()
				.setRequestMode('remote-api')
				.doFetch(`/account/email-confirm/${token}`, {
					method: 'POST',
					next: { revalidate: 3600 },
				});

		if (fetchResponse?.success === false) {
			message =
				fetchResponse?.message ||
				(await translate('email_confirm.message.failed'));
		} else {
			success = true;
			message = await translate('email_confirm.message.success');
		}
	} catch (error: unknown) {
		if (error instanceof ApiError) {
			message = error.message;
		} else {
			message = await translate('email_confirm.message.failed');
		}
	}

	return (
		<section className="fit-container">
			<div className="standard-box p-4 sm:p-8 shadow-md md:w-[24rem]">
				<div className="form-section">
					<h1 className="text-center">Email Confirmation</h1>

					<div className="text-sm">
						<div className="flex items-center gap-1">
							{success ? (
								<Icons.Status.Success className="text-success" />
							) : (
								<Icons.Status.Error className="text-error" />
							)}
							{message}
						</div>
					</div>
				</div>

				{success ? (
					<p className="mt-4 text-center">
						<span className="text-sm text-gray-500 dark:text-base-content">
							What's next? Check{' '}
							<Link
								href={RoutesSetup.get('account-me')}
								className="link link-info link-hover text-sm"
							>
								your account
							</Link>{' '}
							or navigate to{' '}
							<Link
								href={RoutesSetup.get('home')}
								className="link link-info link-hover text-sm"
							>
								home page
							</Link>
						</span>
					</p>
				) : (
					<p className="mt-4 text-center">
						<span className="text-sm text-gray-500 dark:text-base-content">
							What now? You can register for a{' '}
							<Link
								href={RoutesSetup.get('register')}
								className="link link-info link-hover text-sm"
							>
								new account
							</Link>{' '}
							or request{' '}
							<Link
								href={RoutesSetup.get('email-confirm-send')}
								className="link link-info link-hover text-sm"
							>
								another confirmation link
							</Link>
						</span>
					</p>
				)}
			</div>
		</section>
	);
}
