import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Listen,
  Method,
  Prop,
  State,
  VNode,
  Watch
} from "@stencil/core";

import Color from "color";
import { ColorAppearance, ColorMode, ColorValue, InternalColor } from "./interfaces";
import { Scale } from "../interfaces";
import {
  CSS,
  DEFAULT_COLOR,
  DEFAULT_STORAGE_KEY_PREFIX,
  DIMENSIONS,
  HSV_LIMITS,
  RGB_LIMITS,
  TEXT
} from "./resources";
import { focusElement, getElementDir } from "../../utils/dom";
import { colorEqual, CSSColorMode, Format, normalizeHex, parseMode, SupportedMode } from "./utils";
import { throttle } from "lodash-es";
import { getKey } from "../../utils/key";
import { clamp } from "../../utils/math";
import { CSS_UTILITY } from "../../utils/resources";

const throttleFor60FpsInMs = 16;
const defaultValue = normalizeHex(DEFAULT_COLOR.hex());
const defaultFormat = "auto";

@Component({
  tag: "calcite-color-picker",
  styleUrl: "calcite-color-picker.scss",
  shadow: true
})
export class CalciteColorPicker {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element() el: HTMLCalciteColorPickerElement;

  //--------------------------------------------------------------------------
  //
  //  Public properties
  //
  //--------------------------------------------------------------------------

  /**
   * When false, empty color (null) will be allowed as a value. Otherwise, a color value is always enforced by the component.
   *
   * When true, clearing the input and blurring will restore the last valid color set. When false, it will set it to empty.
   */
  @Prop() allowEmpty = false;

  /** specify the appearance - default (containing border), or minimal (no containing border) */
  @Prop({ reflect: true }) appearance: ColorAppearance = "default";

  /**
   * Internal prop for advanced use-cases.
   *
   * @internal
   */
  @Prop({ mutable: true }) color: InternalColor | null = DEFAULT_COLOR;

  @Watch("color")
  handleColorChange(color: Color | null, oldColor: Color | null): void {
    this.drawColorFieldAndSlider();
    this.updateChannelsFromColor(color);

    this.previousColor = oldColor;

    if (this.colorUpdateLocked) {
      return;
    }

    this.value = this.toValue(color);
  }

  /**
   * The format of the value property.
   *
   * When "auto", the format will be inferred from `value` when set.
   * @default "auto"
   */
  @Prop() format: Format = defaultFormat;

  @Watch("format")
  handleFormatChange(format: CalciteColorPicker["format"]): void {
    this.mode = format === "auto" ? this.mode : format;
    this.value = this.toValue(this.color);
  }

  /** When true, hides the hex input */
  @Prop() hideHex = false;

  /** When true, hides the RGB/HSV channel inputs */
  @Prop() hideChannels = false;

  /** When true, hides the saved colors section */
  @Prop() hideSaved = false;

  /** Label used for the blue channel
   * @default "B"
   */
  @Prop() intlB = TEXT.b;

  /** Label used for the blue channel description
   * @default "Blue"
   */
  @Prop() intlBlue = TEXT.blue;

  /** Label used for the delete color button.
   * @default "Delete color"
   */
  @Prop() intlDeleteColor = TEXT.deleteColor;

  /** Label used for the green channel
   * @default "G"
   */
  @Prop() intlG = TEXT.g;

  /** Label used for the green channel description
   * @default "Green"
   */
  @Prop() intlGreen = TEXT.green;

  /** Label used for the hue channel
   * @default "H"
   */
  @Prop() intlH = TEXT.h;

  /** Label used for the HSV mode
   * @default "HSV"
   */
  @Prop() intlHsv = TEXT.hsv;

  /** Label used for the hex input
   * @default "Hex"
   */
  @Prop() intlHex = TEXT.hex;

  /** Label used for the hue channel description
   * @default "Hue"
   */
  @Prop() intlHue = TEXT.hue;

  /**
   * Label used for the hex input when there is no color selected.
   * @default "No color"
   */
  @Prop() intlNoColor = TEXT.noColor;

  /** Label used for the red channel
   * @default "R"
   */
  @Prop() intlR = TEXT.r;

  /** Label used for the red channel description
   * @default "Red"
   */
  @Prop() intlRed = TEXT.red;

  /** Label used for the RGB mode
   * @default "RGB"
   */
  @Prop() intlRgb = TEXT.rgb;

  /** Label used for the saturation channel
   * @default "S"
   */
  @Prop() intlS = TEXT.s;

  /** Label used for the saturation channel description
   * @default "Saturation"
   */
  @Prop() intlSaturation = TEXT.saturation;

  /** Label used for the save color button.
   * @default "Save color"
   */
  @Prop() intlSaveColor = TEXT.saveColor;

  /** Label used for the saved colors section
   * @default "Saved"
   */
  @Prop() intlSaved = TEXT.saved;

  /** Label used for the value channel
   * @default "V"
   */
  @Prop() intlV = TEXT.v;

  /** Label used for the
   * @default "Value"
   */
  @Prop() intlValue = TEXT.value;

  /**
   * The scale of the color picker.
   */
  @Prop({ reflect: true }) scale: Scale = "m";

  @Watch("scale")
  handleScaleChange(scale: Scale = "m"): void {
    this.updateDimensions(scale);
  }

  /**
   * Storage ID for colors.
   */
  @Prop() storageId: string;

  /**
   * The color value.
   *
   * This value can be either a {@link https://developer.mozilla.org/en-US/docs/Web/CSS/color|CSS string}
   * a RGB, HSL or HSV object.
   *
   * The type will be preserved as the color is updated.
   * @default "#007ac2"
   * @see [ColorValue](https://github.com/Esri/calcite-components/blob/master/src/components/calcite-color-picker/interfaces.ts#L10)
   */
  @Prop({ mutable: true }) value: ColorValue | null = defaultValue;

  @Watch("value")
  handleValueChange(value: ColorValue | null, oldValue: ColorValue | null): void {
    const { allowEmpty, format } = this;
    const checkMode = !allowEmpty || value;
    let modeChanged = false;

    if (checkMode) {
      const nextMode = parseMode(value);

      if (!nextMode || (format !== "auto" && nextMode !== format)) {
        console.warn(`ignoring invalid color value: ${value}`);
        this.value = oldValue;
        return;
      }

      modeChanged = this.mode !== nextMode;
      this.mode = nextMode;
    }

    if (this.colorUpdateLocked) {
      this.calciteColorPickerChange.emit();
      return;
    }

    const color = allowEmpty && !value ? null : Color(value);
    const colorChanged = !colorEqual(color, this.color);

    if (modeChanged || colorChanged) {
      this.color = color;
      this.calciteColorPickerChange.emit();
    }
  }
  //--------------------------------------------------------------------------
  //
  //  Internal State/Props
  //
  //--------------------------------------------------------------------------

  private get baseColorFieldColor(): Color {
    return this.color || this.previousColor || DEFAULT_COLOR;
  }

  private activeThumbX: number;

  private activeThumbY: number;

  private colorUpdateLocked = false;

  private fieldAndSliderRenderingContext: CanvasRenderingContext2D;

  private globalThumbX: number;

  private globalThumbY: number;

  private colorFieldScopeNode: HTMLDivElement;

  private hueThumbState: "idle" | "hover" | "drag" = "idle";

  private previousColor: InternalColor | null;

  private mode: SupportedMode = CSSColorMode.HEX;

  private shiftKeyChannelAdjustment = 0;

  private sliderThumbState: "idle" | "hover" | "drag" = "idle";

  @State() colorFieldAndSliderInteractive = false;

  @State() channelMode: ColorMode = "rgb";

  @State() channels: [number, number, number] = this.toChannels(DEFAULT_COLOR);

  @State() dimensions = DIMENSIONS.m;

  @State() savedColors: string[] = [];

  @State() colorFieldScopeTop: number;

  @State() colorFieldScopeLeft: number;

  @State() scopeOrientation: "vertical" | "horizontal";

  @State() hueScopeLeft: number;

  @State() hueScopeTop: number;

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------

  /**
   * Fires when the color value has changed.
   */
  @Event() calciteColorPickerChange: EventEmitter;

  private handleTabActivate = (event: Event): void => {
    this.channelMode = (event.currentTarget as HTMLElement).getAttribute(
      "data-color-mode"
    ) as ColorMode;

    this.updateChannelsFromColor(this.color);
  };

  private handleColorFieldScopeKeyDown = (event: KeyboardEvent): void => {
    const key = getKey(event.key);
    const arrowKeyToXYOffset = {
      ArrowUp: { x: 0, y: -10 },
      ArrowRight: { x: 10, y: 0 },
      ArrowDown: { x: 0, y: 10 },
      ArrowLeft: { x: -10, y: 0 }
    };

    if (Object.keys(arrowKeyToXYOffset).includes(key)) {
      event.preventDefault();
      this.scopeOrientation = key === "ArrowDown" || key === "ArrowUp" ? "vertical" : "horizontal";
      this.captureColorFieldColor(
        this.colorFieldScopeLeft + arrowKeyToXYOffset[key].x || 0,
        this.colorFieldScopeTop + arrowKeyToXYOffset[key].y || 0,
        false
      );
      return;
    }
  };

  private handleHueScopeKeyDown = (event: KeyboardEvent): void => {
    const modifier = event.shiftKey ? 10 : 1;
    const key = getKey(event.key);
    const arrowKeyToXOffset = {
      ArrowUp: 1,
      ArrowRight: 1,
      ArrowDown: -1,
      ArrowLeft: -1
    };

    if (Object.keys(arrowKeyToXOffset).includes(key)) {
      event.preventDefault();
      const delta = arrowKeyToXOffset[key] * modifier;
      const hue = this.baseColorFieldColor?.hue();
      const color = hue ? this.baseColorFieldColor.hue(hue + delta) : Color({ h: 0, s: 0, v: 100 });
      this.internalColorSet(color, false);
      return;
    }
  };

  private handleHexInputChange = (event: Event): void => {
    event.stopPropagation();
    const { allowEmpty, color } = this;
    const input = event.target as HTMLCalciteColorPickerHexInputElement;
    const hex = input.value;

    if (allowEmpty && !hex) {
      this.internalColorSet(null);
      return;
    }

    const normalizedHex = color && normalizeHex(color.hex());

    if (hex !== normalizedHex) {
      this.internalColorSet(Color(hex));
    }
  };

  private handleSavedColorSelect = (event: Event): void => {
    const swatch = event.currentTarget as HTMLCalciteColorPickerSwatchElement;
    this.internalColorSet(Color(swatch.color));
  };

  private handleChannelInput = (event: CustomEvent): void => {
    const input = event.currentTarget as HTMLCalciteInputElement;
    const internalInput = event.detail.nativeEvent.target as HTMLInputElement;
    const channelIndex = Number(input.getAttribute("data-channel-index"));

    const limit =
      this.channelMode === "rgb"
        ? RGB_LIMITS[Object.keys(RGB_LIMITS)[channelIndex]]
        : HSV_LIMITS[Object.keys(HSV_LIMITS)[channelIndex]];

    let inputValue: string;

    if (this.allowEmpty && !input.value) {
      inputValue = "";
    } else {
      const value = Number(input.value) + this.shiftKeyChannelAdjustment;
      const clamped = clamp(value, 0, limit);

      inputValue = clamped.toString();
    }

    input.value = inputValue;
    internalInput.value = inputValue;
  };

  // using @Listen as a workaround for VDOM listener not firing
  @Listen("keydown", { capture: true })
  @Listen("keyup", { capture: true })
  protected handleChannelKeyUpOrDown(event: KeyboardEvent): void {
    this.shiftKeyChannelAdjustment = 0;
    const key = getKey(event.key);

    if (
      (key !== "ArrowUp" && key !== "ArrowDown") ||
      !event.composedPath().some((node: HTMLElement) => node.classList?.contains(CSS.channel))
    ) {
      return;
    }

    const { shiftKey } = event;
    event.preventDefault();

    if (!this.color) {
      this.internalColorSet(this.previousColor);
      event.stopPropagation();
      return;
    }

    // this gets applied to the input's up/down arrow increment/decrement
    const complementaryBump = 9;

    this.shiftKeyChannelAdjustment =
      key === "ArrowUp" && shiftKey
        ? complementaryBump
        : key === "ArrowDown" && shiftKey
        ? -complementaryBump
        : 0;
  }

  private handleChannelChange = (event: CustomEvent): void => {
    const input = event.currentTarget as HTMLCalciteInputElement;
    const channelIndex = Number(input.getAttribute("data-channel-index"));
    const channels = [...this.channels] as this["channels"];

    const shouldClearChannels = this.allowEmpty && !input.value;

    if (shouldClearChannels) {
      this.channels = [null, null, null];
      this.internalColorSet(null);
      return;
    }

    channels[channelIndex] = Number(input.value);
    this.updateColorFromChannels(channels);
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

    if (this.sliderThumbState !== "drag" && this.hueThumbState !== "drag") {
      this.hueThumbState = "idle";
      this.sliderThumbState = "idle";
      this.drawColorFieldAndSlider();
    }
  };

  private handleColorFieldAndSliderMouseDown = (event: MouseEvent): void => {
    const { offsetX, offsetY } = event;
    this.activeThumbX = offsetX;
    this.activeThumbY = offsetY;
    this.globalThumbX = offsetX;
    this.globalThumbY = offsetY;
    const region = this.getCanvasRegion(offsetY);

    if (region === "color-field") {
      this.hueThumbState = "drag";
      this.captureColorFieldColor(offsetX, offsetY);
    } else if (region === "slider") {
      this.sliderThumbState = "drag";
      this.captureHueSliderColor(offsetX);
    }

    // prevent text selection outside of color field & slider area
    event.preventDefault();

    document.addEventListener("mousemove", this.globalMouseMoveHandler);
    document.addEventListener("mouseup", this.globalMouseUpHandler, { once: true });
  };

  private globalMouseUpHandler = (): void => {
    this.hueThumbState = "idle";
    this.sliderThumbState = "idle";
    this.drawColorFieldAndSlider();
  };

  private globalMouseMoveHandler = (event: MouseEvent): void => {
    const { el, dimensions } = this;
    const sliderThumbDragging = this.sliderThumbState === "drag";
    const hueThumbDragging = this.hueThumbState === "drag";

    if (!el.isConnected || (!sliderThumbDragging && !hueThumbDragging)) {
      return;
    }

    this.globalThumbX = this.globalThumbX + event.movementX;
    this.globalThumbY = this.globalThumbY + event.movementY;

    this.activeThumbX = clamp(this.globalThumbX, 0, dimensions.colorField.width);
    this.activeThumbY = clamp(
      this.globalThumbY,
      0,
      dimensions.colorField.height + dimensions.slider.height
    );

    const region: ReturnType<CalciteColorPicker["getCanvasRegion"]> = hueThumbDragging
      ? "color-field"
      : sliderThumbDragging
      ? "slider"
      : this.getCanvasRegion(this.activeThumbY);

    if (region === "color-field") {
      this.captureColorFieldColor(this.activeThumbX, this.activeThumbY, false);
    } else if (region === "slider") {
      this.captureHueSliderColor(this.activeThumbX);
    }
  };

  private handleColorFieldAndSliderMouseEnterOrMove = ({ offsetX, offsetY }: MouseEvent): void => {
    const {
      dimensions: { colorField, slider, thumb }
    } = this;

    this.colorFieldAndSliderInteractive = offsetY <= colorField.height + slider.height;

    const region = this.getCanvasRegion(offsetY);

    if (region === "color-field") {
      const prevHueThumbState = this.hueThumbState;
      const color = this.baseColorFieldColor.hsv();

      const centerX = Math.round(color.saturationv() / (HSV_LIMITS.s / colorField.width));
      const centerY = Math.round(
        colorField.height - color.value() / (HSV_LIMITS.v / colorField.height)
      );

      const hoveringThumb = this.containsPoint(offsetX, offsetY, centerX, centerY, thumb.radius);

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
          this.drawColorFieldAndSlider();
        }
      }
    } else if (region === "slider") {
      const sliderThumbColor = this.baseColorFieldColor.hsv().saturationv(100).value(100);

      const prevSliderThumbState = this.sliderThumbState;
      const sliderThumbCenterX = Math.round(sliderThumbColor.hue() / (360 / slider.width));
      const sliderThumbCenterY =
        Math.round((slider.height + this.getSliderCapSpacing()) / 2) + colorField.height;

      const hoveringSliderThumb = this.containsPoint(
        offsetX,
        offsetY,
        sliderThumbCenterX,
        sliderThumbCenterY,
        thumb.radius
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
          this.drawColorFieldAndSlider();
        }
      }
    }
  };

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  /** Sets focus on the component. */
  @Method()
  async setFocus(): Promise<void> {
    return focusElement(this.colorFieldScopeNode);
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
  }

  connectedCallback(): void {
    const { color, format, value } = this;

    const initialValueDefault = format !== "auto" ? this.toValue(color, format) : defaultValue;
    const initialValue = format !== "auto" && value === defaultValue ? initialValueDefault : value;

    this.handleValueChange(initialValue, initialValueDefault);

    this.updateDimensions(this.scale);
  }

  disconnectedCallback(): void {
    document.removeEventListener("mousemove", this.globalMouseMoveHandler);
    document.removeEventListener("mouseup", this.globalMouseUpHandler);
  }

  //--------------------------------------------------------------------------
  //
  //  Render Methods
  //
  //--------------------------------------------------------------------------

  render(): VNode {
    const {
      allowEmpty,
      color,
      intlDeleteColor,
      el,
      hideHex,
      hideChannels,
      hideSaved,
      intlHex,
      intlSaved,
      intlSaveColor,
      savedColors,
      scale
    } = this;
    const selectedColorInHex = color ? color.hex() : null;
    const hexInputScale = scale !== "s" ? "m" : scale;
    const {
      colorFieldAndSliderInteractive,
      colorFieldScopeTop,
      colorFieldScopeLeft,
      hueScopeLeft,
      hueScopeTop,
      scopeOrientation,
      dimensions: {
        colorField: { height: colorFieldHeight, width: colorFieldWidth },
        slider: { height: sliderHeight }
      }
    } = this;
    const hueTop = hueScopeTop ?? sliderHeight / 2 + colorFieldHeight;
    const hueLeft = hueScopeLeft ?? (colorFieldWidth * DEFAULT_COLOR.hue()) / HSV_LIMITS.h;
    const elementDir = getElementDir(el);
    const noColor = color === null;
    const vertical = scopeOrientation === "vertical";
    return (
      <div class={CSS.container}>
        <div class={CSS.colorFieldAndSliderWrap}>
          <canvas
            class={{
              [CSS.colorFieldAndSlider]: true,
              [CSS.colorFieldAndSliderInteractive]: colorFieldAndSliderInteractive
            }}
            onMouseDown={this.handleColorFieldAndSliderMouseDown}
            onMouseEnter={this.handleColorFieldAndSliderMouseEnterOrMove}
            onMouseLeave={this.handleColorFieldAndSliderMouseLeave}
            onMouseMove={this.handleColorFieldAndSliderMouseEnterOrMove}
            ref={this.initColorFieldAndSlider}
          />
          <div
            aria-label={vertical ? this.intlValue : this.intlSaturation}
            aria-valuemax={vertical ? HSV_LIMITS.v : HSV_LIMITS.s}
            aria-valuemin="0"
            aria-valuenow={(vertical ? color?.saturationv() : color?.value()) || "0"}
            class={{ [CSS.scope]: true, [CSS.colorFieldScope]: true }}
            onKeyDown={this.handleColorFieldScopeKeyDown}
            ref={this.storeColorFieldScope}
            role="slider"
            style={{ top: `${colorFieldScopeTop || 0}px`, left: `${colorFieldScopeLeft || 0}px` }}
            tabindex="0"
          />
          <div
            aria-label={this.intlHue}
            aria-valuemax={HSV_LIMITS.h}
            aria-valuemin="0"
            aria-valuenow={color?.round().hue() || DEFAULT_COLOR.round().hue()}
            class={{ [CSS.scope]: true, [CSS.hueScope]: true }}
            onKeyDown={this.handleHueScopeKeyDown}
            role="slider"
            style={{ top: `${hueTop}px`, left: `${hueLeft}px` }}
            tabindex="0"
          />
        </div>
        {hideHex && hideChannels ? null : (
          <div
            class={{
              [CSS.controlSection]: true,
              [CSS.section]: true,
              [CSS_UTILITY.rtl]: elementDir === "rtl"
            }}
          >
            {hideHex ? null : (
              <div class={CSS.hexOptions}>
                <span
                  class={{
                    [CSS.header]: true,
                    [CSS.headerHex]: true
                  }}
                >
                  {intlHex}
                </span>
                <calcite-color-picker-hex-input
                  allowEmpty={allowEmpty}
                  class={CSS.control}
                  dir={elementDir}
                  onCalciteColorPickerHexInputChange={this.handleHexInputChange}
                  scale={hexInputScale}
                  value={selectedColorInHex}
                />
              </div>
            )}
            {hideChannels ? null : (
              <calcite-tabs
                class={{
                  [CSS.colorModeContainer]: true,
                  [CSS.splitSection]: true
                }}
                dir={elementDir}
                scale="s"
              >
                <calcite-tab-nav slot="tab-nav">
                  {this.renderChannelsTabTitle("rgb")}
                  {this.renderChannelsTabTitle("hsv")}
                </calcite-tab-nav>
                {this.renderChannelsTab("rgb")}
                {this.renderChannelsTab("hsv")}
              </calcite-tabs>
            )}
          </div>
        )}
        {hideSaved ? null : (
          <div class={{ [CSS.savedColorsSection]: true, [CSS.section]: true }}>
            <div class={CSS.header}>
              <label>{intlSaved}</label>
              <div class={CSS.savedColorsButtons}>
                <calcite-button
                  appearance="transparent"
                  class={CSS.deleteColor}
                  color="neutral"
                  disabled={noColor}
                  iconStart="minus"
                  label={intlDeleteColor}
                  onClick={this.deleteColor}
                  scale={scale === "l" ? "m" : "s"} // TO-DO: s/m color-pickers in Figma show 16px button size (non-existent), l shows 24px size. Will this work for now (s: 24, m: 24, l: 32)?
                />
                <calcite-button
                  appearance="transparent"
                  class={CSS.saveColor}
                  color="neutral"
                  disabled={noColor}
                  iconStart="plus"
                  label={intlSaveColor}
                  onClick={this.saveColor}
                  scale={scale === "l" ? "m" : "s"} // TO-DO: s/m color-pickers in Figma show 16px button size (non-existent), l shows 24px size. Will this work for now (s: 24, m: 24, l: 32)?
                />
              </div>
            </div>
            {savedColors.length > 0 ? (
              <div class={CSS.savedColors}>
                {[
                  ...savedColors.map((color) => (
                    <calcite-color-picker-swatch
                      active={selectedColorInHex === color}
                      class={CSS.savedColor}
                      color={color}
                      key={color}
                      onClick={this.handleSavedColorSelect}
                      onKeyDown={this.handleSavedColorKeyDown}
                      scale={scale}
                      tabIndex={0}
                    />
                  ))
                ]}
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  private storeColorFieldScope = (node: HTMLDivElement): void => {
    this.colorFieldScopeNode = node;
  };

  private renderChannelsTabTitle = (channelMode: this["channelMode"]): VNode => {
    const { channelMode: activeChannelMode, intlRgb, intlHsv } = this;
    const active = channelMode === activeChannelMode;
    const label = channelMode === "rgb" ? intlRgb : intlHsv;

    return (
      <calcite-tab-title
        active={active}
        class={CSS.colorMode}
        data-color-mode={channelMode}
        key={channelMode}
        onCalciteTabsActivate={this.handleTabActivate}
      >
        {label}
      </calcite-tab-title>
    );
  };

  private renderChannelsTab = (channelMode: this["channelMode"]): VNode => {
    const {
      channelMode: activeChannelMode,
      channels,
      intlB,
      intlBlue,
      intlG,
      intlGreen,
      intlH,
      intlHue,
      intlR,
      intlRed,
      intlS,
      intlSaturation,
      intlV,
      intlValue
    } = this;

    const active = channelMode === activeChannelMode;
    const isRgb = channelMode === "rgb";
    const channelLabels = isRgb ? [intlR, intlG, intlB] : [intlH, intlS, intlV];
    const channelAriaLabels = isRgb
      ? [intlRed, intlGreen, intlBlue]
      : [intlHue, intlSaturation, intlValue];

    return (
      <calcite-tab active={active} class={CSS.control} key={channelMode}>
        <div class={CSS.channels}>
          {channels.map((channel, index) =>
            this.renderChannel(channel, index, channelLabels[index], channelAriaLabels[index])
          )}
        </div>
      </calcite-tab>
    );
  };

  private renderChannel = (
    value: number | null,
    index: number,
    label: string,
    ariaLabel: string
  ): VNode => (
    <calcite-input
      class={CSS.channel}
      data-channel-index={index}
      label={ariaLabel}
      numberButtonType="none"
      onCalciteInputChange={this.handleChannelChange}
      onCalciteInputInput={this.handleChannelInput}
      prefixText={label}
      scale="s"
      type="number"
      value={value?.toString()}
    />
  );

  // --------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private captureHueSliderColor(x: number): void {
    const {
      dimensions: {
        slider: { width }
      }
    } = this;
    const hue = (360 / width) * x;

    this.internalColorSet(this.baseColorFieldColor.hue(hue), false);
  }

  private getCanvasRegion(y: number): "color-field" | "slider" | "none" {
    const {
      dimensions: {
        colorField: { height: colorFieldHeight },
        slider: { height: sliderHeight }
      }
    } = this;

    if (y <= colorFieldHeight) {
      return "color-field";
    }

    if (y <= colorFieldHeight + sliderHeight) {
      return "slider";
    }

    return "none";
  }

  private internalColorSet(color: Color | null, skipEqual = true): void {
    if (skipEqual && colorEqual(color, this.color)) {
      return;
    }

    this.colorUpdateLocked = true;
    this.color = color;
    this.value = this.toValue(color);
    this.colorUpdateLocked = false;
  }

  private toValue(color: Color | null, format: SupportedMode = this.mode): ColorValue | null {
    if (!color) {
      return null;
    }

    const hexMode = "hex";

    if (format.includes(hexMode)) {
      return normalizeHex(color.round()[hexMode]());
    }

    if (format.includes("-css")) {
      return color[format.replace("-css", "").replace("a", "")]().round().string();
    }

    const colorObject = color[format]().round().object();

    if (format.endsWith("a")) {
      // normalize alpha prop
      colorObject.a = colorObject.alpha;
      delete colorObject.alpha;
    }

    return colorObject;
  }

  private getSliderCapSpacing(): number {
    const {
      dimensions: {
        slider: { height },
        thumb: { radius }
      }
    } = this;

    return radius * 2 - height;
  }

  private updateDimensions(scale: Scale = "m"): void {
    this.dimensions = DIMENSIONS[scale];
  }

  private deleteColor = (): void => {
    const colorToDelete = this.color.hex();
    const inStorage = this.savedColors.indexOf(colorToDelete) > -1;

    if (!inStorage) {
      return;
    }

    const savedColors = this.savedColors.filter((color) => color !== colorToDelete);

    this.savedColors = savedColors;

    const storageKey = `${DEFAULT_STORAGE_KEY_PREFIX}${this.storageId}`;

    if (this.storageId) {
      localStorage.setItem(storageKey, JSON.stringify(savedColors));
    }
  };

  private saveColor = (): void => {
    const colorToSave = this.color.hex();
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

  private drawColorFieldAndSlider = throttle((): void => {
    if (!this.fieldAndSliderRenderingContext) {
      return;
    }

    this.drawColorField();
    this.drawHueSlider();
  }, throttleFor60FpsInMs);

  private drawColorField(): void {
    const context = this.fieldAndSliderRenderingContext;
    const {
      dimensions: {
        colorField: { height, width }
      }
    } = this;

    context.fillStyle = this.baseColorFieldColor.hsv().saturationv(100).value(100).string();
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

    this.drawActiveColorFieldColor();
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

  private captureColorFieldColor = (x: number, y: number, skipEqual = true): void => {
    const {
      dimensions: {
        colorField: { height, width }
      }
    } = this;
    const saturation = Math.round((HSV_LIMITS.s / width) * x);
    const value = Math.round((HSV_LIMITS.v / height) * (height - y));

    this.internalColorSet(
      this.baseColorFieldColor.hsv().saturationv(saturation).value(value),
      skipEqual
    );
  };

  private initColorFieldAndSlider = (canvas: HTMLCanvasElement): void => {
    this.fieldAndSliderRenderingContext = canvas.getContext("2d");
    this.setCanvasContextSize(canvas, {
      width: this.dimensions.colorField.width,
      height:
        this.dimensions.colorField.height +
        this.dimensions.slider.height +
        this.getSliderCapSpacing() * 2
    });

    this.drawColorFieldAndSlider();
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

  private drawActiveColorFieldColor(): void {
    const { color } = this;

    if (!color) {
      return;
    }

    const hsvColor = color.hsv();

    const {
      dimensions: {
        colorField: { height, width },
        thumb: { radius }
      }
    } = this;

    const x = hsvColor.saturationv() / (HSV_LIMITS.s / width);
    const y = height - hsvColor.value() / (HSV_LIMITS.v / height);

    requestAnimationFrame(() => {
      this.colorFieldScopeLeft = x;
      this.colorFieldScopeTop = y;
    });

    this.drawThumb(this.fieldAndSliderRenderingContext, radius, x, y, hsvColor, this.hueThumbState);
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
    context.fillStyle = color.rgb().string();
    context.fill();
  }

  private drawActiveHueSliderColor(): void {
    const { color } = this;

    if (!color) {
      return;
    }

    const hsvColor = color.hsv().saturationv(100).value(100);

    const {
      dimensions: {
        colorField: { height: colorFieldHeight },
        slider: { height, width },
        thumb: { radius }
      }
    } = this;

    const x = hsvColor.hue() / (360 / width);
    const y = height / 2 + colorFieldHeight;

    requestAnimationFrame(() => {
      this.hueScopeLeft = x;
      this.hueScopeTop = y;
    });

    this.drawThumb(
      this.fieldAndSliderRenderingContext,
      radius,
      x,
      y,
      hsvColor,
      this.sliderThumbState
    );
  }

  private drawHueSlider(): void {
    const context = this.fieldAndSliderRenderingContext;
    const {
      dimensions: {
        colorField: { height: colorFieldHeight },
        slider: { height, width }
      }
    } = this;

    const gradient = context.createLinearGradient(0, 0, width, 0);

    const hueSliderColorStopKeywords = ["red", "yellow", "lime", "cyan", "blue", "magenta", "red"];

    const offset = 1 / (hueSliderColorStopKeywords.length - 1);
    let currentOffset = 0;

    hueSliderColorStopKeywords.forEach((keyword) => {
      gradient.addColorStop(currentOffset, Color(keyword).string());
      currentOffset += offset;
    });

    context.fillStyle = gradient;
    context.clearRect(0, colorFieldHeight, width, height + this.getSliderCapSpacing() * 2);
    context.fillRect(0, colorFieldHeight, width, height);

    this.drawActiveHueSliderColor();
  }

  private updateColorFromChannels(channels: this["channels"]): void {
    this.internalColorSet(Color(channels, this.channelMode));
  }

  private updateChannelsFromColor(color: Color | null): void {
    this.channels = color ? this.toChannels(color) : [null, null, null];
  }

  private toChannels(color: Color): [number, number, number] {
    const { channelMode } = this;

    return color[channelMode]()
      .array()
      .map((value) => Math.floor(value)) as [number, number, number];
  }
}
