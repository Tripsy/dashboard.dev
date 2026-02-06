export enum LogLevelEnum {
	TRACE = 'trace', // 10
	DEBUG = 'debug', // 20
	INFO = 'info', // 30
	WARN = 'warn', // 40
	ERROR = 'error', // 50
	FATAL = 'fatal', // 60
}

export enum LogCategoryEnum {
	SYSTEM = 'system',
	HISTORY = 'history',
	CRON = 'cron',
	INFO = 'info',
	ERROR = 'error',
}

export type LogDataModel<D = Date | string> = {
	id: number;
	pid: string;
	request_id: string | null;
	category: LogCategoryEnum;
	level: LogLevelEnum;
	message: string;
	context: string;
	debugStack: string;
	created_at: D;
};
