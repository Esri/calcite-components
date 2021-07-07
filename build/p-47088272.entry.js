import{r as t,c as i,h as e,H as a,g as s}from"./p-92cf559a.js";import{T as r,d as n,a as o,g as l,s as c,p,i as h}from"./p-22494388.js";import{g as m}from"./p-6b4b7af1.js";import{g as d}from"./p-cebd4de5.js";import{u,C as f,c as b}from"./p-87dd2d7d.js";import"./p-42da4366.js";import"./p-af695f59.js";import"./p-a4e6e35b.js";const g=class{constructor(e){t(this,e),this.calciteDatePickerChange=i(this,"calciteDatePickerChange",7),this.calciteDatePickerRangeChange=i(this,"calciteDatePickerRangeChange",7),this.active=!1,this.intlPrevMonth=r.prevMonth,this.intlNextMonth=r.nextMonth,this.locale=document.documentElement.lang||"en",this.scale="m",this.range=!1,this.overlayPositioning="absolute",this.proximitySelectionDisabled=!1,this.layout="horizontal",this.focusedInput="start",this.hasShadow=!!document.head.attachShadow,this.setEndInput=t=>{this.endInput=t},this.deactivate=()=>{this.active=!1},this.keyUpHandler=t=>{"Escape"===d(t.key)&&(this.active=!1)},this.inputBlur=t=>{this.blur(t.detail)},this.startInputFocus=()=>{this.active=!0,this.focusedInput="start"},this.endInputFocus=()=>{this.active=!0,this.focusedInput="end"},this.inputInput=t=>{this.input(t.detail.value)},this.setMenuEl=t=>{t&&(this.menuEl=t,this.createPopper())},this.setStartWrapper=t=>{this.startWrapper=t,this.setReferenceEl()},this.setEndWrapper=t=>{this.endWrapper=t,this.setReferenceEl()},this.handleDateChange=t=>{this.range||(this.valueAsDate=t.detail)},this.handleDateRangeChange=t=>{if(!this.range||!t.detail)return;const{startDate:i,endDate:e}=t.detail;this.startAsDate=i,this.endAsDate=e,clearTimeout(this.endInputFocusTimeout),i&&"start"===this.focusedInput&&(this.endInputFocusTimeout=window.setTimeout((()=>{var t;return null===(t=this.endInput)||void 0===t?void 0:t.setFocus()}),150))}}activeHandler(){this.reposition()}focusInHandler(t){this.hasShadow||this.el.contains(t.target)||(this.active=!1)}calciteDaySelectHandler(){this.active=!1}async reposition(){const{popper:t,menuEl:i}=this,e=this.getModifiers();t?u({el:i,modifiers:e,placement:"bottom-leading",popper:t}):this.createPopper()}connectedCallback(){this.loadLocaleData(),this.value&&(this.valueAsDate=n(this.value)),this.start&&this.setStartAsDate(n(this.start)),this.end&&this.setEndAsDate(n(this.end)),this.min&&(this.minAsDate=n(this.min)),this.max&&(this.maxAsDate=n(this.max)),this.createPopper()}disconnectedCallback(){this.destroyPopper()}render(){var t,i;const s=o(this.range?this.startAsDate:this.valueAsDate,this.minAsDate,this.maxAsDate),r=this.range?o(this.endAsDate,this.minAsDate,this.maxAsDate):null,n=r?r.toLocaleDateString(this.locale):"",l=s?s.toLocaleDateString(this.locale):"",c=m(this.el);return e(a,{onBlur:this.deactivate,onKeyUp:this.keyUpHandler,role:"application"},this.localeData&&e("div",{"aria-expanded":this.active.toString(),class:"input-container",dir:c,role:"application"},e("div",{class:"input-wrapper",ref:this.setStartWrapper},e("calcite-input",{class:"input "+("vertical"===this.layout&&this.range?"no-bottom-border":""),icon:"calendar","number-button-type":"none",onCalciteInputBlur:this.inputBlur,onCalciteInputFocus:this.startInputFocus,onCalciteInputInput:this.inputInput,placeholder:null===(t=this.localeData)||void 0===t?void 0:t.placeholder,scale:this.scale,type:"text",value:l})),e("div",{"aria-hidden":(!this.active).toString(),class:"menu-container",ref:this.setMenuEl},e("div",{class:{"calendar-picker-wrapper":!0,"calendar-picker-wrapper--end":"end"===this.focusedInput,[f.animation]:!0,[f.animationActive]:this.active}},e("calcite-date-picker",{activeRange:this.focusedInput,endAsDate:this.endAsDate,headingLevel:this.headingLevel,intlNextMonth:this.intlNextMonth,intlPrevMonth:this.intlPrevMonth,locale:this.locale,max:this.max,maxAsDate:this.maxAsDate,min:this.min,minAsDate:this.minAsDate,onCalciteDatePickerChange:this.handleDateChange,onCalciteDatePickerRangeChange:this.handleDateRangeChange,proximitySelectionDisabled:this.proximitySelectionDisabled,range:this.range,scale:this.scale,startAsDate:this.startAsDate,tabIndex:0,valueAsDate:this.valueAsDate}))),this.range&&"horizontal"===this.layout&&e("div",{class:"horizontal-arrow-container"},e("calcite-icon",{flipRtl:!0,icon:"arrow-right",scale:"s"})),this.range&&"vertical"===this.layout&&e("div",{class:"vertical-arrow-container"},e("calcite-icon",{icon:"arrow-down",scale:"s"})),this.range&&e("div",{class:"input-wrapper",ref:this.setEndWrapper},e("calcite-input",{class:"input",icon:"calendar","number-button-type":"none",onCalciteInputBlur:this.inputBlur,onCalciteInputFocus:this.endInputFocus,onCalciteInputInput:this.inputInput,placeholder:null===(i=this.localeData)||void 0===i?void 0:i.placeholder,ref:this.setEndInput,scale:this.scale,type:"text",value:n}))))}setReferenceEl(){const{focusedInput:t,layout:i,endWrapper:e,startWrapper:a}=this;this.referenceEl="end"===t||"vertical"===i?e||a:a||e,this.createPopper()}getModifiers(){return[{name:"flip",enabled:!0,options:{fallbackPlacements:["top-start","top","top-end","bottom-start","bottom","bottom-end"]}}]}createPopper(){this.destroyPopper();const{menuEl:t,referenceEl:i,overlayPositioning:e}=this;if(!t||!i)return;const a=this.getModifiers();this.popper=b({el:t,modifiers:a,overlayPositioning:e,placement:"bottom-leading",referenceEl:i})}destroyPopper(){const{popper:t}=this;t&&t.destroy(),this.popper=null}valueWatcher(t){this.valueAsDate=n(t)}startWatcher(t){this.setStartAsDate(n(t))}endWatcher(t){this.setEndAsDate(n(t))}async loadLocaleData(){const{locale:t}=this;this.localeData=await l(t)}setStartAsDate(t){this.startAsDate=t}setEndAsDate(t){this.endAsDate=t}input(t){const i=this.getDateFromInput(t);if(i)if(this.range){let t=!1;"start"===this.focusedInput?(t=!this.startAsDate||!c(i,this.startAsDate),t&&(this.startAsDate=i)):"end"===this.focusedInput&&(t=!this.endAsDate||!c(i,this.endAsDate),t&&(this.endAsDate=i))}else this.valueAsDate=i}blur(t){const{locale:i,focusedInput:e,endAsDate:a,range:s,startAsDate:r,valueAsDate:n}=this;this.getDateFromInput(t.value)||(!s&&n?t.value=n.toLocaleDateString(i):"start"===e&&r?t.value=r.toLocaleDateString(i):"end"===e&&a&&(t.value=a.toLocaleDateString(i)))}getDateFromInput(t){if(!this.localeData)return!1;const{separator:i}=this.localeData,{day:e,month:a,year:s}=p(t,this.localeData),r=e>0,n=a>-1,o=new Date(s,a,e);o.setFullYear(s);const l=!isNaN(o.getTime()),c=t.split(i).filter((t=>t)).length>2,m=s.toString().length>0;return!!(r&&n&&l&&c&&m&&h(o,this.min,this.max))&&o}get el(){return s(this)}static get watchers(){return{active:["activeHandler"],layout:["setReferenceEl"],focusedInput:["setReferenceEl"],value:["valueWatcher"],start:["startWatcher"],end:["endWatcher"],locale:["loadLocaleData"]}}};g.style="@-webkit-keyframes in{0%{opacity:0}100%{opacity:1}}@keyframes in{0%{opacity:0}100%{opacity:1}}@-webkit-keyframes in-down{0%{opacity:0;-webkit-transform:translate3D(0, -5px, 0);transform:translate3D(0, -5px, 0)}100%{opacity:1;-webkit-transform:translate3D(0, 0, 0);transform:translate3D(0, 0, 0)}}@keyframes in-down{0%{opacity:0;-webkit-transform:translate3D(0, -5px, 0);transform:translate3D(0, -5px, 0)}100%{opacity:1;-webkit-transform:translate3D(0, 0, 0);transform:translate3D(0, 0, 0)}}@-webkit-keyframes in-up{0%{opacity:0;-webkit-transform:translate3D(0, 5px, 0);transform:translate3D(0, 5px, 0)}100%{opacity:1;-webkit-transform:translate3D(0, 0, 0);transform:translate3D(0, 0, 0)}}@keyframes in-up{0%{opacity:0;-webkit-transform:translate3D(0, 5px, 0);transform:translate3D(0, 5px, 0)}100%{opacity:1;-webkit-transform:translate3D(0, 0, 0);transform:translate3D(0, 0, 0)}}@-webkit-keyframes in-scale{0%{opacity:0;-webkit-transform:scale3D(0.95, 0.95, 1);transform:scale3D(0.95, 0.95, 1)}100%{opacity:1;-webkit-transform:scale3D(1, 1, 1);transform:scale3D(1, 1, 1)}}@keyframes in-scale{0%{opacity:0;-webkit-transform:scale3D(0.95, 0.95, 1);transform:scale3D(0.95, 0.95, 1)}100%{opacity:1;-webkit-transform:scale3D(1, 1, 1);transform:scale3D(1, 1, 1)}}:host{--calcite-icon-size:1rem;--calcite-spacing-eighth:0.125rem;--calcite-spacing-quarter:0.25rem;--calcite-spacing-half:0.5rem;--calcite-spacing-three-quarters:0.75rem;--calcite-spacing:1rem;--calcite-spacing-plus-quarter:1.25rem;--calcite-spacing-plus-half:1.5rem;--calcite-spacing-double:2rem;--calcite-menu-min-width:10rem;--calcite-header-min-height:3rem;--calcite-footer-min-height:3rem}:root{--calcite-popper-transition:150ms ease-in-out}:host([hidden]){display:none}:host{display:inline-block;vertical-align:top;width:100%;position:relative;overflow:visible;-webkit-box-shadow:none;box-shadow:none}:host .menu-container .calcite-popper-anim{position:relative;z-index:1;-webkit-transition:var(--calcite-popper-transition);transition:var(--calcite-popper-transition);visibility:hidden;-webkit-transition-property:visibility, opacity, -webkit-transform;transition-property:visibility, opacity, -webkit-transform;transition-property:transform, visibility, opacity;transition-property:transform, visibility, opacity, -webkit-transform;opacity:0;-webkit-box-shadow:0 0 16px 0 rgba(0, 0, 0, 0.16);box-shadow:0 0 16px 0 rgba(0, 0, 0, 0.16);border-radius:0.25rem}:host .menu-container[data-popper-placement^=bottom] .calcite-popper-anim{-webkit-transform:translateY(-5px);transform:translateY(-5px)}:host .menu-container[data-popper-placement^=top] .calcite-popper-anim{-webkit-transform:translateY(5px);transform:translateY(5px)}:host .menu-container[data-popper-placement^=left] .calcite-popper-anim{-webkit-transform:translateX(5px);transform:translateX(5px)}:host .menu-container[data-popper-placement^=right] .calcite-popper-anim{-webkit-transform:translateX(-5px);transform:translateX(-5px)}:host .menu-container[data-popper-placement] .calcite-popper-anim--active{opacity:1;visibility:visible;-webkit-transform:translate(0);transform:translate(0)}.calendar-picker-wrapper{-webkit-box-shadow:none;box-shadow:none;position:static;-webkit-transform:translate3d(0, 0, 0);transform:translate3d(0, 0, 0);width:100%;line-height:0}.input-wrapper{position:relative}:host([range]) .input-container{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}:host([range]) .input-wrapper{-ms-flex:1 1 auto;flex:1 1 auto}:host([range]) .horizontal-arrow-container{background-color:var(--calcite-ui-background);padding:0 var(--calcite-spacing-quarter);border:1px solid var(--calcite-ui-border-1);border-left:none;border-right:none;height:42px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex:0 0 auto;flex:0 0 auto}:host([range][layout=vertical]) .input-wrapper{width:100%}:host([range][layout=vertical]) .input-container{-ms-flex-direction:column;flex-direction:column;-ms-flex-align:start;align-items:start}:host([range][layout=vertical]) .calendar-picker-wrapper--end{-webkit-transform:translate3d(0, 0, 0);transform:translate3d(0, 0, 0)}:host([range][layout=vertical]) .vertical-arrow-container{position:absolute;left:0;top:36px;z-index:1;background-color:var(--calcite-ui-foreground-1);padding-left:0.625rem;padding-right:0.625rem;margin-left:1px;margin-right:1px}:host([scale=s][range]:not([layout=vertical])) .calendar-picker-wrapper{width:216px}:host([scale=s][range]:not([layout=vertical])) .horizontal-arrow-container{height:30px}:host([scale=m][range]:not([layout=vertical])) .calendar-picker-wrapper{width:286px}:host([scale=l][range]:not([layout=vertical])) .calendar-picker-wrapper{width:398px}:host([scale=l][range]:not([layout=vertical])) .horizontal-arrow-container{height:54px}.menu-container{display:block;position:absolute;z-index:900;-webkit-transform:scale(0);transform:scale(0);visibility:hidden;pointer-events:none}:host([active]) .menu-container{pointer-events:initial;visibility:visible}.input .calcite-input-wrapper{margin-top:0}:host([range][layout=vertical][scale=s]) .vertical-arrow-container{top:24px}:host([range][layout=vertical][scale=l]) .vertical-arrow-container{top:50px;padding-left:0.875rem;padding-right:0.875rem}:host([range][layout=vertical][active]) .vertical-arrow-container{display:none}";export{g as calcite_input_date_picker}