import { Component, Element, Prop, h, VNode } from "@stencil/core";
import { DataSeries } from "./interfaces";
import { guid } from "../../utils/guid";
import { area, range, translate } from "./util";

@Component({
  tag: "calcite-graph",
  styleUrl: "calcite-graph.scss",
  shadow: true
})
export class CalciteGraph {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element() el: HTMLCalciteGraphElement;

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  /**
   * Array of tuples describing a single data point ([x, y])
   * These data points should be sorted by x-axis value
   */
  @Prop() data: DataSeries = [];

  /** Width of graph in pixels*/
  @Prop() width = 300;

  /** Width of graph in pixels*/
  @Prop() height = 100;

  /** Start of highlight color if highlighting range */
  @Prop() highlightMin: number;

  /** End of highlight color if highlighting range */
  @Prop() highlightMax: number;

  /**
   * Array of values describing a single color stop ([offset, color, opacity])
   * These color stops should be sorted by offset value
   */
  @Prop() colorStops: [number, string, number][];

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  render(): VNode {
    const { data, colorStops, width, height, highlightMax, highlightMin } = this;
    const id = this.graphId;

    // if we have no data, return empty svg
    if (!data || data.length === 0) {
      return (
        <svg
          class="svg"
          height={height}
          preserveAspectRatio="none"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
        />
      );
    }

    const { min, max } = range(data);
    const t = translate({ min, max, width, height });
    const [hMinX] = t([highlightMin, max[1]]);
    const [hMaxX] = t([highlightMax, max[1]]);
    const areaPath = area({ data, min, max, t });
    const fill = colorStops ? `url(#linear-gradient-${id})` : undefined;
    return (
      <svg
        class="svg"
        height={height}
        preserveAspectRatio="none"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
      >
        {colorStops ? (
          <defs>
            <linearGradient id={`linear-gradient-${id}`} x1="0" x2="1" y1="0" y2="0">
              {colorStops.map(([offset, color, opacity = 1]) => (
                <stop offset={`${offset * 100}%`} stop-color={color} stop-opacity={opacity}/>
              ))}
            </linearGradient>
          </defs>
        ) : null}

        {highlightMin !== undefined ? [
          <mask height="100%" id={`${id}1`} width="100%" x="0%" y="0%">
            <path
              d={`
            M 0,0
            L ${hMinX - 1},0
            L ${hMinX - 1},${height}
            L 0,${height}
            Z
          `}
              fill="white"
            />
          </mask>,

          <mask height="100%" id={`${id}2`} width="100%" x="0%" y="0%">
            <path
              d={`
            M ${hMinX + 1},0
            L ${hMaxX - 1},0
            L ${hMaxX - 1},${height}
            L ${hMinX + 1}, ${height}
            Z
          `}
              fill="white"
            />
          </mask>,

          <mask height="100%" id={`${id}3`} width="100%" x="0%" y="0%">
            <path
              d={`
                M ${hMaxX + 1},0
                L ${width},0
                L ${width},${height}
                L ${hMaxX + 1}, ${height}
                Z
              `}
              fill="white"
            />
          </mask>,

          <path class="graph-path" d={areaPath} fill={fill} mask={`url(#${id}1)`} />,
          <path class="graph-path--highlight" d={areaPath} fill={fill} mask={`url(#${id}2)`} />,
          <path class="graph-path" d={areaPath} fill={fill} mask={`url(#${id}3)`} />
         ] : (
          <path class="graph-path" d={areaPath} fill={fill} />
        )}
      </svg>
    );
  }

  //--------------------------------------------------------------------------
  //
  //  Private State/Props
  //
  //--------------------------------------------------------------------------

  private graphId = `calcite-graph-${guid()}`;
}
