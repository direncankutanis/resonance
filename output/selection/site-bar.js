/* Shared page chrome: one compact bar for the home link, demo budget unit and language. Load before i18n and demo-unit. */
(()=>{'use strict';
const RELEASE='0.9.8';
const script=document.currentScript,root=new URL('./',script&&script.src||document.baseURI).href;
const css=`
#site-bar{position:relative;z-index:40;display:flex;align-items:center;gap:8px 18px;flex-wrap:wrap;margin:0;padding:8px clamp(16px,3vw,32px);background:#0a131a;border-bottom:1px solid #22323a;color:#dfe7e3;font:13px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:0;box-sizing:border-box;width:100%;max-width:100%}
#site-bar *{box-sizing:border-box}
#site-bar a#site-home{display:inline-flex;align-items:center;gap:8px;min-height:36px;margin:0 auto 0 0;color:#e9e2d4;text-decoration:none;font:600 12px/1 system-ui,sans-serif;letter-spacing:2.2px;text-transform:uppercase}
#site-bar a#site-home:hover{color:#f3d9a8}
#site-bar #site-release{border:1px solid #3a4b52;border-radius:20px;padding:3px 8px;color:#a9bab4;font:500 11px/1.2 system-ui,sans-serif;letter-spacing:.3px;text-transform:none}
#site-bar #site-spacer{margin-right:auto}
#site-bar label{display:inline;margin:0;font:500 12px/1.4 system-ui,sans-serif;color:#aebdb7;letter-spacing:.2px}
#site-bar select{width:auto;min-width:0;min-height:36px;margin:0;padding:6px 30px 6px 10px;border:1px solid #3b4f57;border-radius:8px;background:#122029 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23c9d6d1' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right 10px center;color:#eef3f0;font:500 13px/1.2 system-ui,sans-serif;appearance:none;-webkit-appearance:none;cursor:pointer;max-width:100%}
#site-bar select:hover{border-color:#5f7a80}
#site-bar select:focus-visible,#site-bar a:focus-visible,#site-bar summary:focus-visible{outline:3px solid #edce91;outline-offset:2px}
#site-bar #demo-unit-control,#site-bar #language-control{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0;padding:0;border:0;background:none;color:inherit;font:inherit;max-width:100%}
#site-bar #demo-unit-info{position:static;margin:0}
#site-bar #demo-unit-info>summary{display:inline-grid;place-items:center;width:28px;height:28px;min-height:0;border:1px solid #3b4f57;border-radius:50%;color:#c9d6d1;font:600 13px/1 system-ui,sans-serif;cursor:pointer;list-style:none}
#site-bar #demo-unit-info>summary::-webkit-details-marker{display:none}
#site-bar #demo-unit-info[open]>summary{background:#22343c;border-color:#7c969b}
#site-bar #demo-unit-info>p{position:absolute;right:clamp(16px,3vw,32px);top:calc(100% + 6px);width:min(420px,calc(100vw - 32px));margin:0;padding:14px 16px;border:1px solid #3b4f57;border-radius:12px;background:#101c24;color:#d3ddd9;font:13px/1.55 system-ui,sans-serif;box-shadow:0 18px 40px #0009}
#site-bar #demo-unit-status:empty,#site-bar #language-status:empty{display:none}
#site-bar #demo-unit-status,#site-bar #language-status{flex-basis:100%;margin:0;color:#f3d9a8;font-size:12px}
@media(max-width:560px){#site-bar{gap:6px 10px}#site-bar label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}#site-bar #site-release{display:none}}
@media print{#site-bar{display:none}}
:where(a,button,select,input,textarea,summary,[tabindex]):focus-visible{outline:3px solid #edce91;outline-offset:3px}
::selection{background:#e2c48b;color:#141b22}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
`;
let bar=null;
function ensure(){
 if(bar)return bar;
 const style=document.createElement('style');style.id='site-bar-style';style.textContent=css;document.head.append(style);
 bar=document.createElement('div');bar.id='site-bar';bar.setAttribute('role','region');bar.setAttribute('aria-label','Site preferences');
 const here=location.href.split(/[?#]/)[0];
 if(here===root||here===root+'index.html'){const spacer=document.createElement('span');spacer.id='site-spacer';bar.append(spacer);}
 else{const home=document.createElement('a');home.id='site-home';home.href=root;home.innerHTML='<span aria-hidden="true">←</span> Resonance <span id="site-release"></span>';home.querySelector('#site-release').textContent='v'+RELEASE;bar.append(home);}
 document.body.prepend(bar);return bar;
}
if(!document.querySelector('link[rel~="icon"]')){const icon=document.createElement('link');icon.rel='icon';icon.type='image/svg+xml';icon.href=root+'favicon.svg';document.head.append(icon);}
window.ResonanceSiteBar={release:RELEASE,add(el){ensure().append(el);return true;}};
})();
