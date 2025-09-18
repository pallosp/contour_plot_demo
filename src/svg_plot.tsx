import {Plot, runsToSvg, squaresToSvg} from 'contour-plot-svg';
import type {AffineTransform, ComputeStats, Rect} from 'contour-plot-svg';
import {Component, createRef} from 'react';

import type {Function2D} from './functions';

export interface PlotConfig<T = unknown> {
  func: Function2D<T>;
  sampleSpacing: number;
  initialZoom: number;
  addStyles: (el: SVGGraphicsElement, value: T) => void;
}

export interface Stats extends ComputeStats {
  squareCount: number;
  runCount: number;
  svgSize: number;
  buildSvgMs: number;
  drawMs: number;
}

interface Props {
  offsetX?: number;
  offsetY?: number;
  zoom: number;
  volatile?: boolean;
  config: PlotConfig;
  showEdges: boolean;
  viewportPixelSize: number;
  onUpdate: (stats: Stats) => void;
  className?: string;
}

interface State {
  mounted: boolean;
}

export class SvgPlot extends Component<Props, State> {
  private svgRef = createRef<SVGSVGElement>();
  private computedDomain: Rect = new DOMRect();

  constructor(props: Props) {
    super(props);
    this.state = {mounted: false};
  }

  private domain(): Rect {
    const el = this.svgRef.current;
    const {offsetX, offsetY, zoom} = this.props;
    const width = (el?.clientWidth ?? 0) / zoom;
    const height = (el?.clientHeight ?? 0) / zoom;
    return {
      x: -width / 2 - (offsetX ?? 0) / zoom,
      y: -height / 2 - (offsetY ?? 0) / zoom,
      width,
      height
    };
  }

  private domainPixelSize(): number {
    return this.props.viewportPixelSize / roundDownToPow2(this.props.zoom);
  }

  override render() {
    const {props} = this;
    const domain = this.domain();
    if (!props.volatile) {
      this.computedDomain = domain;
    }

    // Transformation from the domain to the view coordinates before the user
    // started panning or zooming.
    const computedDomainToViewTransform = new DOMMatrix()
      .scaleSelf(this.props.zoom)
      .translateSelf(-this.computedDomain.x, -this.computedDomain.y);

    // Result of the ongoing panning and zooming.
    const dx = (this.computedDomain.x - domain.x) * this.props.zoom;
    const dy = (this.computedDomain.y - domain.y) * this.props.zoom;

    return (
      <svg ref={this.svgRef} className={props.className}>
        {domain.width > 0 && (
          <g transform={`translate(${dx} ${dy})`}>
            <SvgPlotContent
              func={props.config.func}
              domain={this.computedDomain}
              domainToViewTransform={computedDomainToViewTransform}
              sampleSpacing={props.config.sampleSpacing}
              pixelSize={this.domainPixelSize()}
              addStyles={props.config.addStyles}
              showEdges={props.showEdges}
              onUpdate={props.onUpdate}
            />
          </g>
        )}
      </svg>
    );
  }

  override componentDidMount(): void {
    this.setState({mounted: true});
  }
}

interface ContentProps<T = unknown> {
  func: (x: number, y: number) => T;
  domain: Rect;
  domainToViewTransform: AffineTransform;
  sampleSpacing: number;
  pixelSize: number;
  showEdges: boolean;
  addStyles: (el: SVGGraphicsElement, value: T) => void;
  onUpdate: (stats: Stats) => void;
}

class SvgPlotContent extends Component<ContentProps> {
  private plot: Plot<unknown>;

  private rootRef = createRef<SVGGElement>();

  constructor(props: ContentProps) {
    super(props);
    this.plot = new Plot(props.func);
  }

  override render() {
    return <g ref={this.rootRef} />;
  }

  private shouldRecompute(
    prevProps: Readonly<ContentProps>,
    nextProps: Readonly<ContentProps>
  ): boolean {
    return (
      prevProps.func !== nextProps.func ||
      prevProps.sampleSpacing !== nextProps.sampleSpacing ||
      prevProps.pixelSize !== nextProps.pixelSize ||
      !containsRect(this.plot.domain(), nextProps.domain)
    );
  }

  private recompute() {
    const {domain, sampleSpacing, pixelSize} = this.props;
    this.plot.compute(domain, sampleSpacing, pixelSize);
  }

  override shouldComponentUpdate(nextProps: Readonly<ContentProps>): boolean {
    return (
      this.props.func !== nextProps.func ||
      this.props.showEdges !== nextProps.showEdges ||
      this.props.addStyles !== nextProps.addStyles ||
      this.shouldRecompute(this.props, nextProps)
    );
  }

  private updateView() {
    const {addStyles, onUpdate} = this.props;
    const transform = this.props.domainToViewTransform;
    const buildSvgStartMs = Date.now();
    let svgElements: SVGGraphicsElement[];
    let squareCount = 0;
    let runCount = 0;
    let drawStartMs: number;
    if (this.props.showEdges) {
      const squares = this.plot.squares();
      drawStartMs = Date.now();
      squareCount = squares.length;
      svgElements = squaresToSvg(squares, addStyles, {transform, edges: true});
    } else {
      const runs = this.plot.runs();
      drawStartMs = Date.now();
      runCount = runs.length;
      svgElements = runsToSvg(runs, addStyles, {transform});
    }

    const content = this.rootRef.current!;
    content.textContent = '';
    content.append(...svgElements);

    onUpdate({
      ...this.plot.computeStats(),
      squareCount,
      runCount,
      svgSize: content.outerHTML.length,
      buildSvgMs: drawStartMs - buildSvgStartMs,
      drawMs: Date.now() - drawStartMs
    });
  }

  override componentDidMount() {
    this.recompute();
    this.updateView();
  }

  override componentDidUpdate(prevProps: Readonly<ContentProps>): void {
    if (this.props.func !== prevProps.func) {
      this.plot = new Plot(this.props.func);
    }
    if (this.shouldRecompute(prevProps, this.props)) {
      this.recompute();
    }
    this.updateView();
  }
}

function containsRect(r1: Rect, r2: Rect) {
  return (
    r2.x >= r1.x &&
    r2.y >= r1.y &&
    r2.x + r2.width <= r1.x + r1.width &&
    r2.y + r2.height <= r1.y + r1.height
  );
}

function roundDownToPow2(x: number): number {
  return 2 ** Math.floor(Math.log2(x));
}
