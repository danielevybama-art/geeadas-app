/* GEEAD ABIDJAN SUD — Paramètres, profil et menu « Plus » */

var deferredInstall=null;
window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferredInstall=e; });
function isStandalone(){ return window.matchMedia('(display-mode: standalone)').matches||navigator.standalone; }
RENDER.parametres=function(){
  var c=cellById(U.celluleId), th=PREF.theme||'auto', ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  var html='<div class="grid g2"><div class="card"><div style="display:flex;gap:14px;align-items:center">'+uavatar(U,'lg')+'<div><h3 style="font-size:19px">'+esc(U.nom)+'</h3><p class="mut sm">'+esc(U.titre)+'</p><div class="row" style="margin-top:8px"><span class="badge">'+(isReg()?I('shield')+'Bureau régional':I('users')+'Bureau local · '+esc(c?c.nom:''))+'</span>'+(isAdmin()?'<span class="badge gold">'+I('star')+'Administrateur</span>':'')+'</div></div></div>'+
    '<dl class="kv" style="margin-top:14px"><dt>E-mail</dt><dd>'+esc(U.email||'—')+'</dd><dt>Téléphone</dt><dd>'+esc(U.telephone||'—')+'</dd>'+(U.validePar?'<dt>Accès validé par</dt><dd>'+esc(U.validePar)+'</dd>':'')+'</dl>'+
    '<div class="sec-t">Ce que votre poste permet</div>'+permsList(U.niveau, U.titre)+
    '<button class="btn block danger" data-act="logout" style="margin-top:14px">'+I('logout')+'Se déconnecter</button></div>'+
    '<div class="card"><h3 style="font-size:15.5px;margin-bottom:8px">Application</h3>'+
    '<div class="sw" style="cursor:default"><div class="t"><b>Apparence</b></div><div class="seg">'+[['auto','Auto'],['light','Clair'],['dark','Sombre']].map(function(t){ return '<button class="'+(th===t[0]?'on':'')+'" data-act="theme" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div></div>'+
    '<label class="sw"><div class="t"><b>Retour haptique</b><span>Vibrations légères au toucher (Android)</span></div><input type="checkbox" data-act="hapticpref" '+(PREF.haptic!==false?'checked':'')+'><span class="k"></span></label>'+
    '<div class="sw" style="cursor:default"><div class="t"><b>Installer sur le téléphone</b><span>'+(isStandalone()?'Application installée':ios?'Safari › Partager › « Sur l\'écran d\'accueil »':'Ajoute une icône comme une vraie application')+'</span></div>'+(isStandalone()?'<span class="badge">'+I('check')+'Installée</span>':'<button class="btn sm pri" data-act="install">'+I('phone2')+'Installer</button>')+'</div>'+
    '<div class="sw" style="cursor:pointer" data-act="replayonb"><div class="t"><b>Revoir la présentation</b><span>Les pages d\'accueil de l\'application</span></div>'+I('chevr','mut')+'</div></div>'+
    (can('parametres')?'<div class="card span2"><h3 style="font-size:15.5px;margin-bottom:14px">Paramètres de la région</h3><div class="fgrid"><label class="field"><span>Nom de la région</span><input id="p_reg" value="'+esc(DB.settings.region)+'"></label><label class="field"><span>Seuil de création d\'une cellule-école</span><input id="p_seuil" type="number" inputmode="numeric" min="2" value="'+esc(DB.settings.seuil)+'"></label><div style="display:flex;align-items:flex-end"><button class="btn pri block" data-act="savesettings">'+I('check')+'Enregistrer</button></div></div></div>':'')+'</div>'+
    (Store.mode==='demo'
      ? '<div class="card demo-card" style="margin-top:16px"><span class="ri">'+I('sparkle')+'</span><div class="t"><h3>Mode démonstration</h3><p class="sm mut">Données fictives enregistrées sur cet appareil uniquement. Aucun essai n\'atteint la base réelle.</p></div><div class="row"><button class="btn" data-act="demoswitch">'+I('swap')+'Changer de profil</button><button class="btn danger" data-act="resetdemo">'+I('trash')+'Réinitialiser</button>'+(DEMO_ONLY?'':'<button class="btn pri" data-act="exitdemo">Quitter la démonstration</button>')+'</div></div>'
      : '<div class="card demo-card" style="margin-top:16px"><span class="ri">'+I('sparkle')+'</span><div class="t"><h3>Présenter la plateforme</h3><p class="sm mut">Ouvrez la démonstration pour montrer l\'application avec des données fictives, sans risque pour la base réelle. Vous resterez connecté à votre compte.</p></div><div class="row"><button class="btn pri" data-act="startdemo">'+I('sparkle')+'Ouvrir la démonstration</button></div></div>')+
    '<p class="xs mut" style="text-align:center;margin-top:24px">GEEAD ABIDJAN SUD · Plateforme des bureaux · version 3.1 · '+(Store.mode==='demo'?'Mode démonstration':'Connecté à la base sécurisée')+'</p>';
  return {html:html};
};
RENDER.plus=function(){
  var ex=bottomNav(); var items=[].concat.apply([],navGroups().map(function(g){ return g[1]; })).filter(function(k){ return ex.indexOf(k)<0; });
  var desc={validations:'Inscriptions des membres',acces:'Demandes et bureaux',cellules:'Les cellules locales',suivi:'Accompagnement des membres',opportunites:'Écoles prêtes pour une cellule',reseau:'Mentors, talents, écoles',communication:'Annonces et diffusion',journal:'Historique des actions',donnees:'Import et export',parametres:'Profil et application'};
  var html='<div class="card" style="display:flex;gap:14px;align-items:center;margin-bottom:16px" data-act="goto" data-v="parametres">'+uavatar(U,'lg')+'<div style="flex:1"><h3 style="font-size:18px">'+esc(U.nom)+'</h3><p class="sm mut">'+esc(U.titre)+'</p></div>'+I('chevr','mut')+'</div><div class="tiles">'+items.map(function(k){ return '<a class="tile" href="#'+k+'"><span class="ic">'+I(VIEWS[k].i)+'</span><b>'+esc(vt(k))+'</b><span>'+esc(desc[k]||'')+'</span></a>'; }).join('')+'</div><button class="btn block danger" data-act="logout" style="margin-top:18px">'+I('logout')+'Se déconnecter</button>';
  return {html:html};
};
function applyTheme(){ var t=PREF.theme||'auto'; if(t==='auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme',t);
  var m=$('meta[name=theme-color]'); if(m) m.content=t==='dark'?'#0a100c':'#04331a'; }

