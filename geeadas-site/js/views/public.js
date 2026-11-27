/* GEEAD ABIDJAN SUD — Formulaire public d'inscription */

function renderPublic(){
  $('#root').innerHTML='<div class="public view"><div class="pub-h">'+logoMark('xl')+'<span class="kick">GEEAD ABIDJAN SUD</span><h1>Recensement des GEEADISTES</h1><p>Élève ou étudiant des Assemblées de Dieu ? Inscris-toi en 2 minutes. Ton responsable de cellule validera ta fiche et tu recevras ton identifiant de membre.</p></div><div class="pub-b"><div class="card" style="padding:22px"><div id="pwb"></div><div id="pwf" class="row" style="margin-top:22px;justify-content:flex-end"></div></div>'+(U||Store.mode==='demo'?'<p class="sm" style="text-align:center;margin-top:16px"><a href="#accueil">'+I('chevl')+' Retour à l\'espace des responsables</a></p>':'')+'</div></div>';
  var w=new Wizard({mode:'public', submitLabel:'Envoyer mon inscription', onSubmit: async function(d){ d.consentement=true; await Store.submitPublic(d); log('Inscription reçue', fullName(d), d.celluleId); confetti();
    $('#pwb').parentNode.innerHTML='<div class="success"><div class="ok"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2 style="font-size:22px;font-weight:800">Merci '+esc(d.prenoms.split(' ')[0])+' !</h2><p class="mut" style="margin:8px auto 22px;max-width:36ch">Ton inscription est bien arrivée. Ton responsable de cellule va la valider et tu recevras ton identifiant GEEADAS.</p><button class="btn pri" data-act="pubagain">'+I('userplus')+'Inscrire une autre personne</button></div>'; } });
  w.mount($('#pwb'), $('#pwf'));
}

