import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function currencyFormatter() {
	// TODO: add support for changing between currencies based on use preferences
	return new Intl.NumberFormat("el-GR", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 0
	});
}