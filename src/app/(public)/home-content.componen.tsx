'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Link } from '@/components/ui/link';
import Routes from '@/config/routes.setup';
import { UserRoleEnum } from '@/models/user.model';
import { useAuth } from '@/providers/auth.provider';

export default function HomeContent() {
	const { auth, authStatus } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (
			authStatus === 'authenticated' &&
			auth?.role === UserRoleEnum.DRIVER
		) {
			router.replace(Routes.get('driver-panel'));
		}
	}, [authStatus, auth, router]);

	return (
		<section className="py-20 md:py-28 bg-surface-secondary/30">
			<div className="container-default">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Ready to Get Started?
					</h2>
					<p className="text-lg text-muted mb-8">
						Join our team as a driver.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							size="lg"
							className="h-12 px-8"
							href={Routes.get('register')}
						>
							Create Free Account
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
