import {render} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {SvgPlot} from '../src/svg_plot';

describe('SvgPlot', () => {
  it('rendering a constant function', () => {
    vi.spyOn(SVGGraphicsElement.prototype, 'clientWidth', 'get').mockReturnValue(2);
    vi.spyOn(SVGGraphicsElement.prototype, 'clientHeight', 'get').mockReturnValue(2);

    const plot = render(
      <SvgPlot
        zoom={1}
        config={{func: () => 0, sampleSpacing: 1, initialZoom: 1, addStyles: () => {}}}
        showEdges={false}
        viewportPixelSize={1}
        onUpdate={() => {}}
      />
    );

    expect(plot.container.querySelector('path')?.getAttribute('d')).toBe('m0 0.5h2m0 1h-2');
  });
});
