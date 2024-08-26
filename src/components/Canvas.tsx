import { useEffect, useRef } from 'react';

interface PropTypes {
	height?: number;
	width?: number;
	backgroundColor?: string;
}

const Canvas = ({ height = 500, width = 500, backgroundColor = '#cccccc' }: PropTypes) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (canvasRef.current) {
			const context = canvasRef.current.getContext('2d');
			if (context) {
				context.canvas.height = height;
				context.canvas.width = width;
				context.fillStyle = backgroundColor;
				context.fillRect(0, 0, height, width);
			}
		}
	}, [height, width]);

	return <canvas ref={canvasRef} />;
};

export default Canvas;
