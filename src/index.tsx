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

export function App() {
  const [plotConfig, setPlotConfig] = useState<PlotConfig<unknown>>(linePlot());
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
          <FunctionButton
            text="Lines"
            selected={plotIndex === 0}
            onclick={() => setPlot(0, linePlot())}
          />
          <FunctionButton
            text="Circles"
            selected={plotIndex === 1}
            onclick={() => setPlot(1, circlePlot())}
          />
          <FunctionButton
            text="Mandelbrot set"
            selected={plotIndex === 2}
            onclick={() => setPlot(2, mandelbrotPlot())}
          />
          <FunctionButton
            text="sin x + cos y"
            selected={plotIndex === 3}
            onclick={() => setPlot(3, sinCosPlot())}
          />
        </ButtonGroup>
        <ShowEdgesCheckbox setShowEdges={setShowEdges} />
        <PixelSizeInput
          pixelSizeExponent={pixelSizeExponent}
          setPixelSizeExponent={setPixelSizeExponent}
        />
      </header>
      <main>
        <PanZoom key={plotIndex} className="svg-plot-wrapper" initialZoom={plotConfig.zoom}>
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
