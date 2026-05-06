import {
	ArrowRight,
	Code,
	Globe,
	Palette,
	Shield,
	Sparkles,
	Zap,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('home.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

const features = [
	{
		icon: Palette,
		title: 'Beautiful Design System',
		description:
			'Soft lavender and warm cream palette with WCAG AA compliant colors.',
	},
	{
		icon: Zap,
		title: 'Lightning Fast',
		description:
			'Optimized React components with smooth animations and transitions.',
	},
	{
		icon: Shield,
		title: 'Accessible First',
		description:
			'Built with accessibility in mind, supporting screen readers and keyboard nav.',
	},
	{
		icon: Code,
		title: 'Developer Friendly',
		description:
			'Clean, typed components with comprehensive documentation.',
	},
	{
		icon: Globe,
		title: 'Responsive Design',
		description:
			'Mobile-first approach ensuring great experience on all devices.',
	},
	{
		icon: Sparkles,
		title: 'Dark Mode Ready',
		description:
			'Seamless light and dark mode with system preference detection.',
	},
];

export default function Page() {
	return (
		<>
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-hero">
				<div className="container-default py-20 md:py-32">
					<div className="max-w-3xl mx-auto text-center">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
							<Sparkles className="h-4 w-4" />
							<span>Introducing NReady v1.0</span>
						</div>
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
							Build{' '}
							<span className="text-gradient">Beautiful</span>{' '}
							React Apps
							<br className="hidden sm:block" /> with Confidence
						</h1>
						<p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
							A comprehensive design system with accessible
							components, responsive layouts, and a stunning color
							palette that makes your applications shine.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button
								size="lg"
								className="h-12 px-8 text-base"
								asChild
							>
								<Link href={Routes.get('register')}>
									Get Started
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="h-12 px-8 text-base"
								asChild
							>
								<Link href={Routes.get('docs')}>
									View Documentation
								</Link>
							</Button>
						</div>
					</div>
				</div>

				{/* Decorative elements */}
				<div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/50 rounded-full blur-3xl" />
			</section>

			{/* Features Section */}
			<section className="py-20 md:py-28">
				<div className="container-default">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Everything You Need
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							A complete toolkit for building modern React
							applications with beautiful, accessible, and
							performant components.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{features.map((feature) => (
							<div
								key={feature.title}
								className="group p-6 rounded-xl border border-border bg-card card-hover"
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent mb-4">
									<feature.icon className="h-6 w-6 text-accent-foreground" />
								</div>
								<h3 className="text-lg font-semibold mb-2">
									{feature.title}
								</h3>
								<p className="text-sm text-muted-foreground">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 md:py-28 bg-muted/30">
				<div className="container-default">
					<div className="max-w-3xl mx-auto text-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Ready to Get Started?
						</h2>
						<p className="text-lg text-muted-foreground mb-8">
							Join thousands of developers building beautiful
							applications with NReady.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" className="h-12 px-8" asChild>
								<Link href={Routes.get('register')}>
									Create Free Account
								</Link>
							</Button>
							<Button
								size="lg"
								variant="secondary"
								className="h-12 px-8"
								asChild
							>
								<Link href={Routes.get('docs')}>
									Explore Components
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
