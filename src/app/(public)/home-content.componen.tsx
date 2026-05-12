'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
		<section className="py-20 md:py-28 bg-muted/30">
			<div className="container-default">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Ready to Get Started?
					</h2>
					<p className="text-lg text-muted-foreground mb-8">
						Join our team as a driver.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" className="h-12 px-8" asChild>
							<Link href={Routes.get('register')}>
								Create Free Account
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
