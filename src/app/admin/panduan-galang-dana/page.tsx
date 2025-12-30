"use client";

import ContentEditor from "@/components/admin/ContentEditor";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function AdminFundraiseGuidePage() {
  return (
    <ContentEditor
      contentKey="fundraise_guide"
      title="Panduan Galang Dana"
      subtitle="Kelola konten halaman panduan galang dana"
      icon={<InfoOutlinedIcon />}
    />
  );
}

