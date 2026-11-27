/* GEEAD ABIDJAN SUD — Session, permissions, navigation et rendu */

var U = null;            // utilisateur connecté
var ST = {               // état d'interface
  q:'', f:{cell:'',statut:'',sexe:'',niveau:'',fiche:''}, sort:'recent', sel:new Set(), selMode:false,
  dashCell:'', comTab:'annonces', diff:{cell:'',statut:'',sexe:'',niveau:'',age:''}, rTab:'etab', rq:'', jq:''
};
var PREF = (function(){ try{ return JSON.parse(localStorage.getItem('geeadas-pref')||'{}'); }catch(e){ return {}; } })();
function savePref(){ try{ localStorage.setItem('geeadas-pref', JSON.stringify(PREF)); }catch(e){} }
var IN_FRAME = (function(){ try{ return window.self!==window.top; }catch(e){ return true; } })();

/* Permissions */
function isReg(){ return !!U && U.niveau==='regional'; }
function isAdmin(){ return !!(U && U.admin); }
function permsOf(u){ if(!u) return []; if(u.admin) return ALL_PERMS.slice();
  var p=posteDef(u.niveau,u.titre), list=p?(p.p==='all'?ALL_PERMS.slice():p.p.slice()):(u.niveau==='regional'?['membres','stats','reseau']:['membres','reseau']);
  if(u.acces==='lecture') list=list.filter(function(x){ return READ_PERMS.indexOf(x)>=0; });
  return list; }
function can(p){ return !!U && (!!U.admin || permsOf(U).indexOf(p)>=0); }
function canEdit(){ return can('membres.edit'); }
function canNote(){ return can('suivi.edit'); }
function canValidate(d){ return isAdmin() || (d.niveau==='local' && isReg() && can('acces')); }
function pendingDemandes(){ return (DB.demandes||[]).filter(function(d){ return d.statut==='en_attente' && canValidate(d); }); }
function cellById(id){ return DB.cells.find(function(c){ return c.id===id; }); }
function cellName(id){ var c=cellById(id); return c?c.nom:'Sans cellule'; }
function scopeM(){ return isReg()?DB.members:DB.members.filter(function(m){ return m.celluleId===U.celluleId; }); }
function scopeIns(){ return isReg()?DB.inscriptions:DB.inscriptions.filter(function(x){ return x.celluleId===U.celluleId; }); }
function scopeNotes(){ return isReg()?DB.notes:DB.notes.filter(function(n){ return n.celluleId===U.celluleId; }); }
function log(action, detail, celluleId){ var l={date:nowISO(),auteur:U?U.nom:'Formulaire public',titre:U?U.titre:'',action:action,detail:detail||'',celluleId:celluleId||(U&&U.celluleId)||''}; Store.save('logs', l).catch(function(){}); }

/* Navigation */
var VIEWS={
  accueil:{t:'Accueil',i:'home'}, membres:{t:'Membres',i:'users',perm:'membres'}, validations:{t:'Inscriptions',i:'inbox',perm:'inscriptions'},
  acces:{t:'Accès & bureaux',i:'key',reg:1,perm:'acces'}, cellules:{t:'Cellules',i:'layers',reg:1}, suivi:{t:'Suivi',i:'heart',perm:'suivi'},
  opportunites:{t:'Nouvelles cellules',i:'pin',reg:1,perm:'opportunites'}, reseau:{t:'Réseau & talents',i:'share',perm:'reseau'},
  communication:{t:'Communication',i:'mega'}, journal:{t:'Journal d\'activité',i:'list',reg:1,perm:'journal'}, donnees:{t:'Import / Export',i:'download',perm:'export'},
  parametres:{t:'Paramètres',i:'sliders'}, plus:{t:'Plus',i:'grid'}
};
function allowed(k){ var v=VIEWS[k]; if(!v||!U) return false; if(v.reg&&!isReg()) return false; if(v.perm&&!can(v.perm)) return false; return true; }
function vt(k){ var v=VIEWS[k]; return (!isReg()&&v.tl)?v.tl:v.t; }
function navGroups(){ var g=isReg()
  ? [['Pilotage',['accueil','membres','validations','acces','cellules','suivi']],['Croissance',['opportunites','reseau']],['Gestion',['communication','journal','donnees']],['Compte',['parametres']]]
  : [['Ma cellule',['accueil','membres','validations','suivi']],['Outils',['communication','reseau','donnees']],['Compte',['parametres']]];
  return g.map(function(x){ return [x[0], x[1].filter(allowed)]; }).filter(function(x){ return x[1].length; }); }
function bottomNav(){ var third=(isReg()?['acces','validations','suivi','cellules']:['validations','suivi','reseau','communication']).filter(allowed)[0]||'communication'; return ['accueil','membres','FAB',third,'plus']; }
function navCount(k){ return k==='validations'?scopeIns().length:k==='acces'?pendingDemandes().length:0; }
function curView(){ var h=location.hash.slice(1); if(h==='inscription') return h; if(allowed(h)||h==='plus') return h; return 'accueil'; }
function go(v){ if(location.hash.slice(1)===v) render(); else location.hash=v; }

function shell(view, inner){
  var c=cellById(U.celluleId);
  var side='<aside class="sidebar"><div class="sb-brand">'+logoMark()+'<div><b>GEEAD ABIDJAN SUD</b><span>'+(isReg()?'Bureau régional':'Cellule '+esc(c?c.nom:''))+'</span></div></div>'+
    navGroups().map(function(g){ return '<div class="sb-group">'+g[0]+'</div>'+g[1].map(function(k){ return '<a class="sb-link '+(view===k?'on':'')+'" href="#'+k+'">'+I(VIEWS[k].i)+vt(k)+(navCount(k)?'<span class="cnt">'+navCount(k)+'</span>':'')+'</a>'; }).join(''); }).join('')+
    '<button class="sb-user" data-act="profile">'+uavatar(U,'sm')+'<div style="flex:1"><b>'+esc(U.nom)+'</b><span>'+esc(U.titre)+'</span></div>'+I('more')+'</button></aside>';
  var bn='<nav class="bnav" aria-label="Navigation">'+bottomNav().map(function(k){ if(k==='FAB') return canEdit()?'<button class="fab" data-act="newmember" aria-label="Nouveau membre">'+I('plus')+'</button>':'<a href="#reseau" class="'+(view==='reseau'?'on':'')+'">'+I('share')+'Réseau</a>';
    var short={validations:'Inscrits',acces:'Accès',communication:'Annonces',reseau:'Réseau'};
    return '<a href="#'+k+'" class="'+(view===k||(k==='plus'&&bottomNav().indexOf(view)<0&&view!=='accueil'&&view!=='membres')?'on':'')+'">'+I(VIEWS[k].i)+(short[k]||vt(k))+(navCount(k)?'<span class="dot">'+navCount(k)+'</span>':'')+'</a>'; }).join('')+'</nav>';
  var top='<header class="topbar" id="topbar"><h1>'+esc(vt(view))+'</h1><div class="gsearch">'+I('search')+'<input id="gsearch" placeholder="Rechercher un membre, un ID…" aria-label="Recherche globale"></div>'+
    (canEdit()&&view!=='membres'?'<button class="btn pri" data-act="newmember" style="display:var(--dsk,inline-flex)">'+I('userplus')+'<span>Nouveau membre</span></button>':'')+
    '<button class="btn icon ghost" data-act="profile" aria-label="Mon profil" style="padding:0">'+uavatar(U,'sm')+'</button></header>';
  return '<div class="app">'+side+'<div class="main">'+top+'<main class="content"><div class="view">'+demoBanner()+inner+'</div></main></div>'+bn+'</div><div class="selbar" id="selbar"></div>';
}

var RENDER={};
function render(){
  closeAllSheets();
  var v=curView();
  if(v==='inscription'){ renderPublic(); return; }
  if(!U){ renderAuth(); return; }
  if(location.hash.slice(1)!==v&&location.hash) { history.replaceState(null,'','#'+v); }
  var r=RENDER[v]();
  $('#root').innerHTML=shell(v, r.html);
  document.title=vt(v)+' · GEEAD ABIDJAN SUD';
  if(window.innerWidth<900) $$('.topbar .btn.pri').forEach(function(b){ b.style.display='none'; });
  if(r.mount) r.mount();
  countUp($('#root'));
  var gs=$('#gsearch'); if(gs) gs.onkeydown=function(e){ if(e.key==='Enter'){ ST.q=gs.value; go('membres'); } };
  window.scrollTo({top:0});
}
window.addEventListener('scroll',function(){ var t=$('#topbar'); if(t) t.classList.toggle('scrolled', window.scrollY>6); },{passive:true});
window.addEventListener('hashchange', function(){ if(location.hash==='#demo'&&!DEMO){ startDemo(); return; } render(); });
document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeSheet(); });

function demoBanner(){
  if(Store.mode!=='demo'||!U) return '';
  return '<div class="demo-banner"><span class="db-ic">'+I('sparkle')+'</span><span class="db-t"><b>Démonstration</b><span> · '+esc(U.titre)+'</span><small>Données fictives, rien n\'est envoyé dans la base réelle.</small></span>'+
    '<button class="btn sm" data-act="demoswitch" aria-label="Changer de profil">'+I('swap')+'<span>Changer de profil</span></button>'+
    (DEMO_ONLY?'':'<button class="btn sm ghost" data-act="exitdemo" aria-label="Quitter la démonstration">'+I('x')+'<span>Quitter</span></button>')+'</div>';
}
function setSession(u){ U=u; try{ if(Store.mode==='demo') localStorage.setItem('geeadas-session',u?u.id:''); }catch(e){} }

