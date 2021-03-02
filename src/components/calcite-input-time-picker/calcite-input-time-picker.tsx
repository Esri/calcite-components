import {
  Component,
  Element,
  Host,
  VNode,
  h,
  Prop,
  Listen,
  Event,
  EventEmitter,
  State,
  Method
} from "@stencil/core";
import { guid } from "../../utils/guid";
import { formatNumberAsTimeString, Time } from "../calcite-time-picker/utils";
import { Theme } from "../interfaces";

@Component({
  tag: "calcite-input-time-picker",
  styleUrl: "calcite-input-time-picker.scss",
  scoped: true
})
export class CalciteInputTimePicker {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element() el: HTMLCalciteInputTimePickerElement;

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  /** The active state of the time input.  When true, the time input popup is displayed. */
  @Prop({ reflect: true }) active = false;

  /** The disabled state of the time input */
  @Prop({ reflect: true }) disabled?: boolean = false;

  /** The id attribute of the input time picker.  When omitted, a globally unique identifier is used. */
  @Prop({ reflect: true, mutable: true }) guid: string;

  /** The name of the time input */
  @Prop({ reflect: true }) name?: string = "";

  /** The scale (size) of the time input */
  @Prop({ reflect: true }) scale: "s" | "m" | "l" = "m";

  /** number that specifies the granularity that the value must adhere to */
  @Prop({ reflect: true }) step = 60;

  /** The color theme of the time-picker */
  @Prop({ reflect: true }) theme: Theme = "light";

  /** The selected time */
  @Prop({ reflect: true, mutable: true }) value?: string;

  //--------------------------------------------------------------------------
  //
  //  Private Properties
  //
  //--------------------------------------------------------------------------

  private inputEl: HTMLCalciteInputElement;

  //--------------------------------------------------------------------------
  //
  //  State
  //
  //--------------------------------------------------------------------------

  @State() popoverOpen = false;

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------

  /**
   * Fires when the time value has changed.
   */
  @Event() calciteInputTimePickerChange: EventEmitter<string>;

  //--------------------------------------------------------------------------
  //
  //  Event Listeners
  //
  //--------------------------------------------------------------------------

  private inputBlurHandler = (): void => {
    this.popoverOpen = false;
    const newValue = this.parseTimeString(this.inputEl.value);
    if (newValue) {
      this.inputEl.value = newValue;
    }
  };

  private inputFocusHandler = (): void => {
    this.popoverOpen = true;
  };

  private inputInputHandler = (event: CustomEvent): void => {
    if (this.parseTimeString(event.detail.value) !== null || !event.detail.value) {
      this.value = event.detail.value;
    }
  };

  @Listen("keydown")
  inputKeyDownHandler(event: KeyboardEvent): void {
    // This prevents the browser default time picker UI from appearing
    if (
      (event.target as HTMLElement).closest("calcite-input") === this.inputEl &&
      event.key === " "
    ) {
      event.preventDefault();
    }
  }

  @Listen("keyup")
  keyUpHandler(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.popoverOpen === true) {
      this.popoverOpen = false;
    }
  }

  @Listen("calciteTimePickerBlur")
  timePickerBlurHandler(): void {
    this.popoverOpen = false;
  }

  @Listen("calciteTimePickerChange")
  timePickerChangeHandler(event: CustomEvent): void {
    if (event.detail) {
      const { hour, minute, second } = event.detail as Time;
      if (hour !== "--" && minute !== "--") {
        if (this.step !== 60 && second !== "--") {
          this.value = `${hour}:${minute}:${second}`;
        } else {
          this.value = `${hour}:${minute}`;
        }
      } else {
        this.value = "";
      }
    }
  }

  @Listen("calciteTimePickerFocus")
  timePickerFocusHandler(): void {
    this.popoverOpen = true;
  }

  @Listen("click", { target: "window" })
  windowClickHandler(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const closestHost = target.closest(
      "calcite-input-time-picker"
    ) as HTMLCalciteInputTimePickerElement;
    const closestLabel = target.closest("calcite-label") as HTMLCalciteLabelElement;
    if (closestLabel && closestLabel.for === this.guid) {
      this.inputEl.setFocus();
      this.popoverOpen = true;
    } else if (closestHost !== this.el) {
      this.popoverOpen = false;
    }
  }

  // --------------------------------------------------------------------------
  //
  //  Public Methods
  //
  // --------------------------------------------------------------------------

  @Method()
  async setFocus(): Promise<void> {
    this.inputEl.setFocus();
  }

  // --------------------------------------------------------------------------
  //
  //  Private Methods
  //
  // --------------------------------------------------------------------------

  private convertStringToTime = (value: string): Time => {
    const timeString = this.parseTimeString(value);
    const [hour, minute, second] = timeString ? timeString.split(":") : ["--", "--", "--"];
    return {
      hour,
      minute,
      second: second || (hour !== "--" && minute !== "--" ? "00" : "--")
    };
  };

  private stringContainsOnlyNumbers(string): boolean {
    const letters = /^[A-Za-z]+$/;
    const numbers = /^[0-9]+$/;
    const letterMatch = string.match(letters);
    const numberMatch = string.match(numbers);
    const hasLetters = Array.isArray(letterMatch);
    const hasNumbers = Array.isArray(numberMatch);
    if (hasNumbers && !hasLetters) {
      return true;
    }
    return false;
  }

  private setInputEl = (el: HTMLCalciteInputElement): void => {
    this.inputEl = el;
  };

  private parseTimeString = (value: string): string => {
    if (value) {
      const splitValue = value.split(":");
      if (splitValue.length > 1) {
        const hour = splitValue[0];
        const minute = splitValue[1];
        const second = splitValue[2];
        const hourAsNumber = parseInt(splitValue[0]);
        const minuteAsNumber = parseInt(splitValue[1]);
        const secondAsNumber = parseInt(splitValue[2]);
        const hourValid =
          hour &&
          this.stringContainsOnlyNumbers(hour) &&
          !isNaN(hourAsNumber) &&
          hourAsNumber >= 0 &&
          hourAsNumber < 24;
        const minuteValid =
          minute &&
          this.stringContainsOnlyNumbers(minute) &&
          !isNaN(minuteAsNumber) &&
          minuteAsNumber >= 0 &&
          minuteAsNumber < 60;
        const secondValid =
          second &&
          this.stringContainsOnlyNumbers(second) &&
          !isNaN(secondAsNumber) &&
          secondAsNumber >= 0 &&
          secondAsNumber < 60;
        if ((hourValid && minuteValid && !second) || (hourValid && minuteValid && secondValid)) {
          let newValue = `${formatNumberAsTimeString(hourAsNumber)}:${formatNumberAsTimeString(
            minuteAsNumber
          )}`;
          if (secondValid) {
            newValue = `${newValue}:${formatNumberAsTimeString(secondAsNumber)}`;
          }
          return newValue;
        }
      }
    }
    return null;
  };

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  connectedCallback() {
    this.guid = this.el.id || `calcite-input-time-picker-${guid()}`;
  }

  // --------------------------------------------------------------------------
  //
  //  Render Methods
  //
  // --------------------------------------------------------------------------

  render(): VNode {
    const { hour, minute, second } = this.convertStringToTime(this.value);
    return (
      <Host>
        <calcite-input
          disabled={this.disabled}
          icon="clock"
          id={`${this.guid}-input`}
          name={this.name}
          onCalciteInputBlur={this.inputBlurHandler}
          onCalciteInputFocus={this.inputFocusHandler}
          onCalciteInputInput={this.inputInputHandler}
          ref={this.setInputEl}
          scale={this.scale}
          step={this.step}
          theme={this.theme}
          type="time"
          value={this.value}
        />
        <calcite-popover
          corner-appearance="round"
          label="Time Picker"
          open={this.popoverOpen}
          referenceElement={`${this.guid}-input`}
          theme={this.theme}
        >
          <calcite-time-picker
            hour={hour}
            minute={minute}
            scale={this.scale}
            second={second}
            step={this.step}
            theme={this.theme}
          />
        </calcite-popover>
      </Host>
    );
  }
}