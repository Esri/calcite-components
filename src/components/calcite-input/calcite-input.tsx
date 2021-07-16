import { Scale, Status } from "../interfaces";
import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
  Method,
  Prop,
  State,
  VNode,
  Watch
} from "@stencil/core";
import { getElementDir, getElementProp, setRequestedIcon } from "../../utils/dom";
import { getKey } from "../../utils/key";
import { INPUT_TYPE_ICONS, SLOTS } from "./calcite-input.resources";
import { InputPlacement } from "./interfaces";
import { Position } from "../interfaces";
import {
  getDecimalSeparator,
  delocalizeNumberString,
  localizeNumberString
} from "../../utils/locale";
import { numberKeys } from "../../utils/key";
import { hiddenInputStyle } from "../../utils/form";
import { isValidNumber, parseNumberString, sanitizeNumberString } from "../../utils/number";
import { CSS_UTILITY, TEXT } from "../../utils/resources";

type NumberNudgeDirection = "up" | "down";

/**
 * @slot action - A slot for positioning a button next to an input
 */
@Component({
  tag: "calcite-input",
  styleUrl: "calcite-input.scss",
  scoped: true
})
export class CalciteInput {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element() el: HTMLCalciteInputElement;

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  /** specify the alignment of the value of the input */
  @Prop({ reflect: true }) alignment: Position = "start";

  /** should the input autofocus */
  @Prop() autofocus = false;

  /** optionally display a clear button that displays when field has a value
   * shows by default for search, time, date
   * will not display for type="textarea" */
  @Prop({ reflect: true }) clearable?: boolean;

  /** is the input disabled  */
  @Prop({ reflect: true }) disabled?: boolean;

  @Watch("disabled")
  disabledWatcher(): void {
    this.setDisabledAction();
  }

  /** for number values, displays the locale's group separator */
  @Prop() groupSeparator = false;

  /** when used as a boolean set to true, show a default recommended icon for certain
   * input types (tel, password, email, date, time, search). You can also pass a
   * calcite-ui-icon name to this prop to display a requested icon for any input type */
  @Prop({ reflect: true }) icon: string | boolean;

  /**
   * string to override English loading text
   * @default "Loading"
   */
  @Prop() intlLoading?: string = TEXT.loading;

  /** flip the icon in rtl */
  @Prop({ reflect: true }) iconFlipRtl?: boolean;

  /** Applies to the aria-label attribute on the button or hyperlink */
  @Prop() label?: string;

  /** specify if the input is in loading state */
  @Prop({ reflect: true }) loading = false;

  /** BCP 47 language tag for desired language and country format */
  @Prop() locale?: string = document.documentElement.lang || "en";

  /**
   * Toggles locale formatting for numbers.
   * @internal
   */
  @Prop() localeFormat = false;

  /** input max */
  @Prop({ reflect: true }) max?: number;

  /** watcher to update number-to-string for max */
  @Watch("max")
  maxWatcher(): void {
    this.maxString = this.max?.toString() || null;
  }

  /** input min */
  @Prop({ reflect: true }) min?: number;

  /** watcher to update number-to-string for min */
  @Watch("min")
  minWatcher(): void {
    this.minString = this.min?.toString() || null;
  }

  /**
   * Maximum length of text input.
   * @deprecated use maxLength instead
   */
  @Prop({ reflect: true }) maxlength?: number;

  /** Maximum length of the input value */
  @Prop({ reflect: true }) maxLength?: number;

  /** Minimum length of the text input */
  @Prop({ reflect: true }) minLength?: number;

  /** The name of the input */
  @Prop({ reflect: true }) name?: string;

  /** specify the placement of the number buttons */
  @Prop({ reflect: true }) numberButtonType?: InputPlacement = "vertical";

  /** explicitly whitelist placeholder attribute */
  @Prop() placeholder: string;

  /** optionally add prefix  */
  @Prop() prefixText?: string;

  /** is the input required */
  @Prop() required = false;

  /** specify the scale of the input, defaults to m */
  @Prop({ mutable: true, reflect: true }) scale: Scale = "m";

  /** specify the status of the input field, determines message and icons */
  @Prop({ mutable: true, reflect: true }) status: Status = "idle";

  /** input step */
  @Prop({ mutable: true, reflect: true }) step?: number | "any";

  /** optionally add suffix  **/
  @Prop() suffixText?: string;

  /**
   * specify the input type
   *
   * Note that the following types add type-specific icons by default: `date`, `email`, `password`, `search`, `tel`, `time`
   */
  @Prop({ reflect: true }) type:
    | "color"
    | "date"
    | "datetime-local"
    | "email"
    | "file"
    | "image"
    | "month"
    | "number"
    | "password"
    | "search"
    | "tel"
    | "text"
    | "textarea"
    | "time"
    | "url"
    | "week" = "text";

  /** input value */
  @Prop({ mutable: true }) value?: string;

  @Watch("value")
  valueWatcher(newValue: string): void {
    if (
      this.type === "number" &&
      this.localizedValue !== localizeNumberString(newValue, this.locale)
    ) {
      this.setLocalizedValue(newValue);
    } else if (this.childEl && this.childEl.value !== newValue) {
      this.childEl.value = newValue;
    }
  }

  @Watch("icon")
  @Watch("type")
  updateRequestedIcon(): void {
    this.requestedIcon = setRequestedIcon(INPUT_TYPE_ICONS, this.icon, this.type);
  }

  //--------------------------------------------------------------------------
  //
  //  Private Properties
  //
  //--------------------------------------------------------------------------

  /** keep track of the rendered child type */
  private childEl?: HTMLInputElement | HTMLTextAreaElement;

  /** keep track of the rendered child type */
  private childElType?: "input" | "textarea" = "input";

  /** number text input element for locale */
  private childNumberEl?: HTMLInputElement;

  /** keep track of the initial value */
  private defaultValue: string;

  private form: HTMLFormElement;

  get isClearable(): boolean {
    return !this.isTextarea && (this.clearable || this.type === "search") && this.value?.length > 0;
  }

  get isTextarea(): boolean {
    return this.childElType === "textarea";
  }

  private minString?: string;

  private maxString?: string;

  private preFocusValue: string;

  /** the computed icon to render */
  private requestedIcon?: string;

  /** determine if there is a slotted action for styling purposes */
  private slottedActionEl?: HTMLSlotElement;

  //--------------------------------------------------------------------------
  //
  //  State
  //
  //--------------------------------------------------------------------------

  @State() localizedValue: string;

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  connectedCallback(): void {
    this.form = this.el.closest("form");
    this.form?.addEventListener("reset", this.reset);
    this.scale = getElementProp(this.el, "scale", this.scale);
    this.status = getElementProp(this.el, "status", this.status);
    this.step = !this.step && this.type === "number" ? "any" : this.step;
    if (this.type === "number" && this.value) {
      if (isValidNumber(this.value)) {
        this.localizedValue = localizeNumberString(this.value, this.locale, this.groupSeparator);
      } else {
        this.value = undefined;
      }
    }
  }

  disconnectedCallback(): void {
    this.form?.removeEventListener("reset", this.reset);
  }

  componentWillLoad(): void {
    this.childElType = this.type === "textarea" ? "textarea" : "input";
    this.defaultValue = this.value;
    this.maxString = this.max?.toString();
    this.minString = this.min?.toString();
    this.requestedIcon = setRequestedIcon(INPUT_TYPE_ICONS, this.icon, this.type);
  }

  componentDidLoad(): void {
    this.slottedActionEl = this.el.querySelector("[slot=action]");
    this.setDisabledAction();
    if (this.type === "number" && this.childEl) {
      this.childEl.style.cssText = hiddenInputStyle;
    }
  }

  componentShouldUpdate(newValue: any, oldValue: any, property: string): boolean {
    if (this.type === "number" && property === "value" && newValue && !isValidNumber(newValue)) {
      this.value = oldValue;
      return false;
    }
    return true;
  }

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------

  /**
   * @internal
   */
  @Event() calciteInputFocus: EventEmitter;

  /**
   * @internal
   */
  @Event() calciteInputBlur: EventEmitter;

  /**
   * This event fires each time a new value is typed.
   */
  @Event({ cancelable: true }) calciteInputInput: EventEmitter;

  /**
   * This event fires each time a new value is typed and committed.
   * @internal
   */
  @Event() calciteInputChange: EventEmitter;

  //--------------------------------------------------------------------------
  //
  //  Event Listeners
  //
  //--------------------------------------------------------------------------

  @Listen("keydown")
  keyDownHandler(event: KeyboardEvent): void {
    if (this.isClearable && getKey(event.key) === "Escape") {
      this.clearInputValue(event);
      event.preventDefault();
    }
  }

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  /** focus the rendered child element */
  @Method()
  async setFocus(): Promise<void> {
    if (this.type === "number") {
      this.childNumberEl?.focus();
    } else {
      this.childEl?.focus();
    }
  }

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private clearInputValue = (nativeEvent: KeyboardEvent | MouseEvent): void => {
    this.setValue(null, nativeEvent, true);
  };

  private inputBlurHandler = () => {
    if (this.type === "number") {
      this.setLocalizedValue(this.value);
    }
    this.calciteInputBlur.emit({
      element: this.childEl,
      value: this.value
    });

    if (this.preFocusValue !== this.value) {
      this.calciteInputChange.emit();
    }
  };

  private inputFocusHandler = (event: FocusEvent): void => {
    if (event.target !== this.slottedActionEl) {
      this.setFocus();
    }
    this.calciteInputFocus.emit({
      element: this.childEl,
      value: this.value
    });

    this.preFocusValue = this.value;
  };

  private inputInputHandler = (nativeEvent: InputEvent): void => {
    this.setValue((nativeEvent.target as HTMLInputElement).value, nativeEvent);
  };

  private inputKeyDownHandler = (event: KeyboardEvent): void => {
    if (event.key === "Enter") {
      this.calciteInputChange.emit();
    }
  };

  private inputNumberInputHandler = (nativeEvent: InputEvent): void => {
    const value = (nativeEvent.target as HTMLInputElement).value;
    const delocalizedValue = delocalizeNumberString(value, this.locale);
    if (nativeEvent.inputType === "insertFromPaste") {
      if (!isValidNumber(delocalizedValue)) {
        nativeEvent.preventDefault();
      }
      this.setValue(parseNumberString(delocalizedValue), nativeEvent);
      this.childNumberEl.value = this.localizedValue;
    } else {
      this.setValue(delocalizeNumberString(value, this.locale), nativeEvent);
    }
  };

  private inputNumberKeyDownHandler = (event: KeyboardEvent): void => {
    if (this.type !== "number") {
      return;
    }
    if (event.key === "ArrowUp") {
      this.nudgeNumberValue("up", event);
      return;
    }
    if (event.key === "ArrowDown") {
      this.nudgeNumberValue("down", event);
      return;
    }
    const supportedKeys = [
      ...numberKeys,
      "ArrowLeft",
      "ArrowRight",
      "Backspace",
      "Delete",
      "Enter",
      "Escape",
      "Tab",
      "-"
    ];
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const isShiftTabEvent = event.shiftKey && event.key === "Tab";
    if (
      supportedKeys.includes(event.key) &&
      (!event.shiftKey || isShiftTabEvent) &&
      !(parseInt(this.value) === 0 && getKey(event.key) === "0")
    ) {
      if (event.key === "Enter") {
        this.calciteInputChange.emit();
      }
      return;
    }
    const decimalSeparator = getDecimalSeparator(this.locale);
    if (event.key === decimalSeparator) {
      if (!this.value && !this.childNumberEl.value) {
        return;
      }
      if (this.value && this.childNumberEl.value.indexOf(decimalSeparator) === -1) {
        return;
      }
    }
    event.preventDefault();
  };

  private nudgeNumberValue = (
    direction: NumberNudgeDirection,
    nativeEvent: KeyboardEvent | MouseEvent
  ): void => {
    if (this.type !== "number") {
      return;
    }
    const decimals = this.value?.split(".")[1]?.length || 0;
    const inputMax = this.maxString ? parseFloat(this.maxString) : null;
    const inputMin = this.minString ? parseFloat(this.minString) : null;
    const inputStep = this.step === "any" ? 1 : Math.abs(this.step || 1);
    let inputVal = this.value && this.value !== "" ? parseFloat(this.value) : 0;
    let newValue = this.value;

    if (direction === "up" && ((!inputMax && inputMax !== 0) || inputVal < inputMax)) {
      newValue = (inputVal += inputStep).toFixed(decimals).toString();
    }

    if (direction === "down" && ((!inputMin && inputMin !== 0) || inputVal > inputMin)) {
      newValue = (inputVal -= inputStep).toFixed(decimals).toString();
    }

    this.setValue(newValue, nativeEvent, true);
  };

  private numberButtonMouseDownHandler = (event: MouseEvent): void => {
    // todo, when dropping ie11 support, refactor to use stepup/stepdown
    // prevent blur and re-focus of input on mousedown
    event.preventDefault();
    const direction = (event.target as HTMLDivElement).dataset.adjustment as NumberNudgeDirection;
    this.nudgeNumberValue(direction, event);
  };

  private reset = (nativeEvent): void => {
    if (this.type === "number") {
      nativeEvent.preventDefault();
    }
    this.setValue(this.defaultValue, nativeEvent);
  };

  private setChildElRef = (el) => {
    this.childEl = el;
  };

  private setChildNumberElRef = (el) => {
    this.childNumberEl = el;
  };

  private setDisabledAction(): void {
    if (!this.slottedActionEl) {
      return;
    }
    const slottedActionEl = this.slottedActionEl as HTMLElement;

    this.disabled
      ? slottedActionEl.setAttribute("disabled", "")
      : slottedActionEl.removeAttribute("disabled");
  }

  private setLocalizedValue = (value: string): void => {
    this.localizedValue = localizeNumberString(value, this.locale, this.groupSeparator);
  };

  private setValue = (value: string, nativeEvent?: any, committing = false): void => {
    const previousValue = this.value;

    this.value = this.type === "number" ? sanitizeNumberString(value) : value;

    if (this.type === "number") {
      this.setLocalizedValue(this.value);
    }

    if (nativeEvent) {
      if (this.type === "number" && value?.endsWith(".")) {
        return;
      }

      const calciteInputInputEvent = this.calciteInputInput.emit({
        element: this.childEl,
        nativeEvent,
        value
      });

      if (calciteInputInputEvent.defaultPrevented) {
        this.value = previousValue;
        this.setLocalizedValue(previousValue);
      } else if (committing) {
        this.calciteInputChange.emit();
      }
    }
  };

  // --------------------------------------------------------------------------
  //
  //  Render Methods
  //
  // --------------------------------------------------------------------------

  render(): VNode {
    const dir = getElementDir(this.el);

    const loader = (
      <div class="calcite-input-loading">
        <calcite-progress label={this.intlLoading} type="indeterminate" />
      </div>
    );

    const inputClearButton = (
      <button
        class="calcite-input-clear-button"
        disabled={this.loading}
        onClick={this.clearInputValue}
      >
        <calcite-icon icon="x" scale="s" />
      </button>
    );
    const iconEl = (
      <calcite-icon
        class="calcite-input-icon"
        dir={dir}
        flipRtl={this.iconFlipRtl}
        icon={this.requestedIcon}
        scale="s"
      />
    );

    const numberButtonClassModifier =
      this.numberButtonType === "horizontal" ? "number-button-item-horizontal" : null;

    const numberButtonsHorizontalUp = (
      <div
        class={`calcite-input-number-button-item ${numberButtonClassModifier}`}
        data-adjustment="up"
        onMouseDown={this.numberButtonMouseDownHandler}
      >
        <calcite-icon icon="chevron-up" scale="s" />
      </div>
    );

    const numberButtonsHorizontalDown = (
      <div
        class={`calcite-input-number-button-item ${numberButtonClassModifier}`}
        data-adjustment="down"
        onMouseDown={this.numberButtonMouseDownHandler}
      >
        <calcite-icon icon="chevron-down" scale="s" />
      </div>
    );

    const numberButtonsVertical = (
      <div class={`calcite-input-number-button-wrapper`}>
        {numberButtonsHorizontalUp}
        {numberButtonsHorizontalDown}
      </div>
    );

    const prefixText = <div class="calcite-input-prefix">{this.prefixText}</div>;

    const suffixText = <div class="calcite-input-suffix">{this.suffixText}</div>;

    const localeNumberInput =
      this.type === "number" ? (
        <input
          aria-label={this.label}
          autofocus={this.autofocus ? true : null}
          defaultValue={this.defaultValue}
          disabled={this.disabled ? true : null}
          key="localized-input"
          maxLength={this.maxLength}
          minLength={this.minLength}
          name={undefined}
          onBlur={this.inputBlurHandler}
          onFocus={this.inputFocusHandler}
          onInput={this.inputNumberInputHandler}
          onKeyDown={this.inputNumberKeyDownHandler}
          placeholder={this.placeholder || ""}
          ref={this.setChildNumberElRef}
          tabIndex={0}
          type="text"
          value={this.localizedValue}
        />
      ) : null;

    const childEl = [
      <this.childElType
        aria-label={this.label}
        autofocus={this.autofocus ? true : null}
        defaultValue={this.defaultValue}
        disabled={this.disabled ? true : null}
        max={this.maxString}
        maxLength={this.maxLength}
        min={this.minString}
        minLength={this.minLength}
        name={this.name}
        onBlur={this.inputBlurHandler}
        onFocus={this.inputFocusHandler}
        onInput={this.inputInputHandler}
        onKeyDown={this.inputKeyDownHandler}
        placeholder={this.placeholder || ""}
        ref={this.setChildElRef}
        required={this.required ? true : null}
        step={this.step}
        tabIndex={this.disabled || this.type === "number" ? -1 : null}
        type={this.type}
        value={this.value}
      />,
      this.isTextarea ? (
        <div class="calcite-input-resize-icon-wrapper">
          <calcite-icon icon="chevron-down" scale="s" />
        </div>
      ) : null
    ];

    return (
      <Host onClick={this.inputFocusHandler}>
        <div class={{ "calcite-input-wrapper": true, [CSS_UTILITY.rtl]: dir === "rtl" }} dir={dir}>
          {this.type === "number" && this.numberButtonType === "horizontal"
            ? numberButtonsHorizontalDown
            : null}
          {this.prefixText ? prefixText : null}
          <div class="calcite-input-element-wrapper">
            {localeNumberInput}
            {childEl}
            {this.isClearable ? inputClearButton : null}
            {this.requestedIcon ? iconEl : null}
            {this.loading ? loader : null}
          </div>
          <div class="calcite-action-wrapper">
            <slot name={SLOTS.action} />
          </div>
          {this.type === "number" && this.numberButtonType === "vertical"
            ? numberButtonsVertical
            : null}
          {this.suffixText ? suffixText : null}
          {this.type === "number" && this.numberButtonType === "horizontal"
            ? numberButtonsHorizontalUp
            : null}
        </div>
      </Host>
    );
  }
}
