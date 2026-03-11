import nunjucks from 'nunjucks';
import { Configuration } from '@/config/settings.config';
import { buildSrcPath } from '@/helpers/system.helper';

// Create a new environment
const templates = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(buildSrcPath('templates')),
	{
		autoescape: true,
		throwOnUndefined: true,
		trimBlocks: true,
		noCache: Configuration.get('app.debug') === 'true',
		watch: true,
	},
);

// Add global variables
templates.addGlobal('siteName', Configuration.get('app.name'));
templates.addGlobal('siteUrl', Configuration.get('app.url'));
templates.addGlobal('supportEmail', Configuration.get('contact.email'));
templates.addGlobal('currentYear', new Date().getFullYear().toString());

// // Add custom filter
// templates.addFilter('shorten', function (str: string, count: number = 5) {
//     return str.slice(0, count);
// });

export default templates;
