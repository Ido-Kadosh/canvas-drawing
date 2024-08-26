import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import useEventListener from '../hooks/useEventListener';

export type DrawMode = 'rectangle' | 'pencil' | 'ellipse';

export interface Rectangle {
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
}

export interface Pencil {
	points: { x: number; y: number }[];
}

interface Shapes {
	pencils: Pencil[];
	rectangles: Rectangle[];
}

interface PropTypes {
	backgroundColor?: string;
	drawMode: DrawMode;
}

const Canvas = forwardRef(({ backgroundColor = '#cccccc', drawMode }: PropTypes, ref) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [shapes, setShapes] = useState<Shapes>({ rectangles: [], pencils: [] });
	const [currentPencilPath, setCurrentPencilPath] = useState<Pencil | null>(null);
	const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
	const [initialShapePos, setInitialShapePos] = useState<{ x: number; y: number } | null>(null);
	const [selectedShapeIndex, setSelectedShapeIndex] = useState<number | null>(null);
	const [savedImageData, setSavedImageData] = useState<ImageData | null>(null);

	useEffect(() => {
		handleResize();
	}, [backgroundColor]);

	// expose clearCanvas to parent component
	useImperativeHandle(ref, () => ({
		clearCanvas: () => {
			if (canvasRef.current) {
				const context = canvasRef.current.getContext('2d');
				if (!context) return;
				context.fillStyle = backgroundColor;
				context.fillRect(0, 0, context.canvas.width, context.canvas.height);
				setSavedImageData(null);
				context.beginPath();
				setShapes({ rectangles: [], pencils: [] });
			}
		},
	}));

	const handleMouseDown = useCallback(
		(ev: React.MouseEvent) => {
			// only allow left click
			if (ev.button !== 0 || !canvasRef.current) return;

			const rect = canvasRef.current?.getBoundingClientRect();
			const startX = ev.clientX - rect.left;
			const startY = ev.clientY - rect.top;
			const context = canvasRef.current.getContext('2d');

			if (!context) return;
			const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
			setSavedImageData(imageData);

			// Check if the click is inside any rectangle
			for (let i = 0; i < shapes.rectangles.length; i++) {
				const currRect = shapes.rectangles[i];
				if (
					startX >= currRect.x &&
					startX <= currRect.x + currRect.width &&
					startY >= currRect.y &&
					startY <= currRect.y + currRect.height
				) {
					setSelectedShapeIndex(i);
					setStartPos({ x: startX, y: startY });
					setInitialShapePos({ x: currRect.x, y: currRect.y });
					return;
				}
			}

			setIsDrawing(true);

			if (drawMode === 'pencil') {
				context?.beginPath();
				setCurrentPencilPath({ points: [{ x: startX, y: startY }] });
				setShapes(prev => ({
					...prev,
					pencils: [...prev.pencils, { points: [{ x: startX, y: startY }] }],
				}));
				return;
			}

			setStartPos({ x: startX, y: startY });
			context.moveTo(startX, startY);
		},
		[canvasRef, drawMode, shapes]
	);

	const handleMouseMove = useCallback(
		(ev: React.MouseEvent) => {
			if (!canvasRef.current || !savedImageData) return;

			const rect = canvasRef.current.getBoundingClientRect();
			const currentX = ev.clientX - rect.left;
			const currentY = ev.clientY - rect.top;
			const context = canvasRef.current.getContext('2d');

			const drawPencil = () => {
				if (!currentPencilPath) return;
				const updatedPoints = [...currentPencilPath.points, { x: currentX, y: currentY }];
				setCurrentPencilPath({ points: updatedPoints });
				setShapes(prev => {
					const pencilsExceptLast = prev.pencils.slice(0, -1); // Copy all pencils except the last one
					const updatedPencils = [...pencilsExceptLast, { points: updatedPoints }]; // Update the last pencil with new points
					return { ...prev, pencils: updatedPencils };
				});
				context?.lineTo(currentX, currentY);
				context?.stroke();
			};

			const drawRectangle = () => {
				if (!startPos || !savedImageData) return;

				// Temporarily draw the rectangle on the canvas without adding it to state
				const width = currentX - startPos.x;
				const height = currentY - startPos.y;
				context?.putImageData(savedImageData, 0, 0); // Restore the canvas state
				context?.strokeRect(startPos.x, startPos.y, width, height);
			};

			const moveShape = () => {
				if (selectedShapeIndex === null || !startPos || !initialShapePos) return;
				const newRectangles = [...shapes.rectangles];
				const selectedRect = newRectangles[selectedShapeIndex];

				// Calculate the new position of the rectangle based on the initial position and mouse movement
				const dx = currentX - startPos.x;
				const dy = currentY - startPos.y;

				selectedRect.x = initialShapePos.x + dx;
				selectedRect.y = initialShapePos.y + dy;

				setShapes(prev => ({ ...prev, rectangles: newRectangles }));
				redrawCanvas(shapes);
			};

			if (selectedShapeIndex !== null && startPos) {
				moveShape();
			}
			if (isDrawing) {
				drawMode === 'pencil' && drawPencil();
				drawMode === 'rectangle' && drawRectangle();
			}
		},
		[isDrawing, canvasRef, drawMode, startPos, savedImageData, selectedShapeIndex, shapes]
	);

	const handleMouseUpOrLeave = useCallback(
		(ev: React.MouseEvent) => {
			// add the rectangle to state only after the mouse is released
			if (drawMode !== 'pencil' && startPos && isDrawing) {
				const newRectangles = [
					...shapes.rectangles,
					{
						x: startPos.x,
						y: startPos.y,
						width: ev.clientX - startPos.x,
						height: ev.clientY - startPos.y,
						rotation: 0,
					},
				];

				setShapes(prev => ({ ...prev, rectangles: newRectangles }));
			}

			setIsDrawing(false);
			setSelectedShapeIndex(null);
			setInitialShapePos(null); // Reset the initial rectangle position
		},
		[drawMode, isDrawing, startPos, shapes]
	);

	const redrawCanvas = (shapes: Shapes) => {
		if (!canvasRef.current) return;
		const context = canvasRef.current.getContext('2d');
		if (!context) return;

		// Clear the canvas
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		context.fillStyle = backgroundColor;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);

		// Redraw all pencil paths
		shapes.pencils.forEach(pencil => {
			context.beginPath();
			pencil.points.forEach((point, index) => {
				if (index === 0) {
					context.moveTo(point.x, point.y);
				} else {
					context.lineTo(point.x, point.y);
					context.stroke();
				}
			});
		});

		// Redraw all rectangles
		shapes.rectangles.forEach(rect => {
			context.save();
			context.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
			context.rotate((rect.rotation * Math.PI) / 180);
			context.strokeRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
			context.restore();
		});
	};

	const handleResize = useCallback(() => {
		if (!canvasRef.current) return;

		var rect = canvasRef.current.parentElement?.getBoundingClientRect();
		if (!rect) return;

		const context = canvasRef.current.getContext('2d');
		if (!context) return;

		context.canvas.height = window.innerHeight * 0.9;
		context.canvas.width = rect.width;
		context.lineWidth = 3;
		context.fillStyle = backgroundColor;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);

		redrawCanvas(shapes);
	}, [canvasRef, backgroundColor, shapes]);

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
