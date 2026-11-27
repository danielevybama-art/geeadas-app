/* GEEAD ABIDJAN SUD — Données : stockage local (démo) ou Firestore */

/* Démonstration : version sans base (FIREBASE_CONFIG vide) ou visite ouverte depuis l'application (#demo) */
var DEMO_ONLY = !FIREBASE_CONFIG;
var DEMO = DEMO_ONLY || (function(){ try{ if(location.hash==='#demo') sessionStorage.setItem('geead-demo','1'); return sessionStorage.getItem('geead-demo')==='1'; }catch(e){ return location.hash==='#demo'; } })();
var KEY='geeadas-v3';
var DB={cells:[],members:[],notes:[],inscriptions:[],users:[],annonces:[],logs:[],demandes:[],settings:{seuil:5,region:'Abidjan Sud'},seq:0};
var COLL={cells:'cellules',members:'membres',notes:'suivis',inscriptions:'inscriptions',users:'utilisateurs',annonces:'annonces',logs:'journal',demandes:'demandes'};
var Store={
  mode: DEMO ? 'demo' : 'firebase', fb:null,
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
    DB.demandes=(reg||u.admin)?await all('demandes'):[];
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
  reset:function(){ Object.keys(DB).forEach(function(k){ delete DB[k]; }); Object.assign(DB, demoData()); this.persist(); }
};
