import {
	ArrowRight,
	FileCheck2,
	LayoutDashboard,
	ShieldCheck,
	Truck,
	Users,
	Wallet,
} from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Link } from '@/components/ui/link';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import { logger } from '@/helpers/logger.helper';
import type { AuthModel } from '@/models/auth.model';
import { UserRoleEnum } from '@/models/user.model';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('home.meta.title', {
			app_name: Configuration.get('app.name'),
		}),
	};
}

const features = [
	{
		icon: FileCheck2,
		title: 'CMR & Transport Documents',
		description:
			'Digitize CMR consignment notes, attach vehicles and sessions, then sign and print from any device.',
	},
	{
		icon: Truck,
		title: 'Fleet & Work Sessions',
		description:
			'Track company vehicles and driver work sessions from dispatch to delivery, in real time.',
	},
	{
		icon: Wallet,
		title: 'Cash Flow',
		description:
			'Record income and expenses per client, vendor or driver, with a full operational history.',
	},
	{
		icon: Users,
		title: 'Clients & Vendors',
		description:
			'Keep a shared directory of clients, vendors, brands and addresses across the whole team.',
	},
	{
		icon: ShieldCheck,
		title: 'Roles & Permissions',
		description:
			'Grant per-entity, per-operation access so admins, operators and drivers only see what they need.',
	},
	{
		icon: LayoutDashboard,
		title: 'One Admin Dashboard',
		description:
			'Every entity — users, logs, mail queue, templates — managed from a single, consistent CRUD interface.',
	},
];

async function getAuth(): Promise<AuthModel | null> {
	const headersList = await headers();
	const authHeader = headersList.get('x-auth-data');

	try {
		return authHeader ? JSON.parse(authHeader) : null;
	} catch (error: unknown) {
		logger.error('Failed to parse the x-auth-data header', error);

		return null;
	}
}

export default async function Page() {
	const auth = await getAuth();

	// Drivers get their own operational panel, not the marketing/admin home page.
	if (auth?.role === UserRoleEnum.DRIVER) {
		redirect(Routes.get('driver-panel'));
	}

	const isDashboardUser = auth !== null;

	return (
		<>
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-hero">
				<div className="container-default py-20 md:py-32">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
							Run your{' '}
							<span className="text-gradient">fleet</span>
							<br className="hidden sm:block" /> from a single
							dashboard
						</h1>
						<p className="text-lg md:text-xl text-muted mb-8 max-w-2xl mx-auto">
							CMR documents, work sessions, vehicles and cash flow
							— all in one place, with the right access for every
							role on your team.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							{isDashboardUser ? (
								<Link
									size="lg"
									className="h-12 px-8 text-base"
									href={Routes.get('dashboard')}
								>
									Go to Dashboard
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							) : (
								<>
									<Link
										size="lg"
										className="h-12 px-8 text-base"
										href={Routes.get('register')}
									>
										Create Free Account
										<ArrowRight className="ml-2 h-5 w-5" />
									</Link>
									<Link
										size="lg"
										variant="outline"
										className="h-12 px-8 text-base"
										href={Routes.get('login')}
									>
										Sign In
									</Link>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Decorative elements */}
				<div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-default/50 rounded-full blur-3xl" />
			</section>

			{/* Features Section */}
			<section className="py-20 md:py-28">
				<div className="container-default">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Everything Your Operation Needs
						</h2>
						<p className="text-lg text-muted max-w-2xl mx-auto">
							A complete toolkit for managing transport documents,
							fleet activity and back-office operations.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{features.map((feature) => (
							<div
								key={feature.title}
								className="group p-6 rounded-xl border border-border bg-surface card-hover"
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft mb-4">
									<feature.icon className="h-6 w-6 text-accent-soft-foreground" />
								</div>
								<h3 className="text-lg font-semibold mb-2">
									{feature.title}
								</h3>
								<p className="text-sm text-muted">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 md:py-28 bg-surface-secondary/30">
				<div className="container-default">
					<div className="max-w-3xl mx-auto text-center">
						{isDashboardUser ? (
							<>
								<h2 className="text-3xl md:text-4xl font-bold mb-4">
									Back to work
								</h2>
								<p className="text-lg text-muted mb-8">
									Jump into the admin dashboard to manage
									users, fleet, documents and more.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Link
										size="lg"
										className="h-12 px-8"
										href={Routes.get('dashboard')}
									>
										Open Dashboard
									</Link>
								</div>
							</>
						) : (
							<>
								<h2 className="text-3xl md:text-4xl font-bold mb-4">
									Ready to Get Started?
								</h2>
								<p className="text-lg text-muted mb-8">
									Create an account to manage your fleet,
									documents and team in one dashboard.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Link
										size="lg"
										className="h-12 px-8"
										href={Routes.get('register')}
									>
										Create Free Account
									</Link>
									<Link
										size="lg"
										variant="secondary"
										className="h-12 px-8"
										href={Routes.get('login')}
									>
										Sign In
									</Link>
								</div>
							</>
						)}
					</div>
				</div>
			</section>
		</>
	);
}
