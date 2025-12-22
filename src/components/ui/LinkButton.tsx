"use client";

import Link from "next/link";
import {
	Button,
	ButtonProps,
	IconButton,
	IconButtonProps,
} from "@mui/material";

export function LinkButton({ href, ...props }: ButtonProps & { href: string }) {
	return <Button component={Link} href={href} {...props} />;
}

export function LinkIconButton({
	href,
	...props
}: IconButtonProps & { href: string }) {
	return <IconButton component={Link} href={href} {...props} />;
}
