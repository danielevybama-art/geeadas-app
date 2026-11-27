/* GEEAD ABIDJAN SUD — Suivi spirituel et académique */

function lastContact(m){ var n=DB.notes.filter(function(x){ return x.membreId===m.id; }).map(function(x){ return x.date; }).sort().pop(); return n||null; }
function aRecontacter(M){ var lim=isoDay(new Date(Date.now()-60*86400000)); return M.filter(function(m){ var l=lastContact(m); return !l||l<lim; }).sort(function(a,b){ return (lastContact(a)||'').localeCompare(lastContact(b)||''); }); }
RENDER.suivi=function(){
  var M=scopeM(), N=scopeNotes().slice().sort(function(a,b){ return b.date.localeCompare(a.date); }), rc=aRecontacter(M);
  var d30=isoDay(new Date(Date.now()-30*86400000)), suivis=new Set(N.filter(function(n){ return n.date>=d30; }).map(function(n){ return n.membreId; })).size;
  var html='<div class="grid g3" style="margin-bottom:16px">'+kpi('heart','',N.filter(function(n){ return n.date>=d30; }).length,'Notes ces 30 derniers jours')+kpi('users','blue',M.length?Math.round(suivis/M.length*100):0,'Membres suivis ce mois','%')+kpi('alert','red',rc.length,'À recontacter (60 j)')+'</div>'+
    '<div class="grid g2"><div class="card"><div class="card-h"><div><h3>À recontacter</h3><div class="sub">Sans suivi depuis plus de 60 jours</div></div></div><div class="list">'+(rc.slice(0,25).map(function(m){ var l=lastContact(m); return memberLi(m, (canNote()?'<button class="btn sm" data-act="addnote" data-id="'+esc(m.id)+'">'+I('plus')+'Suivi</button>':'')+'<span class="xs mut">'+(l?fmtRel(l):'Jamais suivi')+'</span>'); }).join('')||emptyState('checkc','Tout le monde est suivi','Bravo !'))+'</div></div>'+
    '<div class="card"><div class="card-h"><div><h3>Notes récentes</h3><div class="sub">'+N.length+' notes au total</div></div></div>'+(N.length?'<ul class="tl">'+N.slice(0,25).map(function(n){ var m=DB.members.find(function(x){ return x.id===n.membreId; }); return '<li><b><a href="#" data-act="member" data-id="'+esc(n.membreId)+'">'+esc(m?fullName(m):n.membreId)+'</a></b> · <span class="badge grey">'+esc(n.type)+'</span><div class="m">'+fmtD(n.date)+' · '+esc(n.par)+'</div><p>'+esc(n.txt)+'</p></li>'; }).join('')+'</ul>':emptyMini('Aucune note pour le moment.'))+'</div></div>';
  return {html:html};
};

