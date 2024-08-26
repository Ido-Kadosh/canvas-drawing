import { useCallback, useEffect, useRef, useState } from 'react';
import useEventListener from '../hooks/useEventListener';

interface PropTypes {
	height?: number;
	width?: number;
	backgroundColor?: string;
}

const Canvas = forwardRef(({ backgroundColor = '#cccccc', drawMode }: PropTypes, ref) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	useImperativeHandle(ref, () => ({
		clearCanvas: () => {
			if (canvasRef.current) {
				const context = canvasRef.current.getContext('2d');
				if (!context) return;
				context.fillStyle = backgroundColor;
				context.fillRect(0, 0, context.canvas.width, context.canvas.height);
				setSavedImageData(null);
				context.beginPath();
			}
		},
	}));

	// reset canvas on prop changes
	useEffect(() => {
		handleResize();
	}, [backgroundColor]);

	const handleMouseDown = useCallback(
		(ev: React.MouseEvent) => {
			setIsDrawing(true);
			if (canvasRef.current) {
				const rect = canvasRef.current?.getBoundingClientRect();
				const context = canvasRef.current.getContext('2d');
				const startX = ev.clientX - rect.left;
				const startY = ev.clientY - rect.top;
				context?.moveTo(startX, startY);
			}
		},
		[canvasRef]
	);

	const handleMouseMove = useCallback(
		(ev: React.MouseEvent) => {
			if (!isDrawing || !canvasRef.current) return;
			const rect = canvasRef.current.getBoundingClientRect();
			const context = canvasRef.current.getContext('2d');
			const currentX = ev.clientX - rect.left;
			const currentY = ev.clientY - rect.top;
				context?.lineTo(currentX, currentY);
				context?.stroke();

			if (!context) return;
		},
		[isDrawing, canvasRef, drawMode, startPos, savedImageData]
	);
	const handleResize = useCallback(() => {
		if (!canvasRef.current) return;
		var rect = canvasRef.current.parentElement?.getBoundingClientRect();
		if (!rect) return;

		const context = canvasRef.current.getContext('2d');
		if (!context) return;
		context.canvas.height = window.innerHeight * 0.9;
		context.canvas.width = rect.width;
		context.fillStyle = backgroundColor;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	}, [canvasRef, backgroundColor]);

	const handleMouseUpOrLeave = useCallback(() => {
		setIsDrawing(false);
	}, [setIsDrawing]);

	useEventListener({
		eventName: 'resize',
		callback: handleResize,
		target: window,
	});

	useEventListener({
		eventName: 'mousedown',
		callback: handleMouseDown,
		ref: canvasRef,
	});

	useEventListener({
		eventName: 'mousemove',
		callback: handleMouseMove,
		ref: canvasRef,
	});

	useEventListener({
		eventName: 'mouseup',
		callback: handleMouseUpOrLeave,
		ref: canvasRef,
	});

	useEventListener({
		eventName: 'mouseleave',
		callback: handleMouseUpOrLeave,
		ref: canvasRef,
	});

	return <canvas ref={canvasRef} className="flex-grow-0 flex-shrink-0" />;
});

export default Canvas;
