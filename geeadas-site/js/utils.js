/* GEEAD ABIDJAN SUD — Fonctions utilitaires */

function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.from((r || document).querySelectorAll(s)); }
function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function norm(s){ return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
function isoDay(d){ d = d || new Date(); return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
function today(){ return isoDay(); }
function nowISO(){ return new Date().toISOString(); }
function ageOf(d){ if(!d) return null; var b=new Date(d), n=new Date(); var a=n.getFullYear()-b.getFullYear(); if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate())) a--; return isNaN(a)?null:a; }
function fmtD(d){ return d ? new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) : '—'; }
function fmtRel(d){ if(!d) return ''; var s=(Date.now()-new Date(d).getTime())/1000; if(s<60) return 'à l\'instant'; if(s<3600) return 'il y a '+Math.floor(s/60)+' min'; if(s<86400) return 'il y a '+Math.floor(s/3600)+' h'; var j=Math.floor(s/86400); if(j<30) return 'il y a '+j+' j'; return fmtD(d); }
function fmtN(n){ return Number(n||0).toLocaleString('fr-FR'); }
function initials(m){ return ((m.nom||'')[0]||'') + ((m.prenoms||'')[0]||''); }
function fullName(m){ return ((m.nom||'').toUpperCase()+' '+(m.prenoms||'')).trim(); }
function firstName(n){ return String(n||'').split(' ')[0]; }
function telIntl(t){ var d=String(t||'').replace(/\D/g,''); if(!d) return ''; if(d.length===10) d='225'+d; return d; }
function fmtTel(t){ var d=String(t||'').replace(/\D/g,''); if(d.length===10) return d.replace(/(\d{2})(?=\d)/g,'$1 ').trim(); return t||''; }
function hue(s){ var h=0; s=String(s||''); for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h; }
var AV_COLORS=['#0b7a3e','#0f8f6b','#d98b05','#2a6fdb','#7a4fd6','#c2410c','#0e7490','#4d7c0f'];
function avColor(s){ return AV_COLORS[hue(s)%AV_COLORS.length]; }
function csvCell(v){ var s=String(v==null?'':v); return /[";\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s; }
function parseCSV(text){
  var first=text.split('\n')[0]; var sep=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
  var rows=[],row=[],f='',q=false;
  for(var i=0;i<text.length;i++){ var c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){f+='"';i++;} else q=false; } else f+=c; }
    else if(c==='"') q=true; else if(c===sep){ row.push(f); f=''; } else if(c==='\n'){ row.push(f); rows.push(row); row=[]; f=''; } else if(c!=='\r') f+=c; }
  if(f||row.length){ row.push(f); rows.push(row); }
  return rows.filter(function(r){ return r.some(function(x){ return x.trim(); }); });
}
function parseDateFR(s){ s=String(s||'').trim(); var m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/); if(m) return m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0'); m=s.match(/^(\d{4})-(\d{2})-(\d{2})/); return m?m[0]:''; }
function resizePhoto(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){ var img=new Image(); img.onload=function(){ var W=300,H=375,c=document.createElement('canvas'); c.width=W;c.height=H; var x=c.getContext('2d'); var s=Math.max(W/img.width,H/img.height); var w=img.width*s,h=img.height*s; x.drawImage(img,(W-w)/2,(H-h)/2,w,h); res(c.toDataURL('image/jpeg',.74)); }; img.onerror=rej; img.src=r.result; }; r.onerror=rej; r.readAsDataURL(file); }); }
function completude(m){ var keys=['photo','telephone','whatsapp','etablissement','niveau','filiere','eglise','commune','naissance']; var n=keys.filter(function(k){ return m[k]; }).length; return Math.round(n/keys.length*100); }


function loadScript(src){ return new Promise(function(res,rej){ var s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
function hideSplash(){ var s=$('#splash'); if(s){ s.classList.add('out'); setTimeout(function(){ s.remove(); },500); } }
