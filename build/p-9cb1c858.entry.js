import{r as t,c as s,h as i,g as h}from"./p-92cf559a.js";import{S as r}from"./p-b5f138bd.js";const e=class{constructor(i){t(this,i),this.calciteListOrderChange=s(this,"calciteListOrderChange",7),this.handleSelector="calcite-handle",this.disabled=!1,this.loading=!1,this.handleActivated=!1,this.items=[],this.observer=new MutationObserver((()=>{this.items=Array.from(this.el.children),this.setUpDragAndDrop()}))}connectedCallback(){this.items=Array.from(this.el.children),this.setUpDragAndDrop(),this.beginObserving()}disconnectedCallback(){this.observer.disconnect(),this.cleanUpDragAndDrop()}calciteHandleNudgeHandler(t){const s=this.items.find((s=>s.contains(t.detail.handle)||t.composedPath().includes(s))),i=this.items.length-1,h=this.items.indexOf(s);let r,e=!1;switch(t.detail.direction){case"up":t.preventDefault(),0===h?e=!0:r=h-1;break;case"down":t.preventDefault(),h===i?r=0:h===i-1?e=!0:r=h+2;break;default:return}this.observer.disconnect(),e?s.parentElement.appendChild(s):s.parentElement.insertBefore(s,this.items[r]),this.items=Array.from(this.el.children),t.detail.handle.activated=!0,t.detail.handle.setFocus(),this.beginObserving()}setUpDragAndDrop(){this.cleanUpDragAndDrop();const t={dataIdAttr:"id",group:this.group,handle:this.handleSelector,onUpdate:()=>{this.items=Array.from(this.el.children),this.calciteListOrderChange.emit()},onStart:()=>{this.observer.disconnect()},onEnd:()=>{this.beginObserving()}};this.dragSelector&&(t.draggable=this.dragSelector),this.sortable=r.create(this.el,t)}cleanUpDragAndDrop(){var t;null===(t=this.sortable)||void 0===t||t.destroy(),this.sortable=null}beginObserving(){this.observer.observe(this.el,{childList:!0,subtree:!0})}render(){return i("slot",null)}get el(){return h(this)}};export{e as calcite_sortable_list}