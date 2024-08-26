import { Shape } from '../types/canvas';

export class EllipseShape implements Shape {
	private initialX: number;
	private initialY: number;
	private startCenterX: number;
	private startCenterY: number;

	constructor(public centerX: number, public centerY: number, public radiusX: number, public radiusY: number) {
		this.initialX = centerX;
		this.initialY = centerY;
		this.startCenterX = centerX;
		this.startCenterY = centerY;
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.ellipse(this.centerX, this.centerY, this.radiusX, this.radiusY, 0, 0, 2 * Math.PI);
		ctx.stroke();
	}

	onMouseDown(x: number, y: number) {
		this.initialX = x;
		this.initialY = y;
		this.startCenterX = this.centerX;
		this.startCenterY = this.centerY;
	}

	onMouseMove(x: number, y: number, isDrawing: boolean): void {
		if (isDrawing) {
			this.centerX = (this.initialX + x) / 2;
			this.centerY = (this.initialY + y) / 2;
			this.radiusX = Math.abs(x - this.initialX) / 2;
			this.radiusY = Math.abs(y - this.initialY) / 2;
		} else {
			const dx = x - this.initialX;
			const dy = y - this.initialY;
			this.centerX = this.startCenterX + dx;
			this.centerY = this.startCenterY + dy;
		}
	}

	isPointOnBorder(x: number, y: number, borderWidth: number): boolean {
		const dx = x - this.centerX;
		const dy = y - this.centerY;
		const distanceSquared = (dx * dx) / (this.radiusX * this.radiusX) + (dy * dy) / (this.radiusY * this.radiusY);
		return Math.abs(distanceSquared - 1) <= borderWidth / Math.max(this.radiusX, this.radiusY);
	}
}
