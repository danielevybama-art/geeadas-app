/* GEEAD ABIDJAN SUD — Croissance : nouvelles cellules, réseau et talents */

function opportunities(){
  var covered=new Set(DB.cells.map(function(c){ return norm(c.etablissement); }).filter(Boolean)), map=new Map();
  DB.members.forEach(function(m){ var k=norm(m.etablissement); if(!k||covered.has(k)) return; var e=map.get(k)||{nom:m.etablissement,membres:[]}; e.membres.push(m); map.set(k,e); });
  return Array.from(map.values()).sort(function(a,b){ return b.membres.length-a.membres.length; });
}
RENDER.opportunites=function(){
  var O=opportunities(), seuil=DB.settings.seuil, prets=O.filter(function(o){ return o.membres.length>=seuil; }), iso=DB.members.filter(function(m){ return !m.celluleId; });
  var html='<div class="hero" style="margin-bottom:16px"><div class="hi">Croissance et multiplication</div><div class="big" data-count="'+prets.length+'">0</div><div class="cap">établissement(s) comptent au moins '+seuil+' GEEADISTES sans cellule-école. Prêts pour une nouvelle cellule.</div></div>'+
    '<div class="grid g2"><div class="card"><div class="card-h"><div><h3>Établissements sans cellule</h3><div class="sub">Seuil de création : '+seuil+' membres (modifiable dans Paramètres)</div></div></div><div class="list">'+
    (O.slice(0,30).map(function(o){ var n=o.membres.length, f=o.membres.filter(function(m){ return m.sexe==='F'; }).length, ok=n>=seuil;
      return '<div class="li" style="cursor:default"><span class="av" style="background:'+(ok?'var(--gold)':'var(--surface-2)')+';color:'+(ok?'#3a2600':'var(--mut)')+'">'+I('cap')+'</span><div class="t"><b>'+esc(o.nom)+'</b><span>'+n+' membres · '+f+' F · '+(n-f)+' G · '+new Set(o.membres.map(function(m){ return m.celluleId; }).filter(Boolean)).size+' cellule(s) d\'origine</span><div class="trk" style="height:6px;border-radius:6px;background:var(--surface-2);margin-top:6px;overflow:hidden"><i style="display:block;height:100%;width:'+Math.min(100,n/seuil*100)+'%;background:'+(ok?'var(--gold)':'var(--brand)')+';border-radius:6px"></i></div></div><div class="r">'+(ok&&can('cellules')?'<button class="btn sm gold" data-act="mkcell" data-v="'+esc(o.nom)+'">'+I('plus')+'Créer</button>':'<span class="badge grey">'+n+'/'+seuil+'</span>')+'</div></div>'; }).join('')||emptyState('checkc','Tous les établissements sont couverts',''))+'</div></div>'+
    '<div class="card"><div class="card-h"><div><h3>Jeunes isolés</h3><div class="sub">'+iso.length+' membre(s) recensé(s) sans cellule</div></div></div><div class="list">'+(iso.map(function(m){ return memberLi(m, canEdit()?'<button class="btn sm" data-act="transfer" data-id="'+esc(m.id)+'">'+I('swap')+'Rattacher</button>':''); }).join('')||emptyState('checkc','Aucun isolé',''))+'</div></div></div>';
  return {html:html};
};

/* Réseau et talents */
RENDER.reseau=function(){
  var html='<div class="toolbar"><div class="search">'+I('search')+'<input id="rq" placeholder="École, filière, talent, nom…" value="'+esc(ST.rq)+'" autocomplete="off" aria-label="Filtrer"></div><div class="seg full">'+[['etab','Établissements'],['mentors','Mentors'],['talents','Talents']].map(function(t){ return '<button class="'+(ST.rTab===t[0]?'on':'')+'" data-act="rtab" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div></div><div id="rbody"></div>';
  return {html:html, mount:function(){ drawReseau(); $('#rq').oninput=function(e){ ST.rq=e.target.value; drawReseau(); }; }};
};
function drawReseau(){
  var q=norm(ST.rq), M=scopeM().filter(function(m){ return m.annuaire!==false&&(!q||norm([m.etablissement,m.filiere,m.talents,m.nom,m.prenoms].join(' ')).indexOf(q)>=0); }), h='';
  if(ST.rTab==='etab'){
    var g=new Map(); M.forEach(function(m){ var k=norm(m.etablissement); if(!k) return; var x=g.get(k)||{nom:m.etablissement,m:[]}; x.m.push(m); g.set(k,x); });
    var G=Array.from(g.values()).sort(function(a,b){ return b.m.length-a.m.length; });
    h='<div class="grid g2">'+(G.slice(0,40).map(function(x){ var fil=countBy(x.m,function(m){ return m.filiere||'Non précisé'; }).sort(function(a,b){ return b[1]-a[1]; });
      return '<div class="card"><div class="card-h"><div><h3>'+esc(x.nom)+'</h3><div class="sub">'+x.m.length+' GEEADISTE(s) · '+fil.length+' filière(s)</div></div><span class="av sm" style="background:'+avColor(x.nom)+'">'+I('cap')+'</span></div><div class="chips" style="flex-wrap:wrap;margin-bottom:10px">'+fil.map(function(f){ return '<span class="badge grey">'+esc(f[0])+' · '+f[1]+'</span>'; }).join('')+'</div><div style="display:flex">'+x.m.slice(0,8).map(function(m,i){ return '<span data-act="member" data-id="'+esc(m.id)+'" style="margin-left:'+(i?-10:0)+'px;cursor:pointer;border:2px solid var(--surface);border-radius:13px;display:inline-flex">'+avatar(m,'sm')+'</span>'; }).join('')+(x.m.length>8?'<span class="av sm" style="margin-left:-10px;background:var(--surface-2);color:var(--mut);border:2px solid var(--surface)">+'+(x.m.length-8)+'</span>':'')+'</div></div>'; }).join('')||'')+'</div>'+(G.length?'':emptyState('search','Aucun résultat',''));
  } else if(ST.rTab==='mentors'){
    var sup=['Licence 3','Master 1','Master 2','Doctorat'], men=M.filter(function(m){ return sup.indexOf(m.niveau)>=0; }), byF=new Map();
    men.forEach(function(m){ var k=m.filiere||'Autre'; byF.set(k,(byF.get(k)||[]).concat([m])); });
    h='<p class="sm mut" style="margin-bottom:12px">Étudiants de Licence 3 et plus, disponibles pour accompagner les plus jeunes dans leur filière.</p><div class="grid g2">'+Array.from(byF.entries()).sort(function(a,b){ return b[1].length-a[1].length; }).map(function(e){ return '<div class="card"><div class="card-h"><h3>'+esc(e[0])+'</h3><span class="badge">'+e[1].length+' mentor(s)</span></div><div class="list">'+e[1].map(function(m){ return memberLi(m,'<span class="badge blue">'+esc(m.niveau)+'</span>'); }).join('')+'</div></div>'; }).join('')+'</div>'+(men.length?'':emptyState('cap','Aucun mentor',''));
  } else {
    var T=M.filter(function(m){ return m.talents||(m.engagements||[]).length; });
    h='<div class="card" style="padding:8px 10px"><div class="list">'+(T.map(function(m){ return memberLi(m,'<span class="badge gold">'+esc(m.talents||(m.engagements||[]).join(', '))+'</span>'); }).join('')||emptyState('star','Aucun talent renseigné',''))+'</div></div>';
  }
  $('#rbody').innerHTML='<div class="stepv">'+h+'</div>';
}

