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

export function convertSearchParamsToString(searchParams: Record<string, string | string[]>) {
	const params = new URLSearchParams();
	Object.entries(searchParams).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			value.forEach(x => params.append(key, x))
		}
		else {
			params.set(key, value)
		}
	})
	return params.toString();
}

// Get the initials from the words of a string based on spliceNum.
// For example Peggy Psi => PP
export function getInitialsFromWords(str: string, spliceNum: number) {
	return str
		.split(" ")
		.slice(0, spliceNum)
		.map((str) => str[0])
		.join("");
}