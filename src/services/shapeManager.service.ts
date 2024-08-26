import { Shape } from '../types/canvas';

export class ShapeManager {
	private shapes: Shape[] = [];
	private selectedShape: Shape | null = null;
	private currentDrawingShape: Shape | null = null;

	addShape(shape: Shape) {
		this.shapes.push(shape);
	}

	drawShapes(ctx: CanvasRenderingContext2D) {
		this.shapes.forEach(shape => shape.draw(ctx));
		if (this.currentDrawingShape) {
			this.currentDrawingShape.draw(ctx);
		}
	}

	clearShapes() {
		this.shapes = [];
		this.selectedShape = null;
		this.currentDrawingShape = null;
	}

	handleMouseDown(x: number, y: number): boolean {
		this.selectedShape = this.shapes.find(shape => shape.isPointOnBorder(x, y, 5)) || null;
		if (this.selectedShape) {
			this.selectedShape.onMouseDown(x, y);
			return true;
		}
		return false;
	}

	handleMouseMove(x: number, y: number, isDrawing: boolean) {
		if (this.selectedShape && !isDrawing) {
			this.selectedShape.onMouseMove(x, y, false);
		} else if (this.currentDrawingShape && isDrawing) {
			this.currentDrawingShape.onMouseMove(x, y, true);
		}
	}

	handleMouseUp() {
		if (this.selectedShape) {
			this.selectedShape = null;
		} else if (this.currentDrawingShape) {
			this.shapes.push(this.currentDrawingShape);
			this.currentDrawingShape = null;
		}
	}

	startDrawingShape(shape: Shape) {
		this.currentDrawingShape = shape;
	}
}
