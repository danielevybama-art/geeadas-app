/* =====================================================================
   GEEADAS — Données, configuration, couche de stockage
   ===================================================================== */

/* Pour la production : collez ici la configuration Firebase (voir README).
   Laissée à null, l'application fonctionne en mode démonstration. */
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyBBojAM0-KmYFrqMsAD9sSuH-YSFgrTcVg",
  authDomain: "geead-abidjan-sud.firebaseapp.com",
  projectId: "geead-abidjan-sud",
  storageBucket: "geead-abidjan-sud.firebasestorage.app",
  messagingSenderId: "777451405530",
  appId: "1:777451405530:web:1e71abc008f652ce56a5e3"
};

var CONFIG = { prefixe: 'GAS', region: 'Abidjan Sud' };
/* Compte qui devient automatiquement administrateur à sa première connexion Google */
var BOOTSTRAP_ADMIN = 'danielevybama@gmail.com';

var TITRES = {
  regional: ['Administrateur(trice) de la plateforme','Président(e) régional(e)','Vice-président(e) régional(e)','Secrétaire général(e)','Secrétaire à l\'organisation','Trésorier(ère) régional(e)','Chargé(e) du suivi spirituel','Chargé(e) de communication','Commissaire aux comptes'],
  local: ['Président(e) de cellule','Vice-président(e) de cellule','Secrétaire de cellule','Trésorier(ère) de cellule','Chargé(e) du suivi']
};
var NIVEAUX = {
  'Élève': ['6e','5e','4e','3e','2nde','1ère','Terminale','CAP / BT'],
  'Étudiant': ['BTS 1','BTS 2','Licence 1','Licence 2','Licence 3','Master 1','Master 2','Doctorat','Formation pro']
};
var ORDRE_NIV = NIVEAUX['Élève'].concat(NIVEAUX['Étudiant']);
var ENGAGEMENTS = ['Chorale','Intercession','Évangélisation','Accueil','Média / Technique','Enseignement','Musique','Leadership'];
var TYPES_SUIVI = ['Visite / entretien','Prière / soutien spirituel','Soutien académique','Prise en charge sociale','Absence prolongée','Félicitations'];
var STATUT_CARTE = ['À produire','Imprimée','Remise'];

/* ---------- Utilitaires ---------- */
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.from((r || document).querySelectorAll(s)); }
function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function norm(s){ return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
function isoDay(d){ d = d || new Date(); return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
function today(){ return isoDay(); }
function nowISO(){ return new Date().toISOString(); }
function ageOf(d){ if(!d) return null; var b=new Date(d), n=new Date(); var a=n.getFullYear()-b.getFullYear(); if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate())) a--; return isNaN(a)?null:a; }
function fmtD(d){ return d ? new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) : '—'; }
function fmtRel(d){ if(!d) return ''; var s=(Date.now()-new Date(d).getTime())/1000; if(s<60) return 'à l\'instant'; if(s<3600) return 'il y a '+Math.floor(s/60)+' min'; if(s<86400) return 'il y a '+Math.floor(s/3600)+' h'; var j=Math.floor(s/86400); if(j<30) return 'il y a '+j+' j'; return fmtD(d); }
function fmtN(n){ return Number(n||0).toLocaleString('fr-FR'); }
function initials(m){ return ((m.nom||'')[0]||'') + ((m.prenoms||'')[0]||''); }
function fullName(m){ return ((m.nom||'').toUpperCase()+' '+(m.prenoms||'')).trim(); }
function firstName(n){ return String(n||'').split(' ')[0]; }
function telIntl(t){ var d=String(t||'').replace(/\D/g,''); if(!d) return ''; if(d.length===10) d='225'+d; return d; }
function fmtTel(t){ var d=String(t||'').replace(/\D/g,''); if(d.length===10) return d.replace(/(\d{2})(?=\d)/g,'$1 ').trim(); return t||''; }
function hue(s){ var h=0; s=String(s||''); for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h; }
var AV_COLORS=['#0b7a3e','#0f8f6b','#d98b05','#2a6fdb','#7a4fd6','#c2410c','#0e7490','#4d7c0f'];
function avColor(s){ return AV_COLORS[hue(s)%AV_COLORS.length]; }
function csvCell(v){ var s=String(v==null?'':v); return /[";\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s; }
function parseCSV(text){
  var first=text.split('\n')[0]; var sep=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
  var rows=[],row=[],f='',q=false;
  for(var i=0;i<text.length;i++){ var c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){f+='"';i++;} else q=false; } else f+=c; }
    else if(c==='"') q=true; else if(c===sep){ row.push(f); f=''; } else if(c==='\n'){ row.push(f); rows.push(row); row=[]; f=''; } else if(c!=='\r') f+=c; }
  if(f||row.length){ row.push(f); rows.push(row); }
  return rows.filter(function(r){ return r.some(function(x){ return x.trim(); }); });
}
function parseDateFR(s){ s=String(s||'').trim(); var m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/); if(m) return m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0'); m=s.match(/^(\d{4})-(\d{2})-(\d{2})/); return m?m[0]:''; }
function resizePhoto(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){ var img=new Image(); img.onload=function(){ var W=300,H=375,c=document.createElement('canvas'); c.width=W;c.height=H; var x=c.getContext('2d'); var s=Math.max(W/img.width,H/img.height); var w=img.width*s,h=img.height*s; x.drawImage(img,(W-w)/2,(H-h)/2,w,h); res(c.toDataURL('image/jpeg',.74)); }; img.onerror=rej; img.src=r.result; }; r.onerror=rej; r.readAsDataURL(file); }); }
function completude(m){ var keys=['photo','telephone','whatsapp','etablissement','niveau','filiere','eglise','commune','naissance']; var n=keys.filter(function(k){ return m[k]; }).length; return Math.round(n/keys.length*100); }

/* ---------- Icônes (traits 24px) ---------- */
var ICONS = {
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  userplus:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  checkc:'<circle cx="12" cy="12" r="10"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  search:'<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  chevr:'<path d="m9 18 6-6-6-6"/>',chevl:'<path d="m15 18-6-6 6-6"/>',chevd:'<path d="m6 9 6 6 6-6"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  msg:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  card:'<rect x="2" y="5" width="20" height="14" rx="3"/><circle cx="8" cy="12" r="2.2"/><path d="M14 10h4M14 14h3"/>',
  printer:'<path d="M6 9V2h12v7"/><rect x="6" y="14" width="12" height="8" rx="1"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  mega:'<path d="m3 11 18-5v12L3 14z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  key:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  trash:'<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/>',
  cap:'<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
  cake:'<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01"/>',
  alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  phone2:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 18h.01"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  church:'<path d="M18 22V10l-6-5-6 5v12M12 5V1M10 2.5h4M10 22v-4a2 2 0 0 1 4 0v4M3 22h18"/>',
  trend:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  filter:'<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
  swap:'<path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  chart:'<path d="M12 20V10M18 20V4M6 20v-4"/>',
  wallet:'<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  more:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
  star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>'
};
function I(n, cls){ return '<svg class="i '+(cls||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICONS[n]||'')+'</svg>'; }

/* ---------- Données de démonstration ---------- */
function demoData(){
  var lieux=['Port-Bouët Adjahui','Port-Bouët Centre','Gonzagueville','Vridi Cité','Vridi Canal','Koumassi Remblais','Koumassi Grand Campement','Koumassi Sicogi','Marcory Zone 4','Marcory Anoumabo','Marcory Résidentiel','Treichville Avenue 16','Treichville Arras','Biétry','Anani','Jean Folly','Derrière Wharf','Abattoir','Petit Bassam','Aéroport','Grand-Bassam Route'];
  var respNoms=['Samuel KOFFI','Ruth AKA','Élie BOGUI','Sarah ZADI','Fabrice DOSSO','David BAMBA','Larissa TANOH','Isaac BROU','Bénédicte ASSI','Josué KACOU','Priscille SÉRI','Caleb GNAGNE','Déborah EHUI','Jérémie AMANI','Christelle DJÈ','Paul-Henri YAO','Esther KONAN','Stéphane OUATTARA','Josiane TRAORÉ','Ange KOUADIO','Rebecca N\'GUESSAN'];
  var cells=lieux.map(function(l,i){ return {id:'c'+(i+1),code:'C'+String(i+1).padStart(2,'0'),nom:l,eglise:'AD '+l,etablissement:'',responsable:respNoms[i],telephone:'07 0'+(i%9+1)+' 4'+(i%7)+' 2'+(i%5)+' '+(10+i),creeLe:'2023-09-0'+(i%9+1)}; });
  cells[0].etablissement='Lycée Municipal de Port-Bouët'; cells[5].etablissement='Lycée Moderne de Koumassi'; cells[8].etablissement='Université Félix Houphouët-Boigny';
  var etabsSec=['Lycée Municipal de Port-Bouët','Lycée Moderne de Koumassi','Collège Moderne de Marcory','Lycée Technique d\'Abidjan','Collège Saint-Viateur','Groupe Scolaire Les Lauriers Vridi','Collège Notre-Dame d\'Afrique','Collège Moderne Gonzagueville','Lycée Moderne de Treichville'];
  var etabSup=['Université Félix Houphouët-Boigny','INP-HB (Abidjan)','ESATIC Treichville','Université Nangui Abrogoua','IUA Abidjan'];
  var noms=['KOUASSI','KOFFI','YAO','N\'GUESSAN','KONAN','KOUAMÉ','BAMBA','TRAORÉ','OUATTARA','KOUADIO','AKA','GNAGNE','EHUI','BOGUI','ZADI','TANOH','ASSI','DJÈ','SÉRI','DOSSO','BROU','AMANI','KACOU','ABOA','GUÉI','LOBA'];
  var pf=['Grâce','Esther','Ruth','Déborah','Emmanuella','Marie-Noëlle','Christelle','Bénédicte','Priscille','Sarah','Rebecca','Josiane','Ange-Laure','Larissa','Myriam','Naomi','Ornella','Judith'];
  var pm=['Jean-Marc','David','Samuel','Josué','Emmanuel','Daniel','Élie','Caleb','Paul-Henri','Jérémie','Fabrice','Ange','Stéphane','Isaac','Joël','Ezéchiel','Gédéon','Nathan'];
  var fil={'Élève':['Série A','Série C','Série D','Série G2','Premier cycle'],'Étudiant':['Droit','Économie','Informatique','Médecine','Lettres modernes','Génie civil','Comptabilité','Anglais','Télécoms','Biologie']};
  var seed=11; function rnd(){ seed=(seed*9301+49297)%233280; return seed/233280; } function pick(a){ return a[Math.floor(rnd()*a.length)]; }
  var now=new Date(), yr=now.getFullYear(), members=[];
  var N=214;
  for(var i=1;i<=N;i++){
    var sexe=rnd()<.57?'F':'M', statut=rnd()<.66?'Élève':'Étudiant';
    var niveau=statut==='Élève'?pick(NIVEAUX['Élève'].slice(0,7)):pick(NIVEAUX['Étudiant'].slice(0,8));
    var base=statut==='Élève'?11+NIVEAUX['Élève'].indexOf(niveau):19+NIVEAUX['Étudiant'].indexOf(niveau)/1.3;
    var a=Math.round(base+rnd()*2);
    var isol=rnd()<.05, cell=isol?null:pick(cells);
    var etab=statut==='Étudiant'?pick(etabSup):pick(etabsSec);
    if(i%17===0) etab='Lycée Moderne de Treichville';
    var tel='07'+String(Math.floor(10000000+rnd()*89999999));
    // inscriptions étalées sur 12 mois, croissance progressive
    var mBack=Math.floor(Math.pow(rnd(),1.6)*12); var di=new Date(yr, now.getMonth()-mBack, 1+Math.floor(rnd()*27));
    if(di>now) di=new Date(now.getTime()-86400000*Math.floor(rnd()*20));
    var paye=rnd()<.62, st=paye?(rnd()<.55?'Remise':(rnd()<.5?'Imprimée':'À produire')):'À produire';
    members.push({ id:CONFIG.prefixe+'-'+String(di.getFullYear()).slice(2)+'-'+String(i).padStart(5,'0'), nom:pick(noms), prenoms:sexe==='F'?pick(pf):pick(pm), sexe:sexe,
      naissance:(yr-a)+'-'+String(1+Math.floor(rnd()*12)).padStart(2,'0')+'-'+String(1+Math.floor(rnd()*27)).padStart(2,'0'),
      telephone:tel, whatsapp:rnd()<.85?tel:'', email:'', commune:pick(['Port-Bouët','Koumassi','Marcory','Treichville']), quartier:'', eglise:cell?cell.eglise:'',
      celluleId:cell?cell.id:'', statut:statut, niveau:niveau, etablissement:etab, filiere:rnd()<.85?pick(fil[statut]):'',
      parentNom:a<18?'M./Mme '+pick(noms):'', parentTel:a<18?'05'+String(Math.floor(10000000+rnd()*89999999)):'',
      baptemeEau:rnd()<.55, baptemeEsprit:rnd()<.32, engagements:rnd()<.5?[pick(ENGAGEMENTS)]:[], talents:rnd()<.28?pick(['Guitare','Chant','Graphisme','Informatique','Théâtre','Batterie','Rédaction','Piano','Photographie']):'',
      annuaire:rnd()<.85, photo:'', dateInscription:isoDay(di), historique:[], carte:{paye:paye,statut:st}, creePar:'Démo' });
  }
  members.sort(function(a,b){ return a.dateInscription.localeCompare(b.dateInscription); });
  members.forEach(function(m,i){ m.id=CONFIG.prefixe+'-'+m.dateInscription.slice(2,4)+'-'+String(i+1).padStart(5,'0'); });
  var users=[
    {id:'u1',nom:'Josué AKA',titre:'Président(e) régional(e)',niveau:'regional',celluleId:'',email:'president@geeadas.ci',telephone:'07 07 11 22 33',acces:'complet',actif:true},
    {id:'u2',nom:'Esther BROU',titre:'Secrétaire général(e)',niveau:'regional',celluleId:'',email:'secretariat@geeadas.ci',telephone:'07 08 44 55 66',acces:'complet',actif:true},
    {id:'u3',nom:'Caleb YAO',titre:'Commissaire aux comptes',niveau:'regional',celluleId:'',email:'comptes@geeadas.ci',telephone:'05 06 77 88 99',acces:'lecture',actif:true},
    {id:'u4',nom:'Samuel KOFFI',titre:'Président(e) de cellule',niveau:'local',celluleId:'c1',email:'portbouet@geeadas.ci',telephone:'07 01 40 20 10',acces:'complet',actif:true},
    {id:'u5',nom:'Grâce N\'GUESSAN',titre:'Secrétaire de cellule',niveau:'local',celluleId:'c1',email:'sec.portbouet@geeadas.ci',telephone:'01 02 03 04 05',acces:'complet',actif:true},
    {id:'u6',nom:'David BAMBA',titre:'Président(e) de cellule',niveau:'local',celluleId:'c6',email:'koumassi@geeadas.ci',telephone:'07 06 45 25 15',acces:'complet',actif:true}
  ];
  var notes=[]; members.slice(-40).forEach(function(m,i){ if(i%3===0) notes.push({id:uid()+i,membreId:m.id,celluleId:m.celluleId,type:pick(TYPES_SUIVI),txt:pick(['Rencontré après le culte, encouragé pour les examens.','Appel téléphonique : va bien, reprend les réunions de cellule.','Besoin d\'un soutien en mathématiques, mis en lien avec un mentor.','Absent depuis 3 semaines, visite prévue samedi.','Admis au BAC, félicitations transmises de la part du bureau.']),date:isoDay(new Date(now.getTime()-86400000*Math.floor(rnd()*50))),par:pick(['Samuel KOFFI','Grâce N\'GUESSAN','David BAMBA'])}); });
  var annonces=[
    {id:'a1',titre:'Congrès régional GEEAD — inscriptions ouvertes',texte:'Le congrès régional se tiendra pendant les congés de Pâques. Chaque cellule doit transmettre la liste de ses participants avant la fin du mois.',date:isoDay(new Date(now.getTime()-86400000*2)),auteur:'Josué AKA',titre_auteur:'Président(e) régional(e)',cible:'all',important:true},
    {id:'a2',titre:'Campagne de cartes de membre',texte:'Les cartes PVC sont en production. Merci de finaliser les paiements et de vérifier les photos de vos membres.',date:isoDay(new Date(now.getTime()-86400000*9)),auteur:'Esther BROU',titre_auteur:'Secrétaire général(e)',cible:'all',important:false}
  ];
  var inscriptions=[0,1,2,3].map(function(i){ var s=i%2?'M':'F'; return {id:'i'+i,nom:pick(noms),prenoms:s==='F'?pick(pf):pick(pm),sexe:s,naissance:(yr-15-i)+'-0'+(i+3)+'-1'+i,telephone:'0102030'+i+'40',whatsapp:'',statut:'Élève',niveau:['2nde','1ère','Terminale','3e'][i],etablissement:i<3?'Collège Moderne de Marcory':'Lycée Municipal de Port-Bouët',filiere:'Série A',celluleId:i<3?'c10':'c1',eglise:i<3?'AD Marcory Anoumabo':'AD Port-Bouët Adjahui',commune:'Marcory',baptemeEau:false,baptemeEsprit:false,engagements:[],annuaire:true,consentement:true,dateSoumission:isoDay(new Date(now.getTime()-86400000*i))}; });
  var logs=[{id:'l1',date:new Date(now.getTime()-3600000*5).toISOString(),auteur:'Esther BROU',action:'Annonce publiée',detail:'Campagne de cartes de membre',celluleId:''},{id:'l2',date:new Date(now.getTime()-3600000*26).toISOString(),auteur:'Samuel KOFFI',action:'Membre ajouté',detail:members[members.length-1].id,celluleId:'c1'}];
  return {cells:cells,members:members,notes:notes,inscriptions:inscriptions,users:users,annonces:annonces,logs:logs,settings:{seuil:5,prixCarte:1000,region:'Abidjan Sud'},seq:N,demo:true};
}

/* ---------- Couche de stockage (démo locale ou Firebase) ---------- */
var KEY='geeadas-v2';
var DB={cells:[],members:[],notes:[],inscriptions:[],users:[],annonces:[],logs:[],invites:[],settings:{seuil:5,prixCarte:1000,region:'Abidjan Sud'},seq:0};
var COLL={cells:'cellules',members:'membres',notes:'suivis',inscriptions:'inscriptions',users:'utilisateurs',annonces:'annonces',logs:'journal',invites:'invitations'};
var Store={
  mode: FIREBASE_CONFIG ? 'firebase' : 'demo', fb:null,
  persist:function(){ if(this.mode!=='demo') return; try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(e){} },
  loadDemo:function(){ var d=null; try{ d=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){} Object.assign(DB, d||demoData()); this.persist(); },
  loadFirebase: async function(u){
    var db=this.fb.db, reg=u.niveau==='regional';
    async function all(c){ return (await db.collection(c).get()).docs.map(function(d){ return Object.assign({},d.data(),{id:d.id}); }); }
    async function mine(c){ return (await db.collection(c).where('celluleId','==',u.celluleId).get()).docs.map(function(d){ return Object.assign({},d.data(),{id:d.id}); }); }
    DB.cells=await all('cellules');
    DB.members=reg?await all('membres'):await mine('membres');
    DB.notes=reg?await all('suivis'):await mine('suivis');
    DB.inscriptions=reg?await all('inscriptions'):await mine('inscriptions');
    DB.users=reg?await all('utilisateurs'):await mine('utilisateurs');
    DB.annonces=await all('annonces');
    DB.invites=reg?await all('invitations'):[];
    DB.logs=reg?(await db.collection('journal').orderBy('date','desc').limit(300).get()).docs.map(function(d){ return Object.assign({},d.data(),{id:d.id}); }):[];
    var s=await db.collection('meta').doc('parametres').get(); if(s.exists) DB.settings=Object.assign(DB.settings,s.data());
  },
  nextId: async function(){
    var yy=String(new Date().getFullYear()).slice(2), n;
    if(this.mode==='firebase'){ var ref=this.fb.db.collection('meta').doc('compteur');
      n=await this.fb.db.runTransaction(async function(t){ var s=await t.get(ref); var v=(s.exists?s.data().n:0)+1; t.set(ref,{n:v},{merge:true}); return v; }); }
    else { DB.seq=(DB.seq||0)+1; n=DB.seq; }
    return CONFIG.prefixe+'-'+yy+'-'+String(n).padStart(5,'0');
  },
  save: async function(kind, obj){
    if(!obj.id) obj.id = kind==='members' ? await this.nextId() : uid();
    var arr=DB[kind], i=arr.findIndex(function(x){ return x.id===obj.id; }); if(i>=0) arr[i]=obj; else arr.push(obj);
    if(this.mode==='firebase'){ var d=Object.assign({},obj); delete d.id; await this.fb.db.collection(COLL[kind]).doc(obj.id).set(d); }
    this.persist(); return obj;
  },
  remove: async function(kind, id){ DB[kind]=DB[kind].filter(function(x){ return x.id!==id; }); if(this.mode==='firebase') await this.fb.db.collection(COLL[kind]).doc(id).delete(); this.persist(); },
  saveSettings: async function(){ if(this.mode==='firebase') await this.fb.db.collection('meta').doc('parametres').set(DB.settings); this.persist(); },
  submitPublic: async function(x){ x.id=uid(); x.dateSoumission=today();
    if(this.mode==='firebase'){ var d=Object.assign({},x); delete d.id; await this.fb.db.collection('inscriptions').doc(x.id).set(d); }
    else { DB.inscriptions.push(x); this.persist(); } },
  createAccount: async function(u, motDePasse){
    if(this.mode!=='firebase') return this.save('users', u);
    var sec=firebase.apps.find(function(a){ return a.name==='secondaire'; }) || firebase.initializeApp(FIREBASE_CONFIG,'secondaire');
    var cred=await sec.auth().createUserWithEmailAndPassword(u.email, motDePasse); u.id=cred.user.uid; await sec.auth().signOut();
    return this.save('users', u);
  },
  reset:function(){ Object.keys(DB).forEach(function(k){ delete DB[k]; }); Object.assign(DB, demoData()); this.persist(); }
};
