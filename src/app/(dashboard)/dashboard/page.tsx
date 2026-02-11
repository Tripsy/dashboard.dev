import {
	ArrowUpRight,
	DollarSign,
	Eye,
	FileText,
	MoreHorizontal,
	TrendingDown,
	TrendingUp,
	Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import { Card } from 'primereact/card';
import NavBreadcrumbSetter from '@/app/(dashboard)/_components/nav-breadcrumb.setter';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import { cn } from '@/helpers/css.helper';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: await translate('dashboard.meta.title', {
			app_name: Configuration.get('app.name') as string,
		}),
	};
}

const stats = [
	{
		title: 'Total Entries',
		value: '1,284',
		change: '+12%',
		trend: 'up',
		icon: FileText,
	},
	{
		title: 'Active Users',
		value: '892',
		change: '+8%',
		trend: 'up',
		icon: Users,
	},
	{
		title: 'Page Views',
		value: '24.5K',
		change: '-3%',
		trend: 'down',
		icon: Eye,
	},
	{
		title: 'Revenue',
		value: '$12,840',
		change: '+18%',
		trend: 'up',
		icon: DollarSign,
	},
];

const recentActivity = [
	{ action: 'New entry created', user: 'John Doe', time: '2 minutes ago' },
	{ action: 'Entry updated', user: 'Jane Smith', time: '15 minutes ago' },
	{ action: 'Comment added', user: 'Bob Johnson', time: '1 hour ago' },
	{ action: 'Entry deleted', user: 'Alice Williams', time: '2 hours ago' },
	{ action: 'New user signup', user: 'Charlie Brown', time: '3 hours ago' },
];

const topEntries = [
	{ title: 'Getting Started Guide', views: 1234, trend: 'up' },
	{ title: 'API Reference', views: 987, trend: 'up' },
	{ title: 'Best Practices', views: 756, trend: 'down' },
	{ title: 'Troubleshooting', views: 654, trend: 'up' },
	{ title: 'FAQ', views: 543, trend: 'down' },
];

export default async function Page() {
	return (
		<>
			<NavBreadcrumbSetter items={[]} />

			{/* Stats grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				{stats.map((stat) => (
					<Card key={stat.title} className="card-hover">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{stat.title}
							</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stat.value}
							</div>
							<div
								className={cn(
									'flex items-center text-xs mt-1',
									stat.trend === 'up'
										? 'text-success'
										: 'text-error',
								)}
							>
								{stat.trend === 'up' ? (
									<TrendingUp className="h-3 w-3 mr-1" />
								) : (
									<TrendingDown className="h-3 w-3 mr-1" />
								)}
								{stat.change} from last month
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Charts and tables */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				{/* Chart placeholder */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Analytics Overview</CardTitle>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem>Last 7 days</DropdownMenuItem>
								<DropdownMenuItem>
									Last 30 days
								</DropdownMenuItem>
								<DropdownMenuItem>
									Last 90 days
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</CardHeader>
					<CardContent>
						{/* Placeholder chart visualization */}
						<div className="h-64 flex items-end gap-2">
							{[
								40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95,
							].map((height, i) => (
								<div
									key={i}
									className="flex-1 bg-primary/20 rounded-t-md transition-all hover:bg-primary/40"
									style={{ height: `${height}%` }}
								/>
							))}
						</div>
						<div className="flex justify-between mt-2 text-xs text-muted-foreground">
							<span>Jan</span>
							<span>Feb</span>
							<span>Mar</span>
							<span>Apr</span>
							<span>May</span>
							<span>Jun</span>
							<span>Jul</span>
							<span>Aug</span>
							<span>Sep</span>
							<span>Oct</span>
							<span>Nov</span>
							<span>Dec</span>
						</div>
					</CardContent>
				</Card>

				{/* Top entries */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Top Entries</CardTitle>
						<Button variant="ghost" size="sm" className="gap-1">
							View all <ArrowUpRight className="h-4 w-4" />
						</Button>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{topEntries.map((entry, i) => (
								<div
									key={i}
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-3">
										<span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
											{i + 1}
										</span>
										<span className="font-medium">
											{entry.title}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">
											{entry.views.toLocaleString()} views
										</span>
										{entry.trend === 'up' ? (
											<TrendingUp className="h-4 w-4 text-success" />
										) : (
											<TrendingDown className="h-4 w-4 text-error" />
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{recentActivity.map((activity, i) => (
							<div
								key={i}
								className="flex items-center justify-between py-2 border-b border-border last:border-0"
							>
								<div>
									<p className="font-medium">
										{activity.action}
									</p>
									<p className="text-sm text-muted-foreground">
										by {activity.user}
									</p>
								</div>
								<span className="text-sm text-muted-foreground">
									{activity.time}
								</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	);
}
