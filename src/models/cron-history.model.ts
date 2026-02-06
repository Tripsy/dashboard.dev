export enum CronHistoryStatusEnum {
	ERROR = 'error',
	OK = 'ok',
	WARNING = 'warning',
}

export type CronHistoryModel<D = Date | string> = {
	id: number;
	label: string;
	status: CronHistoryStatusEnum;
	start_at: D;
	end_at: D;
	run_time: number;
	content?: string;
};
