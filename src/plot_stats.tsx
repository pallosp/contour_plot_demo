import {Typography} from '@mui/material';

import type {Stats} from './svg_plot';

export function PlotStats(props: {stats: Stats | undefined}) {
  const stats = props.stats;
  if (!stats) return <Typography variant="caption">…</Typography>;

  const pixelsPerEval = stats.newArea / stats.newCalls;
  const computeStats =
    stats.newCalls > 0 ? (
      <span className="stats-item">
        Computed f(x,y) {stats.newCalls.toLocaleString()} times, once for every{' '}
        {+pixelsPerEval.toFixed(1)} pixels in {Math.round(stats.elapsedMs)} ms.
      </span>
    ) : null;
  const renderStats = (
    <span className="stats-item">
      Built {(stats.squareCount + stats.runCount).toLocaleString()}
      {stats.squareCount > 0 ? ' squares' : ' runs'} in {stats.buildSvgMs} ms and drew them in{' '}
      {stats.drawMs} ms.
    </span>
  );
  const svgStats = (
    <span className="stats-item">SVG size: {Math.round(stats.svgSize / 1024)} KiB</span>
  );
  return (
    <Typography variant="caption">
      {computeStats} {renderStats} {svgStats}
    </Typography>
  );
}
