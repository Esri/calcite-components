var n=function(){return(n=Object.assign||function(n){for(var t,r=1,i=arguments.length;r<i;r++)for(var u in t=arguments[r])Object.prototype.hasOwnProperty.call(t,u)&&(n[u]=t[u]);return n}).apply(this,arguments)},t=function(){this.start=0,this.end=0,this.previous=null,this.parent=null,this.rules=null,this.parsedCssText="",this.cssText="",this.atRule=!1,this.type=0,this.keyframesName="",this.selector="",this.parsedSelector=""};function r(n){return i(function(n){var r=new t;r.start=0,r.end=n.length;for(var i=r,u=0,f=n.length;u<f;u++)if(n[u]===e){i.rules||(i.rules=[]);var s=i,a=s.rules[s.rules.length-1]||null;(i=new t).start=u+1,i.parent=s,i.previous=a,s.rules.push(i)}else n[u]===o&&(i.end=u+1,i=i.parent||r);return r}(n=function(n){return n.replace(f.comments,"").replace(f.port,"")}(n)),n)}function i(n,t){var r=t.substring(n.start,n.end-1);if(n.parsedCssText=n.cssText=r.trim(),n.parent){r=(r=(r=function(n){return n.replace(/\\([0-9a-f]{1,6})\s/gi,(function(){for(var n=arguments[1],t=6-n.length;t--;)n="0"+n;return"\\"+n}))}(r=t.substring(n.previous?n.previous.end:n.parent.start,n.start-1))).replace(f.multipleSpaces," ")).substring(r.lastIndexOf(";")+1);var e=n.parsedSelector=n.selector=r.trim();n.atRule=0===e.indexOf(c),n.atRule?0===e.indexOf(a)?n.type=u.MEDIA_RULE:e.match(f.keyframesRule)&&(n.type=u.KEYFRAMES_RULE,n.keyframesName=n.selector.split(f.multipleSpaces).pop()):n.type=0===e.indexOf(s)?u.MIXIN_RULE:u.STYLE_RULE}var o=n.rules;if(o)for(var v=0,h=o.length,l=void 0;v<h&&(l=o[v]);v++)i(l,t);return n}var u={STYLE_RULE:1,KEYFRAMES_RULE:7,MEDIA_RULE:4,MIXIN_RULE:1e3},e="{",o="}",f={comments:/\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,port:/@import[^;]*;/gim,customProp:/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,mixinProp:/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,mixinApply:/@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,varApply:/[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,keyframesRule:/^@[^\s]*keyframes/,multipleSpaces:/\s+/g},s="--",a="@media",c="@";function v(n,t,r){n.lastIndex=0;var i=t.substring(r).match(n);if(i){var u=r+i.index;return{start:u,end:u+i[0].length}}return null}var h=/\bvar\(/,l=/\B--[\w-]+\s*:/,m=/\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,p=/^[\t ]+\n/gm;function d(n,t,r){var i=function(n,t){var r=v(h,n,t);if(!r)return null;var i=function(n,t){for(var r=0,i=t;i<n.length;i++){var u=n[i];if("("===u)r++;else if(")"===u&&--r<=0)return i+1}return i}(n,r.start),u=n.substring(r.end,i-1).split(","),e=u[0],o=u.slice(1);return{start:r.start,end:i,propName:e.trim(),fallback:o.length>0?o.join(",").trim():void 0}}(n,r);if(!i)return t.push(n.substring(r,n.length)),n.length;var u=i.propName,e=null!=i.fallback?w(i.fallback):void 0;return t.push(n.substring(r,i.start),(function(n){return function(n,t,r){return n[t]?n[t]:r?y(r,n):""}(n,u,e)})),i.end}function y(n,t){for(var r="",i=0;i<n.length;i++){var u=n[i];r+="string"==typeof u?u:u(t)}return r}function g(n,t){for(var r=!1,i=!1,u=t;u<n.length;u++){var e=n[u];if(r)i&&'"'===e&&(r=!1),i||"'"!==e||(r=!1);else if('"'===e)r=!0,i=!0;else if("'"===e)r=!0,i=!1;else{if(";"===e)return u+1;if("}"===e)return u}}return u}function w(n){var t=0;n=function(n){for(var t="",r=0;;){var i=v(l,n,r),u=i?i.start:n.length;if(t+=n.substring(r,u),!i)break;r=g(n,u)}return t}(n=n.replace(m,"")).replace(p,"");for(var r=[];t<n.length;)t=d(n,r,t);return r}function b(n){var t={};n.forEach((function(n){n.declarations.forEach((function(n){t[n.prop]=n.value}))}));for(var r={},i=Object.entries(t),u=function(){var n=!1;if(i.forEach((function(t){var i=t[0],u=y(t[1],r);u!==r[i]&&(r[i]=u,n=!0)})),!n)return"break"},e=0;e<10&&"break"!==u();e++);return r}function E(n,t){if(void 0===t&&(t=0),!n.rules)return[];var r=[];return n.rules.filter((function(n){return n.type===u.STYLE_RULE})).forEach((function(n){var i=function(n){for(var t,r=[];t=k.exec(n.trim());){var i=M(t[2]),u=i.value,e=i.important;r.push({prop:t[1].trim(),value:w(u),important:e})}return r}(n.cssText);i.length>0&&n.parsedSelector.split(",").forEach((function(n){n=n.trim(),r.push({selector:n,declarations:i,specificity:1,nu:t})})),t++})),r}var k=/(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};{])+)|\{([^}]*)\}(?:(?=[;\s}])|$))/gm;function M(n){var t=(n=n.replace(/\s+/gim," ").trim()).endsWith("!important");return t&&(n=n.substr(0,n.length-10).trim()),{value:n,important:t}}function R(n){var t=[];return n.forEach((function(n){t.push.apply(t,n.selectors)})),t}function A(n){var t=r(n),i=w(n);return{original:n,template:i,selectors:E(t),usesCssVars:i.length>1}}function L(n,t){if(n.some((function(n){return n.styleEl===t})))return!1;var r=A(t.textContent);return r.styleEl=t,n.push(r),!0}function $(n){var t=b(R(n));n.forEach((function(n){n.usesCssVars&&(n.styleEl.textContent=y(n.template,t))}))}function O(n,t,r){return function(n,t,r){return n.replace(RegExp(t,"g"),r)}(n,"\\."+t,"."+r)}function P(n,t){return Array.from(n.querySelectorAll("style:not([data-styles]):not([data-no-shim])")).map((function(n){return L(t,n)})).some(Boolean)}function I(n,t,r){var i=r.href;return fetch(i).then((function(n){return n.text()})).then((function(u){if(function(n){return n.indexOf("var(")>-1||U.test(n)}(u)&&r.parentNode){(function(n){return _.lastIndex=0,_.test(n)})(u)&&(u=function(n,t){var r=t.replace(/[^/]*$/,"");return n.replace(_,(function(n,t){return n.replace(t,r+t)}))}(u,i));var e=n.createElement("style");e.setAttribute("data-styles",""),e.textContent=u,L(t,e),r.parentNode.insertBefore(e,r),r.remove()}})).catch((function(n){console.error(n)}))}var U=/[\s;{]--[-a-zA-Z0-9]+\s*:/m,_=/url[\s]*\([\s]*['"]?(?!(?:https?|data)\:|\/)([^\'\"\)]*)[\s]*['"]?\)[\s]*/gim,j=function(){function t(n,t){this.win=n,this.doc=t,this.count=0,this.hostStyleMap=new WeakMap,this.hostScopeMap=new WeakMap,this.globalScopes=[],this.scopesMap=new Map,this.didInit=!1}return t.prototype.i=function(){var n=this;return this.didInit||!this.win.requestAnimationFrame?Promise.resolve():(this.didInit=!0,new Promise((function(t){n.win.requestAnimationFrame((function(){(function(n,t){"undefined"!=typeof MutationObserver&&new MutationObserver((function(){P(n,t)&&$(t)})).observe(document.head,{childList:!0})})(n.doc,n.globalScopes),function(n,t){return P(n,t),function(n,t){for(var r=[],i=n.querySelectorAll('link[rel="stylesheet"][href]:not([data-no-shim])'),u=0;u<i.length;u++)r.push(I(n,t,i[u]));return Promise.all(r)}(n,t).then((function(){$(t)}))}(n.doc,n.globalScopes).then((function(){return t()}))}))})))},t.prototype.addLink=function(n){var t=this;return I(this.doc,this.globalScopes,n).then((function(){t.updateGlobal()}))},t.prototype.addGlobalStyle=function(n){L(this.globalScopes,n)&&this.updateGlobal()},t.prototype.createHostStyle=function(t,r,i,u){if(this.hostScopeMap.has(t))throw Error("host style already created");var e=this.registerHostTemplate(i,r,u),o=this.doc.createElement("style");return o.setAttribute("data-no-shim",""),e.usesCssVars?u?(o["s-sc"]=r=e.scopeId+"-"+this.count,o.textContent="/*needs update*/",this.hostStyleMap.set(t,o),this.hostScopeMap.set(t,function(t,r){var i=t.template.map((function(n){return"string"==typeof n?O(n,t.scopeId,r):n})),u=t.selectors.map((function(i){return n(n({},i),{selector:O(i.selector,t.scopeId,r)})}));return n(n({},t),{template:i,selectors:u,scopeId:r})}(e,r)),this.count++):(e.styleEl=o,e.usesCssVars||(o.textContent=y(e.template,{})),this.globalScopes.push(e),this.updateGlobal(),this.hostScopeMap.set(t,e)):o.textContent=i,o},t.prototype.removeHost=function(n){var t=this.hostStyleMap.get(n);t&&t.remove(),this.hostStyleMap.delete(n),this.hostScopeMap.delete(n)},t.prototype.updateHost=function(n){var t=this.hostScopeMap.get(n);if(t&&t.usesCssVars&&t.isScoped){var r=this.hostStyleMap.get(n);if(r){var i=b(function(n,t,r){var i=[],u=function(n,t){for(var r=[];t;){var i=n.get(t);i&&r.push(i),t=t.parentElement}return r}(t,n);return r.forEach((function(n){return i.push(n)})),u.forEach((function(n){return i.push(n)})),function(n){return n.sort((function(n,t){return n.specificity===t.specificity?n.nu-t.nu:n.specificity-t.specificity})),n}(R(i).filter((function(t){return function(n,t){return":root"===t||"html"===t||n.matches(t)}(n,t.selector)})))}(n,this.hostScopeMap,this.globalScopes));r.textContent=y(t.template,i)}}},t.prototype.updateGlobal=function(){$(this.globalScopes)},t.prototype.registerHostTemplate=function(n,t,r){var i=this.scopesMap.get(t);return i||((i=A(n)).scopeId=t,i.isScoped=r,this.scopesMap.set(t,i)),i},t}();!function(n){!n||n.__cssshim||n.CSS&&n.CSS.supports&&n.CSS.supports("color","var(--c)")||(n.__cssshim=new j(n,n.document))}("undefined"!=typeof window&&window);