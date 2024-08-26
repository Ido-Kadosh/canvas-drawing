import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import useEventListener from '../hooks/useEventListener';
import { EllipseShape } from '../services/ellipse.service';
import { PencilShape } from '../services/pencil.service';
import { RectangleShape } from '../services/rectangle.service';
import { ShapeManager } from '../services/shapeManager.service';
import { DrawMode, Shape } from '../types/canvas';

interface PropTypes {
	backgroundColor?: string;
	drawMode: DrawMode;
}

const Canvas = forwardRef(({ backgroundColor = '#cccccc', drawMode }: PropTypes, ref) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const shapeManager = useRef(new ShapeManager());
	const [isDrawing, setIsDrawing] = useState(false);

	useEffect(() => {
		handleResize();
	}, [backgroundColor]);

	// expose clearCanvas to the parent component
	useImperativeHandle(ref, () => ({
		clearCanvas: () => {
			const ctx = canvasRef.current?.getContext('2d');
			if (!ctx) return;

			// clear the canvas and reset the shape manager
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			shapeManager.current.clearShapes();
		},
	}));

	const handleMouseDown = useCallback(
		(ev: React.MouseEvent) => {
			const rect = canvasRef.current?.getBoundingClientRect();
			if (!rect) return;
			const startX = ev.clientX - rect.left;
			const startY = ev.clientY - rect.top;

			const existingShapeSelected = shapeManager.current.handleMouseDown(startX, startY);

			if (existingShapeSelected) return;

			let newShape: Shape | null = null;

			if (drawMode === 'rectangle') {
				newShape = new RectangleShape(startX, startY, 0, 0);
			} else if (drawMode === 'ellipse') {
				newShape = new EllipseShape(startX, startY, 0, 0);
			} else if (drawMode === 'pencil') {
				newShape = new PencilShape(startX, startY);
			}

			// if we're in drawing mode, start drawing a new shape
			if (newShape) {
				shapeManager.current.startDrawingShape(newShape);
				newShape.onMouseDown(startX, startY);
				setIsDrawing(true);
			}
		},
		[drawMode]
	);

	const handleMouseMove = useCallback(
		(ev: React.MouseEvent) => {
			const rect = canvasRef.current?.getBoundingClientRect();
			if (!rect) return;
			const currentX = ev.clientX - rect.left;
			const currentY = ev.clientY - rect.top;

			shapeManager.current.handleMouseMove(currentX, currentY, isDrawing);
			redrawCanvas();
		},
		[isDrawing]
	);

	const handleMouseUp = useCallback(() => {
		const rect = canvasRef.current?.getBoundingClientRect();
		if (!rect) return;

		shapeManager.current.handleMouseUp();
		setIsDrawing(false);
		redrawCanvas();
	}, []);

	const redrawCanvas = () => {
		if (!canvasRef.current) return;
		const ctx = canvasRef.current.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		shapeManager.current.drawShapes(ctx);
	};

	const handleResize = useCallback(() => {
		if (!canvasRef.current) return;

		var rect = canvasRef.current.parentElement?.getBoundingClientRect();
		if (!rect) return;

		const ctx = canvasRef.current.getContext('2d');
		if (!ctx) return;

		ctx.canvas.height = window.innerHeight * 0.9;
		ctx.canvas.width = rect.width;
		ctx.lineWidth = 3;
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		redrawCanvas();
	}, [canvasRef, backgroundColor]);

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
		callback: handleMouseUp,
		ref: canvasRef,
	});

	useEventListener({
		eventName: 'mouseleave',
		callback: handleMouseUp,
		ref: canvasRef,
	});

	return <canvas ref={canvasRef} className="flex-grow-0 flex-shrink-0" />;
});

export default Canvas;
