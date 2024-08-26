import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import useEventListener from '../hooks/useEventListener';

export type DrawMode = 'rectangle' | 'freeDraw' | 'ellipse';

interface PropTypes {
	backgroundColor?: string;
	drawMode: DrawMode;
}

const Canvas = forwardRef(({ backgroundColor = '#cccccc', drawMode }: PropTypes, ref) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
	const [savedImageData, setSavedImageData] = useState<ImageData | null>(null);

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
				setStartPos({ x: startX, y: startY });
				if (!context) return;
				context.moveTo(startX, startY);
				if (context && drawMode === 'rectangle') {
					const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
					setSavedImageData(imageData);
				}
			}
		},
		[canvasRef, drawMode]
	);

	const handleMouseMove = useCallback(
		(ev: React.MouseEvent) => {
			if (!isDrawing || !canvasRef.current) return;

			const rect = canvasRef.current.getBoundingClientRect();
			const context = canvasRef.current.getContext('2d');
			const currentX = ev.clientX - rect.left;
			const currentY = ev.clientY - rect.top;

			const freeDraw = () => {
				context?.lineTo(currentX, currentY);
				context?.stroke();
			};

			const drawRectangle = () => {
				if (drawMode === 'rectangle' && startPos && savedImageData) {
					const width = currentX - startPos.x;
					const height = currentY - startPos.y;

					if (!context) return;

					// Clear the canvas to not have multiple rectangles
					context.putImageData(savedImageData, 0, 0);

					context.strokeRect(startPos.x, startPos.y, width, height);
				}
			};

			drawMode === 'freeDraw' && freeDraw();
			drawMode === 'rectangle' && drawRectangle();
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
