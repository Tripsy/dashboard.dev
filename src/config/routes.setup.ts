import ValueError from '@/exceptions/value.error';

export const RouteAuthEnum = {
	PUBLIC: 'public',
	UNAUTHENTICATED: 'unauthenticated',
	AUTHENTICATED: 'authenticated',
	PROTECTED: 'protected', // Admin OR Operator
} as const;

export type RouteAuth = (typeof RouteAuthEnum)[keyof typeof RouteAuthEnum];

type RouteProps = {
	type?: string;
	auth?: RouteAuth;
	permission?: string;
};

type RoutesData = {
	[key: string]: { path: string } & RouteProps;
};

export type RouteMatch = {
	name: string;
	props: RouteProps;
} | null;

class RouteBuilder {
	constructor(
		private readonly parent: RoutesCollection,
		private readonly type: string,
		private _routeAuth?: RouteAuth,
	) {}

	public auth(routeAuth: RouteAuth): this {
		this._routeAuth = routeAuth;

		return this;
	}

	public add(
		name: string,
		path: string,
		props: Partial<RouteProps> = {},
	): this {
		this.parent.add(name, path, {
			type: this.type,
			auth: props.auth ?? this._routeAuth ?? RouteAuthEnum.PUBLIC,
			...props,
		});
		return this;
	}
}

class RoutesCollection {
	private data: RoutesData = {};

	public add(name: string, path: string, props?: RouteProps): this {
		if (!name || !path) {
			throw new ValueError('Route name and path are required');
		}

		props = {
			...props,
			auth: props?.auth ?? RouteAuthEnum.PUBLIC,
		};

		this.data[name] = { path, ...props };

		return this;
	}

	// Start a scoped group
	public group(name: string): RouteBuilder {
		return new RouteBuilder(this, name);
	}

	public get(
		name: string,
		args?: Record<string, string | number | string[]>,
	): string {
		if (!this.data[name]) {
			throw new ValueError(`Route not defined for: ${name}`);
		}

		const [basePath, query] = this.data[name].path.split('?');
		const replacedPath = this.replacePathParams(basePath, args);

		return query ? `${replacedPath}?${query}` : replacedPath;
	}

	private replacePathParams(
		path: string,
		args?: Record<string, string | number | string[]>,
	): string {
		if (!args) {
			return path;
		}

		let result = path;

		for (const [key, value] of Object.entries(args)) {
			if (Array.isArray(value)) {
				result = result.replace(
					`:${key}*`,
					value.map(encodeURIComponent).join('/'),
				);
			} else {
				result = result.replace(
					`:${key}`,
					encodeURIComponent(String(value)),
				);
			}
		}

		return result;
	}

	public match(pathname: string): RouteMatch {
		for (const [name, props] of Object.entries(this.data)) {
			const pattern = this.convertPathToRegex(props.path);
			const match = pathname.match(pattern);

			if (match) {
				return {
					name: name,
					props: props,
				};
			}
		}

		return null;
	}

	private convertPathToRegex(path: string): RegExp {
		// Convert :param to named capture group
		// Convert :param* to wildcard match
		const pattern = path
			.replace(/\/:(\w+)(\*)?/g, (_, param, wildcard) =>
				wildcard
					? `/(?<${param}>[^/]+(?:/[^/]+)*)`
					: `/(?<${param}>[^/]+)`,
			)
			.replace(/\*/g, '.*');

		return new RegExp(`^${pattern}(?:\\?.*)?$`); // Include optional query string
	}

	public getRoutes(): RoutesData {
		return this.data;
	}
}

const Routes = new RoutesCollection();

Routes.add('home', '/');
Routes.add('status', '/status/:type');
Routes.add('page', '/page/:label');
Routes.add('docs', '/docs');

// API
Routes.group('api')
	.add('proxy', '/api/proxy/:path*')
	.add('csrf', '/api/csrf')
	.add('language', '/api/language');

// Account
Routes.group('account')
	.auth(RouteAuthEnum.UNAUTHENTICATED)
	.add('login', '/account/login')
	.add('logout', '/account/logout', { auth: RouteAuthEnum.AUTHENTICATED })
	.add('register', '/account/register')
	.add('password-recover', '/account/password-recover')
	.add('password-recover-change', '/account/password-recover-change/:token')
	.add('email-confirm', '/account/email-confirm/:token', {
		auth: RouteAuthEnum.PUBLIC,
	})
	.add('email-confirm-send', '/account/email-confirm-send')
	.add('account-me', '/account/me', { auth: RouteAuthEnum.AUTHENTICATED })
	.add('account-edit', '/account/edit', { auth: RouteAuthEnum.AUTHENTICATED })
	.add('password-update', '/account/password-update', {
		auth: RouteAuthEnum.AUTHENTICATED,
	})
	.add('email-update', '/account/email-update', {
		auth: RouteAuthEnum.AUTHENTICATED,
	})
	.add('account-delete', '/account/delete', {
		auth: RouteAuthEnum.AUTHENTICATED,
	});

// Dashboard
Routes.group('dashboard')
	.auth(RouteAuthEnum.PROTECTED)
	.add('dashboard', '/dashboard')
	.add('template', '/dashboard/templates', {
		permission: 'template.find',
	})
	.add('client', '/dashboard/clients', {
		permission: 'client.find',
	})
	.add('client-address', '/dashboard/client-address', {
		permission: 'client_address.find',
	})
	.add('place', '/dashboard/places', {
		permission: 'place.find',
	})
	.add('brand', '/dashboard/brands', {
		permission: 'brand.find',
	})
	.add('cash-flow', '/dashboard/cash-flow', {
		permission: 'cash_flow.find',
	})
	.add('log-data', '/dashboard/log-data', {
		permission: 'log_data.find',
	})
	.add('log-history', '/dashboard/log-history', {
		permission: 'log_history.find',
	})
	.add('cron-history', '/dashboard/cron-history', {
		permission: 'cron_history.find',
	})
	.add('mail-queue', '/dashboard/mail-queue', {
		permission: 'mail_queue.find',
	})
	.add('user', '/dashboard/users', {
		permission: 'user.find',
	})
	.add('permission', '/dashboard/permissions', {
		permission: 'permission.find',
	})

    .add('vehicle', '/dashboard/vehicles', {
        permission: 'vehicle.find',
    }).add('company-vehicle', '/dashboard/company-vehicles', {
        permission: 'company-vehicle.find',
    })

    .add('cmr', '/dashboard/cmrs', {
        permission: 'cmr.find',
    })
    .add('cmr-driver', '/dashboard/cmr-drivers', {
        permission: 'cmr-driver.find',
    })
    .add('cmr-vehicle', '/dashboard/cmr-vehicles', {
        permission: 'cmr-vehicle.find',
    })
	.add('work-session', '/dashboard/work-sessions', {
        permission: 'work-session.find',
    })
	.add('work-session-vehicles', '/dashboard/work-session-vehicles', {
        permission: 'work-session-vehicle.find',
    })

/**
 * Check if the given path is an excluded route (usually auth related routes)
 * On successful login it doesn't redirect back to excluded routes
 * `auth` is not refreshed periodically while on excluded routes
 *
 * @param pathname
 */
export function isExcludedRoute(pathname: string) {
	const excludeRoutes = [
		Routes.get('login'),
		Routes.get('logout'),
		Routes.get('register'),
		Routes.get('password-recover'),
		Routes.get('password-recover-change'),
		Routes.get('email-confirm'),
		Routes.get('email-confirm-send'),
	];

	return excludeRoutes.includes(pathname);
}

/**
 * Check if the given route is protected
 *
 * @param auth
 */
export function isProtectedRoute(
	auth: RouteAuth,
): auth is 'authenticated' | 'protected' {
	return (
		auth === RouteAuthEnum.AUTHENTICATED || auth === RouteAuthEnum.PROTECTED
	);
}

export default Routes;
