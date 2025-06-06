import {Component, createRef} from 'react';
import type {ReactNode} from 'react';
import {createPortal} from 'react-dom';

interface Props {
  initialZoom: number;
  className?: string;
  children: (state: {
    offsetX: number;
    offsetY: number;
    zoom: number;
    volatile: boolean;
  }) => ReactNode;
}

interface State {
  lastX: number;
  lastY: number;
  offsetX: number;
  offsetY: number;
  zoom: number;
  panning: boolean;
}

export class PanZoom extends Component<Props, State> {
  private readonly rootElement = createRef<HTMLDivElement>();
  private resizeObserver = new ResizeObserver(() => this.onResize());

  private readonly mouseMoveListener = (e: MouseEvent) => this.onMouseMove(e);
  private readonly mouseUpListener = () => this.onMouseUp();

  constructor(props: Props) {
    super(props);
    this.state = {
      lastX: 0,
      lastY: 0,
      offsetX: 0,
      offsetY: 0,
      zoom: props.initialZoom,
      panning: false
    };
  }

  override render() {
    const {className, children} = this.props;
    const {offsetX, offsetY, zoom, panning} = this.state;
    return (
      <div ref={this.rootElement} className={className} onMouseDown={(e) => this.onMouseDown(e)}>
        {children({offsetX, offsetY, zoom, volatile: panning})}
        {panning &&
          createPortal(
            <div style={{position: 'absolute', width: '100vw', height: '100vh', cursor: 'grab'}} />,
            document.body
          )}
      </div>
    );
  }

  override componentDidMount(): void {
    this.resizeObserver.observe(this.rootElement.current!);
  }

  private onMouseDown(e: React.MouseEvent) {
    e.preventDefault(); // prevent text selection while dragging
    const {x, y} = e.nativeEvent;
    this.setState({lastX: x, lastY: y, panning: true});
    window.addEventListener('mousemove', this.mouseMoveListener);
    window.addEventListener('mouseup', this.mouseUpListener);
  }

  private onMouseMove(e: MouseEvent) {
    const {lastX, lastY, offsetX, offsetY} = this.state;
    this.setState({
      lastX: e.x,
      lastY: e.y,
      offsetX: offsetX + e.x - lastX,
      offsetY: offsetY + e.y - lastY
    });
  }

  private onMouseUp() {
    this.cleanup();
    this.setState({panning: false});
  }

  private onResize() {
    this.forceUpdate();
  }

  override componentWillUnmount(): void {
    this.cleanup();
    this.resizeObserver.disconnect();
  }

  private cleanup() {
    window.removeEventListener('mousemove', this.mouseMoveListener);
    window.removeEventListener('mouseup', this.mouseUpListener);
  }
}
