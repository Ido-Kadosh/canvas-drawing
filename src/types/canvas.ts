export interface Shape {
	draw(ctx: CanvasRenderingContext2D): void;
	onMouseDown(x: number, y: number): void;
	onMouseMove(x: number, y: number, isDrawing: boolean): void;
	isPointOnBorder(x: number, y: number, borderWidth: number): void;
}

export interface Ellipse {
	centerX: number;
	centerY: number;
	radiusX: number;
	radiusY: number;
	rotation: number;
}

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

export interface Shapes {
	pencils: Pencil[];
	rectangles: Rectangle[];
	ellipses: Ellipse[];
}

export type ShapeKey = keyof Shapes;
export type drawTypes = Rectangle | Ellipse | Pencil;
export type DrawMode = 'rectangle' | 'pencil' | 'ellipse';
