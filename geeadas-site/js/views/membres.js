/* GEEAD ABIDJAN SUD — Membres : liste, fiche, suivi */

function memberLi(m, right, sel){
  return '<div class="li '+(sel?'sel':'')+'" data-act="'+(ST.selMode?'togglesel':'member')+'" data-id="'+esc(m.id)+'">'+(ST.selMode?'<span class="ck">'+I('check')+'</span>':'')+avatar(m)+'<div class="t"><b>'+esc(fullName(m))+'</b><span><span class="mono">'+esc(m.id)+'</span> · '+esc(m.etablissement||'—')+'</span></div><div class="r">'+(right!=null?right:'<span class="badge '+(m.statut==='Étudiant'?'blue':'')+'">'+esc(m.niveau||'—')+'</span>'+(isReg()&&!m.celluleId?'<span class="badge red">Isolé</span>':''))+'</div></div>';
}
function filteredMembers(){
  var q=norm(ST.q), f=ST.f;
  var L=scopeM().filter(function(m){
    if(q&&norm([m.id,m.nom,m.prenoms,m.etablissement,m.telephone,m.filiere,m.eglise].join(' ')).indexOf(q)<0) return false;
    if(f.cell&&(f.cell==='_none'?m.celluleId:m.celluleId!==f.cell)) return false;
    if(f.statut&&m.statut!==f.statut) return false; if(f.sexe&&m.sexe!==f.sexe) return false; if(f.niveau&&m.niveau!==f.niveau) return false;
    if(f.fiche==='incomplet'&&completude(m)>=70) return false; if(f.fiche==='complet'&&completude(m)<80) return false;
    return true; });
  var s=ST.sort; L.sort(function(a,b){ return s==='nom'?fullName(a).localeCompare(fullName(b)):s==='id'?a.id.localeCompare(b.id):(b.dateInscription||'').localeCompare(a.dateInscription||'')||b.id.localeCompare(a.id); });
  return L;
}
RENDER.membres=function(){
  var f=ST.f, c=cellById(f.cell);
  var chip=function(on,act,label,v){ return '<button class="chip '+(on?'on':'')+'" data-act="'+act+'" '+(v!=null?'data-v="'+esc(v)+'"':'')+'>'+label+'</button>'; };
  var html='<div class="toolbar"><div class="search">'+I('search')+'<input id="mq" placeholder="Nom, identifiant, école, téléphone…" value="'+esc(ST.q)+'" aria-label="Rechercher" autocomplete="off">'+(ST.q?'<button class="btn icon ghost sm clr" data-act="clearq" aria-label="Effacer">'+I('x')+'</button>':'')+'</div>'+
    '<div class="chips">'+chip(!f.statut,'fstatut','Tous','')+chip(f.statut==='Élève','fstatut','Élèves','Élève')+chip(f.statut==='Étudiant','fstatut','Étudiants','Étudiant')+chip(f.sexe==='F','fsexe','Filles','F')+chip(f.sexe==='M','fsexe','Garçons','M')+
    chip(!!f.niveau,'fniveau',(f.niveau||'Niveau')+' '+I('chevd'))+(isReg()?chip(!!f.cell,'fcell',(f.cell==='_none'?'Sans cellule':c?esc(c.nom):'Cellule')+' '+I('chevd')):'')+chip(!!f.fiche,'ffiche',({incomplet:'Fiche incomplète',complet:'Fiche complète'}[f.fiche]||'Fiche')+' '+I('chevd'))+
    (f.statut||f.sexe||f.niveau||f.cell||f.fiche?chip(false,'freset',I('x')+'Effacer'):'')+'</div></div>'+
    '<div class="row between" style="margin-bottom:8px"><span class="sm mut" id="mcount"></span><div class="row"><button class="btn sm ghost" data-act="sort">'+I('swap')+({recent:'Plus récents',nom:'Nom A → Z',id:'Identifiant'}[ST.sort])+'</button>'+(canEdit()?'<button class="btn sm '+(ST.selMode?'pri':'')+'" data-act="selmode">'+I('checkc')+(ST.selMode?'Terminer':'Sélectionner')+'</button>':'')+'<button class="btn sm pri dsk-only" data-act="newmember" style="'+(canEdit()?'':'display:none')+'">'+I('userplus')+'<span>Ajouter</span></button></div></div>'+
    '<div class="card" style="padding:8px 10px"><div class="list" id="mlist"></div></div>';
  return {html:html, mount:function(){ drawMembers(); var q=$('#mq'); q.oninput=function(){ ST.q=q.value; drawMembers(); }; }};
};
var PAGE=80;
function drawMembers(limit){
  var L=filteredMembers(), lim=limit||PAGE;
  $('#mcount').textContent=fmtN(L.length)+' membre'+(L.length>1?'s':'')+(L.length!==scopeM().length?' sur '+fmtN(scopeM().length):'');
  $('#mlist').innerHTML=L.length?L.slice(0,lim).map(function(m){ return memberLi(m,null,ST.sel.has(m.id)); }).join('')+(L.length>lim?'<button class="btn block ghost" data-act="more" data-v="'+(lim+PAGE)+'" style="margin-top:6px">Afficher plus ('+(L.length-lim)+')</button>':''):emptyState('search','Aucun résultat','Modifiez la recherche ou les filtres.', canEdit()?'<button class="btn pri" data-act="newmember">'+I('userplus')+'Nouveau membre</button>':'');
  drawSelbar();
}
function drawSelbar(){
  var b=$('#selbar'); if(!b) return; var n=ST.sel.size;
  b.classList.toggle('on', ST.selMode&&n>0);
  b.innerHTML='<b style="white-space:nowrap">'+n+' sélectionné'+(n>1?'s':'')+'</b>'+(isReg()&&canEdit()?'<button class="btn sm" data-act="bulktransfer">'+I('swap')+'Transférer</button>':'')+'<button class="btn sm" data-act="bulkwa">'+I('msg')+'Contacts</button>'+(can('export')?'<button class="btn sm" data-act="bulkexport">'+I('download')+'Exporter</button>':'')+'<button class="btn sm" data-act="bulkall">'+I('checkc')+'Tout</button>';
}

/* Fiche détaillée (panneau) */
function openMember(id, tab){
  var m=DB.members.find(function(x){ return x.id===id; }); if(!m) return;
  var sh=openSheet({title:'Fiche membre', wide:true, focus:false, body:'<div id="mb"></div>'});
  drawMember(sh, m, tab||'profil');
}
function drawMember(sh, m, tab){
  var a=ageOf(m.naissance), wa=telIntl(m.whatsapp||m.telephone), c=cellById(m.celluleId);
  var notes=DB.notes.filter(function(n){ return n.membreId===m.id; }).sort(function(x,y){ return y.date.localeCompare(x.date); });
  var body='<div class="prof-h">'+avatar(m,'lg')+'<h2>'+esc(fullName(m))+'</h2><div class="row" style="justify-content:center;margin-top:8px"><span class="badge '+(m.sexe==='F'?'gold':'')+'">'+(m.sexe==='F'?'Fille':'Garçon')+'</span>'+(a!=null?'<span class="badge grey">'+a+' ans'+(a<18?' · mineur':'')+'</span>':'')+'<span class="badge blue">'+esc(m.statut)+' · '+esc(m.niveau)+'</span>'+(c?'':'<span class="badge red">Sans cellule</span>')+'</div><button class="idc" data-act="copy" data-v="'+esc(m.id)+'">'+I('qr')+'<span class="mono">'+esc(m.id)+'</span>'+I('copy')+'</button></div>'+
    '<div class="qa"><a href="tel:'+esc(String(m.telephone||'').replace(/\s/g,''))+'"><span class="ci">'+I('phone')+'</span>Appeler</a><a href="'+(wa?'https://wa.me/'+wa:'#')+'" target="_blank" rel="noopener"><span class="ci wa">'+I('msg')+'</span>WhatsApp</a>'+(canEdit()?'<button data-act="editmember" data-id="'+esc(m.id)+'"><span class="ci">'+I('edit')+'</span>Modifier</button>':'<button data-act="mtab" data-v="fiche"><span class="ci">'+I('card')+'</span>Fiche</button>')+(canNote()?'<button data-act="addnote" data-id="'+esc(m.id)+'"><span class="ci">'+I('heart')+'</span>Suivi</button>':'<button data-act="mtab" data-v="'+(canEdit()?'fiche':'historique')+'"><span class="ci">'+I(canEdit()?'card':'list')+'</span>'+(canEdit()?'Fiche':'Historique')+'</button>')+'</div>'+
    '<div class="seg full" style="margin-bottom:16px">'+[['profil','Profil']].concat(can('suivi')?[['suivi','Suivi ('+notes.length+')']]:[]).concat([['fiche','Fiche'],['historique','Historique']]).map(function(t){ return '<button class="'+(tab===t[0]?'on':'')+'" data-act="mtab" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div><div id="mtab" class="stepv">';
  if(tab==='profil'){
    var kv=function(rows){ return '<div class="card" style="padding:4px 16px"><dl class="kv">'+rows.map(function(r){ return '<dt>'+r[0]+'</dt><dd>'+(r[1]||'—')+'</dd>'; }).join('')+'</dl></div>'; };
    body+='<div class="sec-t">Scolarité</div>'+kv([['Établissement',esc(m.etablissement)],['Niveau',esc(m.niveau)],['Série / filière',esc(m.filiere)]])+
      '<div class="sec-t">Église et cellule</div>'+kv([['Cellule',c?esc(c.code+' · '+c.nom):'<span style="color:var(--red)">Non rattaché</span>'],['Église locale',esc(m.eglise)],['Baptême',[m.baptemeEau?'Eau':'',m.baptemeEsprit?'Saint-Esprit':''].filter(Boolean).join(' · ')],['Engagements',esc((m.engagements||[]).join(', '))],['Talents',esc(m.talents)]])+
      '<div class="sec-t">Contacts</div>'+kv([['Téléphone',esc(fmtTel(m.telephone))],['WhatsApp',esc(fmtTel(m.whatsapp))],['E-mail',esc(m.email)],['Commune',esc([m.commune,m.quartier].filter(Boolean).join(', '))],['Parent / tuteur',m.parentNom?esc(m.parentNom)+'<br><span class="mut">'+esc(fmtTel(m.parentTel))+'</span>':'']])+
      '<div class="sec-t">Fiche</div>'+kv([['Inscrit le',fmtD(m.dateInscription)],['Enregistré par',esc(m.creePar)],['Complétude',completude(m)+' %'],['Annuaire du réseau',m.annuaire!==false?'Visible':'Masqué']]);
    if(canEdit()) body+='<div class="row" style="margin-top:18px"><button class="btn" data-act="transfer" data-id="'+esc(m.id)+'">'+I('swap')+(isReg()?'Transférer':'Changer de cellule')+'</button>'+(can('membres.delete')?'<button class="btn danger" data-act="delmember" data-id="'+esc(m.id)+'">'+I('trash')+'Supprimer</button>':'')+'</div>';
  } else if(tab==='suivi'){
    body+=(canNote()?'<button class="btn pri block" data-act="addnote" data-id="'+esc(m.id)+'" style="margin-bottom:18px">'+I('plus')+'Ajouter une note de suivi</button>':'')+(notes.length?'<ul class="tl">'+notes.map(function(n){ return '<li><b>'+esc(n.type)+'</b><div class="m">'+fmtD(n.date)+' · '+esc(n.par)+'</div><p>'+esc(n.txt)+'</p></li>'; }).join('')+'</ul>':emptyState('heart','Aucun suivi','Les visites, appels et accompagnements apparaîtront ici.'));
  } else if(tab==='fiche'){
    body+='<div class="fiche-wrap">'+ficheHTML(m)+'</div><button class="btn pri block" data-act="printfiche" data-id="'+esc(m.id)+'" style="margin-top:14px">'+I('printer')+'Imprimer ou enregistrer en PDF</button>';
  } else {
    var h=(m.historique||[]).slice().reverse();
    body+=h.length?'<ul class="tl">'+h.map(function(x){ return '<li><b>'+esc(x.champ)+'</b><div class="m">'+fmtD(x.date)+' · '+esc(x.par||'')+'</div><p>'+esc(x.de)+' → <b>'+esc(x.a)+'</b></p></li>'; }).join('')+'</ul>':emptyState('list','Aucun changement','Changements d\'école, de cellule, de niveau ou d\'église.');
  }
  body+='</div>';
  sh.querySelector('.sheet-b').innerHTML=body; sh.dataset.mid=m.id; sh.dataset.tab=tab;
}
function refreshMemberSheet(){ var sh=topSheet(); if(sh&&sh.dataset.mid){ var m=DB.members.find(function(x){ return x.id===sh.dataset.mid; }); if(m) drawMember(sh,m,sh.dataset.tab); } }

/* Fiche imprimable */
function ficheHTML(m){
  var c=cellById(m.celluleId), a=ageOf(m.naissance);
  var row=function(l,v){ return '<div class="fr"><span>'+l+'</span><b>'+(v||'—')+'</b></div>'; };
  var sec=function(t,rows){ return '<section><h4>'+t+'</h4>'+rows.join('')+'</section>'; };
  return '<article class="fiche"><header class="fiche-h"><img class="fiche-logo" src="'+LOGO+'" alt=""><div class="fiche-org"><b>GEEAD ABIDJAN SUD</b><span>Groupe des Élèves et Étudiants des Assemblées de Dieu</span><em>Fiche de membre</em></div><div class="fiche-id"><span>Identifiant</span><b class="mono">'+esc(m.id)+'</b></div></header>'+
    '<div class="fiche-top">'+(m.photo?'<img class="fiche-ph" src="'+esc(m.photo)+'" alt="Photo">':'<div class="fiche-ph ini" style="background:'+avColor(m.id)+'">'+esc(initials(m))+'</div>')+
    '<div class="fiche-who"><h3>'+esc((m.nom||'').toUpperCase())+'</h3><p class="pn">'+esc(m.prenoms)+'</p><div class="row"><span class="badge '+(m.sexe==='F'?'gold':'')+'">'+(m.sexe==='F'?'Féminin':'Masculin')+'</span>'+(a!=null?'<span class="badge grey">'+a+' ans</span>':'')+'<span class="badge blue">'+esc(m.statut)+' · '+esc(m.niveau)+'</span></div>'+
    '<p class="cel">'+I('layers')+(c?esc(c.code+' · Cellule '+c.nom):'Non rattaché à une cellule')+'</p></div></div>'+
    '<div class="fiche-grid">'+
      sec('Identité',[row('Date de naissance',m.naissance?fmtD(m.naissance):''),row('Commune',esc([m.commune,m.quartier].filter(Boolean).join(', ')))])+
      sec('Scolarité',[row('Établissement',esc(m.etablissement)),row('Niveau',esc(m.niveau)),row(m.statut==='Élève'?'Série':'Filière',esc(m.filiere))])+
      sec('Contacts',[row('Téléphone',esc(fmtTel(m.telephone))),row('WhatsApp',esc(fmtTel(m.whatsapp))),row('E-mail',esc(m.email))])+
      sec('Parent / tuteur',[row('Nom',esc(m.parentNom)),row('Téléphone',esc(fmtTel(m.parentTel)))])+
      sec('Église et engagement',[row('Église locale',esc(m.eglise)),row('Baptême',[m.baptemeEau?'Eau':'',m.baptemeEsprit?'Saint-Esprit':''].filter(Boolean).join(' · ')),row('Services',esc((m.engagements||[]).join(', '))),row('Talents',esc(m.talents))])+
      sec('Inscription',[row('Inscrit le',fmtD(m.dateInscription)),row('Enregistré par',esc(m.creePar)),row('Fiche complète à',completude(m)+' %')])+
    '</div><footer class="fiche-f"><span>L\'École, Notre Champ Missionnaire</span><span>Édité le '+fmtD(today())+'</span></footer></article>';
}
function printFiche(list){
  var z=$('#printzone'); z.innerHTML=list.map(ficheHTML).join('');
  setTimeout(function(){ try{ window.print(); }catch(e){} setTimeout(function(){ z.innerHTML=''; },800); },300);
  if(IN_FRAME) toast('Aperçu : l\'impression fonctionne sur la version en ligne');
}

/* Note de suivi */
function openNote(id){
  var m=DB.members.find(function(x){ return x.id===id; });
  var sh=openSheet({title:'Note de suivi', auto:true, body:'<div class="li" style="cursor:default;padding:0 0 14px">'+avatar(m)+'<div class="t"><b>'+esc(fullName(m))+'</b><span>'+esc(m.id)+'</span></div></div><span class="field"><span>Type</span></span><div class="chips" style="flex-wrap:wrap;margin-bottom:14px" id="ntypes">'+TYPES_SUIVI.map(function(t,i){ return '<button type="button" class="chip '+(i===0?'on':'')+'" data-v="'+esc(t)+'">'+esc(t)+'</button>'; }).join('')+'</div><label class="field"><span>Note</span><textarea id="ntxt" placeholder="Ce qui a été fait, besoins exprimés, prochaine étape…"></textarea></label>',
    foot:'<button class="btn" data-act="closesheet">Annuler</button><button class="btn pri" id="nsave">'+I('check')+'Enregistrer</button>'});
  var type=TYPES_SUIVI[0];
  sh.querySelector('#ntypes').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; type=b.dataset.v; $$('#ntypes .chip').forEach(function(c){ c.classList.toggle('on',c===b); }); };
  sh.querySelector('#nsave').onclick=async function(){ var t=sh.querySelector('#ntxt').value.trim(); if(!t){ sh.querySelector('#ntxt').classList.add('err'); toast('Écrivez la note','err'); return; }
    await Store.save('notes',{membreId:m.id,celluleId:m.celluleId||'',type:type,txt:t,date:today(),par:U.nom}); log('Suivi ajouté', m.id+' · '+type, m.celluleId);
    closeSheet(); toast('Note de suivi enregistrée'); var s=topSheet(); if(s&&s.dataset.mid){ s.dataset.tab='suivi'; refreshMemberSheet(); } else rerenderSoft(); };
}
