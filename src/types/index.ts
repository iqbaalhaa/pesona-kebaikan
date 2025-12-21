import { ReactNode } from "react";

export interface Donation {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl?: string;
  category: 'bencana' | 'pendidikan' | 'kesehatan' | 'sosial';
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MenuItem {
	label: string;
	icon: ReactNode;
	isNew?: boolean;
	path?: string;
}

export interface Category {
	id: string;
	label: string;
	icon: ReactNode;
}

export interface Campaign {
	id: string;
	title: string;
	organizer: string;
	cover: string;
	collected: number;
	daysLeft: number;
	target?: number;
	categoryId?: string;
	category?: string; // Display label for category
	recommended?: boolean;
	tag?: string;
	donors?: number;
	latestUpdate?: string;
	slug?: string;
}
