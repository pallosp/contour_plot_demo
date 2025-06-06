import {ButtonGroup} from '@mui/material';
import {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Route, Routes, useNavigate, useParams} from 'react-router-dom';

import {FunctionButton, PixelSizeInput, ShowEdgesCheckbox} from './controls';
import {PanZoom} from './pan_zoom';
import {circlePlot, linePlot, mandelbrotPlot, sinCosPlot} from './plot_configs';
import {PlotStats} from './plot_stats';
import {SvgPlot} from './svg_plot';
import type {PlotConfig, Stats} from './svg_plot';

import '@fontsource/roboto/latin-400.css';
import './style.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PLOT_TYPES: Array<[string, () => PlotConfig<any>]> = [
  ['Lines', linePlot],
  ['Circles', circlePlot],
  ['Mandelbrot set', mandelbrotPlot],
  ['sin x + cos y', sinCosPlot]
];

export function Page(props: {plotIndex: number}) {
  const [showEdges, setShowEdges] = useState(false);
  const [pixelSizeExponent, setPixelSizeExponent] = useState(devicePixelRatio > 1 ? -1 : 0);
  const [stats, setStats] = useState<Stats | undefined>(undefined);
  const [plotConfig, setPlotConfig] = useState<PlotConfig>(() => PLOT_TYPES[props.plotIndex][1]());
  const navigate = useNavigate();

  useEffect(() => {
    setPlotConfig(PLOT_TYPES[props.plotIndex][1]());
  }, [props.plotIndex]);

  return (
    <>
      <header>
        <ButtonGroup variant="outlined" sx={{height: '36px'}}>
          {PLOT_TYPES.map(([title], index) => (
            <FunctionButton
              key={title}
              text={title}
              selected={props.plotIndex === index}
              onclick={() => {
                if (props.plotIndex === index) {
                  setPlotConfig(PLOT_TYPES[index][1]());
                } else {
                  navigate(`/${index}`);
                }
              }}
            />
          ))}
        </ButtonGroup>
        <ShowEdgesCheckbox setShowEdges={setShowEdges} />
        <PixelSizeInput
          pixelSizeExponent={pixelSizeExponent}
          setPixelSizeExponent={setPixelSizeExponent}
        />
      </header>
      <main>
        <PanZoom
          className="svg-plot-wrapper"
          initialZoom={plotConfig.initialZoom}
          key={plotConfig.initialZoom}
        >
          {({offsetX, offsetY, zoom, volatile}) => (
            <SvgPlot
              offsetX={offsetX}
              offsetY={offsetY}
              zoom={zoom}
              volatile={volatile}
              config={plotConfig}
              showEdges={showEdges}
              viewportPixelSize={2 ** pixelSizeExponent}
              className="svg-plot"
              onUpdate={setStats}
            />
          )}
        </PanZoom>
      </main>
      <footer>
        <PlotStats stats={stats} />
      </footer>
    </>
  );
}

function ValidatedPage() {
  const {plotIndex} = useParams();
  if (!plotIndex || Object.keys(PLOT_TYPES).includes(plotIndex)) {
    return <Page plotIndex={+(plotIndex ?? 0)} />;
  }

  // Redirect to the root if the plot index is invalid.
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/', {replace: true});
  });
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:plotIndex?" element={<ValidatedPage />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
