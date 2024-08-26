import { Shape } from '../types/canvas';

export class RectangleShape implements Shape {
	private initialX: number;
	private initialY: number;

	constructor(public x: number, public y: number, public width: number, public height: number) {
		this.initialX = x;
		this.initialY = y;
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.strokeRect(this.x, this.y, this.width, this.height);
	}

	onMouseDown(x: number, y: number) {
		this.initialX = x - this.x; // Store the offset
		this.initialY = y - this.y;
	}

	onMouseMove(x: number, y: number, isDrawing: boolean) {
		if (isDrawing) {
			this.width = x - this.x;
			this.height = y - this.y;
		} else {
			this.x = x - this.initialX;
			this.y = y - this.initialY;
		}
	}

	isPointOnBorder(x: number, y: number, borderWidth: number): boolean {
		// Calculate the actual bounds of the rectangle
		const left = Math.min(this.x, this.x + this.width);
		const right = Math.max(this.x, this.x + this.width);
		const top = Math.min(this.y, this.y + this.height);
		const bottom = Math.max(this.y, this.y + this.height);

		// Check if the point is within the border range
		const withinLeftEdge = Math.abs(x - left) <= borderWidth;
		const withinRightEdge = Math.abs(x - right) <= borderWidth;
		const withinTopEdge = Math.abs(y - top) <= borderWidth;
		const withinBottomEdge = Math.abs(y - bottom) <= borderWidth;

		const onVerticalEdge = (withinLeftEdge || withinRightEdge) && y >= top && y <= bottom;
		const onHorizontalEdge = (withinTopEdge || withinBottomEdge) && x >= left && x <= right;

		return onVerticalEdge || onHorizontalEdge;
	}
}
