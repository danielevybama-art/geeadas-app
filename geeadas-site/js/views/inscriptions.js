/* GEEAD ABIDJAN SUD — Inscriptions reçues par le formulaire public */

function inscLink(){ return location.origin+location.pathname+'#inscription'; }
RENDER.validations=function(){
  var L=scopeIns().slice().sort(function(a,b){ return (b.dateSoumission||'').localeCompare(a.dateSoumission||''); });
  var html='<div class="grid g3" style="margin-bottom:16px"><div class="card span2" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div class="kpi" style="flex:1;min-width:200px"><div class="ic gold">'+I('inbox')+'</div><h3 style="font-size:17px">'+L.length+' inscription'+(L.length>1?'s':'')+' en attente</h3><p class="sm mut" style="margin-top:4px">Fiches remplies par les membres via le lien public. La validation attribue l\'identifiant unique.</p></div><div class="row"><button class="btn" data-act="sharelink">'+I('share')+'Partager le lien</button><a class="btn" href="#inscription">'+I('eye')+'Voir le formulaire</a></div></div>'+
    '<div class="card"><div class="ic" style="display:none"></div><div class="sec-t" style="margin-top:0">Lien d\'inscription</div><p class="mono sm" style="word-break:break-all;color:var(--ink-2)">'+esc(inscLink())+'</p><button class="btn sm" data-act="copy" data-v="'+esc(inscLink())+'" style="margin-top:10px">'+I('copy')+'Copier</button></div></div>'+
    '<div class="card" style="padding:8px 10px">'+(L.length?'<div class="list">'+L.map(function(x){
      var dup=DB.members.find(function(m){ return norm(m.nom+m.prenoms)===norm(x.nom+x.prenoms)&&m.naissance===x.naissance; }), a=ageOf(x.naissance);
      return '<div class="li" style="cursor:default;flex-wrap:wrap">'+avatar(x)+'<div class="t" style="min-width:180px"><b>'+esc(fullName(x))+'</b><span>'+(a!=null?a+' ans · ':'')+esc(x.etablissement)+' · '+esc(x.niveau)+'</span><span>'+(isReg()?esc(cellName(x.celluleId))+' · ':'')+'Reçu '+fmtRel(x.dateSoumission)+'</span>'+(dup?'<span class="badge red" style="margin-top:4px">'+I('alert')+'Doublon possible : '+esc(dup.id)+'</span>':'')+'</div>'+
        (can('inscriptions')?'<div class="row"><button class="btn sm ghost danger" data-act="rejins" data-id="'+esc(x.id)+'">'+I('x')+'</button><button class="btn sm" data-act="reviewins" data-id="'+esc(x.id)+'">Revoir</button><button class="btn sm pri" data-act="valins" data-id="'+esc(x.id)+'">'+I('check')+'Valider</button></div>':'')+'</div>'; }).join('')+'</div>':emptyState('inbox','Aucune inscription en attente','Partagez le lien d\'inscription dans vos groupes WhatsApp.','<button class="btn pri" data-act="sharelink">'+I('share')+'Partager le lien</button>'))+'</div>';
  return {html:html};
};
async function validateIns(id){
  var x=DB.inscriptions.find(function(i){ return i.id===id; }); if(!x) return;
  var d=Object.assign({},x); delete d.id; delete d.dateSoumission;
  var m=await Store.save('members', Object.assign(d,{id:'',historique:[],dateInscription:today(),creePar:U.nom}));
  await Store.remove('inscriptions', id); log('Inscription validée', m.id+' · '+fullName(m), m.celluleId);
  toast('Validé · '+m.id); rerenderSoft();
}

