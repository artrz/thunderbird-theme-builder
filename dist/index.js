import*as u from"fs";import C from"adm-zip";var l={ensureDirectory(e){this.pathExists(e)||u.mkdirSync(e,{recursive:!0})},pathExists(e){return u.existsSync(e)},readFile(e,t){return u.readFileSync(e,{encoding:t??"utf8"})},zipCompress(e,t){let r=new C;for(let o of t)typeof o=="string"?r.addLocalFile(o):r.addFile(o.filename,Buffer.from(o.content,"utf8"));return r.writeZip(e),e}};function h(e){let t=k(),r=j(t,e);return t.extra.thunderbird={name:r.name??t.displayName??t.name,version:r.version??t.version,themeId:r.themeId??`${t.name}@addons.thunderbird.net`,thunderbirdMinVersion:r.thunderbirdMinVersion??"115.0",stylesheet:r.stylesheet,author:{name:r.author?.name??t.author?.name,url:r.author?.url??t.author?.url},srcDir:r.srcDir??"src",outDir:r.outDir??"build",assetsDir:r.assetsDir},t}function k(){let e=JSON.parse(l.readFile("package.json"));return e.extra||(e.extra={thunderbird:{}}),e}function j(e,t){return{...e.extra?.thunderbird??{},...t??{}}}import i from"joi";var p={generate(e,t,r,o){let n=r.extra.thunderbird;return{manifest_version:2,name:r.displayName??r.name,version:n.version,description:r.description,author:r.author?.name,homepage_url:r.author?.url,browser_specific_settings:{gecko:{id:n.themeId,strict_min_version:n.thunderbirdMinVersion}},theme:{colors:e.colors,images:t},theme_experiment:{stylesheet:o,colors:e.experimentColors}}},validate(e){let t=i.object({name:i.string().required(),version:i.string().pattern(/^(0|[1-9][0-9]{0,8})([.](0|[1-9][0-9]{0,8})){0,3}$/u).required(),displayName:i.string(),description:i.string(),author:i.object({name:i.string(),url:i.string()}),extra:i.object({thunderbird:i.object({name:i.string().required(),version:i.string().pattern(/^\d+([.]\d+){0,2}$/u),themeId:i.alternatives().try(i.string().email({tlds:{allow:!1}}),i.string().pattern(/^\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}$/iu)),thunderbirdMinVersion:i.string().pattern(/^\d+(\.\d+)?$/u).required(),stylesheet:i.string(),author:i.object({name:i.string(),url:i.string()}).required(),srcDir:i.string().required(),outDir:i.string().required(),assetsDir:i.string()})})}).unknown();i.assert(e,t);let r=e.extra.thunderbird;if(r.assetsDir&&!l.pathExists(r.assetsDir))throw new Error(`Invalid assets directory '${r.assetsDir}'`)}};import T from"path";import{readdirSync as M}from"fs";import*as b from"sass";import f from"path";var g={processFile(e){return e?{content:b.compile(e,{style:"expanded"}).css,filename:f.format({...f.parse(e),dir:"",base:"",ext:".css"})}:void 0},getStyleFilePath(e){let t=e.stylesheet?f.join(e.srcDir,e.stylesheet):void 0;if(t&&!l.pathExists(t))throw new Error(`Style file "${t}" not found.`);return t}};import a from"joi";var x={color_scheme:{themecol_light_01:"#336699"},theme_colors:{button_background_active:"",button_background_hover:"",frame:"",frame_inactive:"",icons:"",icons_attention:"",popup:"",popup_border:"",popup_highlight:"",popup_highlight_text:"",popup_text:"",sidebar:"",sidebar_border:"",sidebar_highlight:"",sidebar_highlight_border:"",sidebar_highlight_text:"",sidebar_text:"",tab_background_separator:"",tab_background_text:"",tab_line:"",tab_loading:"",tab_selected:"",tab_text:"",toolbar:"",toolbar_bottom_separator:"",toolbar_field:"",toolbar_field_border:"",toolbar_field_border_focus:"",toolbar_field_focus:"",toolbar_field_highlight:"",toolbar_field_highlight_text:"",toolbar_field_text:"",toolbar_field_text_focus:"",toolbar_text:"",toolbar_top_separator:"",toolbar_vertical_separator:""},theme_experiment_colors:{}};var _={parseColors(e){let t=$(e.color_scheme,e.theme_colors??{}),{colors:r,experimentColors:o}=w(e.color_scheme,e.theme_experiment_colors??{}),{colors:n,experimentColors:s}=D(e.color_scheme);return{colors:{...t,...r,...n},experimentColors:{...o,...s}}},validate(e){let t=a.object({color_scheme:a.object().pattern(a.string(),a.string().pattern(/^#([0-9a-fA-F]{3,4})|([0-9a-fA-F]{6,8})$/u)).required(),theme_colors:a.object().pattern(a.string(),a.string()),theme_experiment_colors:a.object().pattern(a.string(),a.string()),images:a.object().pattern(a.string(),a.string())});a.assert(e,t),F(e);let r=[...Object.values(e.theme_colors??{}),...Object.values(e.theme_experiment_colors??{})].filter((s,c,d)=>s===d[c]),o=r.filter(s=>!(s in e.color_scheme));if(o.length>0)throw new Error(`Missing color definitions:
${m(o)}`);let n=Object.keys(e.color_scheme).filter(s=>!r.includes(s));n.length>0&&console.warn(`* Colors not referenced in 'theme_colors' nor 'theme_experiment_colors':
${m(n)}`)}};function $(e,t){return Object.entries(t).reduce((r,[o,n])=>(r[o]=e[n],r),{})}function w(e,t){return Object.entries(t).reduce((r,[o,n])=>{let s=n+o.replaceAll("-","_"),c=e[n];return r.colors[s]=c,r.experimentColors[s]=o,r},{colors:{},experimentColors:{}})}function D(e){return Object.entries(e).reduce((t,[r,o])=>{t.colors[r]=o;let n=`--${r}`;return t.experimentColors[r]=n,t},{colors:{},experimentColors:{}})}function F(e){S(e),P(e)}function P(e){if(!e.theme_colors)return;let t=O(),r=Object.keys(e.theme_colors),o=r.filter(s=>!t.includes(s));if(o.length)throw new Error(`Invalid color keys:
${m(o)}
Valid colors are:
${m(t)}`);let n=t.filter(s=>!r.includes(s));n.length&&console.warn(`* Theme colors missing in 'theme_colors':
${m(n)}`)}function S(e){let t=Object.values(e.color_scheme).map(o=>o.replaceAll(" ","")),r=E(t);if(r.length)throw new Error(`Duplicated color keys:
${m(r)}`)}function E(e){return[...new Set(e.filter((t,r,o)=>o.indexOf(t)!==r))]}function O(){let e=x.theme_colors;return Object.keys(e)}function m(e){return JSON.stringify(e,null,1)}function ne(e,t){let r=h(t),o=r.extra.thunderbird;l.ensureDirectory(o.outDir);try{p.validate(r),_.validate(e)}catch(v){console.error(v),console.log();return}let n=g.getStyleFilePath(o),s=g.processFile(n),c=_.parseColors(e),d=p.generate(c,e.images,r,s?.filename),y=q(d,r,s);I(d,y)}function q(e,t,r){let o=[{filename:"manifest.json",content:JSON.stringify(e,null,1)}];if(r&&o.push({filename:r.filename,content:r.content}),t.extra.thunderbird.assetsDir){let{assetsDir:c}=t.extra.thunderbird;M(c).forEach(d=>{o.push(T.join(c,d))})}let n=`${t.name.replaceAll(".","-")}.xpi`,s=T.join(t.extra.thunderbird.outDir,n);return l.zipCompress(s,o),s}function I(e,t){let r=[`Theme: ${e.name}`,`Id: ${e.browser_specific_settings.gecko.id}`,`Version: ${e.version}`,`File: ${t}`],o=r.reduce((n,s)=>s.length>n?s.length:n,0);console.log(`
 .${"-".repeat(o)}. `);for(let n of r){let s=" ".repeat(o-n.length);console.log(`| ${n}${s} |`)}console.log(` '${"-".repeat(o)}' `)}export{ne as build};