"use client";

import { useEffect, useState } from "react";

export function useIsDarkMode() {
	const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;

		return (window as Window).matchMedia("(prefers-color-scheme: dark)").matches;
	})

	useEffect(() => {
		// DEV NOTE: The AbortController interface represents a controller object that allows you to abort one or more Web requests as and when desired.
		// Think about it like a cancellation token source with AbortSignal being the actual CancellationToken as it is used in ASP.NET
		const controller = new AbortController();
		// Whenever the user changes their system theme, update the theme prefered state
		window.matchMedia("(prefers-color-scheme: dark)")
			.addEventListener("change", (e) => {
				setIsDarkMode(e.matches);
			}, { signal: controller.signal });

		return () => controller.abort(); // This unhooks our event listener on component unmount
	}, [])

	return isDarkMode;
}

