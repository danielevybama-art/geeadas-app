/* GEEADAS — correctif connexion (v2.1) : Google en fenêtre, création de mot de passe à la première connexion */
(function(){
  if(Store.mode!=='firebase') return;
  var baseLogin = renderLogin;
  renderLogin = function(err, mode){
    baseLogin(err);
    var f = $('#loginf'); if(!f) return;
    if(mode==='signup'){
      f.querySelector('h2').textContent='Première connexion';
      f.querySelector('.lead').textContent='Créez votre mot de passe avec l\'adresse e-mail enregistrée par le bureau régional.';
      var pw=$('#lp'); pw.setAttribute('autocomplete','new-password'); pw.placeholder='8 caractères minimum';
      pw.closest('label').insertAdjacentHTML('afterend','<label class="field" style="margin-top:14px"><span>Confirmer le mot de passe</span><input id="lp2" type="password" required autocomplete="new-password"></label>');
      f.querySelector('.btn.pri').textContent='Créer mon accès';
      var g=f.querySelector('[data-act=googlelogin]'); if(g){ g.nextElementSibling.remove(); g.remove(); }
      f.querySelector('[data-act=resetpwd]').outerHTML='<button type="button" class="btn ghost block" data-act="loginmode" style="margin-top:6px">J\'ai déjà un accès : me connecter</button>';
      f.onsubmit=async function(e){ e.preventDefault(); var em=$('#le').value.trim().toLowerCase(), p=$('#lp').value;
        if(p.length<8){ renderLogin('Le mot de passe doit contenir au moins 8 caractères.','signup'); return; }
        if(p!==$('#lp2').value){ renderLogin('Les deux mots de passe ne correspondent pas.','signup'); return; }
        var b=f.querySelector('.pri'); b.disabled=true; b.textContent='Création…';
        try{ await Store.fb.auth.createUserWithEmailAndPassword(em,p); }
        catch(er){ renderLogin(er.code==='auth/email-already-in-use'?'Cette adresse a déjà un accès : connectez-vous.':'Création impossible : '+(er.message||er.code),'signup'); } };
    } else {
      f.querySelector('[data-act=resetpwd]').insertAdjacentHTML('afterend','<button type="button" class="btn ghost block" data-act="signupmode">Première connexion : créer mon mot de passe</button>');
    }
  };
  ACT.signupmode=function(){ renderLogin('', 'signup'); };
  ACT.loginmode=function(){ renderLogin(''); };
  ACT.googlelogin=async function(el){
    var p=new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({prompt:'select_account'}); el.disabled=true;
    try{ await Store.fb.auth.signInWithPopup(p); }
    catch(er){ el.disabled=false;
      if(er.code==='auth/popup-blocked'||er.code==='auth/operation-not-supported-in-this-environment') renderLogin('La fenêtre Google a été bloquée par ce navigateur. Utilisez Chrome ou Safari, ou connectez-vous avec e-mail et mot de passe.');
      else if(er.code!=='auth/popup-closed-by-user'&&er.code!=='auth/cancelled-popup-request') renderLogin('Connexion Google impossible : '+(er.message||er.code)); } };
  if(!U && location.hash!=='#inscription' && $('#loginf')) renderLogin();
})();
