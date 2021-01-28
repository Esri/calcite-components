import {
  Component,
  Element,
  Host,
  h,
  Prop,
  VNode,
  Event,
  EventEmitter,
  Watch,
  State
} from "@stencil/core";
import { Scale } from "../interfaces";

const numberKeys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

type AmPm = "--" | "AM" | "PM";

type MinuteOrSecond = "minute" | "second";

export interface Time {
  hour: string;
  minute: string;
  second?: string;
}

@Component({
  tag: "calcite-time-picker",
  styleUrl: "calcite-time-picker.scss",
  shadow: true
})
export class CalciteTimePicker {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element() el: HTMLCalciteTimePickerElement;

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------

  @Event() calciteTimePickerChange: EventEmitter<Time>;

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  /** The focused state of the time picker */
  @Prop({ reflect: true }) focused = false;

  /** The hour value (24-hour format) */
  @Prop() hour?: string = "--";

  /** Format of the hour value (12-hour or 24-hour) (this will be replaced by locale eventually) */
  @Prop({ reflect: true }) hourDisplay: "12" | "24" = "12";

  /** The minute value */
  @Prop() minute?: string = "--";

  /** The second value */
  @Prop() second?: string = "--";

  /** The scale (size) of the time picker */
  @Prop({ reflect: true }) scale: Scale = "m";

  /** number that specifies the granularity that the value must adhere to */
  @Prop({ reflect: true }) step = 60;

  @Watch("hour")
  @Watch("minute")
  @Watch("second")
  timeChanged(): void {
    const timeValues = this.getTimeValues();
    if (timeValues) {
      this.calciteTimePickerChange.emit(this.getTimeValues());
    } else {
      this.calciteTimePickerChange.emit();
    }
  }

  // --------------------------------------------------------------------------
  //
  //  State
  //
  // --------------------------------------------------------------------------

  /** The am/pm value */
  @State() ampm: AmPm = "--";

  // --------------------------------------------------------------------------
  //
  //  Private Methods
  //
  // --------------------------------------------------------------------------

  private amPmKeyDownHandler = (event: KeyboardEvent): void => {
    switch (event.key) {
      case "a":
        this.ampm = "AM";
        break;
      case "p":
        this.ampm = "PM";
        break;
      case "Backspace":
        this.ampm = "--";
        break;
      case "ArrowUp":
        event.preventDefault();
        this.incrementAmPm();
        break;
      case "ArrowDown":
        event.preventDefault();
        this.decrementAmPm();
        break;
    }
  };

  private decrementAmPm = (): void => {
    switch (this.ampm) {
      case "--":
        this.ampm = "PM";
        break;
      case "AM":
        this.ampm = "PM";
        break;
      case "PM":
        this.ampm = "AM";
        break;
    }
  };

  private decrementHour = (): void => {
    switch (this.hour) {
      case "--":
        this.hour = "00";
        break;
      case "00":
        this.hour = "23";
        break;
      default:
        const hourAsNumber = parseInt(this.hour);
        const newHour = hourAsNumber - 1;
        this.hour = this.formatNumberAsString(newHour);
        break;
    }
  };

  private decrementMinuteOrSecond = (key: MinuteOrSecond): void => {
    if (this[key] === "--") {
      this[key] = "59";
    } else {
      const valueAsNumber = parseInt(this[key]);
      if (valueAsNumber === 0) {
        this[key] = "59";
      } else {
        const newValue = valueAsNumber - 1;
        this[key] = this.formatNumberAsString(newValue);
      }
    }
  };

  private decrementMinute = (): void => {
    this.decrementMinuteOrSecond("minute");
  };

  private decrementSecond = (): void => {
    this.decrementMinuteOrSecond("second");
  };

  private formatNumberAsString(number: number): string {
    return number >= 0 && number <= 9 ? `0${number}` : number.toString();
  }

  private getDisplayHour(): string {
    if (this.hourDisplay === "12" && this.hour !== "--") {
      const hourAsNumber = parseInt(this.hour);
      if (hourAsNumber > 12) {
        return this.formatNumberAsString(hourAsNumber - 12);
      }
      if (hourAsNumber === 0) {
        return "12";
      }
    }
    return this.hour;
  }

  private getTimeValues(): Time {
    if (this.hour !== "--" && this.minute !== "--") {
      const time: Time = {
        hour: this.hour,
        minute: this.minute
      };
      if (this.second !== "--") {
        time.second = this.second;
      }
      return time;
    }
    return;
  }

  private hourKeyDownHandler = (event: KeyboardEvent): void => {
    if (numberKeys.includes(event.key)) {
      const keyAsNumber = parseInt(event.key);
      if (this.hour === "01" && keyAsNumber >= 0 && keyAsNumber <= 2) {
        this.hour = `1${event.key}`;
      } else {
        this.hour = `0${event.key}`;
      }
    } else {
      switch (event.key) {
        case "Backspace":
          this.hour = "--";
          break;
        case "ArrowDown":
          event.preventDefault();
          this.decrementHour();
          break;
        case "ArrowUp":
          event.preventDefault();
          this.incrementHour();
          break;
      }
    }
  };

  private incrementAmPm = (): void => {
    switch (this.ampm) {
      case "--":
        this.ampm = "AM";
        break;
      case "AM":
        this.ampm = "PM";
        break;
      case "PM":
        this.ampm = "AM";
        break;
    }
  };

  private incrementHour = (): void => {
    switch (this.hour) {
      case "--":
        this.hour = "01";
        break;
      case "23":
        this.hour = "00";
        break;
      default:
        const hourAsNumber = parseInt(this.hour);
        const newHour = hourAsNumber + 1;
        this.hour = this.formatNumberAsString(newHour);
        break;
    }
  };

  private incrementMinuteOrSecond = (key: MinuteOrSecond): void => {
    if (this[key] === "--") {
      this[key] = "00";
    } else {
      const valueAsNumber = parseInt(this[key]);
      if (valueAsNumber === 59) {
        this[key] = "00";
      } else {
        const newValue = valueAsNumber + 1;
        this[key] = this.formatNumberAsString(newValue);
      }
    }
  };

  private incrementMinute = (): void => {
    this.incrementMinuteOrSecond("minute");
  };

  private incrementSecond = (): void => {
    this.incrementMinuteOrSecond("second");
  };

  private minuteKeyDownHandler = (event: KeyboardEvent): void => {
    if (numberKeys.includes(event.key)) {
      if (this.minute === "--") {
        this.minute = `0${event.key}`;
      } else if (this.minute.startsWith("0")) {
        const minuteAsNumber = parseInt(this.minute);
        if (minuteAsNumber > 5) {
          this.minute = `0${event.key}`;
        } else {
          this.minute = `${minuteAsNumber}${event.key}`;
        }
      } else {
        this.minute = `0${event.key}`;
      }
    } else {
      switch (event.key) {
        case "Backspace":
          this.minute = "--";
          break;
        case "ArrowDown":
          event.preventDefault();
          this.decrementMinute();
          break;
        case "ArrowUp":
          event.preventDefault();
          this.incrementMinute();
          break;
      }
    }
  };

  private secondKeyDownHandler = (event: KeyboardEvent): void => {
    if (numberKeys.includes(event.key)) {
      if (this.second === "--") {
        this.second = `0${event.key}`;
      } else if (this.second.startsWith("0")) {
        const secondAsNumber = parseInt(this.second);
        if (secondAsNumber > 5) {
          this.second = `0${event.key}`;
        } else {
          this.second = `${secondAsNumber}${event.key}`;
        }
      } else {
        this.second = `0${event.key}`;
      }
    } else {
      switch (event.key) {
        case "Backspace":
          this.second = "--";
          break;
        case "ArrowDown":
          event.preventDefault();
          this.decrementSecond();
          break;
        case "ArrowUp":
          event.preventDefault();
          this.incrementSecond();
          break;
      }
    }
  };

  // --------------------------------------------------------------------------
  //
  //  Render Methods
  //
  // --------------------------------------------------------------------------

  render(): VNode {
    const iconScale = this.scale === "s" || this.scale === "m" ? "s" : "m";
    const includeSeconds = this.step !== 60 ? true : false;
    return (
      <Host>
        <div class="time-picker">
          <div>
            <button
              aria-label="increase hour"
              class="top-left"
              onClick={this.incrementHour}
              tabIndex={-1}
              type="button"
            >
              <calcite-icon icon="chevronup" scale={iconScale} />
            </button>
            <span
              aria-label="Hour"
              aria-placeholder="--"
              aria-valuemax="23"
              aria-valuemin="1"
              aria-valuenow={this.hour !== "--" ? parseInt(this.hour) : undefined}
              aria-valuetext={this.hour !== "--" ? this.hour : undefined}
              class="hour"
              onKeyDown={this.hourKeyDownHandler}
              role="spinbutton"
              tabIndex={0}
            >
              {this.getDisplayHour()}
            </span>
            <button
              aria-label="decrease hour"
              class="bottom-left"
              onClick={this.decrementHour}
              tabIndex={-1}
              type="button"
            >
              <calcite-icon icon="chevrondown" scale={iconScale} />
            </button>
          </div>
          <div>:</div>
          <div>
            <button
              aria-label="increase minute"
              onClick={this.incrementMinute}
              tabIndex={-1}
              type="button"
            >
              <calcite-icon icon="chevronup" scale={iconScale} />
            </button>
            <span
              aria-label="Minute"
              aria-placeholder="--"
              aria-valuemax="12"
              aria-valuemin="1"
              aria-valuenow={this.minute !== "--" ? parseInt(this.minute) : undefined}
              aria-valuetext={this.minute !== "--" ? this.minute : undefined}
              class="minute"
              onKeyDown={this.minuteKeyDownHandler}
              role="spinbutton"
              tabIndex={0}
            >
              {this.minute}
            </span>
            <button
              aria-label="decrease minute"
              onClick={this.decrementMinute}
              tabIndex={-1}
              type="button"
            >
              <calcite-icon icon="chevrondown" scale={iconScale} />
            </button>
          </div>
          {includeSeconds && <div>:</div>}
          {includeSeconds && (
            <div>
              <button
                aria-label="increase second"
                onClick={this.incrementSecond}
                tabIndex={-1}
                type="button"
              >
                <calcite-icon icon="chevronup" scale={iconScale} />
              </button>
              <span
                aria-label="Second"
                aria-placeholder="--"
                aria-valuemax="59"
                aria-valuemin="0"
                aria-valuenow={this.second !== "--" ? parseInt(this.second) : undefined}
                aria-valuetext={this.second !== "--" ? this.second : undefined}
                class="second"
                onKeyDown={this.secondKeyDownHandler}
                role="spinbutton"
                tabIndex={0}
              >
                {this.second}
              </span>
              <button
                aria-label="decrease second"
                onClick={this.decrementSecond}
                tabIndex={-1}
                type="button"
              >
                <calcite-icon icon="chevrondown" scale={iconScale} />
              </button>
            </div>
          )}
          {this.hourDisplay === "12" && (
            <div>
              <button
                aria-label="switch to am or pm"
                class="top-right"
                onClick={this.incrementAmPm}
                tabIndex={-1}
                type="button"
              >
                <calcite-icon icon="chevronup" scale={iconScale} />
              </button>
              <span
                aria-label="AM/PM"
                aria-placeholder="--"
                aria-valuemax="2"
                aria-valuemin="1"
                aria-valuenow={this.ampm !== "--" ? (this.ampm === "AM" ? "1" : "2") : undefined}
                aria-valuetext={this.ampm !== "--" ? this.ampm : undefined}
                class="ampm"
                onKeyDown={this.amPmKeyDownHandler}
                role="spinbutton"
                tabIndex={0}
              >
                {this.ampm}
              </span>
              <button
                aria-label="switch to am or pm"
                class="bottom-right"
                onClick={this.decrementAmPm}
                tabIndex={-1}
                type="button"
              >
                <calcite-icon icon="chevrondown" scale={iconScale} />
              </button>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
