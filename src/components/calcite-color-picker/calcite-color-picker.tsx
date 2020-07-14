import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Method,
  Prop,
  State,
  VNode,
  Watch,
} from "@stencil/core";

import Color from "color";
import { ColorMode } from "../../interfaces/ColorPicker";
import { Scale, Theme } from "../../interfaces/common";
import {
  CSS,
  DEFAULT_HEX_COLOR,
  DEFAULT_STORAGE_KEY_PREFIX,
} from "./resources";

// TODO: extract into ColorMode object w/ more details: parts, limits, labels, render()? etc...
const RGB_LIMITS = {
  r: 255,
  g: 255,
  b: 255,
};

const HSV_LIMITS = {
  h: 360,
  s: 100,
  v: 100,
};

const DIMENSIONS = {
  s: {
    slider: {
      height: 8,
      width: 170,
    },
    colorField: {
      height: 80,
      width: 170,
    },
    thumb: {
      radius: 8,
    },
  },
  m: {
    slider: {
      height: 12,
      width: 240,
    },
    colorField: {
      height: 130,
      width: 240,
    },
    thumb: {
      radius: 10,
    },
  },
  l: {
    slider: {
      height: 12,
      width: 370,
    },
    colorField: {
      height: 200,
      width: 370,
    },
    thumb: {
      radius: 10,
    },
  },
};

const defaultColor = Color(DEFAULT_HEX_COLOR);

@Component({
  tag: "calcite-color-picker",
  styleUrl: "calcite-color-picker.scss",
  shadow: true,
})
export class CalciteColorPicker {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element()
  el: HTMLDivElement;

  //--------------------------------------------------------------------------
  //
  //  Public properties
  //
  //--------------------------------------------------------------------------

  /** Label used for the blue channel */
  @Prop() intlB = "B";

  /** Label used for the blue channel description */
  @Prop() intlBlue = "Blue";

  /** Label used for the green channel */
  @Prop() intlG = "G";

  /** Label used for the green channel description */
  @Prop() intlGreen = "Green";

  /** Label used for the hue channel */
  @Prop() intlH = "H";

  /** Label used for the HSV mode */
  @Prop() intlHsv = "HSV";

  /** Label used for the hex input */
  @Prop() intlHex = "Hex";

  /** Label used for the hue channel description */
  @Prop() intlHue = "Hue";

  /** Label used for the red channel */
  @Prop() intlR = "R";

  /** Label used for the red channel description */
  @Prop() intlRed = "Red";

  /** Label used for the RGB mode */
  @Prop() intlRgb = "RGB";

  /** Label used for the saturation channel */
  @Prop() intlS = "S";

  /** Label used for the saturation channel description */
  @Prop() intlSaturation = "Saturation";

  /** Label used for the  */
  @Prop() intlSavedColors = "Saved Colors";

  /** Label used for the value channel */
  @Prop() intlV = "V";

  /** Label used for the  */
  @Prop() intlValue = "Value";

  // TODO: should this be state?
  /**
   * The color mode. Can be `rgb` or `hsv`.
   */
  @Prop() mode: ColorMode = "rgb";

  /**
   * The scale of the color picker.
   */
  @Prop({
    reflect: true,
  })
  scale: Exclude<Scale, "xs" | "xl"> = "m";

  @Watch("scale")
  handleScaleChange(scale: Exclude<Scale, "xs" | "xl"> = "m"): void {
    this.updateDimensions(scale);
  }

  /**
   * Storage ID for colors.
   */
  @Prop() storageId: string;

  /**
   * The component's theme.
   */
  @Prop({
    reflect: true,
  })
  theme: Theme = "light";

  /**
   * The color value in hex.
   */
  @Prop() value = defaultColor.hex();

  @Watch("value")
  handleColorChange(value): void {
    this.activeColor = Color(value);
  }

  //--------------------------------------------------------------------------
  //
  //  Internal State/Props
  //
  //--------------------------------------------------------------------------

  private fieldAndSliderRenderingContext: CanvasRenderingContext2D;

  private hexInputNode: HTMLCalciteHexInputElement;

  private hueThumbState: "idle" | "hover" | "drag" = "idle";

  private sliderThumbState: "idle" | "hover" | "drag" = "idle";

  @State() activeColor = defaultColor;

  @Watch("activeColor")
  handleActiveColorChange(): void {
    this.drawCanvasParts();
    this.calciteColorPickerColorChange.emit();
  }

  @State() colorFieldAndSliderInteractive = false;

  @State() colorPart0: number;
  @State() colorPart1: number;

  @State() colorPart2: number;

  @State() dimensions = DIMENSIONS.m;

  @State() savedColors: string[] = [];

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------

  @Event()
  calciteColorPickerColorChange: EventEmitter;

  private handleColorModeClick = (event: Event): void => {
    this.mode = (event.currentTarget as HTMLElement).getAttribute(
      "data-color-mode"
    ) as ColorMode;
  };

  private handleHexInputChange = (event: Event): void => {
    event.stopPropagation();
    const { activeColor } = this;
    const input = event.target as HTMLCalciteHexInputElement;
    const hex = input.value;

    if (hex !== activeColor.hex()) {
      this.activeColor = Color(hex);
    }
  };

  private handleSavedColorSelect = (event: Event): void => {
    const swatch = event.currentTarget as HTMLCalciteColorSwatchElement;
    this.activeColor = Color(swatch.color);
  };

  private handleColorPartInput = (event: KeyboardEvent): void => {
    const input = event.target as HTMLInputElement;
    const partId = Number(input.getAttribute("data-color-part-id"));

    const limit =
      this.mode === "rgb"
        ? RGB_LIMITS[Object.keys(RGB_LIMITS)[partId]]
        : HSV_LIMITS[Object.keys(HSV_LIMITS)[partId]];

    const clamped = Math.max(0, Math.min(Number(input.value), limit));
    input.value = `${clamped}`;
  };

  private handleColorPartChange = (event: KeyboardEvent): void => {
    const input = event.target as HTMLInputElement;
    const partId = Number(input.getAttribute("data-color-part-id"));
    this[`colorPart${partId}`] = Number(input.value);
    this.updateColorFromParts();
  };

  private handleColorModeKeyDown = (event: KeyboardEvent): void => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      this.handleColorModeClick(event);
    }
  };

  private handleSaveColorKeyDown = (event: KeyboardEvent): void => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      this.saveColor();
    }
  };

  private handleDeleteColorKeyDown = (event: KeyboardEvent): void => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      this.deleteColor();
    }
  };

  private handleSavedColorKeyDown = (event: KeyboardEvent): void => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      this.handleSavedColorSelect(event);
    }
  };

  private handleColorFieldAndSliderMouseLeave = (): void => {
    this.colorFieldAndSliderInteractive = false;
  };

  private handleColorFieldAndSliderMouseEnterOrMove = ({
    offsetY,
  }: MouseEvent): void => {
    const {
      dimensions: {
        colorField: { height: colorFieldHeight },
        slider: { height: sliderHeight },
      },
    } = this;

    this.colorFieldAndSliderInteractive =
      offsetY <= colorFieldHeight + sliderHeight;
  };

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  /** Sets focus on the component. */
  @Method()
  async setFocus(): Promise<void> {
    return this.hexInputNode?.setFocus();
  }

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  componentWillLoad(): void {
    const storageKey = `${DEFAULT_STORAGE_KEY_PREFIX}${this.storageId}`;

    if (this.storageId && localStorage.getItem(storageKey)) {
      this.savedColors = JSON.parse(localStorage.getItem(storageKey));
    }

    const valueAttr = this.el.getAttribute("value");
    if (valueAttr) {
      this.handleColorChange(valueAttr);
    }

    this.updateDimensions(this.scale);
  }

  render(): VNode {
    const { mode, activeColor, savedColors, scale, theme } = this;
    const parts = this.getColorComponents();
    const partLabels =
      this.mode === "rgb"
        ? [this.intlR, this.intlG, this.intlB]
        : [this.intlH, this.intlS, this.intlV];
    const selectedColorInHex = activeColor.hex();
    const hexInputScale = scale !== "s" ? "m" : scale;
    const { colorFieldAndSliderInteractive } = this;

    return (
      <Host>
        <canvas
          class={{
            [CSS.colorFieldAndSlider]: true,
            [CSS.colorFieldAndSliderInteractive]: colorFieldAndSliderInteractive,
          }}
          onMouseEnter={this.handleColorFieldAndSliderMouseEnterOrMove}
          onMouseLeave={this.handleColorFieldAndSliderMouseLeave}
          onMouseMove={this.handleColorFieldAndSliderMouseEnterOrMove}
          ref={this.initColorFieldAndSlider}
        />
        <div class={{ [CSS.controlSection]: true, [CSS.section]: true }}>
          <div class={CSS.colorHexOptions}>
            <span
              class={{
                [CSS.header]: true,
                [CSS.headerHex]: true,
                [CSS.underlinedHeader]: true,
              }}
            >
              {this.intlHex}
            </span>
            <calcite-hex-input
              class={CSS.control}
              onCalciteHexInputChange={this.handleHexInputChange}
              ref={(node) => (this.hexInputNode = node)}
              scale={hexInputScale}
              value={selectedColorInHex}
              theme={theme}
            />
          </div>
          <div
            class={{
              [CSS.colorModeContainer]: true,
              [CSS.splitSection]: true,
            }}
          >
            <div
              class={{
                [CSS.colorModeSelection]: true,
                [CSS.header]: true,
                [CSS.underlinedHeader]: true,
              }}
            >
              <div
                class={{
                  [CSS.colorMode]: true,
                  [CSS.colorModeSelected]: mode === "rgb",
                }}
                data-color-mode="rgb"
                onClick={this.handleColorModeClick}
                onKeyDown={this.handleColorModeKeyDown}
                tabIndex={0}
              >
                {this.intlRgb}
              </div>
              <div
                class={{
                  [CSS.colorMode]: true,
                  [CSS.colorModeSelected]: mode === "hsv",
                }}
                data-color-mode="hsv"
                onClick={this.handleColorModeClick}
                onKeyDown={this.handleColorModeKeyDown}
                tabIndex={0}
              >
                {this.intlHsv}
              </div>
            </div>
            <div class={{ [CSS.colorModeParts]: true, [CSS.control]: true }}>
              <div class={CSS.colorModePart}>
                <span class={CSS.colorModePartLabel}>{partLabels[0]}</span>
                <input
                  class={CSS.colorModePartInput}
                  data-color-part-id={0}
                  onInput={this.handleColorPartInput}
                  onChange={this.handleColorPartChange}
                  type="number"
                  value={parts[0]}
                />
              </div>
              <div class={CSS.colorModePart}>
                <span class={CSS.colorModePartLabel}>{partLabels[1]}</span>
                <input
                  class={CSS.colorModePartInput}
                  data-color-part-id={1}
                  onInput={this.handleColorPartInput}
                  onChange={this.handleColorPartChange}
                  type="number"
                  value={parts[1]}
                />
              </div>
              <div class={CSS.colorModePart}>
                <span class={CSS.colorModePartLabel}>{partLabels[2]}</span>
                <input
                  class={CSS.colorModePartInput}
                  data-color-part-id={2}
                  onInput={this.handleColorPartInput}
                  onChange={this.handleColorPartChange}
                  type="number"
                  value={parts[2]}
                />
              </div>
            </div>
          </div>
        </div>
        <div class={{ [CSS.savedColorsSection]: true, [CSS.section]: true }}>
          <div class={CSS.header}>
            <label>{this.intlSavedColors}</label>
            <div class={CSS.savedColorsButtons}>
              <div
                class={CSS.addColor}
                onClick={this.deleteColor}
                onKeyDown={this.handleDeleteColorKeyDown}
                tabIndex={0}
              >
                <calcite-icon icon="minus" />
              </div>
              <div
                class={CSS.removeColor}
                onClick={this.saveColor}
                onKeyDown={this.handleSaveColorKeyDown}
                tabIndex={0}
              >
                <calcite-icon icon="plus" />
              </div>
            </div>
          </div>
          <div class={CSS.savedColors}>
            {[
              ...savedColors.map((color) => (
                <calcite-color-swatch
                  color={color}
                  active={selectedColorInHex === color}
                  key={color}
                  onClick={this.handleSavedColorSelect}
                  onKeyDown={this.handleSavedColorKeyDown}
                  scale={scale}
                  tabIndex={0}
                  theme={theme}
                />
              )),
            ]}
          </div>
        </div>
      </Host>
    );
  }

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private getSliderCapSpacing(): number {
    const {
      dimensions: {
        slider: { height },
        thumb: { radius },
      },
    } = this;

    return radius * 2 - height;
  }

  private updateDimensions(scale: Exclude<Scale, "xs" | "xl"> = "m"): void {
    this.dimensions = DIMENSIONS[scale];
  }

  private deleteColor = (): void => {
    const colorToDelete = this.activeColor.hex();
    const inStorage = this.savedColors.indexOf(colorToDelete) > -1;

    if (!inStorage) {
      return;
    }

    const savedColors = this.savedColors.filter(
      (color) => color !== colorToDelete
    );

    this.savedColors = savedColors;

    const storageKey = `${DEFAULT_STORAGE_KEY_PREFIX}${this.storageId}`;

    if (this.storageId) {
      localStorage.setItem(storageKey, JSON.stringify(savedColors));
    }
  };

  private saveColor = (): void => {
    const colorToSave = this.activeColor.hex();
    const alreadySaved = this.savedColors.indexOf(colorToSave) > -1;

    if (alreadySaved) {
      return;
    }

    const savedColors = [...this.savedColors, colorToSave];

    this.savedColors = savedColors;

    const storageKey = `${DEFAULT_STORAGE_KEY_PREFIX}${this.storageId}`;

    if (this.storageId) {
      localStorage.setItem(storageKey, JSON.stringify(savedColors));
    }
  };

  private drawCanvasParts(): void {
    this.drawcolorField();
    this.drawHueSlider();
  }

  private drawcolorField(): void {
    const context = this.fieldAndSliderRenderingContext;
    const {
      dimensions: {
        colorField: { height, width },
      },
    } = this;

    context.fillStyle = this.activeColor
      .hsv()
      .saturationv(100)
      .value(100)
      .toString();

    context.fillRect(0, 0, width, height);

    const whiteGradient = context.createLinearGradient(0, 0, width, 0);
    whiteGradient.addColorStop(0, "rgba(255,255,255,1)");
    whiteGradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = whiteGradient;
    context.fillRect(0, 0, width, height);

    const blackGradient = context.createLinearGradient(0, 0, 0, height);
    blackGradient.addColorStop(0, "rgba(0,0,0,0)");
    blackGradient.addColorStop(1, "rgba(0,0,0,1)");
    context.fillStyle = blackGradient;
    context.fillRect(0, 0, width, height);

    this.drawActivecolorFieldColor();
  }

  private setCanvasContextSize(
    canvas: HTMLCanvasElement,
    { height, width }: { height: number; width: number }
  ): void {
    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.height = `${height}px`;
    canvas.style.width = `${width}px`;

    const context = canvas.getContext("2d");
    context.scale(devicePixelRatio, devicePixelRatio);
  }

  private initColorFieldAndSlider = (canvas: HTMLCanvasElement): void => {
    this.fieldAndSliderRenderingContext = canvas.getContext("2d");
    this.setCanvasContextSize(canvas, {
      width: this.dimensions.colorField.width,
      height:
        this.dimensions.colorField.height +
        this.dimensions.slider.height +
        this.getSliderCapSpacing() * 2,
    });

    this.drawCanvasParts();

    const yWithin = (y: number): "color-field" | "slider" | "none" => {
      const {
        dimensions: {
          colorField: { height: colorFieldHeight },
          slider: { height: sliderHeight },
        },
      } = this;

      if (y <= colorFieldHeight) {
        return "color-field";
      }

      if (y <= colorFieldHeight + sliderHeight) {
        return "slider";
      }

      return "none";
    };

    const captureColor = (x: number, y: number): void => {
      const {
        dimensions: {
          colorField: { height, width },
        },
      } = this;
      const saturation = (HSV_LIMITS.s / width) * x;
      const value = (HSV_LIMITS.v / height) * (height - y);

      this.activeColor = this.activeColor
        .hsv()
        .saturationv(saturation)
        .value(value);
    };

    canvas.addEventListener("mousedown", ({ offsetX, offsetY }) => {
      const region = yWithin(offsetY);

      if (region === "color-field") {
        this.hueThumbState = "drag";
        captureColor(offsetX, offsetY);
      } else if (region === "slider") {
        this.sliderThumbState = "drag";
        captureSliderColor(offsetX);
      }
    });

    canvas.addEventListener("mouseout", () => {
      this.hueThumbState = "idle";
      this.sliderThumbState = "idle";

      this.drawCanvasParts();
    });

    canvas.addEventListener("mouseup", () => {
      this.hueThumbState = "hover";
      this.sliderThumbState = "hover";

      this.drawCanvasParts();
    });

    canvas.addEventListener("mousemove", ({ offsetX, offsetY }) => {
      const region = yWithin(offsetY);

      if (region === "color-field") {
        const prevHueThumbState = this.hueThumbState;
        const color = this.activeColor.hsv();

        const {
          dimensions: {
            colorField: { height, width },
            thumb: { radius },
          },
        } = this;
        const centerX = color.saturationv() / (HSV_LIMITS.s / width);
        const centerY = height - color.value() / (HSV_LIMITS.v / height);

        const hoveringThumb = this.containsPoint(
          offsetX,
          offsetY,
          centerX,
          centerY,
          radius
        );

        let transitionedBetweenHoverAndIdle = false;

        if (prevHueThumbState === "idle" && hoveringThumb) {
          this.hueThumbState = "hover";
          transitionedBetweenHoverAndIdle = true;
        } else if (prevHueThumbState === "hover" && !hoveringThumb) {
          this.hueThumbState = "idle";
          transitionedBetweenHoverAndIdle = true;
        }

        if (this.hueThumbState !== "drag") {
          if (transitionedBetweenHoverAndIdle) {
            // refresh since we won't update color and thus no redraw
            this.drawCanvasParts();
          }

          return;
        }

        captureColor(offsetX, offsetY);
      } else if (region === "slider") {
        const {
          dimensions: {
            slider: { height: sliderHeight, width: sliderWidth },
            thumb: { radius: thumbRadius },
          },
        } = this;

        const prevSliderThumbState = this.sliderThumbState;
        const sliderThumbColor = this.activeColor
          .hsv()
          .saturationv(100)
          .value(100);
        const sliderThumbCenterX = sliderThumbColor.hue() / (360 / sliderWidth);
        const sliderThumbCenterY =
          (sliderHeight + this.getSliderCapSpacing()) / 2;

        const hoveringSliderThumb = this.containsPoint(
          offsetX,
          offsetY,
          sliderThumbCenterX,
          sliderThumbCenterY,
          thumbRadius
        );

        let sliderThumbTransitionedBetweenHoverAndIdle = false;

        if (prevSliderThumbState === "idle" && hoveringSliderThumb) {
          this.sliderThumbState = "hover";
          sliderThumbTransitionedBetweenHoverAndIdle = true;
        } else if (prevSliderThumbState === "hover" && !hoveringSliderThumb) {
          this.sliderThumbState = "idle";
          sliderThumbTransitionedBetweenHoverAndIdle = true;
        }

        if (this.sliderThumbState !== "drag") {
          if (sliderThumbTransitionedBetweenHoverAndIdle) {
            // refresh since we won't update color and thus no redraw
            this.drawHueSlider();
          }

          return;
        }

        captureSliderColor(offsetX);
      }
    });

    const captureSliderColor = (x: number): void => {
      const {
        dimensions: {
          slider: { width },
        },
      } = this;
      const hue = (360 / width) * x;
      this.activeColor = this.activeColor.hue(hue);
    };
  };

  private containsPoint(
    testPointX: number,
    testPointY: number,
    boundsX: number,
    boundsY: number,
    boundsRadius: number
  ): boolean {
    return (
      Math.pow(testPointX - boundsX, 2) + Math.pow(testPointY - boundsY, 2) <=
      Math.pow(boundsRadius, 2)
    );
  }

  private drawActivecolorFieldColor(): void {
    const color = this.activeColor.hsv();

    const {
      dimensions: {
        colorField: { height, width },
        thumb: { radius },
      },
    } = this;

    const x = color.saturationv() / (HSV_LIMITS.s / width);
    const y = height - color.value() / (HSV_LIMITS.v / height);

    this.drawThumb(
      this.fieldAndSliderRenderingContext,
      radius,
      x,
      y,
      color,
      this.hueThumbState
    );
  }

  private drawThumb(
    context: CanvasRenderingContext2D,
    radius: number,
    x: number,
    y: number,
    color: Color,
    state: "idle" | "hover" | "drag"
  ): void {
    const startAngle = 0;
    const endAngle = 2 * Math.PI;

    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle);
    context.shadowBlur = state === "hover" ? 32 : 16;
    context.shadowColor = `rgba(0, 0, 0, ${state === "drag" ? 0.32 : 0.16})`;
    context.fillStyle = "#fff";
    context.fill();

    context.beginPath();
    context.arc(x, y, radius - 3, startAngle, endAngle);
    context.shadowBlur = 0;
    context.shadowColor = "transparent";
    context.fillStyle = color.rgb().toString();
    context.fill();
  }

  private drawActiveHueSliderColor(): void {
    const color = this.activeColor.hsv().saturationv(100).value(100);

    const {
      dimensions: {
        colorField: { height: colorFieldHeight },
        slider: { height, width },
        thumb: { radius },
      },
    } = this;

    const x = color.hue() / (360 / width);
    const y = height / 2 + colorFieldHeight;

    this.drawThumb(
      this.fieldAndSliderRenderingContext,
      radius,
      x,
      y,
      color,
      this.sliderThumbState
    );
  }

  private drawHueSlider(): void {
    const context = this.fieldAndSliderRenderingContext;
    const {
      dimensions: {
        colorField: { height: colorFieldHeight },
        slider: { height, width },
      },
    } = this;

    const gradient = context.createLinearGradient(0, 0, width, 0);

    const hueSliderColorStopKeywords = [
      "red",
      "yellow",
      "lime",
      "cyan",
      "blue",
      "magenta",
      "red",
    ];

    const offset = 1 / (hueSliderColorStopKeywords.length - 1);
    let currentOffset = 0;

    hueSliderColorStopKeywords.forEach((keyword) => {
      gradient.addColorStop(currentOffset, Color(keyword).toString());
      currentOffset += offset;
    });

    context.fillStyle = gradient;
    context.clearRect(
      0,
      colorFieldHeight,
      width,
      height + this.getSliderCapSpacing() * 2
    );
    context.fillRect(0, colorFieldHeight, width, height);

    this.drawActiveHueSliderColor();
  }

  private updateColorFromParts(): void {
    this.activeColor = Color(
      [this.colorPart0, this.colorPart1, this.colorPart2],
      this.mode
    );
  }

  private getColorComponents(): [number, number, number] {
    const { activeColor, mode } = this;
    return activeColor[mode]()
      .array()
      .map((value) => Math.floor(value)) as [number, number, number];
  }
}
