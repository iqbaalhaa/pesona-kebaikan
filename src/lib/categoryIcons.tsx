import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import MosqueIcon from "@mui/icons-material/Mosque";
import SchoolIcon from "@mui/icons-material/School";
import ForestIcon from "@mui/icons-material/Forest";
import HomeIcon from "@mui/icons-material/Home";
import AccessibleIcon from "@mui/icons-material/Accessible";
import ConstructionIcon from "@mui/icons-material/Construction";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import HandshakeIcon from "@mui/icons-material/Handshake";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";

export const CATEGORY_ICON_MAP: Record<
  string,
  { icon: React.ReactElement; color: string }
> = {
  "bencana alam": { icon: <ThunderstormIcon sx={{ fontSize: 28 }} />, color: "#ef4444" },
  "balita & anak sakit": { icon: <ChildCareIcon sx={{ fontSize: 28 }} />, color: "#f59e0b" },
  "bantuan medis": { icon: <MedicalServicesIcon sx={{ fontSize: 28 }} />, color: "#3b82f6" },
  zakat: { icon: <VolunteerActivismIcon sx={{ fontSize: 28 }} />, color: "#10b981" },
  wakaf: { icon: <MosqueIcon sx={{ fontSize: 28 }} />, color: "#059669" },
  pendidikan: { icon: <SchoolIcon sx={{ fontSize: 28 }} />, color: "#8b5cf6" },
  lingkungan: { icon: <ForestIcon sx={{ fontSize: 28 }} />, color: "#22c55e" },
  "panti asuhan": { icon: <HomeIcon sx={{ fontSize: 28 }} />, color: "#ec4899" },
  difabel: { icon: <AccessibleIcon sx={{ fontSize: 28 }} />, color: "#6366f1" },
  infrastruktur: { icon: <ConstructionIcon sx={{ fontSize: 28 }} />, color: "#64748b" },
  kemanusiaan: { icon: <HandshakeIcon sx={{ fontSize: 28 }} />, color: "#f43f5e" },
  "bantuan pangan": { icon: <SoupKitchenIcon sx={{ fontSize: 28 }} />, color: "#ea580c" },
};

export function getCategoryIcon(name?: string) {
  const key = (name || "").toLowerCase();
  return (
    CATEGORY_ICON_MAP[key] ?? {
      icon: <CategoryRoundedIcon sx={{ fontSize: 28 }} />,
      color: "#64748b",
    }
  );
}
