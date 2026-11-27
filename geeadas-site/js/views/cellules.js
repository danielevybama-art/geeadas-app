/* GEEAD ABIDJAN SUD — Cellules locales */

RENDER.cellules=function(){
  var cs=DB.cells.slice().sort(function(a,b){ return a.code.localeCompare(b.code); });
  var d30=isoDay(new Date(Date.now()-30*86400000));
  var html='<div class="row between" style="margin-bottom:16px"><p class="mut">'+cs.length+' cellules · '+fmtN(DB.members.filter(function(m){ return m.celluleId; }).length)+' membres rattachés</p>'+(can('cellules')?'<button class="btn pri" data-act="editcell">'+I('plus')+'Nouvelle cellule</button>':'')+'</div><div class="grid g3">'+
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
  openSheet({title:c.code+' · '+c.nom, wide:true, focus:false, body:'<div class="grid g3" style="margin-bottom:16px">'+kpi('users','',s.n,'Membres')+kpi('heart','gold',s.f,'Filles')+kpi('checkc','blue',s.completes,'Fiches complètes')+'</div>'+
    '<div class="card"><dl class="kv"><dt>Église</dt><dd>'+esc(c.eglise||'—')+'</dd><dt>Cellule-école</dt><dd>'+esc(c.etablissement||'—')+'</dd><dt>Responsable</dt><dd>'+esc(c.responsable||'—')+'</dd><dt>Téléphone</dt><dd>'+esc(c.telephone||'—')+'</dd></dl></div>'+
    '<div class="sec-t">Bureau de la cellule</div><div class="card" style="padding:8px 10px">'+(bureau.length?'<div class="list">'+bureau.map(function(u){ return '<div class="li" data-act="editaccount" data-id="'+esc(u.id)+'">'+uavatar(u)+'<div class="t"><b>'+esc(u.nom)+'</b><span>'+esc(u.titre)+'</span></div>'+I('chevr','chev')+'</div>'; }).join('')+'</div>':emptyMini('Aucun compte pour cette cellule.'))+'<p class="xs mut" style="padding:6px">Les responsables demandent leur accès depuis l\'application ; le bureau régional le valide dans « Accès & bureaux ».</p>'+'</div>'+
    '<div class="sec-t">Niveaux</div><div class="card">'+cols(parNiv,NIVEAUX['Élève'])+'</div>',
    foot:(can('cellules')?'<button class="btn" data-act="editcell" data-v="'+esc(id)+'">'+I('edit')+'Modifier</button>':'')+'<button class="btn pri" data-act="cellmembers" data-v="'+esc(id)+'">'+I('users')+'Voir les membres</button>'});
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

