/* GEEAD ABIDJAN SUD — Communication : annonces et diffusion */

RENDER.communication=function(){
  if(!can('diffusion')) ST.comTab='annonces';
  var html='<div class="seg full" style="margin-bottom:16px;max-width:440px;'+(can('diffusion')?'':'display:none')+'">'+[['annonces','Annonces'],['diffusion','Diffusion ciblée']].map(function(t){ return '<button class="'+(ST.comTab===t[0]?'on':'')+'" data-act="comtab" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div><div id="combody"></div>';
  return {html:html, mount:drawCom};
};
function drawCom(){
  var b=$('#combody'), h='';
  if(ST.comTab==='annonces'){
    var A=annoncesFor();
    h=(can('annonces')?'<button class="btn pri" data-act="newannonce" style="margin-bottom:14px">'+I('mega')+'Publier une annonce</button>':'<p class="sm mut" style="margin-bottom:12px">Annonces et convocations publiées par le bureau régional.</p>')+'<div class="card">'+(A.map(function(a){ return annonceCard(a, can('annonces')); }).join('')||emptyState('mega','Aucune annonce',''))+'</div>';
  } else {
    var d=ST.diff, M=diffList();
    var sel=function(k,label,opts){ return '<label class="field"><span>'+label+'</span><select data-d="'+k+'"><option value="">Tous</option>'+opts.map(function(o){ return '<option value="'+esc(o[0])+'" '+(d[k]===o[0]?'selected':'')+'>'+esc(o[1])+'</option>'; }).join('')+'</select></label>'; };
    h='<div class="grid g3"><div class="card span2"><div class="card-h"><div><h3>Composer le message</h3><div class="sub">Utilisez {prenom} pour personnaliser chaque message</div></div></div>'+
      '<div class="fgrid" style="margin-bottom:14px">'+(isReg()?sel('cell','Cellule',DB.cells.map(function(c){ return [c.id,c.code+' · '+c.nom]; })):'')+sel('statut','Statut',[['Élève','Élèves'],['Étudiant','Étudiants']])+sel('sexe','Sexe',[['F','Filles'],['M','Garçons']])+sel('niveau','Niveau',ORDRE_NIV.map(function(n){ return [n,n]; }))+sel('age','Âge',[['mineur','Mineurs'],['majeur','Majeurs']])+'</div>'+
      '<label class="field"><span>Message</span><textarea id="dmsg" rows="5">'+esc(ST.dmsg||'Bonjour {prenom}, le bureau du GEEAD ABIDJAN SUD vous informe que…')+'</textarea></label>'+
      '<div class="row" style="margin-top:14px"><button class="btn pri" data-act="copynums">'+I('copy')+'Copier les '+M.length+' numéros</button><button class="btn" data-act="copymsg">'+I('msg')+'Copier le message</button><button class="btn" data-act="exportdiff">'+I('download')+'Exporter</button></div></div>'+
      '<div class="card"><div class="card-h"><div><h3>'+M.length+' destinataire(s)</h3><div class="sub">Envoi individuel via WhatsApp</div></div></div><div class="list" style="max-height:520px;overflow:auto">'+M.slice(0,60).map(function(m){ var n=telIntl(m.whatsapp||m.telephone); return memberLi(m, n?'<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/'+n+'?text='+encodeURIComponent(personalize(m))+'" data-noopen>'+I('send')+'</a>':''); }).join('')+'</div></div></div>';
  }
  b.innerHTML='<div class="stepv">'+h+'</div>';
  $$('[data-d]',b).forEach(function(s){ s.onchange=function(){ ST.diff[s.dataset.d]=s.value; ST.dmsg=$('#dmsg').value; drawCom(); }; });
  var t=$('#dmsg'); if(t) t.oninput=function(){ ST.dmsg=t.value; };
}
function diffList(){ var d=ST.diff; return scopeM().filter(function(m){ var a=ageOf(m.naissance); return (!d.cell||m.celluleId===d.cell)&&(!d.statut||m.statut===d.statut)&&(!d.sexe||m.sexe===d.sexe)&&(!d.niveau||m.niveau===d.niveau)&&(!d.age||(d.age==='mineur'?a<18:a>=18)); }); }
function personalize(m){ return String(ST.dmsg||'Bonjour {prenom}, le bureau du GEEAD ABIDJAN SUD vous informe que…').replace(/\{prenom\}/g, String(m.prenoms||'').split(' ')[0]); }
function newAnnonce(){
  var sh=openSheet({title:'Nouvelle annonce', auto:true, body:'<label class="field"><span>Titre <i>*</i></span><input id="at"></label><label class="field" style="margin-top:14px"><span>Message <i>*</i></span><textarea id="ax" rows="5"></textarea></label><label class="field" style="margin-top:14px"><span>Destinataires</span><select id="ac"><option value="all">Toutes les cellules</option>'+DB.cells.map(function(c){ return '<option value="'+esc(c.id)+'">'+esc(c.code+' · '+c.nom)+'</option>'; }).join('')+'</select></label><div class="card" style="padding:2px 14px;box-shadow:none;margin-top:14px"><label class="sw"><div class="t"><b>Marquer comme important</b><span>Mise en avant sur l\'accueil des cellules</span></div><input type="checkbox" id="ai"><span class="k"></span></label></div>',
    foot:'<button class="btn" data-act="closesheet">Annuler</button><button class="btn pri" id="asave">'+I('send')+'Publier</button>'});
  sh.querySelector('#asave').onclick=async function(){ var t=$('#at').value.trim(), x=$('#ax').value.trim(); if(!t||!x){ toast('Titre et message obligatoires','err'); return; }
    await Store.save('annonces',{titre:t,texte:x,cible:$('#ac').value,important:$('#ai').checked,date:today(),auteur:U.nom,titre_auteur:U.titre}); log('Annonce publiée', t); closeSheet(); toast('Annonce publiée'); drawCom(); };
}

