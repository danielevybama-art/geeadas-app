/* GEEAD ABIDJAN SUD — Composants d'interface */

/* Retours tactiles et micro-interactions */
function haptic(kind){ if(PREF.haptic===false) return; try{ if(navigator.vibrate) navigator.vibrate(kind==='success'?[14,50,22]:kind==='error'?[40,60,40]:kind==='heavy'?18:9); }catch(e){} }
document.addEventListener('pointerdown', function(e){
  var el=e.target.closest('.btn,.li,.chip,.tile,.task,.qa a,.qa button,.acct,.opt,.bnav a');
  if(!el) return; haptic();
  if(!el.matches('.btn,.li,.tile,.task,.acct')) return;
  var r=el.getBoundingClientRect(), s=Math.max(r.width,r.height), sp=document.createElement('span');
  sp.className='ripple'; sp.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px';
  if(getComputedStyle(el).position==='static') el.style.position='relative';
  el.appendChild(sp); setTimeout(function(){ sp.remove(); },600);
}, {passive:true});
function toast(msg, kind){
  var box=$('#toasts'), t=document.createElement('div'); t.className='toast '+(kind==='err'?'err':'');
  t.innerHTML='<span class="ti">'+I(kind==='err'?'x':'check')+'</span><span></span>'; t.lastChild.textContent=msg; box.appendChild(t);
  haptic(kind==='err'?'error':'success');
  setTimeout(function(){ t.classList.add('out'); setTimeout(function(){ t.remove(); },300); }, 2800);
}
function countUp(root){
  $$('[data-count]', root).forEach(function(el){ var to=parseFloat(el.dataset.count), dec=(el.dataset.count.split('.')[1]||'').length, t0=performance.now(), d=900;
    (function f(t){ var p=Math.min(1,(t-t0)/d), e=1-Math.pow(1-p,3); el.textContent=(to*e).toLocaleString('fr-FR',{minimumFractionDigits:dec,maximumFractionDigits:dec})+(el.dataset.suf||''); if(p<1) requestAnimationFrame(f); })(t0); });
}
function confetti(){
  var c=document.createElement('div'); c.className='confetti'; var cols=['#0b7a3e','#f4a51c','#14a356','#ffd27a','#2a6fdb'];
  for(var i=0;i<60;i++){ var p=document.createElement('i'); p.style.left=Math.random()*100+'%'; p.style.background=cols[i%cols.length]; p.style.setProperty('--x',(Math.random()*200-100)+'px'); p.style.setProperty('--r',(Math.random()*720)+'deg'); p.style.animationDelay=Math.random()*.3+'s'; c.appendChild(p); }
  document.body.appendChild(c); setTimeout(function(){ c.remove(); },2200);
}
function copyText(txt, okMsg){ (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){ toast(okMsg||'Copié'); }).catch(function(){ showText('Copier', txt); }); }
function showText(title, txt){ openSheet({title:title, auto:true, body:'<p class="sm mut" style="margin-bottom:10px">Sélectionnez puis copiez le contenu.</p><textarea rows="10" readonly id="txtout">'+esc(txt)+'</textarea>', foot:'<button class="btn pri" data-act="copyout">'+I('copy')+'Copier</button>'}); }
function download(name, text){
  if(IN_FRAME){ showText('Export : '+name, text); return; }
  try{ var blob=new Blob(['﻿'+text],{type:'text/csv;charset=utf-8'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); toast('Fichier téléchargé : '+name); }
  catch(e){ showText('Export : '+name, text); }
}

/* Panneaux et boîtes de dialogue */
var sheetStack=[];
function openSheet(o){
  var scrim=document.createElement('div'); scrim.className='scrim';
  var sh=document.createElement('section'); sh.className='sheet'+(o.wide?' wide':'')+(o.auto?' auto':''); sh.setAttribute('role','dialog'); sh.setAttribute('aria-modal','true');
  sh.innerHTML='<div class="grab"></div><header class="sheet-h">'+(o.back?'<button class="btn icon ghost" data-act="closesheet" aria-label="Retour">'+I('chevl')+'</button>':'')+'<h2></h2><button class="btn icon ghost" data-act="closesheet" aria-label="Fermer">'+I('x')+'</button></header><div class="sheet-b">'+(o.body||'')+'</div>'+(o.foot?'<footer class="sheet-f">'+o.foot+'</footer>':'');
  sh.querySelector('h2').textContent=o.title||'';
  document.body.appendChild(scrim); document.body.appendChild(sh);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ scrim.classList.add('on'); sh.classList.add('on'); }); });
  scrim.onclick=closeSheet;
  // glisser vers le bas pour fermer (mobile)
  var g=sh.querySelector('.grab'), y0=null;
  g.addEventListener('pointerdown',function(e){ y0=e.clientY; sh.style.transition='none'; g.setPointerCapture(e.pointerId); });
  g.addEventListener('pointermove',function(e){ if(y0===null) return; var dy=Math.max(0,e.clientY-y0); sh.style.transform='translateY('+dy+'px)'; });
  g.addEventListener('pointerup',function(e){ var dy=e.clientY-y0; y0=null; sh.style.transition=''; sh.style.transform=''; if(dy>110) closeSheet(); });
  sheetStack.push({sh:sh,scrim:scrim,onClose:o.onClose});
  document.body.style.overflow='hidden';
  setTimeout(function(){ var f=sh.querySelector('.sheet-b input:not([type=file]),.sheet-b select'); if(f&&window.innerWidth>899&&o.focus!==false) f.focus({preventScroll:true}); },420);
  return sh;
}
function closeSheet(){ var s=sheetStack.pop(); if(!s) return; s.sh.classList.remove('on'); s.scrim.classList.remove('on'); setTimeout(function(){ s.sh.remove(); s.scrim.remove(); },420); if(!sheetStack.length) document.body.style.overflow=''; if(s.onClose) s.onClose(); }
function closeAllSheets(){ while(sheetStack.length) closeSheet(); }
function topSheet(){ return sheetStack.length?sheetStack[sheetStack.length-1].sh:null; }
function confirmDlg(o){ return new Promise(function(res){
  var scrim=document.createElement('div'); scrim.className='scrim'; scrim.style.zIndex=115;
  var d=document.createElement('div'); d.className='dialog'; d.setAttribute('role','alertdialog');
  d.innerHTML='<div class="ic" style="'+(o.tone==='brand'?'background:var(--brand-50);color:var(--brand)':'')+'">'+I(o.icon||'alert')+'</div><h3></h3><p></p><div class="row"><button class="btn" data-r="0">Annuler</button><button class="btn '+(o.tone==='brand'?'pri':'pri')+'" data-r="1" style="'+(o.tone==='brand'?'':'background:var(--red);border-color:var(--red);box-shadow:none')+'">'+esc(o.ok||'Confirmer')+'</button></div>';
  d.querySelector('h3').textContent=o.title; d.querySelector('p').textContent=o.text||'';
  document.body.appendChild(scrim); document.body.appendChild(d); haptic('heavy');
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ scrim.classList.add('on'); d.classList.add('on'); }); });
  function done(v){ d.classList.remove('on'); scrim.classList.remove('on'); setTimeout(function(){ d.remove(); scrim.remove(); },300); res(v); }
  d.onclick=function(e){ var b=e.target.closest('[data-r]'); if(b) done(b.dataset.r==='1'); }; scrim.onclick=function(){ done(false); };
}); }
function picker(title, opts, current, cb){
  var sh=openSheet({title:title, auto:true, focus:false, body:'<div class="list">'+opts.map(function(o){ return '<div class="li" data-v="'+esc(o[0])+'"><div class="t"><b>'+esc(o[1])+'</b>'+(o[2]?'<span>'+esc(o[2])+'</span>':'')+'</div>'+(String(current)===String(o[0])?'<span style="color:var(--brand)">'+I('check')+'</span>':'')+'</div>'; }).join('')+'</div>'});
  sh.querySelector('.list').onclick=function(e){ var li=e.target.closest('[data-v]'); if(!li) return; closeSheet(); cb(li.dataset.v); };
}


function logoMark(cls){ return '<span class="logo-mark '+(cls||'')+'"><img src="'+LOGO+'" alt="GEEAD ABIDJAN SUD"></span>'; }
