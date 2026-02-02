type LoadingProps = {
	text: string;
	className?: string;
};

export function Loading({ text, className }: LoadingProps) {
	return (
		<div className={className}>
			<span className="loading loading-ring loading-xl mr-2"></span>
			<span>{text}</span>
		</div>
	);
}
