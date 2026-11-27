/* GEEAD ABIDJAN SUD — Actions de l'interface (délégation des clics) */

var ACT={
  closesheet:function(){ closeSheet(); },
  copyout:function(){ var t=$('#txtout'); copyText(t.value); t.select(); },
  acctab:function(el){ ST.accTab=el.dataset.v; render(); },
  valdemande:function(el){ openValidation(el.dataset.id); },
  refusedemande:function(el){ refuseDemande(el.dataset.id); },
  editaccount:function(el){ openAccount(el.dataset.id); },
  printfiche:function(el){ printFiche([DB.members.find(function(m){ return m.id===el.dataset.id; })]); },
  logout:async function(){ if(!(await confirmDlg({title:'Se déconnecter ?',text:'Vous devrez vous reconnecter pour accéder à l\'espace.',ok:'Déconnexion',icon:'logout',tone:'brand'}))) return; await authSignOut(); },
  profile:function(){ go(window.innerWidth<900?'plus':'parametres'); },
  goto:function(el){ var v=el.dataset.v; if(v==='membres-incomplets'){ ST.f={cell:'',statut:'',sexe:'',niveau:'',fiche:'incomplet'}; v='membres'; } go(v); },
  newmember:function(){ if(canEdit()) openWizard(null); },
  'newmember-again':function(){ closeSheet(); setTimeout(function(){ openWizard(null); },300); },
  'member-from-success':function(el){ closeSheet(); setTimeout(function(){ openMember(el.dataset.id, el.dataset.tab); },300); },
  member:function(el,e){ e.preventDefault(); openMember(el.dataset.id, el.dataset.tab); },
  editmember:function(el){ openWizard(DB.members.find(function(m){ return m.id===el.dataset.id; })); },
  mtab:function(el){ var sh=topSheet(); if(!sh) return; sh.dataset.tab=el.dataset.v; refreshMemberSheet(); },
  addnote:function(el){ openNote(el.dataset.id); },
  copy:function(el){ copyText(el.dataset.v, 'Copié : '+el.dataset.v); },
  delmember:async function(el){ if(!can('membres.delete')) return; var m=DB.members.find(function(x){ return x.id===el.dataset.id; }); if(await confirmDlg({title:'Supprimer '+fullName(m)+' ?',text:'La fiche '+m.id+' et son historique seront supprimés définitivement.',ok:'Supprimer'})){ await Store.remove('members',m.id); log('Membre supprimé', m.id+' · '+fullName(m), m.celluleId); closeAllSheets(); toast('Membre supprimé'); render(); } },
  transfer:function(el){ var m=DB.members.find(function(x){ return x.id===el.dataset.id; });
    picker('Rattacher à une cellule', DB.cells.map(function(c){ return [c.id,c.code+' · '+c.nom,c.eglise]; }), m.celluleId, async function(v){ if(v===m.celluleId) return;
      m.historique=(m.historique||[]).concat([{date:today(),champ:'Cellule',de:cellName(m.celluleId),a:cellName(v),par:U.nom}]); var old=m.celluleId; m.celluleId=v; if(!m.eglise){ m.eglise=cellById(v).eglise; }
      await Store.save('members',m); log('Transfert de cellule', m.id+' · '+cellName(old)+' → '+cellName(v), v); toast('Rattaché à '+cellName(v)); if(!isReg()){ closeAllSheets(); render(); } else { refreshMemberSheet(); rerenderSoft(); } }); },
  fstatut:function(el){ ST.f.statut=el.dataset.v; rerenderSoft(); }, fsexe:function(el){ ST.f.sexe=ST.f.sexe===el.dataset.v?'':el.dataset.v; rerenderSoft(); },
  fniveau:function(){ picker('Niveau d\'étude',[['','Tous les niveaux']].concat(ORDRE_NIV.map(function(n){ return [n,n]; })), ST.f.niveau, function(v){ ST.f.niveau=v; rerenderSoft(); }); },
  fcell:function(){ picker('Cellule',[['','Toutes les cellules'],['_none','Sans cellule (isolés)']].concat(DB.cells.map(function(c){ return [c.id,c.code+' · '+c.nom]; })), ST.f.cell, function(v){ ST.f.cell=v; rerenderSoft(); }); },
  ffiche:function(){ picker('Fiche',[['','Toutes les fiches'],['complet','Fiches complètes'],['incomplet','Fiches incomplètes']], ST.f.fiche, function(v){ ST.f.fiche=v; rerenderSoft(); }); },
  freset:function(){ ST.f={cell:'',statut:'',sexe:'',niveau:'',fiche:''}; rerenderSoft(); },
  clearq:function(){ ST.q=''; rerenderSoft(); },
  sort:function(){ picker('Trier par',[['recent','Plus récents'],['nom','Nom A → Z'],['id','Identifiant']], ST.sort, function(v){ ST.sort=v; rerenderSoft(); }); },
  more:function(el){ drawMembers(+el.dataset.v); },
  selmode:function(){ ST.selMode=!ST.selMode; ST.sel.clear(); rerenderSoft(); },
  togglesel:function(el){ var id=el.dataset.id; if(ST.sel.has(id)) ST.sel.delete(id); else ST.sel.add(id); el.classList.toggle('sel'); drawSelbar(); },
  bulkall:function(){ filteredMembers().forEach(function(m){ ST.sel.add(m.id); }); drawMembers(); },
  bulkexport:function(){ download('selection-geeadas.csv', toCSV(DB.members.filter(function(m){ return ST.sel.has(m.id); }))); },
  bulkwa:function(){ var nums=DB.members.filter(function(m){ return ST.sel.has(m.id); }).map(function(m){ return telIntl(m.whatsapp||m.telephone); }).filter(Boolean); copyText(nums.map(function(n){ return '+'+n; }).join('\n'), nums.length+' numéros copiés'); },
  bulktransfer:function(){ picker('Transférer vers', DB.cells.map(function(c){ return [c.id,c.code+' · '+c.nom]; }), '', async function(v){ var L=DB.members.filter(function(m){ return ST.sel.has(m.id); }); for(var i=0;i<L.length;i++){ var m=L[i]; if(m.celluleId===v) continue; m.historique=(m.historique||[]).concat([{date:today(),champ:'Cellule',de:cellName(m.celluleId),a:cellName(v),par:U.nom}]); m.celluleId=v; await Store.save('members',m); } log('Transfert groupé', L.length+' membres → '+cellName(v), v); toast(L.length+' membres transférés'); ST.sel.clear(); drawMembers(); }); },
  dashcell:function(){ picker('Statistiques de',[['','Toute la région']].concat(DB.cells.map(function(c){ return [c.id,c.code+' · '+c.nom]; })), ST.dashCell, function(v){ ST.dashCell=v; render(); }); },
  cellsheet:function(el){ openCell(el.dataset.v); },
  cellmembers:function(el){ ST.f={cell:el.dataset.v,statut:'',sexe:'',niveau:'',fiche:''}; ST.q=''; closeAllSheets(); go('membres'); },
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
  exportall:function(){ download('base-geeadas.csv', toCSV(scopeM())); log('Export', 'Base des membres'); },
  exportstats:function(){ download('stats-cellules.csv',['Code;Cellule;Membres;Filles;Garçons;Élèves;Étudiants;Mineurs;Fiches complètes'].concat(DB.cells.map(function(c){ var L=DB.members.filter(function(m){ return m.celluleId===c.id; }), s=statsBlock(L); return [c.code,c.nom,s.n,s.f,s.g,s.el,s.et,s.mineurs,s.completes].map(csvCell).join(';'); })).join('\n')); },
  exportcontacts:function(){ download('annuaire.csv',['Identifiant;Nom et prénoms;Cellule;Téléphone;WhatsApp;Parent;Tél. parent'].concat(scopeM().map(function(m){ return [m.id,fullName(m),cellName(m.celluleId),m.telephone,m.whatsapp,m.parentNom,m.parentTel].map(csvCell).join(';'); })).join('\n')); },
  tpl:function(){ download('modele-recensement.csv','Nom;Prénoms;Sexe;Date de naissance;Téléphone;WhatsApp;Email;Commune;Statut;Niveau;Établissement;Filière;Église;Cellule\nKOUASSI;Grâce;F;15/03/2009;0700000000;0700000000;;Koumassi;Élève;2nde;Lycée Moderne de Koumassi;Série A;AD Koumassi Remblais;C06'); },
  resetdemo:async function(){ if(await confirmDlg({title:'Réinitialiser la démonstration ?',text:'Toutes les saisies faites sur cet appareil seront effacées.',ok:'Réinitialiser'})){ var id=U.id; Store.reset(); setSession(DB.users.find(function(u){ return u.id===id; })||DB.users[0]); render(); toast('Démonstration réinitialisée'); } },
  theme:function(el){ PREF.theme=el.dataset.v; savePref(); applyTheme(); $$('[data-act=theme]').forEach(function(b){ b.classList.toggle('on',b===el); }); },
  hapticpref:function(el){ PREF.haptic=el.checked; savePref(); haptic('success'); },
  install:function(){ if(deferredInstall){ deferredInstall.prompt(); deferredInstall.userChoice.then(function(){ deferredInstall=null; }); } else openSheet({title:'Installer l\'application',auto:true,body:'<div class="task" style="cursor:default"><span class="ic">'+I('phone2')+'</span><div class="t"><b>Android (Chrome)</b><span>Menu ⋮ › « Installer l\'application » ou « Ajouter à l\'écran d\'accueil ».</span></div></div><div class="task" style="cursor:default"><span class="ic gold">'+I('phone2')+'</span><div class="t"><b>iPhone (Safari)</b><span>Bouton Partager › « Sur l\'écran d\'accueil ».</span></div></div><p class="sm mut" style="margin-top:12px">L\'installation est disponible sur la version en ligne de la plateforme.</p>'}); },
  savesettings:async function(){ DB.settings.region=$('#p_reg').value.trim()||'Abidjan Sud'; DB.settings.seuil=Math.max(2,+$('#p_seuil').value||5); await Store.saveSettings(); log('Paramètres modifiés',''); toast('Paramètres enregistrés'); render(); },
  pubagain:function(){ renderPublic(); },
};
document.addEventListener('click', function(e){
  if(e.target.closest('[data-noopen]')) { e.stopPropagation(); return; }
  var el=e.target.closest('[data-act]'); if(!el) return;
  var a=el.dataset.act; if(!ACT[a]) return;
  if(el.tagName==='INPUT'){ return; }
  ACT[a](el,e);
});
document.addEventListener('change', function(e){ var el=e.target; if(el.tagName==='INPUT'&&el.dataset.act&&ACT[el.dataset.act]) ACT[el.dataset.act](el,e); });

