import {
	ArchiveRestore,
	Ban,
	Calendar,
	CircleAlert,
	CircleCheck,
	CircleSlash,
	CircleUser,
	CircleX,
	ClipboardClock,
	Clock,
	Eraser,
	Eye,
	EyeOff,
	FileStack,
	HardDrive,
	Info,
	KeyRound,
	LayoutTemplate,
	ListStart,
	Loader,
	LockKeyhole,
	LogIn,
	Mail,
	MailCheck,
	Mails,
	Minus,
	Play,
	Plus,
	RefreshCcw,
	Search,
	Settings,
	Shield,
	SquarePen,
	SquareStack,
	TableOfContents,
	Tag,
	TextSearch,
	ThumbsUp,
	Trash2,
	TriangleAlert,
	UserRound,
	Users,
	Wrench,
	X,
} from 'lucide-react';
import { capitalizeFirstLetter } from '@/helpers/string.helper';

type IconProps = {
	className?: string;
	props?: Record<string, string>;
};

export const Icons = {
	Search: (props: IconProps) => <Search {...props} />,
	Visible: (props: IconProps) => <Eye {...props} />,
	Obscured: (props: IconProps) => <EyeOff {...props} />,
	Info: (props: IconProps) => <Info {...props} />,
	Clear: (props: IconProps) => <Eraser {...props} />,

	Email: (props: IconProps) => <Mail {...props} />,
	Password: (props: IconProps) => <KeyRound {...props} />,
	Tag: (props: IconProps) => <Tag {...props} />,
	Calendar: (props: IconProps) => <Calendar {...props} />,
	Settings: (props: IconProps) => <Settings {...props} />,
	Security: (props: IconProps) => <Shield {...props} />,
	Session: (props: IconProps) => <FileStack {...props} />,
	User: (props: IconProps) => <UserRound {...props} />,
	Users: (props: IconProps) => <Users {...props} />,
	HardDrive: (props: IconProps) => <HardDrive {...props} />,
	History: (props: IconProps) => <ClipboardClock {...props} />,
	Cron: (props: IconProps) => <SquareStack {...props} />,
	List: (props: IconProps) => <ListStart {...props} />,
	Mails: (props: IconProps) => <Mails {...props} />,
	Template: (props: IconProps) => <LayoutTemplate {...props} />,
	Logs: (props: IconProps) => <TableOfContents {...props} />,
	Account: (props: IconProps) => <CircleUser {...props} />,
	Permission: (props: IconProps) => <Wrench {...props} />,
	Plus: (props: IconProps) => <Plus {...props} />,
	Minus: (props: IconProps) => <Minus {...props} />,
	TextSearch: (props: IconProps) => <TextSearch {...props} />,

	Status: {
		Active: (props: IconProps) => <CircleCheck {...props} />,
		Pending: (props: IconProps) => <Clock {...props} />,
		Inactive: (props: IconProps) => <CircleSlash {...props} />,
		Deleted: (props: IconProps) => <Ban {...props} />,
		Ok: (props: IconProps) => <ThumbsUp {...props} />,
		Error: (props: IconProps) => <CircleAlert {...props} />,
		Warning: (props: IconProps) => <TriangleAlert {...props} />,
		Sent: (props: IconProps) => <MailCheck {...props} />,
		Success: (props: IconProps) => <CircleCheck {...props} />,
		Loading: (props: IconProps) => <Loader {...props} />,
	},
	Action: {
		Login: (props: IconProps) => <LogIn {...props} />,
		Go: (props: IconProps) => <Play {...props} />,
		Create: (props: IconProps) => <Plus {...props} />,
		Update: (props: IconProps) => <SquarePen {...props} />,
		Delete: (props: IconProps) => <Trash2 {...props} />,
		Cancel: (props: IconProps) => <X {...props} />,
		Destroy: (props: IconProps) => <CircleX {...props} />,
		Reset: (props: IconProps) => <RefreshCcw {...props} />,
		Enable: (props: IconProps) => <CircleCheck {...props} />,
		Disable: (props: IconProps) => <LockKeyhole {...props} />,
		Restore: (props: IconProps) => <ArchiveRestore {...props} />,
		Permissions: (props: IconProps) => <Wrench {...props} />,
		View: (props: IconProps) => <Eye {...props} />,
	},
};

export function getActionIcon(action: string) {
	action = capitalizeFirstLetter(action);

	if (action in Icons.Action) {
		return Icons.Action[action as keyof typeof Icons.Action];
	}

	throw new Error(`${action} is not defined in Icons.Action`);
}
