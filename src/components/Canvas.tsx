import { useCallback, useEffect, useRef, useState } from 'react';
import useEventListener from '../hooks/useEventListener';

interface PropTypes {
	height?: number;
	width?: number;
	backgroundColor?: string;
}

const Canvas = ({ height = 500, width = 500, backgroundColor = '#cccccc' }: PropTypes) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);

	// reset canvas on prop changes
	useEffect(() => {
		if (canvasRef.current) {
			const context = canvasRef.current.getContext('2d');
			if (!context) return;
			context.canvas.height = height;
			context.canvas.width = width;
			context.fillStyle = backgroundColor;
			context.fillRect(0, 0, height, width);
		}
	}, [height, width, backgroundColor]);

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

			if (!context) return;
			context.lineTo(currentX, currentY);
			context.stroke();
		},
		[isDrawing, canvasRef]
	);

	const handleMouseUpOrLeave = useCallback(() => {
		setIsDrawing(false);
	}, [setIsDrawing]);

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

	return <canvas ref={canvasRef} />;
};

export default Canvas;
