import Link from 'next/link';
import { Icons } from '@/components/icon.component';
import RoutesSetup from '@/config/routes.setup';

export function Footer() {
	return (
		<footer className="footer sm:footer-horizontal relative bg-base-100 items-center p-4">
			<aside className="items-center">
				<div>
					Copyright &copy; {new Date().getFullYear()} - All right
					reserved
				</div>
				<div className="flex gap-x-2">
					<Link
						href={RoutesSetup.get('page', {
							label: 'terms-and-conditions',
						})}
						className="hover:link-info"
						title="Terms & Conditions"
					>
						Terms & Conditions
					</Link>
					/
					<Link
						href={RoutesSetup.get('page', {
							label: 'privacy-policy',
						})}
						className="hover:link-info"
						title="Privacy Policy"
					>
						Privacy Policy
					</Link>
				</div>
			</aside>
			<div className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
				<a
					href="https://github.com/Tripsy/nextjs.test/tree/main"
					title="Github repository"
					target="_blank"
					rel="noopener"
				>
					<Icons.Design.Github className="text-2xl" />
				</a>
				<a
					href="https://www.linkedin.com/in/david-gabriel-8853a7115/"
					title="LinkedIn profile - Gabriel David"
					target="_blank"
					rel="noopener"
				>
					<Icons.Design.Linkedin className="text-2xl" />
				</a>
			</div>
		</footer>
	);
}
