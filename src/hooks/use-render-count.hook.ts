import { useEffect, useRef } from 'react';

export function useRenderCount(componentName = 'Component') {
	const renderCount = useRef(0);

	useEffect(() => {
		// Increment after each render
		renderCount.current += 1;

		console.debug(`${componentName} rendered ${renderCount.current} times`);
	});

	return renderCount.current;
}
