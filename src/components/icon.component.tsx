import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import {
	faArrowRightToBracket,
	faArrowsRotate,
	faBan,
	faBars,
	faCalendar,
	faCircleCheck,
	faCircleExclamation,
	faCircleInfo,
	faCircleXmark,
	faClock,
	faEnvelope,
	faEnvelopeCircleCheck,
	faEye,
	faEyeSlash,
	faFileContract,
	faKey,
	faLock,
	faMagnifyingGlass,
	faMoon,
	faPenToSquare,
	faPlay,
	faPlugCircleXmark,
	faPlus,
	faRotateLeft,
	faScrewdriverWrench,
	faShield,
	faSpinner,
	faSun,
	faTag,
	faThumbsUp,
	faTrashCan,
	faTriangleExclamation,
	faUser,
} from '@fortawesome/free-solid-svg-icons';
import {
	FontAwesomeIcon,
	type FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import {Mail} from "lucide-react";

export function AwesomeIcon({
	className = 'fa-md', // ex: fa-lg, fa-2xl, fa-sm
	...props
}: FontAwesomeIconProps) {
	return <FontAwesomeIcon className={className} {...props} />;
}

type IconsProps = {
	className: string;
	props?: Record<string, string>;
};

export const Icons = {
	Design: {
		SideMenuOpen: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faBars} {...props} />
		),
		SideMenuClosed: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faBars} {...props} />
		),
		ThemeLight: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faSun} {...props} />
		),
		ThemeDark: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faMoon} {...props} />
		),
		Github: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faGithub} {...props} />
		),
		Linkedin: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faLinkedin} {...props} />
		),
	},
	Loading: (props: Partial<FontAwesomeIconProps>) => (
		<AwesomeIcon icon={faSpinner} {...props} />
	),
	Email: (props: IconsProps) => (
		<Mail {...props} />
	),
	Password: (props: Partial<FontAwesomeIconProps>) => (
		<AwesomeIcon icon={faKey} {...props} />
	),
	Search: (props: Partial<FontAwesomeIconProps>) => (
		<AwesomeIcon icon={faMagnifyingGlass} {...props} />
	),
	Visible: (props: Partial<FontAwesomeIconProps>) => (
		<AwesomeIcon icon={faEye} {...props} />
	),
	Obscured: (props: Partial<FontAwesomeIconProps>) => (
		<AwesomeIcon icon={faEyeSlash} {...props} />
	),
	Tag: (props: Partial<FontAwesomeIconProps>) => (
		<AwesomeIcon icon={faTag} {...props} />
	),
	Calendar: (props: Partial<FontAwesomeIconProps>) => (
		<AwesomeIcon icon={faCalendar} {...props} />
	),
	Settings: (props: Partial<FontAwesomeIconProps>) => (
		<AwesomeIcon icon={faScrewdriverWrench} {...props} />
	),
	Security: (props: Partial<FontAwesomeIconProps>) => (
		<AwesomeIcon icon={faShield} {...props} />
	),
	Session: (props: Partial<FontAwesomeIconProps>) => (
		<AwesomeIcon icon={faFileContract} {...props} />
	),
	Info: (props: Partial<FontAwesomeIconProps>) => (
		<AwesomeIcon icon={faCircleInfo} {...props} />
	),
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
		Error: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faCircleExclamation} {...props} />
		),
		Warning: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faTriangleExclamation} {...props} />
		),
		Sent: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faEnvelopeCircleCheck} {...props} />
		),
		Success: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faCircleCheck} {...props} />
		),
	},
	Action: {
		Login: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faArrowRightToBracket} {...props} />
		),
		Go: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faPlay} {...props} />
		),
		Create: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faPlus} {...props} />
		),
		Update: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faPenToSquare} {...props} />
		),
		Delete: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faTrashCan} {...props} />
		),
		Cancel: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faCircleXmark} {...props} />
		),
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
		User: (props: Partial<FontAwesomeIconProps>) => (
			<AwesomeIcon icon={faUser} {...props} />
		),
	},
};

export function getActionIcon(action: string) {
	action = capitalizeFirstLetter(action);

	if (action in Icons.Action) {
		return Icons.Action[action as keyof typeof Icons.Action];
	}

	throw new Error(`${action} is not defined in Icons.Action`);
}
