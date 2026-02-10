import {
	faArrowsRotate,
	faBan,
	faCircleCheck,
	faClock,
	faEnvelopeCircleCheck,
	faEye,
	faLock,
	faPenToSquare,
	faPlugCircleXmark,
	faPlus,
	faRotateLeft,
	faScrewdriverWrench,
	faThumbsUp,
	faTrashCan,
	faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import {
	FontAwesomeIcon,
	type FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';
import {
	Calendar,
	CircleX,
	Eye,
	EyeOff,
	FileStack,
	Info,
	KeyRound,
	Loader,
	LogIn,
	Mail,
	Play,
	Search,
	Settings,
	Shield,
	Tag,
	UserRound,
	X,
} from 'lucide-react';
import { capitalizeFirstLetter } from '@/helpers/string.helper';

export function AwesomeIcon({
	className = 'fa-md', // ex: fa-lg, fa-2xl, fa-sm
	...props
}: FontAwesomeIconProps) {
	return <FontAwesomeIcon className={className} {...props} />;
}

type IconsProps = {
	className?: string;
	props?: Record<string, string>;
};

export const Icons = {
	Email: (props: IconsProps) => <Mail {...props} />,
	Password: (props: IconsProps) => <KeyRound {...props} />,
	Search: (props: IconsProps) => <Search {...props} />,
	Visible: (props: IconsProps) => <Eye {...props} />,
	Obscured: (props: IconsProps) => <EyeOff {...props} />,
	Tag: (props: IconsProps) => <Tag {...props} />,
	Calendar: (props: IconsProps) => <Calendar {...props} />,
	Settings: (props: IconsProps) => <Settings {...props} />,
	Security: (props: IconsProps) => <Shield {...props} />,
	Session: (props: IconsProps) => <FileStack {...props} />,
	Info: (props: IconsProps) => <Info {...props} />,
	Status: {
		Active: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faCircleCheck} {...props} />
		),
		Pending: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faClock} {...props} />
		),
		Inactive: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faLock} {...props} />
		),
		Deleted: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faBan} {...props} />
		),
		Ok: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faThumbsUp} {...props} />
		),
		Error: (props: IconsProps) => <CircleX {...props} />,
		Warning: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faTriangleExclamation} {...props} />
		),
		Sent: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faEnvelopeCircleCheck} {...props} />
		),
		Success: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faCircleCheck} {...props} />
		),
		Loading: (props: IconsProps) => <Loader {...props} />,
	},
	Action: {
		Login: (props: IconsProps) => <LogIn {...props} />,
		Go: (props: IconsProps) => <Play {...props} />,
		Create: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faPlus} {...props} />
		),
		Update: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faPenToSquare} {...props} />
		),
		Delete: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faTrashCan} {...props} />
		),
		Cancel: (props: IconsProps) => <X {...props} />,
		Destroy: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faPlugCircleXmark} {...props} />
		),
		Reset: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faArrowsRotate} {...props} />
		),
		Enable: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faCircleCheck} {...props} />
		),
		Disable: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faLock} {...props} />
		),
		Restore: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faRotateLeft} {...props} />
		),
		Permissions: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faScrewdriverWrench} {...props} />
		),
		View: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faEye} {...props} />
		),
	},
	Entity: {
		User: (props: IconsProps) => <UserRound {...props} />,
	},
};

export function getActionIcon(action: string) {
	action = capitalizeFirstLetter(action);

	if (action in Icons.Action) {
		return Icons.Action[action as keyof typeof Icons.Action];
	}

	throw new Error(`${action} is not defined in Icons.Action`);
}
