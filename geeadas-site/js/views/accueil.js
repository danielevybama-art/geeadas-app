/* GEEAD ABIDJAN SUD — Accueil : tableaux de bord régional et local */

RENDER.accueil=function(){ return isReg()?accueilReg():accueilLocal(); };
function greetLine(){ var parts=U.nom.split(' '); var prenom=parts[0]===parts[0].toUpperCase()&&parts.length>1?parts.slice(1).join(' '):parts[0]; var h=new Date().getHours(); return (h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir')+' '+prenom; }
function tasksFor(M){
  var t=[], dm=pendingDemandes().length; if(dm) t.push(['key','gold',dm,'Demandes d\'accès','Responsables en attente de validation','acces']);
  var ins=can('inscriptions')?scopeIns().length:0; if(ins) t.push(['inbox','gold',ins,'Inscriptions à valider','Fiches envoyées par les membres','validations']);
  var inc=canEdit()?M.filter(function(m){ return completude(m)<70; }).length:0; if(inc) t.push(['edit','blue',inc,'Fiches incomplètes','Photo, filière ou contacts manquants','membres-incomplets']);
  if(isReg()&&can('opportunites')){ var o=opportunities().filter(function(x){ return x.membres.length>=DB.settings.seuil; }).length; if(o) t.push(['pin','',o,'Cellules à créer','Établissements prêts','opportunites']);
    var iso=DB.members.filter(function(m){ return !m.celluleId; }).length; if(iso) t.push(['alert','red',iso,'Jeunes isolés','Recensés sans cellule','opportunites']); }
  var rc=can('suivi')?aRecontacter(M).length:0; if(rc) t.push(['heart','',rc,'À recontacter','Aucun suivi depuis 60 jours','suivi']);
  return t;
}
function tasksHTML(t){ return t.length?t.map(function(x){ return '<div class="task tap" data-act="goto" data-v="'+x[5]+'"><span class="ic '+x[1]+'">'+I(x[0])+'</span><div class="t"><b>'+esc(x[3])+'</b><span>'+esc(x[4])+'</span></div><span class="num">'+x[2]+'</span>'+I('chevr','mut')+'</div>'; }).join(''):emptyState('checkc','Tout est à jour','Aucune action en attente.'); }
function annoncesFor(){ return DB.annonces.filter(function(a){ return isReg()||a.cible==='all'||a.cible===U.celluleId; }).sort(function(a,b){ return b.date.localeCompare(a.date); }); }
function annonceCard(a, del){ return '<div class="task" style="cursor:default;align-items:flex-start"><span class="ic '+(a.important?'gold':'')+'">'+I('mega')+'</span><div class="t"><b>'+esc(a.titre)+(a.important?' <span class="badge gold">Important</span>':'')+'</b><span style="display:block;color:var(--ink-2);margin:4px 0 6px;font-size:13.5px">'+esc(a.texte)+'</span><span>'+esc(a.auteur)+' · '+esc(a.titre_auteur||'')+' · '+fmtD(a.date)+(isReg()?' · '+(a.cible==='all'?'Toutes les cellules':esc(cellName(a.cible))):'')+'</span></div>'+(del?'<button class="btn icon ghost sm" data-act="delannonce" data-id="'+esc(a.id)+'" aria-label="Supprimer">'+I('trash')+'</button>':'')+'</div>'; }

function statsBlock(M){
  var n=M.length, f=M.filter(function(m){ return m.sexe==='F'; }).length, el=M.filter(function(m){ return m.statut==='Élève'; }).length;
  var ages=M.map(function(m){ return ageOf(m.naissance); }).filter(function(a){ return a!==null; });
  var moy=ages.length?(ages.reduce(function(a,b){ return a+b; },0)/ages.length):0;
  var mois=isoDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  var nouveaux=M.filter(function(m){ return (m.dateInscription||'')>=mois; }).length;
  var completes=M.filter(function(m){ return completude(m)>=80; }).length;
  var etabs=new Set(M.map(function(m){ return norm(m.etablissement); }).filter(Boolean)).size;
  return {n:n,f:f,g:n-f,el:el,et:n-el,ages:ages,moy:moy,nouveaux:nouveaux,completes:completes,etabs:etabs,mineurs:ages.filter(function(a){ return a<18; }).length};
}
function accueilReg(){
  var M=ST.dashCell?DB.members.filter(function(m){ return m.celluleId===ST.dashCell; }):DB.members, s=statsBlock(M), cs=cumulSeries(M,12);
  var classement=DB.cells.map(function(c){ var L=DB.members.filter(function(m){ return m.celluleId===c.id; }); return [c.nom,L.length,c.id]; }).sort(function(a,b){ return b[1]-a[1]; });
  var parNiv=countBy(M,function(m){ return m.niveau; }).sort(function(a,b){ return ORDRE_NIV.indexOf(a[0])-ORDRE_NIV.indexOf(b[0]); });
  var etabMap=new Map(); M.forEach(function(m){ var k=norm(m.etablissement); if(!k) return; var e=etabMap.get(k)||[m.etablissement,0]; e[1]++; etabMap.set(k,e); });
  var topEtab=Array.from(etabMap.values()).sort(function(a,b){ return b[1]-a[1]; }).slice(0,7);
  var tr=[['Moins de 15 ans',0,14],['15 – 17 ans',15,17],['18 – 20 ans',18,20],['21 – 24 ans',21,24],['25 ans et +',25,200]].map(function(t){ return [t[0],s.ages.filter(function(a){ return a>=t[1]&&a<=t[2]; }).length]; });
  var be=M.filter(function(m){ return m.baptemeEau; }).length, bs=M.filter(function(m){ return m.baptemeEsprit; }).length;
  var c=cellById(ST.dashCell);
  var html='<div class="row between" style="margin:4px 0 16px"><div><h2 style="font-size:24px;font-weight:800">'+esc(greetLine())+'</h2><p class="mut sm" style="margin-top:4px">'+esc(U.titre)+' · '+new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+'</p></div>'+
    '<button class="chip '+(ST.dashCell?'on':'')+'" data-act="dashcell">'+I('filter')+(c?esc(c.nom):'Toute la région')+I('chevd')+'</button></div>'+
    '<div class="grid g3"><div class="hero span2"><div class="hi">'+(c?'Cellule '+esc(c.nom):'GEEADISTES recensés · Région '+esc(DB.settings.region))+'</div><div class="big" data-count="'+s.n+'">0</div><div class="cap">'+fmtN(s.el)+' élèves · '+fmtN(s.et)+' étudiants · '+s.etabs+' établissements</div><span class="pill">'+I('trend')+'+'+s.nouveaux+' ce mois-ci</span>'+sparkline(cs.vals)+
      '<div class="acts">'+(canEdit()?'<button class="btn w" data-act="newmember">'+I('userplus')+'Ajouter</button>':'')+(can('inscriptions')?'<button class="btn" data-act="goto" data-v="validations">'+I('inbox')+'Inscriptions ('+scopeIns().length+')</button>':'')+(pendingDemandes().length?'<button class="btn" data-act="goto" data-v="acces">'+I('key')+'Accès ('+pendingDemandes().length+')</button>':'')+(can('export')?'<button class="btn" data-act="exportall">'+I('download')+'Exporter</button>':'')+'</div></div>'+
    '<div class="card"><div class="card-h"><div><h3>À traiter</h3><div class="sub">Actions en attente dans la région</div></div></div>'+tasksHTML(tasksFor(M).slice(0,5))+'</div></div>'+
    '<div class="grid g4" style="margin-top:16px">'+
      kpi('layers','',ST.dashCell?(classement.findIndex(function(x){ return x[2]===ST.dashCell; })+1)+'e':DB.cells.length, ST.dashCell?'Rang sur '+DB.cells.length+' cellules':'Cellules actives')+
      kpi('heart','gold',s.n?Math.round(s.f/s.n*100):0,'Filles ('+s.f+') · '+s.g+' garçons','%')+
      kpi('checkc','blue',s.n?Math.round(s.completes/s.n*100):0,'Fiches complètes ('+s.completes+')','%')+
      kpi('cake','red',s.moy.toFixed(1),'Âge moyen · '+s.mineurs+' mineurs')+'</div>'+
    '<div class="grid g3" style="margin-top:16px"><div class="card span2"><div class="card-h"><div><h3>Évolution des effectifs</h3><div class="sub">Membres cumulés sur 12 mois</div></div><span class="badge">'+I('trend')+' +'+fmtN(cs.vals[11]-cs.vals[0])+' en 12 mois</span></div><div style="padding-bottom:24px">'+areaChart(cs.vals,cs.labels)+'</div></div>'+
      '<div class="card"><div class="card-h"><h3>Garçons et filles</h3></div>'+donut([{l:'Filles',v:s.f,c:'#f4a51c'},{l:'Garçons',v:s.g,c:'#0b7a3e'}],fmtN(s.n),'membres')+'<div style="height:16px"></div>'+donut([{l:'Élèves',v:s.el,c:'#0b7a3e'},{l:'Étudiants',v:s.et,c:'#2a6fdb'}],s.n?Math.round(s.el/s.n*100)+'%':'0%','élèves')+'</div></div>'+
    '<div class="grid g2" style="margin-top:16px">'+(ST.dashCell?'':'<div class="card"><div class="card-h"><div><h3>Classement des cellules</h3><div class="sub">Par nombre de membres</div></div><a class="btn sm" href="#cellules">Tout voir</a></div>'+bars(classement.slice(0,8),{rank:1,act:'cellsheet'})+'</div>')+
      '<div class="card"><div class="card-h"><div><h3>Niveaux d\'étude</h3><div class="sub"><span class="legend"><span><i style="background:#0b7a3e"></i>Élèves</span><span><i style="background:#f4a51c"></i>Étudiants</span></span></div></div></div>'+cols(parNiv,NIVEAUX['Élève'])+'</div>'+
      '<div class="card"><div class="card-h"><h3>Établissements les plus représentés</h3></div>'+bars(topEtab)+'</div>'+
      '<div class="card"><div class="card-h"><h3>Tranches d\'âge</h3></div>'+bars(tr,{gold:1})+'<div class="sec-t">Vie spirituelle</div>'+bars([['Baptisés d\'eau',be],['Baptisés du Saint-Esprit',bs],['Engagés dans un service',M.filter(function(m){ return (m.engagements||[]).length; }).length]])+'</div></div>';
  return {html:html};
}
function kpi(icon, tone, val, label, suf){ return '<div class="card kpi"><div class="ic '+tone+'">'+I(icon)+'</div><div class="v"><span data-count="'+(typeof val==='number'||/^[\d.]+$/.test(val)?val:'')+'" data-suf="'+(suf||'')+'">'+(typeof val==='number'||/^[\d.]+$/.test(val)?'0':esc(val))+'</span></div><div class="l">'+esc(label)+'</div></div>'; }
function accueilLocal(){
  var M=scopeM(), s=statsBlock(M), c=cellById(U.celluleId)||{nom:''}, cs=cumulSeries(M,8);
  var rank=DB.cells.map(function(x){ return [x.id, DB.members.filter(function(m){ return m.celluleId===x.id; }).length]; }).sort(function(a,b){ return b[1]-a[1]; }).findIndex(function(x){ return x[0]===U.celluleId; })+1;
  var mo=new Date().getMonth()+1, anniv=M.filter(function(m){ return m.naissance&&+m.naissance.slice(5,7)===mo; }).sort(function(a,b){ return a.naissance.slice(8).localeCompare(b.naissance.slice(8)); });
  var recents=M.slice().sort(function(a,b){ return (b.dateInscription||'').localeCompare(a.dateInscription||''); }).slice(0,5);
  var parNiv=countBy(M,function(m){ return m.niveau; }).sort(function(a,b){ return ORDRE_NIV.indexOf(a[0])-ORDRE_NIV.indexOf(b[0]); });
  var ann=annoncesFor().slice(0,3);
  var html='<div style="margin:4px 0 16px"><h2 style="font-size:24px;font-weight:800">'+esc(greetLine())+'</h2><p class="mut sm" style="margin-top:4px">'+esc(U.titre)+' · Cellule '+esc(c.nom)+'</p></div>'+
    '<div class="grid g3"><div class="hero span2"><div class="hi">Cellule '+esc(c.code||'')+' · '+esc(c.nom)+'</div><div class="big" data-count="'+s.n+'">0</div><div class="cap">GEEADISTES dans votre cellule · '+rank+'e sur '+DB.cells.length+' cellules</div><span class="pill">'+I('trend')+'+'+s.nouveaux+' ce mois-ci</span>'+sparkline(cs.vals)+
      '<div class="acts">'+(canEdit()?'<button class="btn w" data-act="newmember">'+I('userplus')+'Enregistrer un GEEADISTE</button>':'')+(can('inscriptions')?'<button class="btn" data-act="sharelink">'+I('share')+'Lien d\'inscription</button>':'')+'</div></div>'+
    '<div class="card"><div class="card-h"><h3>À traiter</h3></div>'+tasksHTML(tasksFor(M))+'</div></div>'+
    '<div class="grid g4" style="margin-top:16px">'+kpi('users','',s.el,'Élèves')+kpi('cap','blue',s.et,'Étudiants')+kpi('checkc','gold',s.completes,'Fiches complètes')+kpi('heart','red',scopeNotes().filter(function(n){ return n.date>=isoDay(new Date(Date.now()-30*86400000)); }).length,'Suivis ce mois')+'</div>'+
    '<div class="grid g2" style="margin-top:16px"><div class="card"><div class="card-h"><div><h3>Annonces du bureau régional</h3></div><a class="btn sm" href="#communication">Tout voir</a></div>'+(ann.length?ann.map(function(a){ return annonceCard(a); }).join(''):emptyMini('Aucune annonce.'))+'</div>'+
      '<div class="card"><div class="card-h"><div><h3>Anniversaires du mois</h3><div class="sub">'+anniv.length+' GEEADISTE(s)</div></div>'+I('cake','mut')+'</div><div class="list">'+(anniv.slice(0,6).map(function(m){ return memberLi(m,'<span class="badge gold">'+m.naissance.slice(8)+'/'+m.naissance.slice(5,7)+'</span>'); }).join('')||emptyMini('Aucun anniversaire ce mois-ci.'))+'</div></div>'+
      '<div class="card"><div class="card-h"><h3>Répartition</h3></div>'+donut([{l:'Filles',v:s.f,c:'#f4a51c'},{l:'Garçons',v:s.g,c:'#0b7a3e'}],fmtN(s.n),'membres')+'<div class="sec-t">Niveaux</div>'+cols(parNiv,NIVEAUX['Élève'])+'</div>'+
      '<div class="card"><div class="card-h"><h3>Derniers inscrits</h3><a class="btn sm" href="#membres">Tous</a></div><div class="list">'+(recents.map(function(m){ return memberLi(m); }).join('')||emptyMini('Aucun membre.'))+'</div></div></div>';
  return {html:html};
}

