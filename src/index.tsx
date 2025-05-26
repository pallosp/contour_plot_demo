import {ButtonGroup} from '@mui/material';
import {render} from 'preact';
import {useState} from 'preact/hooks';

import {FunctionButton, PixelSizeInput, ShowEdgesCheckbox} from './controls';
import {PanZoom} from './pan_zoom';
import {circlePlot, linePlot, mandelbrotPlot, sinCosPlot} from './plot_configs';
import {PlotStats} from './plot_stats';
import {PlotConfig, Stats, SvgPlot} from './svg_plot';

import '@fontsource/roboto/latin-400.css';
import './style.css';

const PLOT_TYPES: Array<[string, () => PlotConfig]> = [
  ['Lines', linePlot],
  ['Circles', circlePlot],
  ['Mandelbrot set', mandelbrotPlot],
  ['sin x + cos y', sinCosPlot]
];

export function App() {
  const [plotConfig, setPlotConfig] = useState<PlotConfig<unknown>>(PLOT_TYPES[0][1]());
  const [plotIndex, setPlotIndex] = useState(0);
  const [showEdges, setShowEdges] = useState(false);
  const [pixelSizeExponent, setPixelSizeExponent] = useState(devicePixelRatio > 1 ? -1 : 0);
  const [stats, setStats] = useState<Stats | undefined>();

  function setPlot(index: number, plotConfig: PlotConfig<unknown>) {
    setPlotIndex(index);
    setPlotConfig(plotConfig);
  }

  return (
    <>
      <header>
        <ButtonGroup variant="outlined" sx={{height: '36px'}}>
          {PLOT_TYPES.map(([title, plotConfigFactory], index) => (
            <FunctionButton
              text={title}
              selected={plotIndex === index}
              onclick={() => setPlot(index, plotConfigFactory())}
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
              onUpdate={(s) => setStats(s)}
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

render(<App />, document.body);
