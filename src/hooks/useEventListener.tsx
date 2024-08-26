import { RefObject, useEffect } from 'react';

const useEventListener = <T extends Event | React.UIEvent>({
	eventName,
	callback,
	ref,
	capture = false,
}: {
	eventName: keyof HTMLElementEventMap | string;
	callback: (ev: T) => unknown;
	ref: RefObject<HTMLElement | Document>;
	capture?: boolean;
}): void => {
	useEffect(() => {
		const refElement = ref && ref.current;
		if (!refElement) return;
		const listenerOptions = { capture };

		// Type assertion as EventListener for compatibility
		const eventListener = callback as unknown as EventListener;

		refElement.addEventListener(eventName, eventListener, listenerOptions);

		return () => {
			refElement.removeEventListener(eventName, eventListener, listenerOptions);
		};
	}, [eventName, ref, callback, capture]);
};

export default useEventListener;
