import {
	ArrowUpRight,
	BanknoteArrowDown,
	DollarSign,
	FileText,
	Hourglass,
} from 'lucide-react';
import type { Metadata } from 'next';
import { ActiveWorkSessions } from '@/app/(dashboard)/_components/stats/active-work-sessions';
import { CountCMRs } from '@/app/(dashboard)/_components/stats/count-cmrs';
import { CountWorkingHours } from '@/app/(dashboard)/_components/stats/count-working-hours';
import { LatestCMRs } from '@/app/(dashboard)/_components/stats/latest-cmrs';
import { RecentActivity } from '@/app/(dashboard)/_components/stats/recent-activity';
import { SumExpenses } from '@/app/(dashboard)/_components/stats/sum-expenses';
import { SumRevenues } from '@/app/(dashboard)/_components/stats/sum-revenues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuItem,
// 	DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('dashboard.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

function Stats({
	box,
}: {
	box: 'cmr' | 'working-hours' | 'expenses' | 'revenues';
}) {
	const config = {
		cmr: {
			title: 'CMRs',
			icon: FileText,
			component: CountCMRs,
		},
		'working-hours': {
			title: 'Working Hours',
			icon: Hourglass,
			component: CountWorkingHours,
		},
		expenses: {
			title: 'Expenses',
			icon: BanknoteArrowDown,
			component: SumExpenses,
		},
		revenues: {
			title: 'Revenues',
			icon: DollarSign,
			component: SumRevenues,
		},
	};

	const Icon = config[box].icon;
	const StatsComponent = config[box].component;

	return (
		<Card className="card-hover">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-muted">
					{config[box].title}
				</CardTitle>
				<Icon className="h-4 w-4 text-muted" />
			</CardHeader>
			<CardContent>
				<StatsComponent />
			</CardContent>
		</Card>
	);
}

// function ChartSkeleton() {
// 	const items = Array.from({ length: 12 }, (_, i) => ({
// 		id: `chart-bar-${i}`,
// 		height: Math.random() * 80 + 20,
// 	}));
//
// 	return (
// 		<>
// 			<div className="h-64 flex items-end gap-2">
// 				{items.map((v) => (
// 					<Skeleton
// 						key={v.id}
// 						className="flex-1 rounded-t-md"
// 						style={{ height: `${v.height}%` }}
// 					/>
// 				))}
// 			</div>
// 			<div className="flex justify-between mt-2">
// 				{items.map((v) => (
// 					<Skeleton key={v.id} className="h-3 w-8" />
// 				))}
// 			</div>
// 		</>
// 	);
// }
//
// async function Chart() {
// 	return (
// 		<>
// 			<div className="h-64 flex items-end gap-2">
// 				{[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map(
// 					(height) => (
// 						<div
// 							key={height}
// 							className="flex-1 bg-accent/20 rounded-t-md transition-all hover:bg-accent/40"
// 							style={{ height: `${height}%` }}
// 						/>
// 					),
// 				)}
// 			</div>
// 			<div className="flex justify-between mt-2 text-xs text-muted">
// 				<span>Jan</span>
// 				<span>Feb</span>
// 				<span>Mar</span>
// 				<span>Apr</span>
// 				<span>May</span>
// 				<span>Jun</span>
// 				<span>Jul</span>
// 				<span>Aug</span>
// 				<span>Sep</span>
// 				<span>Oct</span>
// 				<span>Nov</span>
// 				<span>Dec</span>
// 			</div>
// 		</>
// 	);
// }

export default async function Page() {
	return (
		<>
			{/* Stats with skeleton */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
				<Stats box="cmr" />
				<Stats box="working-hours" />
				<Stats box="expenses" />
				<Stats box="revenues" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="space-y-6">
					{/* Work Sessions */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Work Sessions</CardTitle>
							<Link
								variant="ghost"
								size="sm"
								className="gap-1"
								href={Routes.get('work-session')}
							>
								View more <ArrowUpRight className="h-4 w-4" />
							</Link>
						</CardHeader>
						<CardContent>
							<ActiveWorkSessions />
						</CardContent>
					</Card>

					{/* Latest CMRs */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Latest CMRs</CardTitle>
							<Link
								variant="ghost"
								size="sm"
								className="gap-1"
								href={Routes.get('cmr')}
							>
								View more <ArrowUpRight className="h-4 w-4" />
							</Link>
						</CardHeader>
						<CardContent>
							<LatestCMRs />
						</CardContent>
					</Card>

					{/* Chart */}
					{/*<Card>*/}
					{/*	<CardHeader className="flex flex-row items-center justify-between">*/}
					{/*		<CardTitle>Analytics Overview</CardTitle>*/}
					{/*		<DropdownMenu>*/}
					{/*			<DropdownMenuTrigger asChild>*/}
					{/*				<Button variant="ghost" className="h-8 w-8">*/}
					{/*					<MoreHorizontal className="h-4 w-4" />*/}
					{/*				</Button>*/}
					{/*			</DropdownMenuTrigger>*/}
					{/*			<DropdownMenuContent align="end">*/}
					{/*				<DropdownMenuItem>*/}
					{/*					Last 7 days*/}
					{/*				</DropdownMenuItem>*/}
					{/*				<DropdownMenuItem>*/}
					{/*					Last 30 days*/}
					{/*				</DropdownMenuItem>*/}
					{/*				<DropdownMenuItem>*/}
					{/*					Last 90 days*/}
					{/*				</DropdownMenuItem>*/}
					{/*			</DropdownMenuContent>*/}
					{/*		</DropdownMenu>*/}
					{/*	</CardHeader>*/}
					{/*	<CardContent>*/}
					{/*		<Suspense fallback={<ChartSkeleton />}>*/}
					{/*			<Chart />*/}
					{/*		</Suspense>*/}
					{/*	</CardContent>*/}
					{/*</Card>*/}
				</div>

				{/* Recent activity */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Recent Activity</CardTitle>
						<Link
							variant="ghost"
							size="sm"
							className="gap-1"
							href={Routes.get('log-history')}
						>
							View more <ArrowUpRight className="h-4 w-4" />
						</Link>
					</CardHeader>
					<CardContent>
						<RecentActivity />
					</CardContent>
				</Card>
			</div>
		</>
	);
}
