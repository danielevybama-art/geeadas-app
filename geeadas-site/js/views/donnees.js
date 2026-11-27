/* GEEAD ABIDJAN SUD — Import et export */

var COLS=[['id','Identifiant'],['nom','Nom'],['prenoms','Prénoms'],['sexe','Sexe'],['naissance','Date de naissance'],['age','Âge'],['telephone','Téléphone'],['whatsapp','WhatsApp'],['email','Email'],['commune','Commune'],['statut','Statut'],['niveau','Niveau'],['etablissement','Établissement'],['filiere','Filière'],['eglise','Église'],['cellule','Cellule'],['baptemeEau','Baptême eau'],['baptemeEsprit','Baptême Saint-Esprit'],['engagements','Engagements'],['talents','Talents'],['parentNom','Parent'],['parentTel','Tél. parent'],['dateInscription','Date inscription']];
function toCSV(list){ return [COLS.map(function(c){ return c[1]; }).join(';')].concat(list.map(function(m){ return COLS.map(function(c){ var k=c[0], v=m[k];
  if(k==='cellule') v=m.celluleId?cellName(m.celluleId):''; if(k==='age') v=ageOf(m.naissance);
  if(typeof v==='boolean') v=v?'Oui':'Non'; if(Array.isArray(v)) v=v.join(', '); return csvCell(v); }).join(';'); })).join('\n'); }
RENDER.donnees=function(){
  var html='<div class="grid g2"><div class="card" style="'+(canEdit()?'':'display:none')+'"><div class="card-h"><div><h3>Importer des membres</h3><div class="sub">Réponses Google Forms ou fichier Excel enregistré en CSV</div></div><span class="av sm" style="background:var(--gold)">'+I('upload')+'</span></div>'+
    '<label class="btn pri block" style="min-height:56px">'+I('upload')+'Choisir un fichier CSV<input type="file" id="csvIn" accept=".csv,text/csv" hidden></label><div id="impRes" style="margin-top:12px"></div>'+
    '<p class="sm mut" style="margin-top:12px">Colonnes reconnues par leur titre : nom, prénoms, sexe, date de naissance, téléphone, WhatsApp, e-mail, commune, statut, niveau, école/établissement, filière/série, église, cellule (code ou nom). Chaque ligne reçoit un identifiant ; les doublons sont ignorés.</p><button class="btn sm" data-act="tpl" style="margin-top:12px">'+I('download')+'Modèle à remplir</button></div>'+
    '<div class="card"><div class="card-h"><div><h3>Exporter</h3><div class="sub">Fichiers compatibles Excel</div></div><span class="av sm" style="background:var(--brand)">'+I('download')+'</span></div>'+
    '<div class="task" data-act="exportall"><span class="ic">'+I('users')+'</span><div class="t"><b>Base des membres</b><span>'+fmtN(scopeM().length)+' fiches complètes</span></div>'+I('chevr','mut')+'</div>'+
    (isReg()?'<div class="task" data-act="exportstats"><span class="ic blue">'+I('chart')+'</span><div class="t"><b>Statistiques par cellule</b><span>Effectifs, sexe, statut, mineurs, fiches complètes</span></div>'+I('chevr','mut')+'</div>':'')+
    '<div class="task" data-act="exportcontacts"><span class="ic gold">'+I('phone')+'</span><div class="t"><b>Annuaire téléphonique</b><span>Nom, identifiant, téléphone, parent</span></div>'+I('chevr','mut')+'</div></div></div>';
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
    await Store.save('members', Object.assign(o,{id:'',baptemeEau:false,baptemeEsprit:false,engagements:[],annuaire:true,historique:[],dateInscription:today(),creePar:U.nom+' (import)'})); ok++; }
  return {ok:ok,skip:skip};
}

