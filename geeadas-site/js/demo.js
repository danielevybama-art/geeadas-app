/* GEEAD ABIDJAN SUD — Jeu de données de démonstration (fictif) */

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
    members.push({ id:CONFIG.prefixe+'-'+String(di.getFullYear()).slice(2)+'-'+String(i).padStart(5,'0'), nom:pick(noms), prenoms:sexe==='F'?pick(pf):pick(pm), sexe:sexe,
      naissance:(yr-a)+'-'+String(1+Math.floor(rnd()*12)).padStart(2,'0')+'-'+String(1+Math.floor(rnd()*27)).padStart(2,'0'),
      telephone:tel, whatsapp:rnd()<.85?tel:'', email:'', commune:pick(['Port-Bouët','Koumassi','Marcory','Treichville']), quartier:'', eglise:cell?cell.eglise:'',
      celluleId:cell?cell.id:'', statut:statut, niveau:niveau, etablissement:etab, filiere:rnd()<.85?pick(fil[statut]):'',
      parentNom:a<18?'M./Mme '+pick(noms):'', parentTel:a<18?'05'+String(Math.floor(10000000+rnd()*89999999)):'',
      baptemeEau:rnd()<.55, baptemeEsprit:rnd()<.32, engagements:rnd()<.5?[pick(ENGAGEMENTS)]:[], talents:rnd()<.28?pick(['Guitare','Chant','Graphisme','Informatique','Théâtre','Batterie','Rédaction','Piano','Photographie']):'',
      annuaire:rnd()<.85, photo:'', dateInscription:isoDay(di), historique:[], creePar:'Démo' });
  }
  members.sort(function(a,b){ return a.dateInscription.localeCompare(b.dateInscription); });
  members.forEach(function(m,i){ m.id=CONFIG.prefixe+'-'+m.dateInscription.slice(2,4)+'-'+String(i+1).padStart(5,'0'); });
  var users=[
    {id:'u0',nom:'Jean Daniel BAMA',titre:'Administrateur(trice) de la plateforme',niveau:'regional',celluleId:'',email:'admin@geead-as.ci',telephone:'07 00 00 00 00',acces:'complet',actif:true,admin:true},
    {id:'u1',nom:'Josué AKA',titre:'Président(e) régional(e)',niveau:'regional',celluleId:'',email:'president@geead-as.ci',telephone:'07 07 11 22 33',acces:'complet',actif:true},
    {id:'u2',nom:'Esther BROU',titre:'Secrétaire général(e)',niveau:'regional',celluleId:'',email:'secretariat@geead-as.ci',telephone:'07 08 44 55 66',acces:'complet',actif:true},
    {id:'u3',nom:'Caleb YAO',titre:'Commissaire aux comptes',niveau:'regional',celluleId:'',email:'comptes@geead-as.ci',telephone:'05 06 77 88 99',acces:'lecture',actif:true},
    {id:'u4',nom:'Samuel KOFFI',titre:'Président(e) de cellule',niveau:'local',celluleId:'c1',email:'portbouet@geead-as.ci',telephone:'07 01 40 20 10',acces:'complet',actif:true},
    {id:'u5',nom:'Grâce N\'GUESSAN',titre:'Secrétaire de cellule',niveau:'local',celluleId:'c1',email:'sec.portbouet@geead-as.ci',telephone:'01 02 03 04 05',acces:'complet',actif:true},
    {id:'u6',nom:'David BAMBA',titre:'Chargé(e) du suivi',niveau:'local',celluleId:'c6',email:'koumassi@geead-as.ci',telephone:'07 06 45 25 15',acces:'complet',actif:true}
  ];
  var demandes=[
    {id:'dm1',nom:'GUÉI',prenoms:'Nathan',niveau:'regional',poste:'Trésorier(ère) régional(e)',celluleId:'',telephone:'07 45 12 33 90',email:'nathan.guei@exemple.ci',statut:'en_attente',date:new Date(now.getTime()-3600000*3).toISOString()},
    {id:'dm2',nom:'LOBA',prenoms:'Myriam',niveau:'local',poste:'Président(e) de cellule',celluleId:'c4',telephone:'05 55 21 09 87',email:'myriam.loba@exemple.ci',statut:'en_attente',date:new Date(now.getTime()-3600000*20).toISOString()},
    {id:'dm3',nom:'ABOA',prenoms:'Ezéchiel',niveau:'local',poste:'Secrétaire de cellule',celluleId:'c10',telephone:'01 40 77 65 12',email:'ezechiel.aboa@exemple.ci',statut:'en_attente',date:new Date(now.getTime()-3600000*30).toISOString()}
  ];

  var notes=[]; members.slice(-40).forEach(function(m,i){ if(i%3===0) notes.push({id:uid()+i,membreId:m.id,celluleId:m.celluleId,type:pick(TYPES_SUIVI),txt:pick(['Rencontré après le culte, encouragé pour les examens.','Appel téléphonique : va bien, reprend les réunions de cellule.','Besoin d\'un soutien en mathématiques, mis en lien avec un mentor.','Absent depuis 3 semaines, visite prévue samedi.','Admis au BAC, félicitations transmises de la part du bureau.']),date:isoDay(new Date(now.getTime()-86400000*Math.floor(rnd()*50))),par:pick(['Samuel KOFFI','Grâce N\'GUESSAN','David BAMBA'])}); });
  var annonces=[
    {id:'a1',titre:'Congrès régional GEEAD — inscriptions ouvertes',texte:'Le congrès régional se tiendra pendant les congés de Pâques. Chaque cellule doit transmettre la liste de ses participants avant la fin du mois.',date:isoDay(new Date(now.getTime()-86400000*2)),auteur:'Josué AKA',titre_auteur:'Président(e) régional(e)',cible:'all',important:true},
    {id:'a2',titre:'Mise à jour des fiches',texte:'Merci de compléter les fiches de vos membres : photo, établissement, série ou filière et contacts WhatsApp.',date:isoDay(new Date(now.getTime()-86400000*9)),auteur:'Esther BROU',titre_auteur:'Secrétaire général(e)',cible:'all',important:false}
  ];
  var inscriptions=[0,1,2,3].map(function(i){ var s=i%2?'M':'F'; return {id:'i'+i,nom:pick(noms),prenoms:s==='F'?pick(pf):pick(pm),sexe:s,naissance:(yr-15-i)+'-0'+(i+3)+'-1'+i,telephone:'0102030'+i+'40',whatsapp:'',statut:'Élève',niveau:['2nde','1ère','Terminale','3e'][i],etablissement:i<3?'Collège Moderne de Marcory':'Lycée Municipal de Port-Bouët',filiere:'Série A',celluleId:i<3?'c10':'c1',eglise:i<3?'AD Marcory Anoumabo':'AD Port-Bouët Adjahui',commune:'Marcory',baptemeEau:false,baptemeEsprit:false,engagements:[],annuaire:true,consentement:true,dateSoumission:isoDay(new Date(now.getTime()-86400000*i))}; });
  var logs=[{id:'l1',date:new Date(now.getTime()-3600000*5).toISOString(),auteur:'Esther BROU',action:'Annonce publiée',detail:'Mise à jour des fiches',celluleId:''},{id:'l2',date:new Date(now.getTime()-3600000*26).toISOString(),auteur:'Samuel KOFFI',action:'Membre ajouté',detail:members[members.length-1].id,celluleId:'c1'}];
  return {cells:cells,members:members,notes:notes,inscriptions:inscriptions,users:users,demandes:demandes,annonces:annonces,logs:logs,settings:{seuil:5,region:'Abidjan Sud'},seq:N,demo:true};
}

