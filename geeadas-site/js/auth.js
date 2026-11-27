/* GEEAD ABIDJAN SUD — Entrée : présentation, choix du rôle, demande d'accès, connexion, démarrage */

var AUTH = { slide:0, step:null, niveau:'', err:'', pending:null, fbUser:null, submitting:false, replay:false, unsub:[], form:{} };
var U_BACKUP = null;
function onbDone(){ try{ return localStorage.getItem('geeadas-onb')==='1'; }catch(e){ return true; } }
function setOnbDone(){ try{ localStorage.setItem('geeadas-onb','1'); }catch(e){} }

function renderAuth(){
  document.title='GEEAD ABIDJAN SUD';
  if(AUTH.pending) return renderPending();
  if(AUTH.replay || (!onbDone() && !AUTH.step)) return renderOnboarding();
  if(AUTH.step==='request') return renderRequest();
  if(AUTH.step==='role') return renderRole();
  return renderLoginScreen();
}
function gIcon(){ return '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8.1z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6.1-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.9 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.1 1.6l3.1-3.1A11 11 0 0 0 2.2 7.1l3.7 2.8C6.8 7.3 9.2 5.4 12 5.4z"/></svg>'; }
function brandBar(back){ return '<header class="ent-h">'+(back?'<button class="btn icon ghost" data-act="'+back+'" aria-label="Retour">'+I('chevl')+'</button>':'')+logoMark()+'<div><b>GEEAD ABIDJAN SUD</b><span>Plateforme des bureaux</span></div>'+(Store.mode==='demo'?'<span class="demo-pill">'+I('sparkle')+'Démo</span>':'')+'</header>'; }

/* ---------- 1. Présentation ---------- */
var SLIDES = [
  {k:'Bienvenue', t:'Bienvenue sur la plateforme du GEEAD ABIDJAN SUD', d:'Recensement, accompagnement et pilotage des élèves et étudiants des Assemblées de Dieu de la région, réunis dans une seule application.', art:'logo'},
  {k:'Recensement', t:'Chaque GEEADISTE a sa fiche', d:'École, niveau, église, cellule et photo : chaque membre reçoit automatiquement un identifiant unique qui le suit partout.', art:'fiches'},
  {k:'Accompagnement', t:'Personne n\'est oublié', d:'Visites, prière, soutien scolaire : chaque bureau garde la trace de ses suivis et sait qui recontacter.', art:'suivi'},
  {k:'Pilotage', t:'Des chiffres fiables pour décider', d:'Le bureau régional suit l\'évolution des effectifs et repère où ouvrir de nouvelles cellules-écoles.', art:'chart'},
  {k:'Sécurité', t:'Un accès selon votre poste', d:'Chaque responsable fait sa demande d\'accès. Elle est validée par le bureau régional et n\'ouvre que les droits de son poste.', art:'shield'}
];
function slideArt(k){
  if(k==='logo') return '<div class="art art-logo"><span class="ring r1"></span><span class="ring r2"></span><span class="ring r3"></span>'+logoMark('xl')+'<span class="float f1">'+I('users')+'Élèves et étudiants</span><span class="float f2">'+I('layers')+'Cellules</span><span class="float f3">'+I('church')+'Assemblées de Dieu</span></div>';
  if(k==='fiches') return '<div class="art art-fiches">'+[['KG','Grâce KOUASSI','Lycée Moderne de Koumassi · 2nde','GAS-26-00042','#d98b05'],['YD','David YAO','Université FHB · Licence 2','GAS-26-00043','#2a6fdb'],['AE','Esther AKA','Collège Moderne de Marcory · 3e','GAS-26-00044','#0b7a3e']].map(function(x,i){ return '<div class="mini" style="--i:'+i+'"><span class="av" style="background:'+x[4]+'">'+x[0]+'</span><div><b>'+x[1]+'</b><span>'+x[2]+'</span></div><em class="mono">'+x[3]+'</em></div>'; }).join('')+'</div>';
  if(k==='suivi') return '<div class="art art-suivi"><div class="tlc">'+[['heart','Visite à domicile','Encouragée pour le BAC'],['phone','Appel de suivi','Reprend les réunions'],['cap','Soutien scolaire','Mise en lien avec un mentor']].map(function(x,i){ return '<div class="tli" style="--i:'+i+'"><span class="ic">'+I(x[0])+'</span><div><b>'+x[1]+'</b><span>'+x[2]+'</span></div></div>'; }).join('')+'</div></div>';
  if(k==='chart') return '<div class="art art-chart"><div class="chc"><div class="chk"><b>+18 %</b><span>GEEADISTES cette année</span></div><div class="chb">'+[34,48,42,60,72,66,88].map(function(h,i){ return '<i style="--h:'+h+'%;--i:'+i+'"></i>'; }).join('')+'</div></div></div>';
  return '<div class="art art-shield"><div class="shd">'+I('shield')+'</div><span class="tier t1">'+I('star')+'Administrateur</span><span class="tier t2">'+I('shield')+'Bureau régional</span><span class="tier t3">'+I('users')+'Bureaux locaux</span></div>';
}
function renderOnboarding(){
  var i=AUTH.slide, s=SLIDES[i], last=i===SLIDES.length-1;
  $('#root').innerHTML='<div class="onb view" id="onb"><div class="onb-art" data-k="'+s.art+'">'+slideArt(s.art)+'</div><div class="onb-panel"><div class="onb-top">'+logoMark()+'<b class="onb-brand">GEEAD ABIDJAN SUD</b><button class="btn ghost sm" data-act="onbskip">'+(AUTH.replay?'Fermer':'Passer')+'</button></div>'+
    '<div class="onb-txt" key="'+i+'"><span class="kick">'+esc(s.k)+'</span><h1>'+esc(s.t)+'</h1><p>'+esc(s.d)+'</p></div>'+
    '<div class="onb-foot"><div class="dots">'+SLIDES.map(function(_,j){ return '<button class="'+(j===i?'on':'')+'" data-act="onbgo" data-v="'+j+'" aria-label="Page '+(j+1)+'"></button>'; }).join('')+'</div>'+
    '<div class="row">'+(i>0?'<button class="btn icon" data-act="onbprev" aria-label="Précédent">'+I('chevl')+'</button>':'')+'<button class="btn pri onb-next" data-act="onbnext">'+(last?(AUTH.replay?'Terminer':'Commencer'):'Suivant')+I(last?'check':'chevr')+'</button></div></div></div></div>';
  var el=$('#onb'), x0=null;
  el.addEventListener('pointerdown',function(e){ x0=e.clientX; });
  el.addEventListener('pointerup',function(e){ if(x0===null) return; var dx=e.clientX-x0; x0=null; if(Math.abs(dx)>60){ if(dx<0) ACT.onbnext(); else ACT.onbprev(); } });
  hideSplash();
}
function endOnboarding(){ setOnbDone(); if(AUTH.replay){ AUTH.replay=false; U=U_BACKUP; U_BACKUP=null; render(); return; } AUTH.step=(DEMO&&!DEMO_ONLY)?'login':'role'; render(); }
document.addEventListener('keydown',function(e){ if(!$('#onb')) return; if(e.key==='ArrowRight') ACT.onbnext(); if(e.key==='ArrowLeft') ACT.onbprev(); });

/* ---------- 2. Qui êtes-vous ? ---------- */
function renderRole(){
  var fu=AUTH.fbUser;
  $('#root').innerHTML='<div class="ent view">'+brandBar(fu?null:'tologin')+'<main class="ent-b"><span class="kick">Bienvenue</span><h1>Quel est votre rôle ?</h1><p class="lead">'+(fu?'Vous êtes connecté avec '+esc(fu.email)+'. Choisissez votre bureau pour envoyer votre demande d\'accès.':'Choisissez votre profil pour continuer.')+'</p>'+
    '<div class="roles">'+
      '<button class="role-opt" data-act="pickrole" data-v="regional"><span class="ri">'+I('shield')+'</span><div><b>Membre du bureau régional</b><span>Président, vice-président, secrétaires, trésorier, chargés… Votre accès est validé par l\'administrateur de la plateforme.</span></div>'+I('chevr','chev')+'</button>'+
      '<button class="role-opt" data-act="pickrole" data-v="local"><span class="ri gold">'+I('users')+'</span><div><b>Membre d\'un bureau local</b><span>Président, secrétaire, trésorier ou chargé du suivi d\'une cellule. Votre accès est validé par le bureau régional.</span></div>'+I('chevr','chev')+'</button>'+
      '<a class="role-opt" href="#inscription"><span class="ri blue">'+I('userplus')+'</span><div><b>Je suis GEEADISTE</b><span>Élève ou étudiant : je m\'inscris au recensement de ma cellule.</span></div>'+I('chevr','chev')+'</a>'+
    '</div>'+(DEMO?'':'<button class="demo-cta" data-act="startdemo"><span class="ri">'+I('sparkle')+'</span><div><b>Découvrir en démonstration</b><span>Explorez l\'application avec des données fictives, sans compte ni validation.</span></div>'+I('chevr','chev')+'</button>')+'<div class="ent-links">'+(fu?'<button class="btn ghost" data-act="authlogout">'+I('logout')+'Utiliser un autre compte</button>':'<button class="btn ghost" data-act="tologin">J\'ai déjà un accès · <b>Se connecter</b></button>')+'<button class="btn ghost sm" data-act="replayonb">Revoir la présentation</button></div></main></div>';
  hideSplash();
}

/* ---------- 3. Demande d'accès ---------- */
function renderRequest(){
  var n=AUTH.niveau||'regional', f=AUTH.form, fu=AUTH.fbUser;
  if(fu&&!f.email) f.email=fu.email||'';
  if(fu&&!f.prenoms&&fu.displayName){ var dn=fu.displayName.split(' '); f.prenoms=dn.slice(0,-1).join(' ')||dn[0]; f.nom=dn.length>1?dn[dn.length-1]:''; }
  var inp=function(k,l,attrs){ return '<label class="field"><span>'+l+' <i>*</i></span><input data-f="'+k+'" value="'+esc(f[k]||'')+'" '+(attrs||'')+'></label>'; };
  var cells=DB.cells.slice().sort(function(a,b){ return a.code.localeCompare(b.code); });
  $('#root').innerHTML='<div class="ent view">'+brandBar('torole')+'<main class="ent-b wide"><span class="kick">'+(n==='regional'?'Bureau régional':'Bureau local')+'</span><h1>Demande d\'accès</h1><p class="lead">Renseignez votre poste et vos coordonnées. '+(n==='regional'?'L\'administrateur de la plateforme':'Le bureau régional')+' validera votre accès.</p>'+
    '<form id="reqf" novalidate><section class="rq-sec"><div class="rq-n">1</div><div class="rq-c"><h3>Votre poste</h3><div class="postes">'+POSTES[n].map(function(p){ return '<button type="button" class="poste '+(f.poste===p.t?'on':'')+'" data-p="'+esc(p.t)+'"><b>'+esc(p.t)+'</b><span>'+esc(p.d)+'</span></button>'; }).join('')+'</div>'+
    (n==='local'?'<label class="field" style="margin-top:14px"><span>Votre cellule <i>*</i></span>'+(cells.length?'<select data-f="celluleId"><option value="">Choisir la cellule…</option>'+cells.map(function(c){ return '<option value="'+esc(c.id)+'" '+(f.celluleId===c.id?'selected':'')+'>'+esc(c.code+' · '+c.nom)+'</option>'; }).join('')+'</select>':'<div class="note-in">'+I('alert')+'Aucune cellule n\'est encore enregistrée. Le bureau régional doit d\'abord créer les cellules.</div>')+'</label>':'')+'</div></section>'+
    '<section class="rq-sec"><div class="rq-n">2</div><div class="rq-c"><h3>Vos coordonnées</h3><div class="fgrid">'+inp('nom','Nom','autocomplete="family-name" style="text-transform:uppercase"')+inp('prenoms','Prénoms','autocomplete="given-name"')+inp('telephone','Téléphone (WhatsApp)','type="tel" inputmode="tel" autocomplete="tel" placeholder="07 00 00 00 00"')+inp('email','Adresse e-mail','type="email" inputmode="email" autocomplete="email" '+(fu?'readonly':''))+'</div></div></section>'+
    '<section class="rq-sec"><div class="rq-n">3</div><div class="rq-c"><h3>Votre accès</h3>'+(fu?'<div class="gconn">'+gIcon()+'<div><b>Connecté avec Google</b><span>'+esc(fu.email)+'</span></div></div>':
      (Store.mode==='firebase'?'<button type="button" class="btn block gbtn" data-act="googlereq">'+gIcon()+'Continuer avec Google</button><div class="or"><span>ou créez un mot de passe</span></div>':'')+'<div class="fgrid"><label class="field"><span>Mot de passe <i>*</i></span><input data-f="pwd" type="password" autocomplete="new-password" placeholder="8 caractères minimum" value="'+esc(f.pwd||'')+'"></label><label class="field"><span>Confirmer <i>*</i></span><input data-f="pwd2" type="password" autocomplete="new-password" value="'+esc(f.pwd2||'')+'"></label></div>')+'</div></section>'+
    (AUTH.err?'<p class="ent-err">'+I('alert')+esc(AUTH.err)+'</p>':'')+
    '<div class="rq-submit"><button class="btn pri block" type="submit">'+I('send')+'Envoyer ma demande</button><p class="xs mut">En envoyant cette demande, vous vous engagez à utiliser les données des membres uniquement pour le service du GEEAD.</p></div></form></main></div>';
  var form=$('#reqf');
  form.oninput=form.onchange=function(e){ var k=e.target.dataset.f; if(k){ f[k]=e.target.value; e.target.classList.remove('err'); } };
  form.onclick=function(e){ var b=e.target.closest('[data-p]'); if(!b) return; f.poste=b.dataset.p; $$('.poste',form).forEach(function(x){ x.classList.toggle('on',x===b); }); haptic(); };
  form.onsubmit=function(e){ e.preventDefault(); submitRequest(); };
  hideSplash();
}
async function submitRequest(){
  var f=AUTH.form, n=AUTH.niveau, fu=AUTH.fbUser, miss=[];
  ['nom','prenoms','telephone','email'].forEach(function(k){ if(!String(f[k]||'').trim()) miss.push(k); });
  if(n==='local'&&!f.celluleId) miss.push('celluleId');
  if(!fu){ if(String(f.pwd||'').length<8) miss.push('pwd'); if(f.pwd!==f.pwd2) miss.push('pwd2'); }
  miss.forEach(function(k){ var el=$('[data-f="'+k+'"]'); if(el){ el.classList.remove('err'); void el.offsetWidth; el.classList.add('err'); } });
  if(!f.poste){ toast('Choisissez votre poste','err'); var p=$('.postes'); if(p){ p.style.animation='shake .35s'; setTimeout(function(){ p.style.animation=''; },400); } return; }
  if(miss.length){ toast(miss.indexOf('pwd2')>=0&&f.pwd&&f.pwd.length>=8?'Les mots de passe ne correspondent pas':'Complétez les champs obligatoires','err'); return; }
  if(String(f.telephone).replace(/\D/g,'').length<8){ toast('Numéro de téléphone incomplet','err'); return; }
  var d={nom:String(f.nom).trim().toUpperCase(), prenoms:String(f.prenoms).trim(), telephone:String(f.telephone).trim(), email:String(f.email).trim().toLowerCase(), niveau:n, poste:f.poste, celluleId:n==='local'?f.celluleId:'', statut:'en_attente', date:nowISO()};
  var btn=$('#reqf [type=submit]'); btn.disabled=true; btn.innerHTML='Envoi en cours…';
  if(Store.mode==='demo'){
    d.id='dm'+uid(); DB.demandes.push(d); Store.persist(); try{ localStorage.setItem('geeadas-session','pending:'+d.id); }catch(e){}
    AUTH.pending=d; AUTH.step=null; AUTH.form={}; AUTH.err=''; render(); haptic('success'); return;
  }
  AUTH.submitting=true;
  try{
    var user=Store.fb.auth.currentUser;
    if(!user){ var cred=await Store.fb.auth.createUserWithEmailAndPassword(d.email, f.pwd); user=cred.user; }
    d.email=String(user.email||d.email).toLowerCase();
    await Store.fb.db.collection('demandes').doc(user.uid).set(d);
    AUTH.fbUser=user; AUTH.pending=Object.assign({id:user.uid}, d); AUTH.step=null; AUTH.form={}; AUTH.err='';
    watchPending(user.uid); AUTH.submitting=false; render(); haptic('success');
  }catch(er){
    AUTH.submitting=false;
    AUTH.err = er.code==='auth/email-already-in-use' ? 'Cette adresse e-mail a déjà un compte. Connectez-vous avec votre mot de passe : vous verrez l\'état de votre demande.'
      : er.code==='auth/invalid-email' ? 'Adresse e-mail invalide.' : er.code==='auth/weak-password' ? 'Mot de passe trop faible (8 caractères minimum).'
      : 'Envoi impossible : '+(er.message||er.code);
    renderRequest(); haptic('error');
  }
}

/* ---------- 4. En attente de validation ---------- */
function renderPending(){
  var d=AUTH.pending, c=cellById(d.celluleId), par=d.niveau==='regional'?'l\'administrateur de la plateforme':'le bureau régional', de=d.niveau==='regional'?'de l\'administrateur de la plateforme':'du bureau régional';
  var h;
  if(d.statut==='refusee'){
    h='<div class="pend-ic red">'+I('x')+'</div><h1>Demande non retenue</h1><p class="lead">Votre demande d\'accès n\'a pas été validée'+(d.traitePar?' par '+esc(d.traitePar):'')+'.</p>'+(d.motif?'<div class="note-in">'+I('mega')+esc(d.motif)+'</div>':'')+
      '<div class="ent-links"><button class="btn pri block" data-act="newrequest">'+I('edit')+'Faire une nouvelle demande</button><button class="btn ghost" data-act="authlogout">'+I('logout')+'Se déconnecter</button></div>';
  } else if(d.statut==='suspendu'){
    h='<div class="pend-ic red">'+I('lock')+'</div><h1>Accès suspendu</h1><p class="lead">Votre accès a été suspendu. Contactez le bureau régional pour le rétablir.</p><div class="ent-links"><button class="btn ghost" data-act="authlogout">'+I('logout')+'Se déconnecter</button></div>';
  } else if(d.statut==='validee'){
    h='<div class="pend-ic">'+I('check')+'</div><h1>Accès validé</h1><p class="lead">Ouverture de votre espace…</p>';
  } else {
    h='<div class="pend-ic wait"><span class="pulse"></span>'+I('inbox')+'</div><h1>Demande envoyée</h1><p class="lead">Votre demande est entre les mains '+de+'. Vous serez connecté automatiquement dès qu\'elle sera validée.</p>'+
      '<ol class="pend-steps"><li class="done"><span>'+I('check')+'</span><div><b>Demande envoyée</b><small>'+fmtRel(d.date)+'</small></div></li><li class="cur"><span>2</span><div><b>Vérification</b><small>par '+par+'</small></div></li><li><span>3</span><div><b>Accès ouvert</b><small>selon votre poste</small></div></li></ol>'+
      '<div class="card pend-sum"><dl class="kv"><dt>Nom</dt><dd>'+esc((d.prenoms||'')+' '+(d.nom||''))+'</dd><dt>Poste</dt><dd>'+esc(d.poste)+'</dd><dt>Bureau</dt><dd>'+(d.niveau==='regional'?'Régional':esc(c?c.code+' · '+c.nom:'Local'))+'</dd><dt>Contact</dt><dd>'+esc(d.telephone||'')+'</dd></dl></div>'+
      (Store.mode==='demo'?'<div class="note-in demo">'+I('sparkle')+'<span>Démonstration : reconnectez-vous avec un profil du '+(d.niveau==='regional'?'bureau régional (administrateur)':'bureau régional')+' pour valider cette demande, puis revenez sur ce compte.</span></div>':'')+'<div class="ent-links"><button class="btn pri block" data-act="checkpending">'+I('swap')+'Vérifier maintenant</button><div class="row" style="justify-content:center"><button class="btn ghost" data-act="editrequest">'+I('edit')+'Modifier ma demande</button><button class="btn ghost" data-act="authlogout">'+I('logout')+'Se déconnecter</button></div></div>';
  }
  $('#root').innerHTML='<div class="ent view">'+brandBar(null)+'<main class="ent-b pend">'+h+'</main></div>';
  hideSplash();
}

/* ---------- 5. Connexion ---------- */
function renderLoginScreen(){
  var art='<div class="auth-art"><div class="lg">'+logoMark('lg')+'<div><b>GEEAD ABIDJAN SUD</b><span>Groupe des Élèves et Étudiants des Assemblées de Dieu</span></div></div>'+
    '<div><h1>Chaque GEEADISTE <em>connu</em>, suivi et accompagné.</h1><p>L\'espace de travail des bureaux régional et locaux du GEEAD ABIDJAN SUD.</p></div><p class="slogan">L\'École, Notre Champ Missionnaire</p></div>';
  var form;
  if(Store.mode==='demo'){
    var g=function(lvl){ return DB.users.filter(function(u){ return u.niveau===lvl&&u.actif!==false; }).map(function(u){ var c=cellById(u.celluleId), p=posteDef(u.niveau,u.titre), d=u.admin?'Valide les accès du bureau régional et voit toute la plateforme.':(p?p.d:'');
      return '<button class="acct" data-act="demologin" data-id="'+esc(u.id)+'">'+uavatar(u)+'<div class="t"><b>'+esc(u.nom)+(u.admin?' <em class="badge gold">Admin</em>':'')+(u.acces==='lecture'?' <em class="badge grey">Lecture</em>':'')+'</b><span>'+esc(u.titre)+(c?' · '+esc(c.nom):'')+'</span>'+(d?'<small>'+esc(d)+'</small>':'')+'</div>'+I('chevr')+'</button>'; }).join(''); };
    form='<div class="auth-form demo-pick"><span class="kick demo-k">'+I('sparkle')+'Mode démonstration</span><h2>Choisissez un profil</h2><p class="lead">Chaque profil ouvre l\'application telle que la voit ce poste. Les données sont fictives et restent sur cet appareil.</p>'+
      '<div class="seg-label">Bureau régional</div>'+g('regional')+'<div class="seg-label">Bureaux locaux</div>'+g('local')+
      '<div class="demo-acts"><button class="btn block" data-act="torole">'+I('userplus')+'Simuler une demande d\'accès</button>'+(DEMO_ONLY?'':'<button class="btn ghost block" data-act="exitdemo">'+I('chevl')+'Quitter la démonstration</button>')+'</div></div>';
  } else {
    form='<form class="auth-form" id="loginf"><h2>Connexion</h2><p class="lead">Accès réservé aux membres validés des bureaux régional et locaux.</p><button type="button" class="btn block gbtn" data-act="googlelogin">'+gIcon()+'Continuer avec Google</button><div class="or"><span>ou avec e-mail</span></div><label class="field"><span>Adresse e-mail</span><input id="le" type="email" required autocomplete="username" placeholder="nom@exemple.com"></label><label class="field" style="margin-top:14px"><span>Mot de passe</span><input id="lp" type="password" required autocomplete="current-password"></label>'+(AUTH.err?'<p class="ent-err">'+I('alert')+esc(AUTH.err)+'</p>':'')+'<button class="btn pri block" style="margin-top:20px;min-height:52px">Se connecter</button><button type="button" class="btn ghost block" data-act="resetpwd" style="margin-top:6px">Mot de passe oublié ?</button><div class="or"><span>Nouveau responsable ?</span></div><button type="button" class="btn block" data-act="torole">'+I('userplus')+'Demander un accès</button><button type="button" class="btn ghost block demo-link" data-act="startdemo">'+I('sparkle')+'Découvrir la plateforme en démonstration</button><p class="sm mut" style="margin-top:16px;text-align:center"><a href="#inscription">Je suis GEEADISTE : je m\'inscris</a></p></form>';
  }
  $('#root').innerHTML='<div class="auth view">'+art+form+'</div>';
  var lf=$('#loginf'); if(lf) lf.onsubmit=async function(e){ e.preventDefault(); var b=lf.querySelector('.pri'); b.disabled=true; b.textContent='Connexion…'; AUTH.err='';
    try{ await Store.fb.auth.signInWithEmailAndPassword($('#le').value.trim(),$('#lp').value); }
    catch(er){ haptic('error'); AUTH.err=(er.code==='auth/too-many-requests')?'Trop de tentatives. Réessayez dans quelques minutes.':'E-mail ou mot de passe incorrect.'; renderLoginScreen(); } };
  hideSplash();
}

/* ---------- Démonstration ---------- */
function startDemo(){
  haptic('success');
  try{ sessionStorage.setItem('geead-demo','1'); localStorage.removeItem('geeadas-session'); }catch(e){}
  $('#root').innerHTML='<div class="ent"><main class="ent-b pend"><div class="pend-ic wait"><span class="pulse"></span>'+I('sparkle')+'</div><h1>Démonstration</h1><p class="lead">Préparation des données fictives…</p></main></div>';
  history.replaceState(null,'',location.pathname+'#demo'); setTimeout(function(){ location.reload(); }, 350);
}
function exitDemo(){
  try{ sessionStorage.removeItem('geead-demo'); localStorage.removeItem('geeadas-session'); }catch(e){}
  history.replaceState(null,'',location.pathname); location.reload();
}

/* ---------- Actions ---------- */
Object.assign(ACT, {
  onbnext:function(){ if(AUTH.slide<SLIDES.length-1){ AUTH.slide++; renderOnboarding(); } else endOnboarding(); },
  onbprev:function(){ if(AUTH.slide>0){ AUTH.slide--; renderOnboarding(); } },
  onbgo:function(el){ AUTH.slide=+el.dataset.v; renderOnboarding(); },
  onbskip:function(){ endOnboarding(); },
  replayonb:function(){ AUTH.replay=true; AUTH.slide=0; if(U){ U_BACKUP=U; U=null; } closeAllSheets(); renderOnboarding(); },
  pickrole:function(el){ AUTH.niveau=el.dataset.v; AUTH.step='request'; AUTH.err=''; if(AUTH.form.niveau!==AUTH.niveau){ AUTH.form.poste=''; AUTH.form.niveau=AUTH.niveau; } render(); },
  torole:function(){ AUTH.step='role'; AUTH.err=''; render(); },
  tologin:function(){ AUTH.step='login'; AUTH.err=''; render(); },
  newrequest:function(){ var d=AUTH.pending; AUTH.pending=null; AUTH.form={nom:d.nom,prenoms:d.prenoms,telephone:d.telephone,email:d.email,niveau:d.niveau,poste:d.poste,celluleId:d.celluleId}; AUTH.niveau=d.niveau; AUTH.step='role'; stopWatch(); render(); },
  editrequest:function(){ var d=AUTH.pending; AUTH.pending=null; AUTH.form={nom:d.nom,prenoms:d.prenoms,telephone:d.telephone,email:d.email,niveau:d.niveau,poste:d.poste,celluleId:d.celluleId}; AUTH.niveau=d.niveau; AUTH.step='request'; stopWatch(); render(); },
  checkpending:async function(el){
    el.disabled=true;
    if(Store.mode==='demo'){ var u=DB.users.find(function(x){ return x.id===AUTH.pending.id; }); var dd=DB.demandes.find(function(x){ return x.id===AUTH.pending.id; });
      if(u){ confetti(); setSession(u); AUTH.pending=null; render(); toast('Votre accès a été validé !'); return; }
      if(dd&&dd.statut!==AUTH.pending.statut){ AUTH.pending=dd; render(); return; }
      toast('Toujours en attente de validation'); el.disabled=false; return; }
    var fu=Store.fb.auth.currentUser; if(fu) await handleAuth(fu); else el.disabled=false;
  },
  authlogout:function(){ authSignOut(); },
  startdemo:function(){ startDemo(); },
  exitdemo:async function(){ if(DEMO_ONLY) return; if(await confirmDlg({title:'Quitter la démonstration ?',text:'Vous revenez à la plateforme réelle. Vos essais restent enregistrés sur cet appareil pour une prochaine démonstration.',ok:'Quitter',tone:'brand',icon:'sparkle'})) exitDemo(); },
  demoswitch:function(){ authSignOut(); },
  googlelogin:function(el){ googleSignIn(el); },
  googlereq:function(el){ googleSignIn(el); },
  resetpwd:async function(){ var e=($('#le')||{}).value; if(!e){ toast('Saisissez d\'abord votre e-mail','err'); return; } try{ await Store.fb.auth.sendPasswordResetEmail(e.trim()); toast('E-mail de réinitialisation envoyé'); }catch(er){ toast('Adresse inconnue','err'); } },
  demologin:function(el){ var u=DB.users.find(function(x){ return x.id===el.dataset.id; }); setSession(u); AUTH.step=null; ST.f={cell:'',statut:'',sexe:'',niveau:'',fiche:''}; ST.dashCell=''; ST.q=''; haptic('success'); history.replaceState(null,'','#accueil'); render(); toast('Bienvenue, '+u.nom); }
});
async function googleSignIn(el){
  var p=new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({prompt:'select_account'}); if(el) el.disabled=true;
  try{ await Store.fb.auth.signInWithPopup(p); }
  catch(er){ if(el) el.disabled=false;
    if(er.code==='auth/popup-blocked'||er.code==='auth/operation-not-supported-in-this-environment') toast('Fenêtre Google bloquée par ce navigateur : utilisez Chrome ou Safari, ou l\'e-mail','err');
    else if(er.code!=='auth/popup-closed-by-user'&&er.code!=='auth/cancelled-popup-request') toast('Connexion Google impossible','err'); }
}
async function authSignOut(){
  stopWatch(); closeAllSheets();
  if(Store.mode==='firebase'){ try{ await Store.fb.auth.signOut(); }catch(e){} }
  setSession(null); try{ localStorage.removeItem('geeadas-session'); }catch(e){}
  U=null; AUTH.pending=null; AUTH.fbUser=null; AUTH.step='login'; AUTH.err=''; AUTH.form={};
  history.replaceState(null,'',location.pathname); render();
}

/* ---------- Firebase : état de connexion ---------- */
function stopWatch(){ (AUTH.unsub||[]).forEach(function(f){ try{ f(); }catch(e){} }); AUTH.unsub=[]; }
function watchPending(uidv){
  stopWatch(); var db=Store.fb.db;
  AUTH.unsub.push(db.collection('utilisateurs').doc(uidv).onSnapshot(function(s){ if(s.exists&&s.data().actif!==false&&!U){ confetti(); toast('Votre accès a été validé !'); enterApp(Store.fb.auth.currentUser, s.data()); } }, function(){}));
  AUTH.unsub.push(db.collection('demandes').doc(uidv).onSnapshot(function(s){ if(s.exists&&AUTH.pending&&!U){ var n=Object.assign({id:uidv}, s.data()); if(n.statut!==AUTH.pending.statut){ AUTH.pending=n; render(); } } }, function(){}));
}
async function enterApp(fu, data){
  var admin=String(fu.email||'').toLowerCase()===BOOTSTRAP_ADMIN.toLowerCase();
  U=Object.assign({}, data, {id:fu.uid, admin:admin});
  $('#root').innerHTML='<div class="ent"><main class="ent-b pend"><div class="pend-ic wait"><span class="pulse"></span>'+I('layers')+'</div><h1>Chargement</h1><p class="lead">Préparation de votre espace…</p></main></div>';
  try{ await Store.loadFirebase(U); }catch(er){ console.error(er); toast('Chargement incomplet : '+(er.code||er.message),'err'); }
  AUTH.pending=null; AUTH.step=null; stopWatch(); render(); hideSplash();
}
async function handleAuth(fu){
  AUTH.fbUser=fu||null;
  if(AUTH.submitting) return;
  if(!fu){ stopWatch(); U=null; AUTH.pending=null; render(); hideSplash(); return; }
  var db=Store.fb.db, email=String(fu.email||'').toLowerCase(), admin=email===BOOTSTRAP_ADMIN.toLowerCase();
  try{
    var p=await db.collection('utilisateurs').doc(fu.uid).get();
    if(!p.exists&&admin){ await db.collection('utilisateurs').doc(fu.uid).set({nom:fu.displayName||'Administrateur',titre:'Administrateur(trice) de la plateforme',niveau:'regional',celluleId:'',email:email,telephone:'',acces:'complet',actif:true}); p=await db.collection('utilisateurs').doc(fu.uid).get(); }
    if(p.exists){ var data=p.data(); if(data.actif===false){ AUTH.pending={statut:'suspendu'}; render(); hideSplash(); return; } await enterApp(fu, data); return; }
    var d=await db.collection('demandes').doc(fu.uid).get();
    if(d.exists){ AUTH.pending=Object.assign({id:fu.uid}, d.data()); watchPending(fu.uid); }
    else if(AUTH.step!=='request'){ AUTH.step='role'; }
    render(); hideSplash();
  }catch(er){ console.error(er); $('#root').innerHTML='<div class="ent"><main class="ent-b pend">'+emptyState('alert','Connexion impossible',er.message||er.code)+'<div class="ent-links"><button class="btn" data-act="authlogout">Se déconnecter</button></div></main></div>'; hideSplash(); }
}

/* ---------- Démarrage ---------- */
async function boot(){
  applyTheme();
  if(Store.mode==='demo'){
    if(location.hash==='#demo') history.replaceState(null,'',location.pathname);
    Store.loadDemo();
    var sid=null; try{ sid=localStorage.getItem('geeadas-session'); }catch(e){}
    if(sid&&sid.indexOf('pending:')===0){ var id=sid.slice(8), u=DB.users.find(function(x){ return x.id===id; }); if(u) U=u; else AUTH.pending=DB.demandes.find(function(x){ return x.id===id; })||null; }
    else U=DB.users.find(function(u){ return u.id===sid&&u.actif!==false; })||null;
    setTimeout(function(){ render(); hideSplash(); }, 650);
    return;
  }
  var base='https://www.gstatic.com/firebasejs/10.12.2/';
  try{ await loadScript(base+'firebase-app-compat.js'); await loadScript(base+'firebase-auth-compat.js'); await loadScript(base+'firebase-firestore-compat.js'); }
  catch(e){ $('#root').innerHTML='<div class="ent"><main class="ent-b pend">'+emptyState('alert','Connexion impossible','Vérifiez votre connexion internet puis rechargez la page.')+'</main></div>'; hideSplash(); return; }
  firebase.initializeApp(FIREBASE_CONFIG); Store.fb={auth:firebase.auth(), db:firebase.firestore()};
  try{ Store.fb.db.enablePersistence({synchronizeTabs:true}).catch(function(){}); }catch(e){}
  try{ DB.cells=(await Store.fb.db.collection('cellules').get()).docs.map(function(d){ return Object.assign({},d.data(),{id:d.id}); }); }catch(e){}
  Store.fb.auth.onAuthStateChanged(handleAuth);
}
boot();
