/* GEEAD ABIDJAN SUD — Assistant d'enregistrement d'un GEEADISTE */

function blankMember(){ return {nom:'',prenoms:'',sexe:'',naissance:'',photo:'',telephone:'',whatsapp:'',memeWa:true,email:'',commune:'',quartier:'',parentNom:'',parentTel:'',statut:'Élève',niveau:'',etablissement:'',filiere:'',eglise:'',celluleId:(U&&!isReg())?U.celluleId:'',baptemeEau:false,baptemeEsprit:false,engagements:[],talents:'',annuaire:true,consentement:false}; }
function Wizard(o){ this.o=o; this.d=Object.assign(blankMember(), JSON.parse(JSON.stringify(o.data||{}))); if(this.d.whatsapp&&this.d.whatsapp!==this.d.telephone) this.d.memeWa=false; this.i=0; this.dir=1; }
Wizard.prototype.steps=[
  {t:'Identité',h:'Qui est ce GEEADISTE ?',req:['nom','prenoms','sexe','naissance']},
  {t:'Contacts',h:'Comment le joindre ?',req:['telephone']},
  {t:'Scolarité',h:'Où étudie-t-il ?',req:['niveau','etablissement']},
  {t:'Église',h:'Vie d\'église et engagement',req:['eglise']}
];
Wizard.prototype.html=function(){
  var d=this.d, s=this.steps[this.i], pub=this.o.mode==='public', self=this;
  var inp=function(k,label,attrs,req){ return '<label class="field"><span>'+label+(req?' <i>*</i>':'')+'</span><input data-k="'+k+'" value="'+esc(d[k])+'" '+(attrs||'')+'></label>'; };
  var h='<div class="steps">'+this.steps.map(function(x,i){ return '<i class="'+(i<=self.i?'on':'')+'"></i>'; }).join('')+'</div><div class="stepv '+(this.dir<0?'back':'')+'"><div class="step-t">Étape '+(this.i+1)+' sur '+this.steps.length+' · '+s.t+'</div><div class="step-h">'+s.h+'</div>';
  if(this.i===0){
    var a=ageOf(d.naissance);
    h+='<div class="photo-up"><label>'+(d.photo?'<img src="'+esc(d.photo)+'" alt="">':I('camera'))+'<input type="file" accept="image/*" capture="user" data-photo></label><div><b>Photo d\'identité</b><p class="sm mut">Fond clair, visage dégagé. Elle figurera sur la fiche de membre.</p>'+(d.photo?'<button class="btn sm ghost danger" data-wact="rmphoto" style="padding:0;margin-top:4px">Retirer</button>':'')+'</div></div>'+
      '<div class="fgrid">'+inp('nom','Nom','autocomplete="family-name" style="text-transform:uppercase"',1)+inp('prenoms','Prénoms','autocomplete="given-name"',1)+
      '<div class="full"><span class="field"><span>Sexe <i>*</i></span></span><div class="big-opt">'+[['F','Fille'],['M','Garçon']].map(function(x){ return '<button type="button" class="opt '+(d.sexe===x[0]?'on':'')+'" data-wset="sexe" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div><input type="hidden" data-k="sexe" value="'+esc(d.sexe)+'"></div>'+
      '<label class="field full"><span>Date de naissance <i>*</i></span><input type="date" data-k="naissance" value="'+esc(d.naissance)+'" max="'+today()+'"></label>'+(a!=null?'<p class="sm full" style="margin-top:-6px;color:var(--brand);font-weight:700">'+a+' ans'+(a<18?' · mineur : les coordonnées d\'un parent seront demandées':'')+'</p>':'')+'</div>';
  } else if(this.i===1){
    var mineur=(ageOf(d.naissance)||99)<18;
    h+='<div class="fgrid">'+inp('telephone','Téléphone','type="tel" inputmode="tel" autocomplete="tel" placeholder="07 00 00 00 00"',1)+
      '<div class="full card" style="padding:2px 14px;box-shadow:none"><label class="sw"><div class="t"><b>Même numéro sur WhatsApp</b><span>Pour les messages du bureau</span></div><input type="checkbox" data-kb="memeWa" '+(d.memeWa?'checked':'')+'><span class="k"></span></label></div>'+
      (d.memeWa?'':inp('whatsapp','Numéro WhatsApp','type="tel" inputmode="tel"'))+inp('email','E-mail','type="email" inputmode="email" autocomplete="email"')+inp('commune','Commune','list="dl-com"')+inp('quartier','Quartier')+
      '<datalist id="dl-com">'+['Port-Bouët','Koumassi','Marcory','Treichville','Grand-Bassam'].map(function(x){ return '<option value="'+x+'">'; }).join('')+'</datalist>'+
      (mineur?'<div class="full sec-t" style="margin:6px 0 0">Parent ou tuteur</div>'+inp('parentNom','Nom du parent / tuteur','',1)+inp('parentTel','Téléphone du parent','type="tel" inputmode="tel"',1):'')+'</div>';
  } else if(this.i===2){
    var etabs=Array.from(new Set(DB.members.map(function(m){ return m.etablissement; }).filter(Boolean))).sort();
    h+='<span class="field"><span>Statut <i>*</i></span></span><div class="big-opt" style="margin-bottom:16px">'+['Élève','Étudiant'].map(function(x){ return '<button type="button" class="opt '+(d.statut===x?'on':'')+'" data-wset="statut" data-v="'+x+'">'+I(x==='Élève'?'users':'cap')+x+'</button>'; }).join('')+'</div>'+
      '<span class="field"><span>Niveau <i>*</i></span></span><div class="opt-grid" style="margin-bottom:16px">'+NIVEAUX[d.statut].map(function(x){ return '<button type="button" class="opt '+(d.niveau===x?'on':'')+'" data-wset="niveau" data-v="'+esc(x)+'">'+esc(x)+'</button>'; }).join('')+'</div><input type="hidden" data-k="niveau" value="'+esc(d.niveau)+'">'+
      '<div class="fgrid">'+inp('etablissement','École / université','list="dl-etab" autocomplete="off" placeholder="Ex. Lycée Moderne de Koumassi"',1)+inp('filiere',d.statut==='Élève'?'Série':'Filière','placeholder="'+(d.statut==='Élève'?'Série A, C, D…':'Droit, Informatique…')+'"')+'<datalist id="dl-etab">'+etabs.map(function(x){ return '<option value="'+esc(x)+'">'; }).join('')+'</datalist></div>';
  } else {
    var cellsOpt=(isReg()||pub)?DB.cells:DB.cells.filter(function(c){ return c.id===U.celluleId; });
    h+='<div class="fgrid">'+inp('eglise','Église locale','placeholder="AD …" list="dl-egl"',1)+'<datalist id="dl-egl">'+DB.cells.map(function(c){ return '<option value="'+esc(c.eglise)+'">'; }).join('')+'</datalist>'+
      '<label class="field"><span>Cellule GEEAD</span><select data-k="celluleId" '+(!isReg()&&!pub?'disabled':'')+'>'+((isReg()||pub)?'<option value="">'+(pub?'Je ne sais pas':'Aucune (isolé)')+'</option>':'')+cellsOpt.map(function(c){ return '<option value="'+esc(c.id)+'" '+(d.celluleId===c.id?'selected':'')+'>'+esc(c.code+' · '+c.nom)+'</option>'; }).join('')+'</select></label></div>'+
      '<div class="card" style="padding:2px 14px;box-shadow:none;margin-top:16px"><label class="sw"><div class="t"><b>Baptisé(e) d\'eau</b></div><input type="checkbox" data-kb="baptemeEau" '+(d.baptemeEau?'checked':'')+'><span class="k"></span></label><label class="sw"><div class="t"><b>Baptisé(e) du Saint-Esprit</b></div><input type="checkbox" data-kb="baptemeEsprit" '+(d.baptemeEsprit?'checked':'')+'><span class="k"></span></label><label class="sw"><div class="t"><b>Visible dans l\'annuaire</b><span>Mise en relation avec d\'autres GEEADISTES</span></div><input type="checkbox" data-kb="annuaire" '+(d.annuaire?'checked':'')+'><span class="k"></span></label></div>'+
      '<span class="field" style="margin-top:16px"><span>Engagements et services</span></span><div class="chips" style="flex-wrap:wrap">'+ENGAGEMENTS.map(function(x){ return '<button type="button" class="chip '+(d.engagements.indexOf(x)>=0?'on':'')+'" data-wtog="'+esc(x)+'">'+esc(x)+'</button>'; }).join('')+'</div>'+
      '<label class="field" style="margin-top:16px"><span>Talents et compétences</span><input data-k="talents" value="'+esc(d.talents)+'" placeholder="Guitare, graphisme, informatique…"></label>'+
      (pub?'<div class="card" style="padding:2px 14px;box-shadow:none;margin-top:16px"><label class="sw"><div class="t"><b>J\'accepte l\'enregistrement de mes informations <i style="color:var(--red);font-style:normal">*</i></b><span>Utilisées uniquement par le GEEAD Abidjan Sud pour mon suivi. Pour un mineur : avec l\'accord d\'un parent.</span></div><input type="checkbox" data-kb="consentement" '+(d.consentement?'checked':'')+'><span class="k"></span></label></div>':'');
  }
  return h+'</div>';
};
Wizard.prototype.foot=function(){ var last=this.i===this.steps.length-1;
  return (this.i>0?'<button class="btn" data-wact="prev">'+I('chevl')+'Retour</button>':(this.o.mode==='public'?'':'<button class="btn" data-act="closesheet">Annuler</button>'))+
    '<button class="btn pri" data-wact="'+(last?'submit':'next')+'">'+(last?I('check')+(this.o.submitLabel||'Enregistrer'):'Continuer'+I('chevr'))+'</button>'; };
Wizard.prototype.mount=function(body, foot){
  var self=this; this.body=body; this.footEl=foot;
  body.innerHTML=this.html(); foot.innerHTML=this.foot();
  body.oninput=function(e){ var k=e.target.dataset.k; if(k){ self.d[k]=e.target.value; e.target.classList.remove('err'); } };
  body.onchange=async function(e){ var t=e.target;
    if(t.dataset.kb){ self.d[t.dataset.kb]=t.checked; haptic(); if(t.dataset.kb==='memeWa') self.redraw(true); }
    if(t.dataset.k==='naissance'){ self.d.naissance=t.value; self.redraw(true); }
    if(t.dataset.k==='celluleId'){ self.d.celluleId=t.value; var c=cellById(t.value); if(c&&!self.d.eglise){ self.d.eglise=c.eglise; self.redraw(true); } }
    if(t.dataset.photo!==undefined&&t.files[0]){ try{ self.d.photo=await resizePhoto(t.files[0]); haptic('success'); self.redraw(true); }catch(er){ toast('Photo illisible','err'); } } };
  body.onclick=function(e){ var b=e.target.closest('[data-wset],[data-wtog],[data-wact]'); if(!b) return;
    if(b.dataset.wset){ self.d[b.dataset.wset]=b.dataset.v; if(b.dataset.wset==='statut'&&NIVEAUX[b.dataset.v].indexOf(self.d.niveau)<0) self.d.niveau=''; self.redraw(true); }
    if(b.dataset.wtog){ var a=self.d.engagements, v=b.dataset.wtog; self.d.engagements=a.indexOf(v)>=0?a.filter(function(x){ return x!==v; }):a.concat([v]); b.classList.toggle('on'); }
    if(b.dataset.wact==='rmphoto'){ self.d.photo=''; self.redraw(true); } };
  foot.onclick=function(e){ var b=e.target.closest('[data-wact]'); if(!b) return; var a=b.dataset.wact;
    if(a==='prev'){ self.i--; self.dir=-1; self.redraw(); }
    if(a==='next'){ if(self.check()){ self.i++; self.dir=1; self.redraw(); } }
    if(a==='submit'){ if(self.check()) self.submit(b); } };
};
Wizard.prototype.redraw=function(keep){ var y=this.body.scrollTop; var dir=this.dir; if(keep) this.dir=0; this.body.innerHTML=this.html(); this.footEl.innerHTML=this.foot(); this.dir=dir; if(keep){ this.body.scrollTop=y; var sv=this.body.querySelector('.stepv'); if(sv) sv.style.animation='none'; } else { this.body.scrollTop=0; if(this.o.mode==='public') window.scrollTo({top:0,behavior:'smooth'}); } };
Wizard.prototype.check=function(){ var d=this.d, s=this.steps[this.i], miss=s.req.filter(function(k){ return !String(d[k]||'').trim(); });
  if(this.i===1&&(ageOf(d.naissance)||99)<18){ ['parentNom','parentTel'].forEach(function(k){ if(!String(d[k]||'').trim()) miss.push(k); }); }
  if(this.i===3&&this.o.mode==='public'&&!d.consentement){ toast('Merci d\'accepter l\'enregistrement de vos informations','err'); return false; }
  if(this.i===1&&d.telephone.replace(/\D/g,'').length<8){ miss.push('telephone'); }
  var self=this;
  miss.forEach(function(k){ var el=self.body.querySelector('[data-k="'+k+'"]'); if(el){ if(el.type==='hidden'){ var p=el.previousElementSibling; if(p){ p.style.animation='shake .35s'; setTimeout(function(){ p.style.animation=''; },400); } } else { el.classList.remove('err'); void el.offsetWidth; el.classList.add('err'); } } });
  if(miss.length){ toast('Complétez les champs obligatoires','err'); var f=self.body.querySelector('.err'); if(f) f.focus(); return false; }
  return true; };
Wizard.prototype.submit=async function(btn){ btn.disabled=true; btn.innerHTML='<span>Enregistrement…</span>'; var d=Object.assign({},this.d);
  d.nom=d.nom.trim().toUpperCase(); d.prenoms=d.prenoms.trim(); if(d.memeWa) d.whatsapp=d.telephone; delete d.memeWa;
  try{ await this.o.onSubmit(d); }catch(er){ console.error(er); toast('Erreur : '+(er.message||er),'err'); btn.disabled=false; btn.innerHTML=I('check')+'Réessayer'; } };

function openWizard(member, opts){
  opts=opts||{}; var isNew=!member||!member.id||opts.fromIns;
  var sh=openSheet({title:opts.title||(isNew?'Nouveau GEEADISTE':'Modifier la fiche'), focus:false, body:'', foot:' '});
  var w=new Wizard({data:member, mode:opts.mode||'staff', submitLabel:opts.submitLabel||(isNew?'Enregistrer et générer l\'ID':'Enregistrer'), onSubmit: async function(d){
    if(isNew){
      var m=Object.assign(d,{id:'',historique:[],dateInscription:today(),creePar:U.nom});
      delete m.consentement; if(opts.fromIns){ m.consentement=true; }
      m=await Store.save('members', m);
      if(opts.fromIns){ await Store.remove('inscriptions', opts.fromIns); log('Inscription validée', m.id+' · '+fullName(m), m.celluleId); }
      else log('Membre ajouté', m.id+' · '+fullName(m), m.celluleId);
      showSuccess(sh, m);
    } else {
      var old=DB.members.find(function(x){ return x.id===member.id; }); var res=Object.assign({},old,d); res.historique=(old.historique||[]).slice();
      [['celluleId','Cellule'],['etablissement','Établissement'],['niveau','Niveau'],['eglise','Église']].forEach(function(p){ if((old[p[0]]||'')!==(res[p[0]]||'')) res.historique.push({date:today(),champ:p[1],de:p[0]==='celluleId'?cellName(old[p[0]]):(old[p[0]]||'—'),a:p[0]==='celluleId'?cellName(res[p[0]]):(res[p[0]]||'—'),par:U.nom}); });
      await Store.save('members', res); log('Fiche modifiée', res.id+' · '+fullName(res), res.celluleId);
      closeSheet(); toast('Fiche mise à jour'); rerenderSoft(); refreshMemberSheet();
    } } });
  w.mount(sh.querySelector('.sheet-b'), sh.querySelector('.sheet-f'));
}
function showSuccess(sh, m){
  confetti(); haptic('success');
  sh.querySelector('.sheet-h h2').textContent='GEEADISTE enregistré';
  sh.querySelector('.sheet-b').innerHTML='<div class="success"><div class="ok"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2 style="font-size:22px;font-weight:800">'+esc(fullName(m))+'</h2><p class="mut" style="margin-top:6px">Identifiant unique attribué automatiquement</p><div class="idbig mono">'+esc(m.id)+'</div><div class="succ-mini">'+avatar(m,'lg')+'<div><b>'+esc(m.etablissement)+'</b><span>'+esc(m.statut)+' · '+esc(m.niveau)+'</span><span>'+esc(cellName(m.celluleId))+'</span></div></div></div>';
  sh.querySelector('.sheet-f').innerHTML='<button class="btn" data-act="newmember-again">'+I('userplus')+'Ajouter un autre</button><button class="btn pri" data-act="member-from-success" data-id="'+esc(m.id)+'" data-tab="fiche">Voir la fiche'+I('chevr')+'</button>';
  sh.querySelector('.sheet-f').onclick=null; rerenderSoft();
}
function rerenderSoft(){ var v=curView(); if(v==='membres'&&$('#mlist')) drawMembers(); else { var r=RENDER[v]&&RENDER[v](); if(r&&$('.content .view')){ $('.content .view').innerHTML=demoBanner()+r.html; $('.content .view').style.animation='none'; if(r.mount) r.mount(); countUp($('.content')); } }
  // badges de navigation
  ['validations','acces'].forEach(function(k){ var n=navCount(k); $$('.sb-link[href="#'+k+'"] .cnt, .bnav a[href="#'+k+'"] .dot').forEach(function(e){ if(n) e.textContent=n; else e.remove(); }); }); }

