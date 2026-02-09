import { Github, Heart, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';
import { LogoComponent } from '@/components/layout/logo.default';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';

const footerLinks = {
	product: [
		{ label: 'Features', href: '/features' },
		{ label: 'Documentation', href: Routes.get('docs') },
		{ label: 'Changelog', href: '/changelog' },
	],
	company: [
		{ label: 'About', href: 'https://play-zone.ro' },
		{ label: 'Contact', href: '/contact' },
	],
	legal: [
		{
			label: 'Privacy',
			href: Routes.get('page', {
				label: 'privacy-policy',
			}),
			title: 'Privacy Policy',
		},
		{
			label: 'Terms',
			href: Routes.get('page', {
				label: 'terms-and-conditions',
			}),
			title: 'Terms & Conditions',
		},
	],
};

const socialLinks = [
	{ icon: Github, href: 'https://github.com/Tripsy', label: 'GitHub' },
	{
		icon: Linkedin,
		href: 'https://www.linkedin.com/in/david-gabriel-8853a7115/',
		label: 'LinkedIn',
	},
	{ icon: Mail, href: 'mailto:engine@play-zone.ro', label: 'Email' },
];

export function Footer() {
	return (
		<footer className="border-t border-border bg-muted/30">
			<div className="container-custom py-12 md:py-16">
				<div className="flex flex-col md:flex-row gap-12 md:gap-20">
					{/* Brand column */}
					<div className="flex flex-col mx-auto md:mx-0">
						<Link
							href={Routes.get('home')}
							className="flex items-center gap-2 mb-4"
						>
							<LogoComponent
								divClass="h-9 w-9"
								spanClass="text-lg"
							/>
							<span className="text-xl font-semibold text-foreground">
								{Configuration.get('app.name')}
							</span>
						</Link>
						<p className="text-sm text-muted-foreground mb-4 max-w-xs">
							The solution to quickly build MVPs, CMS platforms,
							E-commerce solutions
						</p>
						<div className="flex gap-3">
							{socialLinks.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
									aria-label={social.label}
								>
									<social.icon className="h-5 w-5" />
								</a>
							))}
						</div>
					</div>

					<div className="flex justify-around md:gap-20">
						<div>
							<h3 className="text-sm font-semibold text-foreground mb-4">
								Product
							</h3>
							<ul className="space-y-3">
								{footerLinks.product.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm text-muted-foreground hover:text-foreground transition-colors"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h3 className="text-sm font-semibold text-foreground mb-4">
								Company
							</h3>
							<ul className="space-y-3">
								{footerLinks.company.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm text-muted-foreground hover:text-foreground transition-colors"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h3 className="text-sm font-semibold text-foreground mb-4">
								Legal
							</h3>
							<ul className="space-y-3">
								{footerLinks.legal.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm text-muted-foreground hover:text-foreground transition-colors"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				<div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-sm text-muted-foreground">
						© {new Date().getFullYear()} NReady. All rights
						reserved.
					</p>
					<p className="text-sm text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
						<Heart /> Made for developers
					</p>
				</div>
			</div>
		</footer>
	);
}
