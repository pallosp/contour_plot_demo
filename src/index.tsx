import {ButtonGroup} from '@mui/material';
import {render} from 'preact';
import {LocationProvider, useLocation} from 'preact-iso';
import {useState} from 'preact/hooks';

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

export function Page({plotIndex}: {plotIndex: number}) {
  const {route} = useLocation();
  const [showEdges, setShowEdges] = useState(false);
  const [pixelSizeExponent, setPixelSizeExponent] = useState(devicePixelRatio > 1 ? -1 : 0);
  const [stats, setStats] = useState<Stats | undefined>(undefined);
  const [plotConfig, setPlotConfig] = useState<PlotConfig<unknown>>(() =>
    PLOT_TYPES[plotIndex][1]()
  );

  return (
    <>
      <header>
        <ButtonGroup variant="outlined" sx={{height: '36px'}}>
          {PLOT_TYPES.map(([title], index) => (
            <FunctionButton
              text={title}
              selected={plotIndex === index}
              onclick={() => {
                setPlotConfig(PLOT_TYPES[index][1]());
                route(`${index}`);
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
        <PanZoom key={plotIndex} className="svg-plot-wrapper" initialZoom={plotConfig.initialZoom}>
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

function App() {
  const location = useLocation();
  const plotIndex = +location.path.substring(1);
  if (plotIndex in PLOT_TYPES) {
    return <Page plotIndex={plotIndex} />;
  } else {
    location.route('/', true);
  }
}

render(
  <LocationProvider>
    <App />
  </LocationProvider>,
  document.body
);
