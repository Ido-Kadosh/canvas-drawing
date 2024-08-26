import { RefObject, useEffect } from 'react';

const useEventListener = <T extends Event | React.UIEvent>({
	eventName,
	callback,
	ref,
	target,
	capture = false,
}: {
	eventName: keyof HTMLElementEventMap | string;
	callback: (ev: T) => unknown;
	ref?: RefObject<HTMLElement | Document>;
	target?: Window | Document;
	capture?: boolean;
}): void => {
	useEffect(() => {
		const eventTarget: HTMLElement | Document | Window | null | undefined = target || ref?.current;
		if (!eventTarget) return;
		const listenerOptions = { capture };

		const eventListener = callback as unknown as EventListener;

		eventTarget.addEventListener(eventName, eventListener, listenerOptions);

		return () => {
			eventTarget.removeEventListener(eventName, eventListener, listenerOptions);
		};
	}, [eventName, ref, callback, capture]);
};

export default useEventListener;
