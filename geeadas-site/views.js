/* =====================================================================
   GEEADAS — Écrans de gestion, actions, démarrage
   ===================================================================== */

/* ---------- Validations / inscriptions ---------- */
function inscLink(){ return location.origin+location.pathname+'#inscription'; }
RENDER.validations=function(){
  var L=scopeIns().slice().sort(function(a,b){ return (b.dateSoumission||'').localeCompare(a.dateSoumission||''); });
  var html='<div class="grid g3" style="margin-bottom:16px"><div class="card span2" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div class="kpi" style="flex:1;min-width:200px"><div class="ic gold">'+I('inbox')+'</div><h3 style="font-size:17px">'+L.length+' inscription'+(L.length>1?'s':'')+' en attente</h3><p class="sm mut" style="margin-top:4px">Fiches remplies par les membres via le lien public. La validation attribue l\'identifiant unique.</p></div><div class="row"><button class="btn" data-act="sharelink">'+I('share')+'Partager le lien</button><a class="btn" href="#inscription">'+I('eye')+'Voir le formulaire</a></div></div>'+
    '<div class="card"><div class="ic" style="display:none"></div><div class="sec-t" style="margin-top:0">Lien d\'inscription</div><p class="mono sm" style="word-break:break-all;color:var(--ink-2)">'+esc(inscLink())+'</p><button class="btn sm" data-act="copy" data-v="'+esc(inscLink())+'" style="margin-top:10px">'+I('copy')+'Copier</button></div></div>'+
    '<div class="card" style="padding:8px 10px">'+(L.length?'<div class="list">'+L.map(function(x){
      var dup=DB.members.find(function(m){ return norm(m.nom+m.prenoms)===norm(x.nom+x.prenoms)&&m.naissance===x.naissance; }), a=ageOf(x.naissance);
      return '<div class="li" style="cursor:default;flex-wrap:wrap">'+avatar(x)+'<div class="t" style="min-width:180px"><b>'+esc(fullName(x))+'</b><span>'+(a!=null?a+' ans · ':'')+esc(x.etablissement)+' · '+esc(x.niveau)+'</span><span>'+(isReg()?esc(cellName(x.celluleId))+' · ':'')+'Reçu '+fmtRel(x.dateSoumission)+'</span>'+(dup?'<span class="badge red" style="margin-top:4px">'+I('alert')+'Doublon possible : '+esc(dup.id)+'</span>':'')+'</div>'+
        (canEdit()?'<div class="row"><button class="btn sm ghost danger" data-act="rejins" data-id="'+esc(x.id)+'">'+I('x')+'</button><button class="btn sm" data-act="reviewins" data-id="'+esc(x.id)+'">Revoir</button><button class="btn sm pri" data-act="valins" data-id="'+esc(x.id)+'">'+I('check')+'Valider</button></div>':'')+'</div>'; }).join('')+'</div>':emptyState('inbox','Aucune inscription en attente','Partagez le lien d\'inscription dans vos groupes WhatsApp.','<button class="btn pri" data-act="sharelink">'+I('share')+'Partager le lien</button>'))+'</div>';
  return {html:html};
};
async function validateIns(id){
  var x=DB.inscriptions.find(function(i){ return i.id===id; }); if(!x) return;
  var d=Object.assign({},x); delete d.id; delete d.dateSoumission;
  var m=await Store.save('members', Object.assign(d,{id:'',historique:[],carte:{paye:false,statut:'À produire'},dateInscription:today(),creePar:U.nom}));
  await Store.remove('inscriptions', id); log('Inscription validée', m.id+' · '+fullName(m), m.celluleId);
  toast('Validé · '+m.id); rerenderSoft();
}

/* ---------- Cellules ---------- */
RENDER.cellules=function(){
  var cs=DB.cells.slice().sort(function(a,b){ return a.code.localeCompare(b.code); });
  var d30=isoDay(new Date(Date.now()-30*86400000));
  var html='<div class="row between" style="margin-bottom:16px"><p class="mut">'+cs.length+' cellules · '+fmtN(DB.members.filter(function(m){ return m.celluleId; }).length)+' membres rattachés</p>'+(canEdit()?'<button class="btn pri" data-act="editcell">'+I('plus')+'Nouvelle cellule</button>':'')+'</div><div class="grid g3">'+
    cs.map(function(c){ var L=DB.members.filter(function(m){ return m.celluleId===c.id; }), f=L.filter(function(m){ return m.sexe==='F'; }).length, nv=L.filter(function(m){ return (m.dateInscription||'')>=d30; }).length;
      var comp=L.length?Math.round(L.reduce(function(a,m){ return a+completude(m); },0)/L.length):0;
      var bureau=DB.users.filter(function(u){ return u.celluleId===c.id; });
      return '<div class="card cellc" data-act="cellsheet" data-v="'+esc(c.id)+'"><div class="row between" style="align-items:flex-start"><div style="display:flex;gap:12px;align-items:center"><span class="code">'+esc(c.code)+'</span><div><h3 style="font-size:15.5px">'+esc(c.nom)+'</h3><p class="xs mut">'+esc(c.responsable||'Responsable non défini')+'</p></div></div>'+ring(comp)+'</div>'+
        '<div class="row between" style="margin-top:16px"><div><div style="font-size:26px;font-weight:800;letter-spacing:-.03em">'+L.length+'</div><div class="xs mut">membres</div></div><div class="row">'+(nv?'<span class="badge">+'+nv+' en 30 j</span>':'')+(c.etablissement?'<span class="badge blue">'+I('cap')+'École</span>':'')+(bureau.length?'<span class="badge grey">'+bureau.length+' compte'+(bureau.length>1?'s':'')+'</span>':'')+'</div></div>'+
        '<div style="display:flex;height:6px;border-radius:6px;overflow:hidden;margin-top:12px;background:var(--surface-2)"><i style="width:'+(L.length?f/L.length*100:0)+'%;background:var(--gold)"></i><i style="flex:1;background:var(--brand)"></i></div></div>'; }).join('')+'</div>';
  return {html:html};
};
function openCell(id){
  var c=cellById(id); if(!c) return; var L=DB.members.filter(function(m){ return m.celluleId===id; }), s=statsBlock(L);
  var bureau=DB.users.filter(function(u){ return u.celluleId===id; });
  var parNiv=countBy(L,function(m){ return m.niveau; }).sort(function(a,b){ return ORDRE_NIV.indexOf(a[0])-ORDRE_NIV.indexOf(b[0]); });
  openSheet({title:c.code+' · '+c.nom, wide:true, focus:false, body:'<div class="grid g3" style="margin-bottom:16px">'+kpi('users','',s.n,'Membres')+kpi('heart','gold',s.f,'Filles')+kpi('wallet','blue',s.payes,'Cartes payées')+'</div>'+
    '<div class="card"><dl class="kv"><dt>Église</dt><dd>'+esc(c.eglise||'—')+'</dd><dt>Cellule-école</dt><dd>'+esc(c.etablissement||'—')+'</dd><dt>Responsable</dt><dd>'+esc(c.responsable||'—')+'</dd><dt>Téléphone</dt><dd>'+esc(c.telephone||'—')+'</dd></dl></div>'+
    '<div class="sec-t">Bureau de la cellule</div><div class="card" style="padding:8px 10px">'+(bureau.length?'<div class="list">'+bureau.map(function(u){ return '<div class="li" data-act="edituser" data-id="'+esc(u.id)+'">'+uavatar(u)+'<div class="t"><b>'+esc(u.nom)+'</b><span>'+esc(u.titre)+'</span></div>'+I('chevr','chev')+'</div>'; }).join('')+'</div>':emptyMini('Aucun compte pour cette cellule.'))+(canEdit()?'<button class="btn sm" data-act="newuser" data-v="'+esc(id)+'" style="margin:8px 6px">'+I('userplus')+'Créer un compte pour le bureau</button>':'')+'</div>'+
    '<div class="sec-t">Niveaux</div><div class="card">'+cols(parNiv,NIVEAUX['Élève'])+'</div>',
    foot:(canEdit()?'<button class="btn" data-act="editcell" data-v="'+esc(id)+'">'+I('edit')+'Modifier</button>':'')+'<button class="btn pri" data-act="cellmembers" data-v="'+esc(id)+'">'+I('users')+'Voir les membres</button>'});
  countUp(topSheet());
}
function editCell(id, preset){
  var c=id?Object.assign({},cellById(id)):Object.assign({code:'C'+String(DB.cells.length+1).padStart(2,'0'),nom:'',eglise:'',etablissement:'',responsable:'',telephone:''},preset||{});
  var f=function(k,l,req){ return '<label class="field"><span>'+l+(req?' <i>*</i>':'')+'</span><input data-c="'+k+'" value="'+esc(c[k])+'"></label>'; };
  var sh=openSheet({title:id?'Modifier la cellule':'Nouvelle cellule', auto:true, body:'<div class="fgrid">'+f('code','Code',1)+f('nom','Nom de la cellule',1)+f('eglise','Église de rattachement')+f('etablissement','Établissement (cellule-école)')+f('responsable','Responsable')+f('telephone','Téléphone')+'</div>',
    foot:(id?'<button class="btn danger" id="cdel">'+I('trash')+'</button>':'')+'<button class="btn" data-act="closesheet">Annuler</button><button class="btn pri" id="csave">'+I('check')+'Enregistrer</button>'});
  sh.querySelector('#csave').onclick=async function(){ $$('[data-c]',sh).forEach(function(i){ c[i.dataset.c]=i.value.trim(); }); if(!c.code||!c.nom){ toast('Code et nom obligatoires','err'); return; }
    if(!c.creeLe) c.creeLe=today(); await Store.save('cells',c); log(id?'Cellule modifiée':'Cellule créée', c.code+' · '+c.nom); closeAllSheets(); toast(id?'Cellule mise à jour':'Cellule créée'); render(); };
  if(id) sh.querySelector('#cdel').onclick=async function(){ var n=DB.members.filter(function(m){ return m.celluleId===id; }).length; if(n){ toast(n+' membre(s) rattaché(s) : transférez-les d\'abord','err'); return; }
    if(await confirmDlg({title:'Supprimer la cellule ?',text:c.nom+' sera supprimée définitivement.',ok:'Supprimer'})){ await Store.remove('cells',id); log('Cellule supprimée', c.nom); closeAllSheets(); render(); toast('Cellule supprimée'); } };
}

/* ---------- Suivi ---------- */
function lastContact(m){ var n=DB.notes.filter(function(x){ return x.membreId===m.id; }).map(function(x){ return x.date; }).sort().pop(); return n||null; }
function aRecontacter(M){ var lim=isoDay(new Date(Date.now()-60*86400000)); return M.filter(function(m){ var l=lastContact(m); return !l||l<lim; }).sort(function(a,b){ return (lastContact(a)||'').localeCompare(lastContact(b)||''); }); }
RENDER.suivi=function(){
  var M=scopeM(), N=scopeNotes().slice().sort(function(a,b){ return b.date.localeCompare(a.date); }), rc=aRecontacter(M);
  var d30=isoDay(new Date(Date.now()-30*86400000)), suivis=new Set(N.filter(function(n){ return n.date>=d30; }).map(function(n){ return n.membreId; })).size;
  var html='<div class="grid g3" style="margin-bottom:16px">'+kpi('heart','',N.filter(function(n){ return n.date>=d30; }).length,'Notes ces 30 derniers jours')+kpi('users','blue',M.length?Math.round(suivis/M.length*100):0,'Membres suivis ce mois','%')+kpi('alert','red',rc.length,'À recontacter (60 j)')+'</div>'+
    '<div class="grid g2"><div class="card"><div class="card-h"><div><h3>À recontacter</h3><div class="sub">Sans suivi depuis plus de 60 jours</div></div></div><div class="list">'+(rc.slice(0,25).map(function(m){ var l=lastContact(m); return memberLi(m, (canEdit()?'<button class="btn sm" data-act="addnote" data-id="'+esc(m.id)+'">'+I('plus')+'Suivi</button>':'')+'<span class="xs mut">'+(l?fmtRel(l):'Jamais suivi')+'</span>'); }).join('')||emptyState('checkc','Tout le monde est suivi','Bravo !'))+'</div></div>'+
    '<div class="card"><div class="card-h"><div><h3>Notes récentes</h3><div class="sub">'+N.length+' notes au total</div></div></div>'+(N.length?'<ul class="tl">'+N.slice(0,25).map(function(n){ var m=DB.members.find(function(x){ return x.id===n.membreId; }); return '<li><b><a href="#" data-act="member" data-id="'+esc(n.membreId)+'">'+esc(m?fullName(m):n.membreId)+'</a></b> · <span class="badge grey">'+esc(n.type)+'</span><div class="m">'+fmtD(n.date)+' · '+esc(n.par)+'</div><p>'+esc(n.txt)+'</p></li>'; }).join('')+'</ul>':emptyMini('Aucune note pour le moment.'))+'</div></div>';
  return {html:html};
};

/* ---------- Nouvelles cellules ---------- */
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
      return '<div class="li" style="cursor:default"><span class="av" style="background:'+(ok?'var(--gold)':'var(--surface-2)')+';color:'+(ok?'#3a2600':'var(--mut)')+'">'+I('cap')+'</span><div class="t"><b>'+esc(o.nom)+'</b><span>'+n+' membres · '+f+' F · '+(n-f)+' G · '+new Set(o.membres.map(function(m){ return m.celluleId; }).filter(Boolean)).size+' cellule(s) d\'origine</span><div class="trk" style="height:6px;border-radius:6px;background:var(--surface-2);margin-top:6px;overflow:hidden"><i style="display:block;height:100%;width:'+Math.min(100,n/seuil*100)+'%;background:'+(ok?'var(--gold)':'var(--brand)')+';border-radius:6px"></i></div></div><div class="r">'+(ok&&canEdit()?'<button class="btn sm gold" data-act="mkcell" data-v="'+esc(o.nom)+'">'+I('plus')+'Créer</button>':'<span class="badge grey">'+n+'/'+seuil+'</span>')+'</div></div>'; }).join('')||emptyState('checkc','Tous les établissements sont couverts',''))+'</div></div>'+
    '<div class="card"><div class="card-h"><div><h3>Jeunes isolés</h3><div class="sub">'+iso.length+' membre(s) recensé(s) sans cellule</div></div></div><div class="list">'+(iso.map(function(m){ return memberLi(m, canEdit()?'<button class="btn sm" data-act="transfer" data-id="'+esc(m.id)+'">'+I('swap')+'Rattacher</button>':''); }).join('')||emptyState('checkc','Aucun isolé',''))+'</div></div></div>';
  return {html:html};
};

/* ---------- Réseau & talents ---------- */
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

/* ---------- Cartes & paiements ---------- */
RENDER.cartes=function(){
  var M=scopeM(), payes=M.filter(function(m){ return m.carte&&m.carte.paye; }), prix=DB.settings.prixCarte;
  var by=function(s){ return M.filter(function(m){ return (m.carte||{}).statut===s; }).length; };
  var F={tous:M, nonpaye:M.filter(function(m){ return !(m.carte&&m.carte.paye); }), aproduire:M.filter(function(m){ return m.carte&&m.carte.paye&&m.carte.statut==='À produire'; }), imprimee:M.filter(function(m){ return (m.carte||{}).statut==='Imprimée'; }), remise:M.filter(function(m){ return (m.carte||{}).statut==='Remise'; })};
  var L=F[ST.cartesF];
  var html='<div class="grid g4" style="margin-bottom:16px">'+kpi('wallet','',payes.length,'Cartes payées sur '+M.length)+kpi('trend','gold',payes.length*prix,'F CFA collectés')+kpi('printer','blue',by('Imprimée'),'Imprimées, à remettre')+kpi('checkc','',by('Remise'),'Remises aux membres')+'</div>'+
    '<div class="toolbar"><div class="chips">'+[['tous','Toutes',M.length],['nonpaye','Non payées',F.nonpaye.length],['aproduire','Payées à produire',F.aproduire.length],['imprimee','Imprimées',F.imprimee.length],['remise','Remises',F.remise.length]].map(function(x){ return '<button class="chip '+(ST.cartesF===x[0]?'on':'')+'" data-act="cartesf" data-v="'+x[0]+'">'+x[1]+' <b style="opacity:.7">'+x[2]+'</b></button>'; }).join('')+'</div>'+
    '<div class="row"><button class="btn sm" data-act="printlot">'+I('printer')+'Imprimer ce lot ('+L.length+')</button><button class="btn sm" data-act="exportcards">'+I('download')+'Fichier imprimeur</button>'+(canEdit()&&ST.cartesF==='aproduire'&&L.length?'<button class="btn sm pri" data-act="markprinted">'+I('check')+'Marquer comme imprimées</button>':'')+'</div></div>'+
    '<div class="card" style="padding:8px 10px"><div class="list">'+(L.slice(0,150).map(function(m){ var k=m.carte||{};
      return '<div class="li" data-act="member" data-id="'+esc(m.id)+'" data-tab="carte">'+avatar(m)+'<div class="t"><b>'+esc(fullName(m))+'</b><span class="mono">'+esc(m.id)+'</span></div><div class="r"><button class="chip '+(k.paye?'on':'')+'" data-act="togglepaye" data-id="'+esc(m.id)+'" '+(canEdit()?'':'disabled')+'>'+(k.paye?I('check')+'Payée':'Non payée')+'</button><span class="badge '+(k.statut==='Remise'?'':k.statut==='Imprimée'?'blue':'grey')+'">'+esc(k.statut||'À produire')+'</span></div></div>'; }).join('')||emptyState('card','Aucune carte dans cette liste',''))+'</div></div>';
  return {html:html};
};

/* ---------- Communication ---------- */
RENDER.communication=function(){
  var html='<div class="seg full" style="margin-bottom:16px;max-width:440px">'+[['annonces','Annonces'],['diffusion','Diffusion ciblée']].map(function(t){ return '<button class="'+(ST.comTab===t[0]?'on':'')+'" data-act="comtab" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div><div id="combody"></div>';
  return {html:html, mount:drawCom};
};
function drawCom(){
  var b=$('#combody'), h='';
  if(ST.comTab==='annonces'){
    var A=annoncesFor();
    h=(isReg()&&canEdit()?'<button class="btn pri" data-act="newannonce" style="margin-bottom:14px">'+I('mega')+'Publier une annonce</button>':'<p class="sm mut" style="margin-bottom:12px">Annonces et convocations publiées par le bureau régional.</p>')+'<div class="card">'+(A.map(function(a){ return annonceCard(a, isReg()&&canEdit()); }).join('')||emptyState('mega','Aucune annonce',''))+'</div>';
  } else {
    var d=ST.diff, M=diffList();
    var sel=function(k,label,opts){ return '<label class="field"><span>'+label+'</span><select data-d="'+k+'"><option value="">Tous</option>'+opts.map(function(o){ return '<option value="'+esc(o[0])+'" '+(d[k]===o[0]?'selected':'')+'>'+esc(o[1])+'</option>'; }).join('')+'</select></label>'; };
    h='<div class="grid g3"><div class="card span2"><div class="card-h"><div><h3>Composer le message</h3><div class="sub">Utilisez {prenom} pour personnaliser chaque message</div></div></div>'+
      '<div class="fgrid" style="margin-bottom:14px">'+(isReg()?sel('cell','Cellule',DB.cells.map(function(c){ return [c.id,c.code+' · '+c.nom]; })):'')+sel('statut','Statut',[['Élève','Élèves'],['Étudiant','Étudiants']])+sel('sexe','Sexe',[['F','Filles'],['M','Garçons']])+sel('niveau','Niveau',ORDRE_NIV.map(function(n){ return [n,n]; }))+sel('age','Âge',[['mineur','Mineurs'],['majeur','Majeurs']])+'</div>'+
      '<label class="field"><span>Message</span><textarea id="dmsg" rows="5">'+esc(ST.dmsg||'Bonjour {prenom}, le bureau du GEEAD Abidjan Sud vous informe que…')+'</textarea></label>'+
      '<div class="row" style="margin-top:14px"><button class="btn pri" data-act="copynums">'+I('copy')+'Copier les '+M.length+' numéros</button><button class="btn" data-act="copymsg">'+I('msg')+'Copier le message</button><button class="btn" data-act="exportdiff">'+I('download')+'Exporter</button></div></div>'+
      '<div class="card"><div class="card-h"><div><h3>'+M.length+' destinataire(s)</h3><div class="sub">Envoi individuel via WhatsApp</div></div></div><div class="list" style="max-height:520px;overflow:auto">'+M.slice(0,60).map(function(m){ var n=telIntl(m.whatsapp||m.telephone); return memberLi(m, n?'<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/'+n+'?text='+encodeURIComponent(personalize(m))+'" data-noopen>'+I('send')+'</a>':''); }).join('')+'</div></div></div>';
  }
  b.innerHTML='<div class="stepv">'+h+'</div>';
  $$('[data-d]',b).forEach(function(s){ s.onchange=function(){ ST.diff[s.dataset.d]=s.value; ST.dmsg=$('#dmsg').value; drawCom(); }; });
  var t=$('#dmsg'); if(t) t.oninput=function(){ ST.dmsg=t.value; };
}
function diffList(){ var d=ST.diff; return scopeM().filter(function(m){ var a=ageOf(m.naissance); return (!d.cell||m.celluleId===d.cell)&&(!d.statut||m.statut===d.statut)&&(!d.sexe||m.sexe===d.sexe)&&(!d.niveau||m.niveau===d.niveau)&&(!d.age||(d.age==='mineur'?a<18:a>=18)); }); }
function personalize(m){ return String(ST.dmsg||'Bonjour {prenom}, le bureau du GEEAD Abidjan Sud vous informe que…').replace(/\{prenom\}/g, String(m.prenoms||'').split(' ')[0]); }
function newAnnonce(){
  var sh=openSheet({title:'Nouvelle annonce', auto:true, body:'<label class="field"><span>Titre <i>*</i></span><input id="at"></label><label class="field" style="margin-top:14px"><span>Message <i>*</i></span><textarea id="ax" rows="5"></textarea></label><label class="field" style="margin-top:14px"><span>Destinataires</span><select id="ac"><option value="all">Toutes les cellules</option>'+DB.cells.map(function(c){ return '<option value="'+esc(c.id)+'">'+esc(c.code+' · '+c.nom)+'</option>'; }).join('')+'</select></label><div class="card" style="padding:2px 14px;box-shadow:none;margin-top:14px"><label class="sw"><div class="t"><b>Marquer comme important</b><span>Mise en avant sur l\'accueil des cellules</span></div><input type="checkbox" id="ai"><span class="k"></span></label></div>',
    foot:'<button class="btn" data-act="closesheet">Annuler</button><button class="btn pri" id="asave">'+I('send')+'Publier</button>'});
  sh.querySelector('#asave').onclick=async function(){ var t=$('#at').value.trim(), x=$('#ax').value.trim(); if(!t||!x){ toast('Titre et message obligatoires','err'); return; }
    await Store.save('annonces',{titre:t,texte:x,cible:$('#ac').value,important:$('#ai').checked,date:today(),auteur:U.nom,titre_auteur:U.titre}); log('Annonce publiée', t); closeSheet(); toast('Annonce publiée'); drawCom(); };
}

/* ---------- Comptes & accès ---------- */
RENDER.comptes=function(){
  var L=DB.users.filter(function(u){ return u.niveau===ST.usersTab; });
  var html='<div class="grid g3" style="margin-bottom:16px">'+kpi('shield','',DB.users.filter(function(u){ return u.niveau==='regional'; }).length,'Comptes du bureau régional')+kpi('users','gold',DB.users.filter(function(u){ return u.niveau==='local'; }).length,'Comptes des bureaux locaux')+kpi('layers','red',DB.cells.filter(function(c){ return !DB.users.some(function(u){ return u.celluleId===c.id; }); }).length,'Cellules sans compte')+'</div>'+
    '<div class="row between" style="margin-bottom:12px"><div class="seg">'+[['regional','Bureau régional'],['local','Bureaux locaux']].map(function(t){ return '<button class="'+(ST.usersTab===t[0]?'on':'')+'" data-act="utab" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div>'+(canEdit()?'<button class="btn pri" data-act="newuser">'+I('userplus')+'Nouveau compte</button>':'')+'</div>'+
    (DB.invites&&DB.invites.filter(function(x){ return x.niveau===ST.usersTab; }).length?'<div class="card" style="padding:8px 10px;margin-bottom:12px"><div class="sec-t" style="margin:6px 6px 4px">Invitations en attente de première connexion</div><div class="list">'+DB.invites.filter(function(x){ return x.niveau===ST.usersTab; }).map(function(x){ var c=cellById(x.celluleId); return '<div class="li" style="cursor:default">'+uavatar(x)+'<div class="t"><b>'+esc(x.nom)+'</b><span>'+esc(x.titre)+(c?' · '+esc(c.code+' '+c.nom):'')+'</span><span>'+esc(x.email)+'</span></div><div class="r"><span class="badge gold">'+I('send')+'Invité</span>'+(canEdit()?'<button class="btn sm ghost danger" data-act="delinvite" data-id="'+esc(x.id)+'">'+I('x')+'</button>':'')+'</div></div>'; }).join('')+'</div></div>':'')+
    '<div class="card" style="padding:8px 10px"><div class="list">'+(L.sort(function(a,b){ return (a.celluleId||'').localeCompare(b.celluleId||''); }).map(function(u){ var c=cellById(u.celluleId);
      return '<div class="li" data-act="edituser" data-id="'+esc(u.id)+'">'+uavatar(u)+'<div class="t"><b>'+esc(u.nom)+(u.id===U.id?' <span class="badge">Vous</span>':'')+'</b><span>'+esc(u.titre)+(c?' · '+esc(c.code+' '+c.nom):'')+'</span><span>'+esc(u.email||'')+'</span></div><div class="r"><span class="badge '+(u.acces==='lecture'?'blue':'')+'">'+(u.acces==='lecture'?I('eye')+'Lecture':I('edit')+'Gestion')+'</span>'+(u.actif===false?'<span class="badge red">Désactivé</span>':'')+'</div></div>'; }).join('')||emptyState('key','Aucun compte',''))+'</div></div>'+
    '<div class="card" style="margin-top:16px"><h3 style="font-size:15px;margin-bottom:10px">Niveaux d\'accès</h3><div class="grid g2"><div class="task" style="cursor:default"><span class="ic">'+I('shield')+'</span><div class="t"><b>Bureau régional</b><span>Voit et gère toute la région : cellules, comptes, validations, annonces, statistiques, cartes et exports.</span></div></div><div class="task" style="cursor:default"><span class="ic gold">'+I('users')+'</span><div class="t"><b>Bureau local</b><span>Enregistre et gère uniquement les GEEADISTES de sa cellule : fiches, suivi, inscriptions, cartes.</span></div></div></div><p class="sm mut" style="margin-top:12px">L\'accès « Lecture » permet de consulter sans rien modifier (ex. commissaire aux comptes).</p></div>';
  return {html:html};
};
function editUser(id, presetCell){
  var u=id?Object.assign({},DB.users.find(function(x){ return x.id===id; })):{nom:'',titre:'',niveau:presetCell?'local':ST.usersTab,celluleId:presetCell||'',email:'',telephone:'',acces:'complet',actif:true};
  if(!isReg()||!canEdit()){ if(id) toast('Seul le bureau régional gère les comptes','err'); return; }
  var sh=openSheet({title:id?'Modifier le compte':'Nouveau compte', auto:true, body:'<div id="ubody"></div>', foot:(id&&id!==U.id?'<button class="btn danger" id="udel">'+I('trash')+'</button>':'')+'<button class="btn" data-act="closesheet">Annuler</button><button class="btn pri" id="usave">'+I('check')+'Enregistrer</button>'});
  function draw(){ sh.querySelector('#ubody').innerHTML='<span class="field"><span>Niveau d\'accès</span></span><div class="big-opt" style="margin-bottom:16px">'+[['regional','Bureau régional','shield'],['local','Bureau local','users']].map(function(x){ return '<button class="opt '+(u.niveau===x[0]?'on':'')+'" data-un="'+x[0]+'">'+I(x[2])+x[1]+'</button>'; }).join('')+'</div>'+
    '<div class="fgrid"><label class="field"><span>Nom et prénoms <i>*</i></span><input data-u="nom" value="'+esc(u.nom)+'"></label><label class="field"><span>Titre / fonction <i>*</i></span><select data-u="titre"><option value="">Choisir…</option>'+TITRES[u.niveau].map(function(t){ return '<option '+(u.titre===t?'selected':'')+'>'+esc(t)+'</option>'; }).join('')+'</select></label>'+
    (u.niveau==='local'?'<label class="field full"><span>Cellule <i>*</i></span><select data-u="celluleId"><option value="">Choisir…</option>'+DB.cells.map(function(c){ return '<option value="'+esc(c.id)+'" '+(u.celluleId===c.id?'selected':'')+'>'+esc(c.code+' · '+c.nom)+'</option>'; }).join('')+'</select></label>':'')+
    '<label class="field"><span>E-mail de connexion <i>*</i></span><input type="email" data-u="email" value="'+esc(u.email)+'" '+(id&&Store.mode==='firebase'?'disabled':'')+'></label><label class="field"><span>Téléphone</span><input type="tel" data-u="telephone" value="'+esc(u.telephone)+'"></label>'+
    (!id&&Store.mode==='firebase'?'<label class="field full"><span>Mot de passe provisoire (facultatif)</span><input type="text" data-u="_pwd" value="'+esc(u._pwd||'')+'" placeholder="Laisser vide : la personne se connecte avec Google"></label><p class="xs mut full" style="margin-top:-6px">Sans mot de passe, une invitation est créée : la personne se connecte avec « Continuer avec Google » en utilisant cette adresse e-mail.</p>':'')+'</div>'+
    '<div class="card" style="padding:2px 14px;box-shadow:none;margin-top:16px"><label class="sw"><div class="t"><b>Peut modifier les données</b><span>Désactivé : accès en lecture seule</span></div><input type="checkbox" data-ub="acces" '+(u.acces!=='lecture'?'checked':'')+'><span class="k"></span></label><label class="sw"><div class="t"><b>Compte actif</b><span>Un compte désactivé ne peut plus se connecter</span></div><input type="checkbox" data-ub="actif" '+(u.actif!==false?'checked':'')+'><span class="k"></span></label></div>'; }
  draw();
  sh.querySelector('#ubody').onclick=function(e){ var b=e.target.closest('[data-un]'); if(b){ u.niveau=b.dataset.un; u.titre=''; if(u.niveau==='regional') u.celluleId=''; draw(); } };
  sh.querySelector('#ubody').oninput=sh.querySelector('#ubody').onchange=function(e){ var t=e.target; if(t.dataset.u) u[t.dataset.u]=t.value; if(t.dataset.ub==='acces') u.acces=t.checked?'complet':'lecture'; if(t.dataset.ub==='actif') u.actif=t.checked; };
  sh.querySelector('#usave').onclick=async function(){ if(!u.nom||!u.titre||!u.email||(u.niveau==='local'&&!u.celluleId)){ toast('Complétez les champs obligatoires','err'); return; }
    var pwd=u._pwd; delete u._pwd; var b=this; b.disabled=true;
    u.email=String(u.email||'').trim().toLowerCase();
    try{ if(!id&&Store.mode==='firebase'){ if(pwd){ if(pwd.length<8){ toast('Mot de passe provisoire : 8 caractères minimum','err'); b.disabled=false; return; } await Store.createAccount(u,pwd); } else { var invd=Object.assign({},u,{id:u.email,creeLe:today(),invitePar:U.nom}); delete invd._pwd; await Store.save('invites',invd); } } else await Store.save('users',u);
      log(id?'Compte modifié':'Compte créé', u.nom+' · '+u.titre); closeAllSheets(); toast(id?'Compte mis à jour':'Compte créé'); render(); }
    catch(er){ b.disabled=false; toast(er.code==='auth/email-already-in-use'?'Cet e-mail est déjà utilisé':'Erreur : '+er.message,'err'); } };
  var del=sh.querySelector('#udel'); if(del) del.onclick=async function(){ if(await confirmDlg({title:'Supprimer ce compte ?',text:u.nom+' ne pourra plus se connecter.',ok:'Supprimer'})){ await Store.remove('users',u.id); log('Compte supprimé', u.nom); closeAllSheets(); render(); toast('Compte supprimé'); } };
}

/* ---------- Journal ---------- */
RENDER.journal=function(){
  var q=norm(ST.jq), L=DB.logs.slice().sort(function(a,b){ return b.date.localeCompare(a.date); }).filter(function(l){ return !q||norm([l.auteur,l.action,l.detail].join(' ')).indexOf(q)>=0; });
  var ic=function(a){ return /suppr/i.test(a)?['trash','red']:/valid/i.test(a)?['checkc','']:/annonce/i.test(a)?['mega','gold']:/compte/i.test(a)?['key','blue']:/suivi/i.test(a)?['heart','']:/cellule/i.test(a)?['layers','blue']:/import/i.test(a)?['upload','gold']:['edit','']; };
  var html='<div class="toolbar"><div class="search">'+I('search')+'<input id="jq" placeholder="Filtrer par auteur, action, identifiant…" value="'+esc(ST.jq)+'"></div></div><div class="card">'+(L.slice(0,200).map(function(l){ var x=ic(l.action); return '<div class="task" style="cursor:default"><span class="ic '+x[1]+'">'+I(x[0])+'</span><div class="t"><b>'+esc(l.action)+'</b><span>'+esc(l.detail)+'</span><span style="display:block">'+esc(l.auteur)+(l.celluleId?' · '+esc(cellName(l.celluleId)):'')+'</span></div><span class="xs mut" style="white-space:nowrap">'+fmtRel(l.date)+'</span></div>'; }).join('')||emptyState('list','Aucune activité',''))+'</div>';
  return {html:html, mount:function(){ var j=$('#jq'); j.oninput=function(){ ST.jq=j.value; var p=j.selectionStart; render(); var n=$('#jq'); n.focus(); n.setSelectionRange(p,p); }; }};
};

/* ---------- Import / Export ---------- */
var COLS=[['id','Identifiant'],['nom','Nom'],['prenoms','Prénoms'],['sexe','Sexe'],['naissance','Date de naissance'],['age','Âge'],['telephone','Téléphone'],['whatsapp','WhatsApp'],['email','Email'],['commune','Commune'],['statut','Statut'],['niveau','Niveau'],['etablissement','Établissement'],['filiere','Filière'],['eglise','Église'],['cellule','Cellule'],['baptemeEau','Baptême eau'],['baptemeEsprit','Baptême Saint-Esprit'],['engagements','Engagements'],['talents','Talents'],['parentNom','Parent'],['parentTel','Tél. parent'],['paye','Carte payée'],['statutCarte','Statut carte'],['dateInscription','Date inscription']];
function toCSV(list){ return [COLS.map(function(c){ return c[1]; }).join(';')].concat(list.map(function(m){ return COLS.map(function(c){ var k=c[0], v=m[k];
  if(k==='cellule') v=m.celluleId?cellName(m.celluleId):''; if(k==='age') v=ageOf(m.naissance); if(k==='paye') v=m.carte&&m.carte.paye; if(k==='statutCarte') v=(m.carte||{}).statut;
  if(typeof v==='boolean') v=v?'Oui':'Non'; if(Array.isArray(v)) v=v.join(', '); return csvCell(v); }).join(';'); })).join('\n'); }
RENDER.donnees=function(){
  var html='<div class="grid g2"><div class="card"><div class="card-h"><div><h3>Importer des membres</h3><div class="sub">Réponses Google Forms ou fichier Excel enregistré en CSV</div></div><span class="av sm" style="background:var(--gold)">'+I('upload')+'</span></div>'+
    '<label class="btn pri block" style="min-height:56px">'+I('upload')+'Choisir un fichier CSV<input type="file" id="csvIn" accept=".csv,text/csv" hidden></label><div id="impRes" style="margin-top:12px"></div>'+
    '<p class="sm mut" style="margin-top:12px">Colonnes reconnues par leur titre : nom, prénoms, sexe, date de naissance, téléphone, WhatsApp, e-mail, commune, statut, niveau, école/établissement, filière/série, église, cellule (code ou nom). Chaque ligne reçoit un identifiant ; les doublons sont ignorés.</p><button class="btn sm" data-act="tpl" style="margin-top:12px">'+I('download')+'Modèle à remplir</button></div>'+
    '<div class="card"><div class="card-h"><div><h3>Exporter</h3><div class="sub">Fichiers compatibles Excel</div></div><span class="av sm" style="background:var(--brand)">'+I('download')+'</span></div>'+
    '<div class="task" data-act="exportall"><span class="ic">'+I('users')+'</span><div class="t"><b>Base des membres</b><span>'+fmtN(scopeM().length)+' fiches complètes</span></div>'+I('chevr','mut')+'</div>'+
    (isReg()?'<div class="task" data-act="exportstats"><span class="ic blue">'+I('chart')+'</span><div class="t"><b>Statistiques par cellule</b><span>Effectifs, sexe, statut, mineurs, cartes</span></div>'+I('chevr','mut')+'</div>':'')+
    '<div class="task" data-act="exportcontacts"><span class="ic gold">'+I('phone')+'</span><div class="t"><b>Annuaire téléphonique</b><span>Nom, identifiant, téléphone, parent</span></div>'+I('chevr','mut')+'</div></div></div>'+
    (Store.mode==='demo'&&isReg()?'<div class="card" style="margin-top:16px"><div class="row between"><div><h3 style="font-size:15px">Données de démonstration</h3><p class="sm mut">Remettre les données fictives à zéro sur cet appareil.</p></div><button class="btn danger" data-act="resetdemo">'+I('trash')+'Réinitialiser</button></div></div>':'');
  return {html:html, mount:function(){ $('#csvIn').onchange=async function(e){ var f=e.target.files[0]; if(!f) return; $('#impRes').innerHTML='<div class="skel" style="height:44px"></div>'; var r=await importCSV(await f.text()); $('#impRes').innerHTML=r.err?'<span class="badge red">'+esc(r.err)+'</span>':'<div class="task" style="cursor:default"><span class="ic">'+I('checkc')+'</span><div class="t"><b>'+r.ok+' membre(s) importé(s)</b><span>'+r.skip+' ligne(s) ignorée(s) (doublons ou sans nom)</span></div></div>'; if(!r.err){ toast(r.ok+' membre(s) importé(s)'); log('Import CSV', r.ok+' membres'); } }; }};
};
var ALIAS={nom:['nom','nom de famille'],prenoms:['prenoms','prenom'],sexe:['sexe','genre'],naissance:['date de naissance','naissance','date naissance'],telephone:['telephone','tel','contact','numero','numero de telephone'],whatsapp:['whatsapp','numero whatsapp'],email:['email','e mail','adresse e mail','adresse mail'],commune:['commune','lieu d habitation'],quartier:['quartier'],statut:['statut','eleve ou etudiant'],niveau:['niveau','classe','niveau d etude'],etablissement:['etablissement','ecole','universite','ecole universite','nom de l ecole','ecole ou universite'],filiere:['filiere','serie','serie filiere'],eglise:['eglise','eglise locale','assemblee'],cellule:['cellule','cellule geead']};
async function importCSV(text){
  var rows=parseCSV(text); if(rows.length<2) return {err:'Fichier vide'};
  var head=rows[0].map(norm), col={}; Object.keys(ALIAS).forEach(function(k){ var al=ALIAS[k], i=head.findIndex(function(h){ return al.indexOf(h)>=0; }); if(i<0) i=head.findIndex(function(h){ return al.some(function(a){ return h.indexOf(a)===0; }); }); if(i>=0) col[k]=i; });
  if(col.nom===undefined) return {err:'Colonne « Nom » introuvable'};
  var ok=0, skip=0;
  for(var r=1;r<rows.length;r++){ var row=rows[r]; var g=function(k){ return col[k]!==undefined?(row[col[k]]||'').trim():''; };
    var o={nom:g('nom').toUpperCase(),prenoms:g('prenoms'),naissance:parseDateFR(g('naissance')),telephone:g('telephone'),whatsapp:g('whatsapp')||g('telephone'),email:g('email'),commune:g('commune'),quartier:g('quartier'),etablissement:g('etablissement'),filiere:g('filiere'),eglise:g('eglise'),niveau:g('niveau')};
    if(!o.nom){ skip++; continue; }
    var sx=norm(g('sexe')); o.sexe=sx.indexOf('f')===0?'F':(sx.indexOf('m')===0||sx.indexOf('g')===0)?'M':'';
    o.statut=norm(g('statut')).indexOf('etu')===0||/licence|master|bts|doctorat/i.test(o.niveau)?'Étudiant':'Élève';
    var cv=norm(g('cellule')), c=cv?DB.cells.find(function(c){ return norm(c.code)===cv||norm(c.nom)===cv||norm(c.nom).indexOf(cv)>=0; }):null; o.celluleId=isReg()?(c?c.id:''):U.celluleId;
    if(DB.members.some(function(m){ return norm(m.nom+m.prenoms)===norm(o.nom+o.prenoms)&&m.naissance===o.naissance; })){ skip++; continue; }
    await Store.save('members', Object.assign(o,{id:'',baptemeEau:false,baptemeEsprit:false,engagements:[],annuaire:true,historique:[],carte:{paye:false,statut:'À produire'},dateInscription:today(),creePar:U.nom+' (import)'})); ok++; }
  return {ok:ok,skip:skip};
}

/* ---------- Paramètres & Plus ---------- */
var deferredInstall=null;
window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferredInstall=e; });
function isStandalone(){ return window.matchMedia('(display-mode: standalone)').matches||navigator.standalone; }
RENDER.parametres=function(){
  var c=cellById(U.celluleId), th=PREF.theme||'auto', ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  var html='<div class="grid g2"><div class="card"><div style="display:flex;gap:14px;align-items:center">'+uavatar(U,'lg')+'<div><h3 style="font-size:19px">'+esc(U.nom)+'</h3><p class="mut sm">'+esc(U.titre)+'</p><div class="row" style="margin-top:8px"><span class="badge">'+(isReg()?I('shield')+'Bureau régional':I('users')+'Bureau local · '+esc(c?c.nom:''))+'</span><span class="badge '+(canEdit()?'':'blue')+'">'+(canEdit()?'Gestion':'Lecture seule')+'</span></div></div></div>'+
    '<dl class="kv" style="margin-top:14px"><dt>E-mail</dt><dd>'+esc(U.email||'—')+'</dd><dt>Téléphone</dt><dd>'+esc(U.telephone||'—')+'</dd></dl><button class="btn block danger" data-act="logout" style="margin-top:14px">'+I('logout')+'Se déconnecter</button></div>'+
    '<div class="card"><h3 style="font-size:15.5px;margin-bottom:8px">Application</h3>'+
    '<div class="sw" style="cursor:default"><div class="t"><b>Apparence</b></div><div class="seg">'+[['auto','Auto'],['light','Clair'],['dark','Sombre']].map(function(t){ return '<button class="'+(th===t[0]?'on':'')+'" data-act="theme" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div></div>'+
    '<label class="sw"><div class="t"><b>Retour haptique</b><span>Vibrations légères au toucher (Android)</span></div><input type="checkbox" data-act="hapticpref" '+(PREF.haptic!==false?'checked':'')+'><span class="k"></span></label>'+
    '<div class="sw" style="cursor:default"><div class="t"><b>Installer sur le téléphone</b><span>'+(isStandalone()?'Application installée':ios?'Safari › Partager › « Sur l\'écran d\'accueil »':'Ajoute une icône comme une vraie application')+'</span></div>'+(isStandalone()?'<span class="badge">'+I('check')+'Installée</span>':'<button class="btn sm pri" data-act="install">'+I('phone2')+'Installer</button>')+'</div></div>'+
    (isReg()&&canEdit()?'<div class="card span2"><h3 style="font-size:15.5px;margin-bottom:14px">Paramètres de la région</h3><div class="fgrid"><label class="field"><span>Nom de la région</span><input id="p_reg" value="'+esc(DB.settings.region)+'"></label><label class="field"><span>Prix de la carte (F CFA)</span><input id="p_prix" type="number" inputmode="numeric" value="'+esc(DB.settings.prixCarte)+'"></label><label class="field"><span>Seuil de création d\'une cellule-école</span><input id="p_seuil" type="number" inputmode="numeric" min="2" value="'+esc(DB.settings.seuil)+'"></label><div style="display:flex;align-items:flex-end"><button class="btn pri block" data-act="savesettings">'+I('check')+'Enregistrer</button></div></div></div>':'')+'</div>'+
    '<p class="xs mut" style="text-align:center;margin-top:24px">GEEAD Abidjan Sud · Plateforme de recensement v2.0 · '+(Store.mode==='demo'?'Mode démonstration':'Connecté à la base sécurisée')+'</p>';
  return {html:html};
};
RENDER.plus=function(){
  var ex=bottomNav(); var items=[].concat.apply([],navGroups().map(function(g){ return g[1]; })).filter(function(k){ return ex.indexOf(k)<0; });
  var desc={validations:'Inscriptions à valider',cellules:'Les cellules locales',suivi:'Accompagnement des membres',opportunites:'Écoles prêtes pour une cellule',reseau:'Mentors, talents, écoles',cartes:'Production et paiements',communication:'Annonces et diffusion',comptes:'Bureaux et niveaux d\'accès',journal:'Historique des actions',donnees:'Import et export',parametres:'Profil et application'};
  var html='<div class="card" style="display:flex;gap:14px;align-items:center;margin-bottom:16px" data-act="goto" data-v="parametres">'+uavatar(U,'lg')+'<div style="flex:1"><h3 style="font-size:18px">'+esc(U.nom)+'</h3><p class="sm mut">'+esc(U.titre)+'</p></div>'+I('chevr','mut')+'</div><div class="tiles">'+items.map(function(k){ return '<a class="tile" href="#'+k+'"><span class="ic">'+I(VIEWS[k].i)+'</span><b>'+esc(vt(k))+'</b><span>'+esc(desc[k]||'')+'</span></a>'; }).join('')+'</div><button class="btn block danger" data-act="logout" style="margin-top:18px">'+I('logout')+'Se déconnecter</button>';
  return {html:html};
};
function applyTheme(){ var t=PREF.theme||'auto'; if(t==='auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme',t);
  var m=$('meta[name=theme-color]'); if(m) m.content=t==='dark'?'#0a100c':'#04331a'; }

/* ---------- Formulaire public ---------- */
function renderPublic(){
  $('#root').innerHTML='<div class="public view"><div class="pub-h"><img src="'+LOGO+'" alt="Logo GEEAD"><h1>Recensement GEEAD Abidjan Sud</h1><p>Élève ou étudiant des Assemblées de Dieu ? Inscris-toi en 2 minutes. Ton responsable de cellule validera ta fiche et tu recevras ton identifiant de membre.</p></div><div class="pub-b"><div class="card" style="padding:22px"><div id="pwb"></div><div id="pwf" class="row" style="margin-top:22px;justify-content:flex-end"></div></div>'+(U||Store.mode==='demo'?'<p class="sm" style="text-align:center;margin-top:16px"><a href="#accueil">'+I('chevl')+' Retour à l\'espace des responsables</a></p>':'')+'</div></div>';
  var w=new Wizard({mode:'public', submitLabel:'Envoyer mon inscription', onSubmit: async function(d){ d.consentement=true; await Store.submitPublic(d); log('Inscription reçue', fullName(d), d.celluleId); confetti();
    $('#pwb').parentNode.innerHTML='<div class="success"><div class="ok"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2 style="font-size:22px;font-weight:800">Merci '+esc(d.prenoms.split(' ')[0])+' !</h2><p class="mut" style="margin:8px auto 22px;max-width:36ch">Ton inscription est bien arrivée. Ton responsable de cellule va la valider et tu recevras ton identifiant GEEADAS.</p><button class="btn pri" data-act="pubagain">'+I('userplus')+'Inscrire une autre personne</button></div>'; } });
  w.mount($('#pwb'), $('#pwf'));
}

/* =====================================================================
   ACTIONS (délégation des clics)
   ===================================================================== */
var ACT={
  closesheet:function(){ closeSheet(); },
  copyout:function(){ var t=$('#txtout'); copyText(t.value); t.select(); },
  demologin:function(el){ var u=DB.users.find(function(x){ return x.id===el.dataset.id; }); setSession(u); ST.f={cell:'',statut:'',sexe:'',niveau:'',carte:''}; ST.dashCell=''; ST.q=''; haptic('success'); history.replaceState(null,'','#accueil'); render(); toast('Bienvenue, '+u.nom); },
  logout:async function(){ if(!(await confirmDlg({title:'Se déconnecter ?',text:'Vous devrez vous reconnecter pour accéder à l\'espace.',ok:'Déconnexion',icon:'logout',tone:'brand'}))) return; if(Store.mode==='firebase'){ await Store.fb.auth.signOut(); } setSession(null); closeAllSheets(); history.replaceState(null,'','#accueil'); render(); },
  profile:function(){ go(window.innerWidth<900?'plus':'parametres'); },
  goto:function(el){ var v=el.dataset.v; if(v==='membres-incomplets'){ ST.f={cell:'',statut:'',sexe:'',niveau:'',carte:'incomplet'}; v='membres'; } go(v); },
  newmember:function(){ if(canEdit()) openWizard(null); },
  'newmember-again':function(){ closeSheet(); setTimeout(function(){ openWizard(null); },300); },
  'member-from-success':function(el){ closeSheet(); setTimeout(function(){ openMember(el.dataset.id); },300); },
  member:function(el,e){ e.preventDefault(); openMember(el.dataset.id, el.dataset.tab); },
  editmember:function(el){ openWizard(DB.members.find(function(m){ return m.id===el.dataset.id; })); },
  mtab:function(el){ var sh=topSheet(); if(!sh) return; sh.dataset.tab=el.dataset.v; refreshMemberSheet(); },
  addnote:function(el){ openNote(el.dataset.id); },
  copy:function(el){ copyText(el.dataset.v, 'Copié : '+el.dataset.v); },
  delmember:async function(el){ var m=DB.members.find(function(x){ return x.id===el.dataset.id; }); if(await confirmDlg({title:'Supprimer '+fullName(m)+' ?',text:'La fiche '+m.id+' et son historique seront supprimés définitivement.',ok:'Supprimer'})){ await Store.remove('members',m.id); log('Membre supprimé', m.id+' · '+fullName(m), m.celluleId); closeAllSheets(); toast('Membre supprimé'); render(); } },
  transfer:function(el){ var m=DB.members.find(function(x){ return x.id===el.dataset.id; });
    picker('Rattacher à une cellule', DB.cells.map(function(c){ return [c.id,c.code+' · '+c.nom,c.eglise]; }), m.celluleId, async function(v){ if(v===m.celluleId) return;
      m.historique=(m.historique||[]).concat([{date:today(),champ:'Cellule',de:cellName(m.celluleId),a:cellName(v),par:U.nom}]); var old=m.celluleId; m.celluleId=v; if(!m.eglise){ m.eglise=cellById(v).eglise; }
      await Store.save('members',m); log('Transfert de cellule', m.id+' · '+cellName(old)+' → '+cellName(v), v); toast('Rattaché à '+cellName(v)); if(!isReg()){ closeAllSheets(); render(); } else { refreshMemberSheet(); rerenderSoft(); } }); },
  cartepaye:async function(el){ var m=DB.members.find(function(x){ return x.id===el.dataset.id; }); m.carte=Object.assign({statut:'À produire'},m.carte,{paye:el.checked}); await Store.save('members',m); log(el.checked?'Carte payée':'Paiement annulé', m.id, m.celluleId); toast(el.checked?'Paiement enregistré':'Paiement retiré'); rerenderSoft(); },
  cartestatut:async function(el){ var m=DB.members.find(function(x){ return x.id===el.dataset.id; }); m.carte=Object.assign({paye:false},m.carte,{statut:el.dataset.v}); await Store.save('members',m); log('Carte : '+el.dataset.v, m.id, m.celluleId); refreshMemberSheet(); rerenderSoft(); toast('Carte : '+el.dataset.v); },
  togglepaye:async function(el,e){ e.stopPropagation(); if(!canEdit()) return; var m=DB.members.find(function(x){ return x.id===el.dataset.id; }); var p=!(m.carte&&m.carte.paye); m.carte=Object.assign({statut:'À produire'},m.carte,{paye:p}); await Store.save('members',m); log(p?'Carte payée':'Paiement annulé', m.id, m.celluleId); haptic('success'); rerenderSoft(); },
  printone:function(el){ printCards([DB.members.find(function(m){ return m.id===el.dataset.id; })]); },
  printlot:function(){ printCards(cartesList()); },
  exportcards:function(){ var L=cartesList(); download('cartes-imprimeur.csv',['Identifiant;Nom;Prénoms;Cellule;Établissement;Niveau;Église;Contenu QR'].concat(L.map(function(m){ var c=cellById(m.celluleId); return [m.id,m.nom,m.prenoms,c?c.code:'',m.etablissement,m.niveau,m.eglise,'GEEADAS|'+m.id+'|'+fullName(m)].map(csvCell).join(';'); })).join('\n')); },
  markprinted:async function(){ var L=cartesList(); if(!(await confirmDlg({title:'Marquer '+L.length+' cartes comme imprimées ?',ok:'Confirmer',icon:'printer',tone:'brand'}))) return; for(var i=0;i<L.length;i++){ L[i].carte.statut='Imprimée'; await Store.save('members',L[i]); } log('Lot de cartes imprimé', L.length+' cartes'); toast(L.length+' cartes marquées imprimées'); render(); },
  cartesf:function(el){ ST.cartesF=el.dataset.v; rerenderSoft(); },
  fstatut:function(el){ ST.f.statut=el.dataset.v; rerenderSoft(); }, fsexe:function(el){ ST.f.sexe=ST.f.sexe===el.dataset.v?'':el.dataset.v; rerenderSoft(); },
  fniveau:function(){ picker('Niveau d\'étude',[['','Tous les niveaux']].concat(ORDRE_NIV.map(function(n){ return [n,n]; })), ST.f.niveau, function(v){ ST.f.niveau=v; rerenderSoft(); }); },
  fcell:function(){ picker('Cellule',[['','Toutes les cellules'],['_none','Sans cellule (isolés)']].concat(DB.cells.map(function(c){ return [c.id,c.code+' · '+c.nom]; })), ST.f.cell, function(v){ ST.f.cell=v; rerenderSoft(); }); },
  fcarte:function(){ picker('Statut',[['','Tous'],['paye','Carte payée'],['nonpaye','Carte non payée'],['incomplet','Fiche incomplète']], ST.f.carte, function(v){ ST.f.carte=v; rerenderSoft(); }); },
  freset:function(){ ST.f={cell:'',statut:'',sexe:'',niveau:'',carte:''}; rerenderSoft(); },
  clearq:function(){ ST.q=''; rerenderSoft(); },
  sort:function(){ picker('Trier par',[['recent','Plus récents'],['nom','Nom A → Z'],['id','Identifiant']], ST.sort, function(v){ ST.sort=v; rerenderSoft(); }); },
  more:function(el){ drawMembers(+el.dataset.v); },
  selmode:function(){ ST.selMode=!ST.selMode; ST.sel.clear(); rerenderSoft(); },
  togglesel:function(el){ var id=el.dataset.id; if(ST.sel.has(id)) ST.sel.delete(id); else ST.sel.add(id); el.classList.toggle('sel'); drawSelbar(); },
  bulkall:function(){ filteredMembers().forEach(function(m){ ST.sel.add(m.id); }); drawMembers(); },
  bulkexport:function(){ download('selection-geeadas.csv', toCSV(DB.members.filter(function(m){ return ST.sel.has(m.id); }))); },
  bulkwa:function(){ var nums=DB.members.filter(function(m){ return ST.sel.has(m.id); }).map(function(m){ return telIntl(m.whatsapp||m.telephone); }).filter(Boolean); copyText(nums.map(function(n){ return '+'+n; }).join('\n'), nums.length+' numéros copiés'); },
  bulkpaye:async function(){ var L=DB.members.filter(function(m){ return ST.sel.has(m.id); }); for(var i=0;i<L.length;i++){ L[i].carte=Object.assign({statut:'À produire'},L[i].carte,{paye:true}); await Store.save('members',L[i]); } log('Paiements groupés', L.length+' cartes'); toast(L.length+' cartes marquées payées'); ST.sel.clear(); drawMembers(); },
  bulktransfer:function(){ picker('Transférer vers', DB.cells.map(function(c){ return [c.id,c.code+' · '+c.nom]; }), '', async function(v){ var L=DB.members.filter(function(m){ return ST.sel.has(m.id); }); for(var i=0;i<L.length;i++){ var m=L[i]; if(m.celluleId===v) continue; m.historique=(m.historique||[]).concat([{date:today(),champ:'Cellule',de:cellName(m.celluleId),a:cellName(v),par:U.nom}]); m.celluleId=v; await Store.save('members',m); } log('Transfert groupé', L.length+' membres → '+cellName(v), v); toast(L.length+' membres transférés'); ST.sel.clear(); drawMembers(); }); },
  dashcell:function(){ picker('Statistiques de',[['','Toute la région']].concat(DB.cells.map(function(c){ return [c.id,c.code+' · '+c.nom]; })), ST.dashCell, function(v){ ST.dashCell=v; render(); }); },
  cellsheet:function(el){ openCell(el.dataset.v); },
  cellmembers:function(el){ ST.f={cell:el.dataset.v,statut:'',sexe:'',niveau:'',carte:''}; ST.q=''; closeAllSheets(); go('membres'); },
  editcell:function(el){ editCell(el.dataset.v||null); },
  mkcell:function(el){ editCell(null,{nom:el.dataset.v,etablissement:el.dataset.v}); },
  valins:function(el){ validateIns(el.dataset.id); },
  reviewins:function(el){ var x=DB.inscriptions.find(function(i){ return i.id===el.dataset.id; }); openWizard(Object.assign({},x,{id:''}),{fromIns:x.id,title:'Revoir l\'inscription',submitLabel:'Valider et générer l\'ID'}); },
  rejins:async function(el){ var x=DB.inscriptions.find(function(i){ return i.id===el.dataset.id; }); if(await confirmDlg({title:'Rejeter l\'inscription ?',text:fullName(x)+' — la fiche sera supprimée.',ok:'Rejeter'})){ await Store.remove('inscriptions',x.id); log('Inscription rejetée', fullName(x), x.celluleId); toast('Inscription rejetée'); rerenderSoft(); } },
  sharelink:function(){ var txt='Élève ou étudiant des Assemblées de Dieu ? Fais-toi recenser au GEEAD '+(DB.settings.region||'')+' : '+inscLink(); if(navigator.share&&!IN_FRAME){ navigator.share({title:'Recensement GEEAD',text:txt}).catch(function(){}); } else copyText(txt,'Message et lien copiés'); },
  rtab:function(el){ ST.rTab=el.dataset.v; $$('[data-act=rtab]').forEach(function(b){ b.classList.toggle('on',b===el); }); drawReseau(); },
  comtab:function(el){ ST.comTab=el.dataset.v; $$('[data-act=comtab]').forEach(function(b){ b.classList.toggle('on',b===el); }); drawCom(); },
  newannonce:function(){ newAnnonce(); },
  delannonce:async function(el){ if(await confirmDlg({title:'Supprimer cette annonce ?',ok:'Supprimer'})){ await Store.remove('annonces',el.dataset.id); toast('Annonce supprimée'); drawCom(); } },
  copynums:function(){ var n=diffList().map(function(m){ return telIntl(m.whatsapp||m.telephone); }).filter(Boolean); copyText(n.map(function(x){ return '+'+x; }).join('\n'), n.length+' numéros copiés'); },
  copymsg:function(){ copyText(ST.dmsg||$('#dmsg').value,'Message copié'); },
  exportdiff:function(){ download('diffusion.csv',['Identifiant;Nom;Prénoms;WhatsApp;Message'].concat(diffList().map(function(m){ return [m.id,m.nom,m.prenoms,'+'+telIntl(m.whatsapp||m.telephone),personalize(m)].map(csvCell).join(';'); })).join('\n')); },
  utab:function(el){ ST.usersTab=el.dataset.v; render(); },
  newuser:function(el){ editUser(null, el.dataset.v); },
  edituser:function(el){ editUser(el.dataset.id); },
  exportall:function(){ download('base-geeadas.csv', toCSV(scopeM())); log('Export', 'Base des membres'); },
  exportstats:function(){ download('stats-cellules.csv',['Code;Cellule;Membres;Filles;Garçons;Élèves;Étudiants;Mineurs;Cartes payées'].concat(DB.cells.map(function(c){ var L=DB.members.filter(function(m){ return m.celluleId===c.id; }), s=statsBlock(L); return [c.code,c.nom,s.n,s.f,s.g,s.el,s.et,s.mineurs,s.payes].map(csvCell).join(';'); })).join('\n')); },
  exportcontacts:function(){ download('annuaire.csv',['Identifiant;Nom et prénoms;Cellule;Téléphone;WhatsApp;Parent;Tél. parent'].concat(scopeM().map(function(m){ return [m.id,fullName(m),cellName(m.celluleId),m.telephone,m.whatsapp,m.parentNom,m.parentTel].map(csvCell).join(';'); })).join('\n')); },
  tpl:function(){ download('modele-recensement.csv','Nom;Prénoms;Sexe;Date de naissance;Téléphone;WhatsApp;Email;Commune;Statut;Niveau;Établissement;Filière;Église;Cellule\nKOUASSI;Grâce;F;15/03/2009;0700000000;0700000000;;Koumassi;Élève;2nde;Lycée Moderne de Koumassi;Série A;AD Koumassi Remblais;C06'); },
  resetdemo:async function(){ if(await confirmDlg({title:'Réinitialiser la démonstration ?',text:'Toutes les saisies faites sur cet appareil seront effacées.',ok:'Réinitialiser'})){ var id=U.id; Store.reset(); setSession(DB.users.find(function(u){ return u.id===id; })||DB.users[0]); render(); toast('Démonstration réinitialisée'); } },
  theme:function(el){ PREF.theme=el.dataset.v; savePref(); applyTheme(); $$('[data-act=theme]').forEach(function(b){ b.classList.toggle('on',b===el); }); },
  hapticpref:function(el){ PREF.haptic=el.checked; savePref(); haptic('success'); },
  install:function(){ if(deferredInstall){ deferredInstall.prompt(); deferredInstall.userChoice.then(function(){ deferredInstall=null; }); } else openSheet({title:'Installer l\'application',auto:true,body:'<div class="task" style="cursor:default"><span class="ic">'+I('phone2')+'</span><div class="t"><b>Android (Chrome)</b><span>Menu ⋮ › « Installer l\'application » ou « Ajouter à l\'écran d\'accueil ».</span></div></div><div class="task" style="cursor:default"><span class="ic gold">'+I('phone2')+'</span><div class="t"><b>iPhone (Safari)</b><span>Bouton Partager › « Sur l\'écran d\'accueil ».</span></div></div><p class="sm mut" style="margin-top:12px">L\'installation est disponible sur la version en ligne de la plateforme.</p>'}); },
  savesettings:async function(){ DB.settings.region=$('#p_reg').value.trim()||'Abidjan Sud'; DB.settings.prixCarte=+$('#p_prix').value||0; DB.settings.seuil=Math.max(2,+$('#p_seuil').value||5); await Store.saveSettings(); log('Paramètres modifiés',''); toast('Paramètres enregistrés'); render(); },
  resetpwd:async function(){ var e=$('#le').value.trim(); if(!e){ toast('Saisissez votre e-mail d\'abord','err'); return; } try{ await Store.fb.auth.sendPasswordResetEmail(e); toast('E-mail de réinitialisation envoyé'); }catch(er){ toast('Adresse inconnue','err'); } },
  pubagain:function(){ renderPublic(); },
  googlelogin:async function(el){ var p=new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({prompt:'select_account'}); el.disabled=true;
    try{ await Store.fb.auth.signInWithPopup(p); }
    catch(er){ if(er.code==='auth/popup-blocked'||er.code==='auth/operation-not-supported-in-this-environment'){ await Store.fb.auth.signInWithRedirect(p); } else if(er.code!=='auth/popup-closed-by-user'&&er.code!=='auth/cancelled-popup-request'){ renderLogin('Connexion Google impossible : '+(er.message||er.code)); } el.disabled=false; } },
  delinvite:async function(el,e){ e.stopPropagation(); if(!(await confirmDlg({title:'Annuler cette invitation ?',ok:'Annuler l\'invitation'}))) return; await Store.remove('invites',el.dataset.id); toast('Invitation annulée'); render(); }
};
function cartesList(){ var M=scopeM(); return ({tous:M,nonpaye:M.filter(function(m){ return !(m.carte&&m.carte.paye); }),aproduire:M.filter(function(m){ return m.carte&&m.carte.paye&&m.carte.statut==='À produire'; }),imprimee:M.filter(function(m){ return (m.carte||{}).statut==='Imprimée'; }),remise:M.filter(function(m){ return (m.carte||{}).statut==='Remise'; })})[ST.cartesF]; }
document.addEventListener('click', function(e){
  if(e.target.closest('[data-noopen]')) { e.stopPropagation(); return; }
  var el=e.target.closest('[data-act]'); if(!el) return;
  var a=el.dataset.act; if(!ACT[a]) return;
  if(el.tagName==='INPUT'){ return; }
  ACT[a](el,e);
});
document.addEventListener('change', function(e){ var el=e.target; if(el.tagName==='INPUT'&&el.dataset.act&&ACT[el.dataset.act]) ACT[el.dataset.act](el,e); });

/* =====================================================================
   DÉMARRAGE
   ===================================================================== */
function loadScript(src){ return new Promise(function(res,rej){ var s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
function hideSplash(){ var s=$('#splash'); if(s){ s.classList.add('out'); setTimeout(function(){ s.remove(); },500); } }
async function boot(){
  applyTheme(); try{ $('#splimg').src=LOGO; }catch(e){}
  if(Store.mode==='demo'){
    Store.loadDemo();
    var sid=null; try{ sid=localStorage.getItem('geeadas-session'); }catch(e){}
    U=DB.users.find(function(u){ return u.id===sid&&u.actif!==false; })||null;
    setTimeout(function(){ render(); hideSplash(); }, 650);
    return;
  }
  var base='https://www.gstatic.com/firebasejs/10.12.2/';
  try{ await loadScript(base+'firebase-app-compat.js'); await loadScript(base+'firebase-auth-compat.js'); await loadScript(base+'firebase-firestore-compat.js'); }
  catch(e){ $('#root').innerHTML=emptyState('alert','Connexion impossible','Vérifiez votre connexion internet puis rechargez la page.'); hideSplash(); return; }
  firebase.initializeApp(FIREBASE_CONFIG); Store.fb={auth:firebase.auth(), db:firebase.firestore()};
  try{ Store.fb.db.enablePersistence({synchronizeTabs:true}).catch(function(){}); }catch(e){}
  if(location.hash==='#inscription'){ try{ DB.cells=(await Store.fb.db.collection('cellules').get()).docs.map(function(d){ return Object.assign({},d.data(),{id:d.id}); }); }catch(e){} }
  Store.fb.auth.onAuthStateChanged(async function(fu){
    if(!fu){ U=null; render(); hideSplash(); return; }
    try{
      var db=Store.fb.db, p=await db.collection('utilisateurs').doc(fu.uid).get();
      if(!p.exists){
        var email=String(fu.email||'').toLowerCase(), inv=null, data=null;
        try{ inv=await db.collection('invitations').doc(email).get(); }catch(e){ inv=null; }
        if(inv&&inv.exists){ data=Object.assign({},inv.data(),{email:email,actif:true}); delete data.id; }
        else if(email&&email===BOOTSTRAP_ADMIN.toLowerCase()){ data={nom:fu.displayName||'Administrateur',titre:'Administrateur(trice) de la plateforme',niveau:'regional',celluleId:'',email:email,telephone:'',acces:'complet',actif:true}; }
        if(data){ await db.collection('utilisateurs').doc(fu.uid).set(data); if(inv&&inv.exists){ try{ await db.collection('invitations').doc(email).delete(); }catch(e){} } p=await db.collection('utilisateurs').doc(fu.uid).get(); }
      }
      if(!p.exists||p.data().actif===false){ await Store.fb.auth.signOut(); renderLogin('Le compte '+(fu.email||'')+' n\'est pas autorisé. Demandez au bureau régional de vous inviter avec cette adresse.'); hideSplash(); return; }
      U=Object.assign({},p.data(),{id:fu.uid});
      await Store.loadFirebase(U); render(); hideSplash();
    }catch(er){ console.error(er); $('#root').innerHTML=emptyState('alert','Erreur de chargement',er.message); hideSplash(); }
  });
}
boot();
