import { Shape } from '../types/canvas';

export class PencilShape implements Shape {
	public points: { x: number; y: number }[] = [];

	constructor(x: number, y: number) {
		this.points.push({ x, y });
	}

	draw(ctx: CanvasRenderingContext2D): void {
		if (this.points.length < 2) return;
		ctx.beginPath();
		ctx.moveTo(this.points[0].x, this.points[0].y);
		this.points.forEach(point => {
			ctx.lineTo(point.x, point.y);
		});
		ctx.stroke();
	}

	onMouseDown(x: number, y: number): void {
		this.points.push({ x, y });
	}

	onMouseMove(x: number, y: number): void {
		this.points.push({ x, y });
	}

	isPointOnBorder(): boolean {
		return false; // never want to move pencil marks
	}
}
