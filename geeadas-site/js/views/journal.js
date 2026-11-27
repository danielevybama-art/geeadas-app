/* GEEAD ABIDJAN SUD — Journal d'activité */

RENDER.journal=function(){
  var q=norm(ST.jq), L=DB.logs.slice().sort(function(a,b){ return b.date.localeCompare(a.date); }).filter(function(l){ return !q||norm([l.auteur,l.action,l.detail].join(' ')).indexOf(q)>=0; });
  var ic=function(a){ return /suppr/i.test(a)?['trash','red']:/valid/i.test(a)?['checkc','']:/annonce/i.test(a)?['mega','gold']:/compte/i.test(a)?['key','blue']:/suivi/i.test(a)?['heart','']:/cellule/i.test(a)?['layers','blue']:/import/i.test(a)?['upload','gold']:['edit','']; };
  var html='<div class="toolbar"><div class="search">'+I('search')+'<input id="jq" placeholder="Filtrer par auteur, action, identifiant…" value="'+esc(ST.jq)+'"></div></div><div class="card">'+(L.slice(0,200).map(function(l){ var x=ic(l.action); return '<div class="task" style="cursor:default"><span class="ic '+x[1]+'">'+I(x[0])+'</span><div class="t"><b>'+esc(l.action)+'</b><span>'+esc(l.detail)+'</span><span style="display:block">'+esc(l.auteur)+(l.celluleId?' · '+esc(cellName(l.celluleId)):'')+'</span></div><span class="xs mut" style="white-space:nowrap">'+fmtRel(l.date)+'</span></div>'; }).join('')||emptyState('list','Aucune activité',''))+'</div>';
  return {html:html, mount:function(){ var j=$('#jq'); j.oninput=function(){ ST.jq=j.value; var p=j.selectionStart; render(); var n=$('#jq'); n.focus(); n.setSelectionRange(p,p); }; }};
};

