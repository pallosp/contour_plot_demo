import {mandelbrot, randomCircles, randomLines, sinCos} from './functions';
import {PlotConfig} from './svg_plot';

export function linePlot(): PlotConfig<boolean> {
  return {
    func: randomLines(),
    sampleSpacing: 0.5,
    zoom: 64,
    addStyles: (el, value) => {
      el.classList.add(value ? 'line' : 'line-background');
    }
  };
}

export function circlePlot(): PlotConfig<number> {
  const classes = ['outside', 'perimeter', 'inside'];
  return {
    func: randomCircles(),
    sampleSpacing: 0.5,
    zoom: 64,
    addStyles: (el, value) => {
      el.classList.add(classes[value + 1]);
    }
  };
}

export function sinCosPlot(): PlotConfig<number> {
  return {
    func: sinCos,
    sampleSpacing: 1,
    zoom: 64,
    addStyles: (el, value) => {
      el.style.stroke = '#' + ((value + 3) * 3).toString(16).repeat(3);
    }
  };
}

export function mandelbrotPlot(): PlotConfig<number> {
  return {
    func: mandelbrot,
    sampleSpacing: 0.25,
    zoom: 256,
    addStyles: (el, value) => {
      el.style.stroke = '#' + ((value % 6) * 3).toString(16).repeat(3);
    }
  };
}
