import React from "react";
import {
	// Navigation
	Menu as MenuIcon,
	ArrowBack as ArrowBackIcon,
	ArrowForward as ArrowForwardIcon,
	Close as CloseIcon,
	MoreVert as MoreVertIcon,
	ExpandMore as ExpandMoreIcon,
	ChevronRight as ChevronRightIcon,
	Home as HomeIcon,
	Apps as AppsIcon,
	Dashboard as DashboardIcon,
	ArrowUpward as ArrowUpwardIcon,
	ArrowDownward as ArrowDownwardIcon,
	FirstPage as FirstPageIcon,
	LastPage as LastPageIcon,

	// Social & Communication
	Email as EmailIcon,
	Phone as PhoneIcon,
	Share as ShareIcon,
	Group as GroupIcon,
	Chat as ChatIcon,
	WhatsApp as WhatsAppIcon,
	Facebook as FacebookIcon,
	Instagram as InstagramIcon,
	Telegram as TelegramIcon,
	Call as CallIcon,
	ContactMail as ContactMailIcon,
	Forum as ForumIcon,

	// File Types & Actions
	InsertDriveFile as FileIcon,
	PictureAsPdf as PdfIcon,
	Image as ImageIcon,
	VideoFile as VideoIcon,
	AudioFile as AudioIcon,
	Folder as FolderIcon,
	Search as SearchIcon,
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Save as SaveIcon,
	Download as DownloadIcon,
	Upload as UploadIcon,
	FilterList as FilterListIcon,
	Sort as SortIcon,
	ContentCopy as CopyIcon,
	Print as PrintIcon,
	AttachFile as AttachFileIcon,

	// Alerts & Feedback
	Notifications as NotificationsIcon,
	Error as ErrorIcon,
	Warning as WarningIcon,
	Info as InfoIcon,
	Help as HelpIcon,
	CheckCircle as CheckCircleIcon,
	Cancel as CancelIcon,
	Flag as FlagIcon,
	Report as ReportIcon,
	ThumbUp as ThumbUpIcon,
	Favorite as FavoriteIcon,

	// Devices & Hardware
	Smartphone as SmartphoneIcon,
	Laptop as LaptopIcon,
	DesktopWindows as DesktopIcon,
	Tablet as TabletIcon,
	Keyboard as KeyboardIcon,
	Mouse as MouseIcon,
	Print as PrinterIcon,
	CameraAlt as CameraIcon,
	Headphones as HeadphonesIcon,
	Memory as MemoryIcon,

	// Editor
	FormatBold as BoldIcon,
	FormatItalic as ItalicIcon,
	InsertLink as LinkIcon,
	FormatListBulleted as ListBulletedIcon,
	FormatListNumbered as ListNumberedIcon,
	FormatQuote as QuoteIcon,
	Code as CodeIcon,
	TextFields as TextFieldsIcon,

	// Multimedia
	PlayArrow as PlayIcon,
	Pause as PauseIcon,
	Stop as StopIcon,
	VolumeUp as VolumeUpIcon,
	VolumeOff as VolumeOffIcon,
	MusicNote as MusicNoteIcon,
	Movie as MovieIcon,
	Mic as MicIcon,
} from "@mui/icons-material";

export interface SystemIcon {
	name: string;
	category: string;
	icon: React.ReactElement;
	tags: string[];
}

export const SYSTEM_ICONS: SystemIcon[] = [
	// Navigation
	{ name: "Menu", category: "Navigation", icon: <MenuIcon />, tags: ["hamburger", "drawer"] },
	{ name: "Home", category: "Navigation", icon: <HomeIcon />, tags: ["house", "main"] },
	{ name: "Dashboard", category: "Navigation", icon: <DashboardIcon />, tags: ["panel", "grid"] },
	{ name: "Apps", category: "Navigation", icon: <AppsIcon />, tags: ["grid", "menu"] },
	{ name: "Arrow Back", category: "Navigation", icon: <ArrowBackIcon />, tags: ["left", "return"] },
	{ name: "Arrow Forward", category: "Navigation", icon: <ArrowForwardIcon />, tags: ["right", "next"] },
	{ name: "Arrow Up", category: "Navigation", icon: <ArrowUpwardIcon />, tags: ["top"] },
	{ name: "Arrow Down", category: "Navigation", icon: <ArrowDownwardIcon />, tags: ["bottom"] },
	{ name: "Close", category: "Navigation", icon: <CloseIcon />, tags: ["x", "cancel", "exit"] },
	{ name: "More", category: "Navigation", icon: <MoreVertIcon />, tags: ["dots", "options"] },
	{ name: "Expand", category: "Navigation", icon: <ExpandMoreIcon />, tags: ["down", "dropdown"] },
	{ name: "Chevron Right", category: "Navigation", icon: <ChevronRightIcon />, tags: ["arrow", "next"] },
	{ name: "First Page", category: "Navigation", icon: <FirstPageIcon />, tags: ["start", "beginning"] },
	{ name: "Last Page", category: "Navigation", icon: <LastPageIcon />, tags: ["end", "finish"] },

	// Communication
	{ name: "Email", category: "Communication", icon: <EmailIcon />, tags: ["mail", "message", "letter"] },
	{ name: "Phone", category: "Communication", icon: <PhoneIcon />, tags: ["call", "mobile"] },
	{ name: "Call", category: "Communication", icon: <CallIcon />, tags: ["phone", "contact"] },
	{ name: "Chat", category: "Communication", icon: <ChatIcon />, tags: ["message", "bubble"] },
	{ name: "Forum", category: "Communication", icon: <ForumIcon />, tags: ["discussion", "chat"] },
	{ name: "Contact", category: "Communication", icon: <ContactMailIcon />, tags: ["address", "card"] },
	{ name: "Share", category: "Communication", icon: <ShareIcon />, tags: ["social", "network"] },
	{ name: "Group", category: "Communication", icon: <GroupIcon />, tags: ["people", "team", "users"] },
	
	// Social
	{ name: "WhatsApp", category: "Social", icon: <WhatsAppIcon />, tags: ["chat", "app"] },
	{ name: "Facebook", category: "Social", icon: <FacebookIcon />, tags: ["social", "network"] },
	{ name: "Instagram", category: "Social", icon: <InstagramIcon />, tags: ["photo", "social"] },
	{ name: "Telegram", category: "Social", icon: <TelegramIcon />, tags: ["chat", "app"] },

	// Files
	{ name: "File", category: "Files", icon: <FileIcon />, tags: ["document", "paper"] },
	{ name: "Folder", category: "Files", icon: <FolderIcon />, tags: ["directory"] },
	{ name: "PDF", category: "Files", icon: <PdfIcon />, tags: ["document", "adobe"] },
	{ name: "Image", category: "Files", icon: <ImageIcon />, tags: ["photo", "picture"] },
	{ name: "Video", category: "Files", icon: <VideoIcon />, tags: ["movie", "film"] },
	{ name: "Audio", category: "Files", icon: <AudioIcon />, tags: ["music", "sound"] },
	{ name: "Attach", category: "Files", icon: <AttachFileIcon />, tags: ["clip", "upload"] },

	// Actions
	{ name: "Search", category: "Actions", icon: <SearchIcon />, tags: ["find", "magnifier"] },
	{ name: "Add", category: "Actions", icon: <AddIcon />, tags: ["plus", "create", "new"] },
	{ name: "Edit", category: "Actions", icon: <EditIcon />, tags: ["pencil", "modify", "update"] },
	{ name: "Delete", category: "Actions", icon: <DeleteIcon />, tags: ["trash", "remove"] },
	{ name: "Save", category: "Actions", icon: <SaveIcon />, tags: ["disk", "store"] },
	{ name: "Download", category: "Actions", icon: <DownloadIcon />, tags: ["get", "import"] },
	{ name: "Upload", category: "Actions", icon: <UploadIcon />, tags: ["send", "cloud"] },
	{ name: "Filter", category: "Actions", icon: <FilterListIcon />, tags: ["sort", "refine"] },
	{ name: "Sort", category: "Actions", icon: <SortIcon />, tags: ["order", "arrange"] },
	{ name: "Copy", category: "Actions", icon: <CopyIcon />, tags: ["duplicate", "clone"] },
	{ name: "Print", category: "Actions", icon: <PrintIcon />, tags: ["printer"] },

	// Alerts
	{ name: "Notifications", category: "Alerts", icon: <NotificationsIcon />, tags: ["bell", "alarm"] },
	{ name: "Warning", category: "Alerts", icon: <WarningIcon />, tags: ["alert", "caution"] },
	{ name: "Error", category: "Alerts", icon: <ErrorIcon />, tags: ["bug", "fail"] },
	{ name: "Info", category: "Alerts", icon: <InfoIcon />, tags: ["details", "help"] },
	{ name: "Help", category: "Alerts", icon: <HelpIcon />, tags: ["question", "support"] },
	{ name: "Success", category: "Alerts", icon: <CheckCircleIcon />, tags: ["ok", "done"] },
	{ name: "Cancel", category: "Alerts", icon: <CancelIcon />, tags: ["stop", "block"] },
	{ name: "Flag", category: "Alerts", icon: <FlagIcon />, tags: ["report", "mark"] },
	{ name: "Report", category: "Alerts", icon: <ReportIcon />, tags: ["alert", "flag"] },
	{ name: "Like", category: "Alerts", icon: <ThumbUpIcon />, tags: ["thumbs up", "approve"] },
	{ name: "Favorite", category: "Alerts", icon: <FavoriteIcon />, tags: ["heart", "love"] },

	// Devices
	{ name: "Smartphone", category: "Devices", icon: <SmartphoneIcon />, tags: ["mobile", "phone"] },
	{ name: "Laptop", category: "Devices", icon: <LaptopIcon />, tags: ["computer", "notebook"] },
	{ name: "Desktop", category: "Devices", icon: <DesktopIcon />, tags: ["pc", "computer"] },
	{ name: "Tablet", category: "Devices", icon: <TabletIcon />, tags: ["ipad"] },
	{ name: "Camera", category: "Devices", icon: <CameraIcon />, tags: ["photo"] },
	{ name: "Headphones", category: "Devices", icon: <HeadphonesIcon />, tags: ["audio", "music"] },
	{ name: "Keyboard", category: "Devices", icon: <KeyboardIcon />, tags: ["input", "type"] },
	{ name: "Mouse", category: "Devices", icon: <MouseIcon />, tags: ["cursor", "click"] },
	{ name: "Memory", category: "Devices", icon: <MemoryIcon />, tags: ["chip", "ram"] },

	// Editor
	{ name: "Bold", category: "Editor", icon: <BoldIcon />, tags: ["text", "format"] },
	{ name: "Italic", category: "Editor", icon: <ItalicIcon />, tags: ["text", "format"] },
	{ name: "Link", category: "Editor", icon: <LinkIcon />, tags: ["url", "web"] },
	{ name: "List", category: "Editor", icon: <ListBulletedIcon />, tags: ["bullets"] },
	{ name: "Numbered List", category: "Editor", icon: <ListNumberedIcon />, tags: ["ordered"] },
	{ name: "Quote", category: "Editor", icon: <QuoteIcon />, tags: ["blockquote"] },
	{ name: "Code", category: "Editor", icon: <CodeIcon />, tags: ["programming", "dev"] },
	{ name: "Text", category: "Editor", icon: <TextFieldsIcon />, tags: ["font", "type"] },

	// Multimedia
	{ name: "Play", category: "Multimedia", icon: <PlayIcon />, tags: ["start", "video"] },
	{ name: "Pause", category: "Multimedia", icon: <PauseIcon />, tags: ["stop", "wait"] },
	{ name: "Stop", category: "Multimedia", icon: <StopIcon />, tags: ["halt", "end"] },
	{ name: "Volume Up", category: "Multimedia", icon: <VolumeUpIcon />, tags: ["sound", "loud"] },
	{ name: "Volume Off", category: "Multimedia", icon: <VolumeOffIcon />, tags: ["mute", "silent"] },
	{ name: "Music", category: "Multimedia", icon: <MusicNoteIcon />, tags: ["song", "audio"] },
	{ name: "Movie", category: "Multimedia", icon: <MovieIcon />, tags: ["film", "cinema"] },
	{ name: "Mic", category: "Multimedia", icon: <MicIcon />, tags: ["record", "voice"] },
];

export const SYSTEM_ICONS_MAP = SYSTEM_ICONS.reduce((acc, curr) => {
	acc[curr.name.toLowerCase()] = curr;
	return acc;
}, {} as Record<string, SystemIcon>);
