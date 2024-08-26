import { useRef, useState } from 'react';
import Canvas, { DrawMode } from './components/Canvas';

const App = () => {
	const [drawMode, setDrawMode] = useState<DrawMode>('pencil');
	const canvasRef = useRef<{ clearCanvas: () => void }>(null);

	return (
		<div className="flex flex-col max-h-screen">
			<Canvas ref={canvasRef} drawMode={drawMode} />
			<div className="space-x-2 m-auto">
				<button
					className={`${
						drawMode === 'pencil' ? 'bg-blue-900' : 'bg-blue-500 hover:bg-blue-600'
					}  text-white font-bold py-2 px-4 rounded`}
					onClick={() => {
						setDrawMode('pencil');
					}}
				>
					Pencil
				</button>
				<button
					className={`${
						drawMode === 'ellipse' ? 'bg-blue-900' : 'bg-blue-500 hover:bg-blue-600'
					}  text-white font-bold py-2 px-4 rounded`}
					onClick={() => {
						setDrawMode('ellipse');
					}}
				>
					Ellipse
				</button>
				<button
					className={`${
						drawMode === 'rectangle' ? 'bg-blue-900' : 'bg-blue-500 hover:bg-blue-600'
					}  text-white font-bold py-2 px-4 rounded`}
					onClick={() => {
						setDrawMode('rectangle');
					}}
				>
					Rectangle
				</button>
				<button
					className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
					onClick={() => {
						canvasRef.current?.clearCanvas();
					}}
				>
					Clear
				</button>
			</div>
		</div>
	);
};

export default App;
