import { Shape } from '../types/canvas';

export class EllipseShape implements Shape {
	private initialX: number;
	private initialY: number;

	constructor(public centerX: number, public centerY: number, public radiusX: number, public radiusY: number) {
		this.initialX = centerX;
		this.initialY = centerY;
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.ellipse(this.centerX, this.centerY, this.radiusX, this.radiusY, 0, 0, 2 * Math.PI);
		ctx.stroke();
	}

	onMouseDown(x: number, y: number) {
		this.initialX = x;
		this.initialY = y;
	}

	onMouseMove(x: number, y: number, isDrawing: boolean): void {
		if (isDrawing) {
			// Adjust the size and position during drawing
			this.centerX = (this.initialX + x) / 2;
			this.centerY = (this.initialY + y) / 2;
			this.radiusX = Math.abs(x - this.initialX) / 2;
			this.radiusY = Math.abs(y - this.initialY) / 2;
		} else {
			this.centerX = x - this.radiusX;
			this.centerY = y - this.radiusY;
		}
	}

	isPointOnBorder(x: number, y: number, borderWidth: number): boolean {
		// Ellipse point on border logic
		const dx = x - this.centerX;
		const dy = y - this.centerY;
		const distanceSquared = (dx * dx) / (this.radiusX * this.radiusX) + (dy * dy) / (this.radiusY * this.radiusY);
		return Math.abs(distanceSquared - 1) <= borderWidth / Math.max(this.radiusX, this.radiusY);
	}
}
