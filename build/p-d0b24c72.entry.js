import{r as t,c as a,h as r,H as e,g as s}from"./p-92cf559a.js";const o=class{constructor(r){t(this,r),this.calciteRadioButtonGroupChange=a(this,"calciteRadioButtonGroupChange",7),this.disabled=!1,this.hidden=!1,this.layout="horizontal",this.required=!1,this.scale="m",this.passPropsToRadioButtons=()=>{const t=this.el.querySelectorAll("calcite-radio-button");t.length>0&&t.forEach((t=>{t.disabled=this.disabled||t.disabled,t.hidden=this.hidden,t.name=this.name,t.required=this.required,t.scale=this.scale}))}}onDisabledChange(){this.passPropsToRadioButtons()}onHiddenChange(){this.passPropsToRadioButtons()}onLayoutChange(){this.passPropsToRadioButtons()}onScaleChange(){this.passPropsToRadioButtons()}connectedCallback(){this.passPropsToRadioButtons()}radioButtonChangeHandler(t){this.calciteRadioButtonGroupChange.emit(t.target.value)}render(){return r(e,{role:"radiogroup"},r("slot",null))}get el(){return s(this)}static get watchers(){return{disabled:["onDisabledChange"],hidden:["onHiddenChange"],layout:["onLayoutChange"],scale:["onScaleChange"]}}};o.style="@-webkit-keyframes in{0%{opacity:0}100%{opacity:1}}@keyframes in{0%{opacity:0}100%{opacity:1}}@-webkit-keyframes in-down{0%{opacity:0;-webkit-transform:translate3D(0, -5px, 0);transform:translate3D(0, -5px, 0)}100%{opacity:1;-webkit-transform:translate3D(0, 0, 0);transform:translate3D(0, 0, 0)}}@keyframes in-down{0%{opacity:0;-webkit-transform:translate3D(0, -5px, 0);transform:translate3D(0, -5px, 0)}100%{opacity:1;-webkit-transform:translate3D(0, 0, 0);transform:translate3D(0, 0, 0)}}@-webkit-keyframes in-up{0%{opacity:0;-webkit-transform:translate3D(0, 5px, 0);transform:translate3D(0, 5px, 0)}100%{opacity:1;-webkit-transform:translate3D(0, 0, 0);transform:translate3D(0, 0, 0)}}@keyframes in-up{0%{opacity:0;-webkit-transform:translate3D(0, 5px, 0);transform:translate3D(0, 5px, 0)}100%{opacity:1;-webkit-transform:translate3D(0, 0, 0);transform:translate3D(0, 0, 0)}}@-webkit-keyframes in-scale{0%{opacity:0;-webkit-transform:scale3D(0.95, 0.95, 1);transform:scale3D(0.95, 0.95, 1)}100%{opacity:1;-webkit-transform:scale3D(1, 1, 1);transform:scale3D(1, 1, 1)}}@keyframes in-scale{0%{opacity:0;-webkit-transform:scale3D(0.95, 0.95, 1);transform:scale3D(0.95, 0.95, 1)}100%{opacity:1;-webkit-transform:scale3D(1, 1, 1);transform:scale3D(1, 1, 1)}}:root{--calcite-popper-transition:150ms ease-in-out}:host([hidden]){display:none}:host{display:-ms-flexbox;display:flex;max-width:100vw}:host([layout=horizontal]){-ms-flex-direction:row;flex-direction:row;-ms-flex-wrap:wrap;flex-wrap:wrap}:host([layout=horizontal][scale=s]){grid-gap:1rem;gap:1rem}:host([layout=horizontal][scale=m]){grid-gap:1.25rem;gap:1.25rem}:host([layout=horizontal][scale=l]){grid-gap:1.5rem;gap:1.5rem}:host([layout=vertical]){-ms-flex-direction:column;flex-direction:column}";export{o as calcite_radio_button_group}