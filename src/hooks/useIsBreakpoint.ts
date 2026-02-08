"use client";

import { useState, useEffect } from "react";

export function useIsBreakpoint(breakpoint: string) {
	const [isBreakpoint, setIsBreakpoint] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		const media = window.matchMedia(`(${breakpoint})`);
		media.addEventListener(
			"change",
			e => {
				setIsBreakpoint(e.matches);
			},
			{ signal: controller.signal }
		);
		setIsBreakpoint(media.matches);

		return () => {
			controller.abort();
		};
	}, [breakpoint]);

	return isBreakpoint;
}
