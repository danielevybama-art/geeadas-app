/* GEEAD ABIDJAN SUD — Accès et bureaux : demandes, validation, comptes */

function demandeLi(d, actions){ var c=cellById(d.celluleId);
  return '<div class="req">'+uavatar({id:d.id,nom:(d.prenoms||'')+' '+(d.nom||'')})+'<div class="t"><b>'+esc((d.prenoms||'')+' '+(d.nom||'').toUpperCase())+'</b><span class="pst">'+esc(d.poste)+'</span><span>'+(d.niveau==='regional'?I('shield')+'Bureau régional':I('layers')+esc(c?c.code+' · '+c.nom:'Cellule inconnue'))+'</span><span>'+I('phone')+esc(fmtTel(d.telephone))+' · '+esc(d.email||'')+'</span><span class="xs mut">Demande envoyée '+fmtRel(d.date)+'</span>'+
    (d.statut==='refusee'?'<span class="badge red">Refusée'+(d.motif?' : '+esc(d.motif):'')+'</span>':d.statut==='validee'?'<span class="badge">'+I('check')+'Validée par '+esc(d.traitePar||'')+'</span>':'')+'</div>'+
    (actions?'<div class="ra"><button class="btn sm ghost danger" data-act="refusedemande" data-id="'+esc(d.id)+'">Refuser</button><button class="btn sm pri" data-act="valdemande" data-id="'+esc(d.id)+'">'+I('check')+'Valider</button></div>':'')+'</div>'; }
function canManageUser(u){ return !!U && u.id!==U.id && (isAdmin() || (u.niveau==='local' && can('acces'))); }
RENDER.acces=function(){
  var P=pendingDemandes().sort(function(a,b){ return (a.date||'').localeCompare(b.date||''); });
  var hist=(DB.demandes||[]).filter(function(d){ return d.statut!=='en_attente' && (isAdmin()||d.niveau==='local'); }).sort(function(a,b){ return (b.traiteLe||'').localeCompare(a.traiteLe||''); }).slice(0,8);
  var regU=DB.users.filter(function(u){ return u.niveau==='regional'; }), locU=DB.users.filter(function(u){ return u.niveau==='local'; });
  var sansBureau=DB.cells.filter(function(c){ return !locU.some(function(u){ return u.celluleId===c.id; }); });
  var tab=ST.accTab||'demandes', h='';
  if(tab==='demandes'){
    h=(P.length?'<div class="card" style="padding:6px 8px">'+P.map(function(d){ return demandeLi(d,true); }).join('')+'</div>':emptyState('checkc','Aucune demande en attente',isAdmin()?'Les demandes des bureaux régional et locaux apparaîtront ici.':'Les demandes des bureaux locaux apparaîtront ici.'))+
      (hist.length?'<div class="sec-t">Traitées récemment</div><div class="card" style="padding:6px 8px">'+hist.map(function(d){ return demandeLi(d,false); }).join('')+'</div>':'');
  } else if(tab==='regional'){
    h='<div class="card" style="padding:8px 10px"><div class="list">'+regU.map(function(u){ return userLi(u); }).join('')+'</div></div>';
  } else {
    var byCell=DB.cells.slice().sort(function(a,b){ return a.code.localeCompare(b.code); }).map(function(c){ var L=locU.filter(function(u){ return u.celluleId===c.id; }); return '<div class="card cellblock"><div class="card-h"><div style="display:flex;gap:10px;align-items:center"><span class="code">'+esc(c.code)+'</span><h3>'+esc(c.nom)+'</h3></div><span class="badge '+(L.length?'':'red')+'">'+(L.length?L.length+' responsable'+(L.length>1?'s':''):'Aucun bureau')+'</span></div>'+(L.length?'<div class="list">'+L.map(function(u){ return userLi(u); }).join('')+'</div>':'')+'</div>'; }).join('');
    h='<div class="grid g2">'+(byCell||emptyState('layers','Aucune cellule','Créez d\'abord les cellules.'))+'</div>';
  }
  var html='<div class="grid g4" style="margin-bottom:16px">'+kpi('key','gold',P.length,'Demandes à traiter')+kpi('shield','',regU.length,'Bureau régional')+kpi('users','blue',locU.length,'Responsables locaux')+kpi('layers','red',sansBureau.length,'Cellules sans bureau')+'</div>'+
    '<div class="card note"><b>'+I('shield')+'Qui valide quoi ?</b><span>L\'administrateur de la plateforme valide les membres du <b>bureau régional</b>. Le bureau régional valide ensuite les membres des <b>bureaux locaux</b>. Chaque accès ouvre uniquement les droits du poste occupé.</span></div>'+
    '<div class="seg full" style="margin:16px 0;max-width:560px">'+[['demandes','Demandes'+(P.length?' ('+P.length+')':'')],['regional','Bureau régional'],['local','Bureaux locaux']].map(function(t){ return '<button class="'+(tab===t[0]?'on':'')+'" data-act="acctab" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div><div class="stepv">'+h+'</div>';
  return {html:html};
};
function userLi(u){ var c=cellById(u.celluleId), m=canManageUser(u);
  return '<div class="li" '+(m?'data-act="editaccount" data-id="'+esc(u.id)+'"':'style="cursor:default"')+'>'+uavatar(u)+'<div class="t"><b>'+esc(u.nom)+(U&&u.id===U.id?' <span class="badge">Vous</span>':'')+'</b><span>'+esc(u.titre)+(c&&u.niveau==='regional'?'':'')+'</span><span>'+esc(u.email||'')+(u.telephone?' · '+esc(u.telephone):'')+'</span></div><div class="r">'+(u.admin?'<span class="badge gold">'+I('star')+'Admin</span>':'<span class="badge '+(u.acces==='lecture'?'blue':'')+'">'+(u.acces==='lecture'?'Lecture':'Gestion')+'</span>')+(u.actif===false?'<span class="badge red">Suspendu</span>':'')+'</div>'+(m?I('chevr','chev'):'')+'</div>'; }
function permsList(niveau, titre){ var P=niveau==='regional'&&/Administrateur/.test(titre)?ALL_PERMS:permsOfPoste(niveau,titre);
  return '<ul class="perms">'+P.filter(function(p){ return niveau==='regional'||['acces','cellules','annonces','journal','opportunites','parametres','stats','membres.delete'].indexOf(p)<0; }).map(function(p){ return '<li>'+I('check')+esc(PERM_LABELS[p]||p)+'</li>'; }).join('')+'</ul>'; }
function posteSheet(o){
  // o: {title, niveau, poste, celluleId, intro, okLabel, onOk(poste, celluleId, actif), actif, showActif, onDelete}
  var st={poste:o.poste, cell:o.celluleId||'', actif:o.actif!==false};
  var sh=openSheet({title:o.title, auto:true, focus:false, body:'<div id="pb"></div>', foot:(o.onDelete?'<button class="btn danger" id="pdel">'+I('trash')+'</button>':'')+'<button class="btn" data-act="closesheet">Annuler</button><button class="btn pri" id="pok">'+I('check')+esc(o.okLabel)+'</button>'});
  function draw(){ sh.querySelector('#pb').innerHTML=(o.intro||'')+'<span class="field"><span>Poste</span></span><div class="postes">'+POSTES[o.niveau].map(function(p){ return '<button class="poste '+(st.poste===p.t?'on':'')+'" data-p="'+esc(p.t)+'"><b>'+esc(p.t)+'</b><span>'+esc(p.d)+'</span></button>'; }).join('')+'</div>'+
    (o.niveau==='local'?'<label class="field" style="margin-top:14px"><span>Cellule</span><select id="pcell">'+DB.cells.map(function(c){ return '<option value="'+esc(c.id)+'" '+(st.cell===c.id?'selected':'')+'>'+esc(c.code+' · '+c.nom)+'</option>'; }).join('')+'</select></label>':'')+
    (o.showActif?'<div class="card" style="padding:2px 14px;box-shadow:none;margin-top:14px"><label class="sw"><div class="t"><b>Accès actif</b><span>Désactivé : la personne ne peut plus se connecter</span></div><input type="checkbox" id="pact" '+(st.actif?'checked':'')+'><span class="k"></span></label></div>':'')+
    '<div class="sec-t">Ce poste pourra</div>'+permsList(o.niveau, st.poste); }
  draw();
  sh.querySelector('#pb').onclick=function(e){ var b=e.target.closest('[data-p]'); if(b){ st.poste=b.dataset.p; var y=sh.querySelector('.sheet-b').scrollTop; draw(); sh.querySelector('.sheet-b').scrollTop=y; haptic(); } };
  sh.querySelector('#pb').onchange=function(e){ if(e.target.id==='pcell') st.cell=e.target.value; if(e.target.id==='pact') st.actif=e.target.checked; };
  sh.querySelector('#pok').onclick=async function(){ if(!st.poste){ toast('Choisissez un poste','err'); return; } if(o.niveau==='local'&&!st.cell){ toast('Choisissez la cellule','err'); return; } this.disabled=true; try{ await o.onOk(st.poste, st.cell, st.actif); }catch(er){ this.disabled=false; toast('Erreur : '+(er.message||er.code),'err'); } };
  if(o.onDelete) sh.querySelector('#pdel').onclick=o.onDelete;
}
function openValidation(id){
  var d=(DB.demandes||[]).find(function(x){ return x.id===id; }); if(!d||!canValidate(d)) return;
  posteSheet({title:'Valider l\'accès', niveau:d.niveau, poste:d.poste, celluleId:d.celluleId, okLabel:'Valider l\'accès',
    intro:'<div class="req" style="margin:-4px 0 14px;padding:0">'+uavatar({id:d.id,nom:d.prenoms+' '+d.nom},'lg')+'<div class="t"><b style="font-size:17px">'+esc(d.prenoms+' '+(d.nom||'').toUpperCase())+'</b><span>'+esc(fmtTel(d.telephone))+' · '+esc(d.email)+'</span><span>'+(d.niveau==='regional'?'Bureau régional':'Bureau local')+' · demande du '+fmtD(d.date)+'</span></div></div><p class="sm mut" style="margin-bottom:12px">Vérifiez le poste avant de valider : il détermine ce que la personne pourra voir et faire.</p>',
    onOk: async function(poste, cell){
      var u={id:d.id, nom:((d.prenoms||'')+' '+(d.nom||'').toUpperCase()).trim(), titre:poste, niveau:d.niveau, celluleId:d.niveau==='local'?cell:'', email:d.email||'', telephone:d.telephone||'', acces:accesForPoste(d.niveau,poste), actif:true, validePar:U.nom, valideLe:today()};
      await Store.save('users', u);
      await Store.save('demandes', Object.assign({}, d, {statut:'validee', poste:poste, celluleId:u.celluleId, traitePar:U.nom, traiteLe:nowISO()}));
      log('Accès validé', u.nom+' · '+poste+(u.celluleId?' · '+cellName(u.celluleId):''), u.celluleId);
      closeAllSheets(); confetti(); toast('Accès validé : '+u.nom); render();
    }});
}
function openAccount(id){
  var u=DB.users.find(function(x){ return x.id===id; }); if(!u||!canManageUser(u)) return;
  posteSheet({title:u.nom, niveau:u.niveau, poste:u.titre, celluleId:u.celluleId, actif:u.actif, showActif:true, okLabel:'Enregistrer',
    intro:'<p class="sm mut" style="margin-bottom:12px">'+esc(u.email||'')+(u.telephone?' · '+esc(u.telephone):'')+(u.validePar?'<br>Accès validé par '+esc(u.validePar)+' le '+fmtD(u.valideLe):'')+'</p>',
    onOk: async function(poste, cell, actif){
      var n=Object.assign({}, u, {titre:poste, celluleId:u.niveau==='local'?cell:'', acces:accesForPoste(u.niveau,poste), actif:actif});
      await Store.save('users', n); log('Accès modifié', n.nom+' · '+poste+(actif?'':' · suspendu'), n.celluleId); closeAllSheets(); toast('Accès mis à jour'); render(); },
    onDelete: async function(){ if(await confirmDlg({title:'Retirer l\'accès de '+u.nom+' ?',text:'La personne devra refaire une demande pour revenir.',ok:'Retirer l\'accès'})){ await Store.remove('users',u.id); var d=(DB.demandes||[]).find(function(x){ return x.id===u.id; }); if(d) await Store.remove('demandes',d.id); log('Accès retiré', u.nom+' · '+u.titre, u.celluleId); closeAllSheets(); toast('Accès retiré'); render(); } }
  });
}
function refuseDemande(id){
  var d=(DB.demandes||[]).find(function(x){ return x.id===id; }); if(!d||!canValidate(d)) return;
  var sh=openSheet({title:'Refuser la demande', auto:true, body:'<p class="sm" style="margin-bottom:12px">'+esc(d.prenoms+' '+d.nom)+' · '+esc(d.poste)+'</p><label class="field"><span>Motif (visible par la personne)</span><textarea id="rmot" rows="3" placeholder="Ex. poste déjà occupé, cellule incorrecte…"></textarea></label>', foot:'<button class="btn" data-act="closesheet">Annuler</button><button class="btn pri" id="rok" style="background:var(--red);border-color:var(--red);box-shadow:none">Refuser</button>'});
  sh.querySelector('#rok').onclick=async function(){ await Store.save('demandes', Object.assign({}, d, {statut:'refusee', motif:$('#rmot').value.trim(), traitePar:U.nom, traiteLe:nowISO()})); log('Accès refusé', d.prenoms+' '+d.nom+' · '+d.poste, d.celluleId); closeAllSheets(); toast('Demande refusée'); render(); };
}

