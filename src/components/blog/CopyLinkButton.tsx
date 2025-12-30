"use client";

import * as React from "react";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = React.useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <IconButton
      onClick={onClick}
      aria-label={copied ? "Link disalin" : "Salin link"}
      sx={{
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 2,
        color: copied ? "#61ce70" : "rgba(15,23,42,.7)",
        "&:hover": { bgcolor: "rgba(15,23,42,.05)" },
      }}
    >
      <ContentCopyIcon fontSize="small" />
    </IconButton>
  );
}
