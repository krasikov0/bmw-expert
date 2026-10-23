/* ============================================================
   BMW Expert — общий слой данных приложения и кабинета владельца.
   Сейчас всё хранится в localStorage этого устройства.
   Чтобы заявки с телефонов клиентов попадали к владельцу,
   достаточно заменить load/save на запросы к серверу — остальной
   код работает через Store и не меняется.
   ============================================================ */
(function(){
const uid=()=>Math.random().toString(36).slice(2,9);
const svc=(name,desc,price,fixed)=>({id:uid(),name,desc:desc||'',price:price||0,fixed:!!fixed,hidden:false});
const cat=(name,ic,items)=>({id:uid(),name,ic,hidden:false,items:items.map(a=>svc(...a))});
const car=(name,models,brand)=>({id:uid(),name,brand:brand||'BMW',hidden:false,models});

const DEFAULTS={
  v:1,
  name:'БМВ Эксперт',
  city:'Казань',
  address:'ул. Адоратского, 82',
  addressNote:'Ж/м Брикетный · 840 м',
  phone:'+7 (843) 215-22-72',
  mapUrl:'https://yandex.ru/maps/org/bmv_ekspert/143196299952/',
  // 0 = воскресенье; null = выходной
  hours:{0:null,1:[10,19],2:[10,19],3:[10,19],4:[10,19],5:[10,19],6:[10,17]},
  posts:2,            // сколько машин можно принять на один час
  closedDates:[],     // ['2026-11-04', ...]
  promo:{on:true,title:'Диагностика за 2 500 ₽',text:'Углублённая компьютерная диагностика BMW и MINI — все блоки за 1 час.'},
  pin:'1234',
  cats:[
    cat('ТО','oil',[
      ['Замена масла в двигателе','Работа · Oilservice',900,1],
      ['Масло Liqui Moly Top Tec 4200 5W-30','НС-синтетика, цена за 1 л',1750,1],
      ['ТО: масло + фильтры','Масляный, воздушный, проверка узлов',2500],
      ['Расширенное ТО','+ свечи, салонный фильтр, жидкости',6000],
      ['Замена свечей зажигания','',2000],
      ['Замена тормозной жидкости','С прокачкой',1500],
      ['Замена антифриза','',2000],
      ['Замена масла в АКПП','Частичная или аппаратная',4000],
      ['Масло в раздатке и редукторах','xDrive',2500]]),
    cat('Диагностика','diag',[
      ['Компьютерная диагностика','Углублённая диагностика BMW, MINI · 1 ч',2500,1],
      ['Диагностика ходовой','На подъёмнике',1000],
      ['Проверка перед покупкой','Ошибки, кузов, ходовая, двигатель',3500],
      ['Диагностика автоэлектрики','',1500],
      ['Диагностика кондиционера','Давление, утечки',1000]]),
    cat('Двигатель','engine',[
      ['Замена цепи ГРМ','N20, N47, B47, N57, N63 и др.'],
      ['Ремонт ГБЦ',''],
      ['Прокладка клапанной крышки','Устранение течи масла',4000],
      ['Ремонт VANOS','',5000],
      ['Ремонт форсунок','',3000],
      ['Промывка инжектора','',2500],
      ['Ремонт топливной системы','',3000],
      ['Удаление катализатора','С программной настройкой']]),
    cat('КПП','gear',[
      ['Ремонт АКПП','ZF 6HP / 8HP'],
      ['Ремонт механической КПП',''],
      ['Адаптация АКПП','После замены масла или ремонта',2000],
      ['Ремонт моста / редуктора','']]),
    cat('Ходовая','spring',[
      ['Замена рычагов','Передняя / задняя подвеска',3000],
      ['Замена амортизаторов','',3000],
      ['Замена сайлентблоков','',2500],
      ['Замена ступичного подшипника','',2500],
      ['Ремонт пневмоподвески','X5, X6, X7, 7 серия',5000],
      ['Ремонт пневмосистемы','Компрессор, магистрали',4000]]),
    cat('Тормоза','brake',[
      ['Замена колодок','Одна ось',1500],
      ['Замена дисков и колодок','Одна ось',2500],
      ['Ремонт суппортов','',2500],
      ['Ремонт тормозной системы','']]),
    cat('Рулевое','steer',[
      ['Ремонт рулевой рейки',''],
      ['Замена тяг и наконечников','',2000]]),
    cat('Электрика','bolt',[
      ['Ремонт стартера','',3500],
      ['Ремонт генератора','',3500],
      ['Ремонт автоэлектрики',''],
      ['Ремонт фар','LED, ксенон, адаптив',3500],
      ['Установка сигнализации',''],
      ['Установка парктроников','']]),
    cat('Климат','snow',[
      ['Заправка кондиционера','',2500],
      ['Ремонт кондиционера',''],
      ['Ремонт Webasto','Автономный отопитель']]),
    cat('Кодирование','chip',[
      ['Программирование блоков',''],
      ['Изменение модификации',''],
      ['Кодирование скрытых функций','']]),
    cat('Прочее','spark',[
      ['Шумоизоляция',''],
      ['Запчасти под заказ','Оригинал и аналоги']])
  ],
  cars:[
    car('1 серия',['116i (F20)','118i (F20)','120d (F20)','M140i (F20)','118i (F40)','M135i (F40)','120i (E87)']),
    car('2 серия',['218i (F22)','220i (F22)','M240i (F22)','218i Gran Coupe (F44)','220d Active Tourer (F45)','M240i (G42)','220i (U06)']),
    car('3 серия',['316i (F30)','320i (F30)','320d (F30)','328i (F30)','335i (F30)','3 GT (F34)','320i (G20)','320d (G20)','330i (G20)','330e (G20)','M340i (G20)','320i (E90)','325i (E90)','330i (E90)']),
    car('4 серия',['420i (F32)','428i (F32)','420d Gran Coupe (F36)','430i (G22)','M440i (G22)','420i Gran Coupe (G26)']),
    car('5 серия',['520i (F10)','520d (F10)','528i (F10)','530d (F10)','535i (F10)','550i (F10)','5 GT (F07)','520d (G30)','530i (G30)','530d (G30)','540i (G30)','M550i (G30)','520i (G60)','525i (E60)','530i (E60)']),
    car('6 серия',['640i (F13)','640d Gran Coupe (F06)','650i (F12)','630i GT (G32)']),
    car('7 серия',['730d (F01)','740Li (F02)','750Li (F02)','730d (G11)','740Li (G12)','750Li (G12)','740d (G70)','760i (G70)']),
    car('8 серия',['840d (G15)','840i Gran Coupe (G16)','M850i (G15)']),
    car('X1',['X1 (E84)','X1 (F48)','X1 (U11)']),
    car('X2',['X2 (F39)','X2 (U10)']),
    car('X3',['X3 (E83)','X3 (F25)','X3 (G01)','X3 (G45)','X3 M (F97)']),
    car('X4',['X4 (F26)','X4 (G02)','X4 M (F98)']),
    car('X5',['X5 (E53)','X5 (E70)','X5 (F15)','X5 (G05)','X5 M (F85)','X5 M (F95)']),
    car('X6',['X6 (E71)','X6 (F16)','X6 (G06)','X6 M (F86)','X6 M (F96)']),
    car('X7',['X7 (G07)','Alpina XB7 (G07)']),
    car('XM',['XM (G09)']),
    car('Z4',['Z4 (E85)','Z4 (E89)','Z4 (G29)']),
    car('i электро',['i3 (I01)','i4 (G26)','i5 (G60)','i7 (G70)','iX (I20)','iX1 (U11)','iX3 (G08)','i8 (I12)']),
    car('M',['M2 (F87)','M2 (G87)','M3 (F80)','M3 (G80)','M4 (F82)','M4 (G82)','M5 (F10)','M5 (F90)','M5 (G90)','M8 (F92)']),
    car('MINI',['Cooper (R56)','Cooper (F56)','Cooper S (F56)','JCW (F56)','Clubman (F54)','Countryman (F60)','Countryman (U25)'],'MINI'),
    car('Rolls-Royce',['Ghost','Wraith','Dawn','Cullinan','Phantom','Spectre'],'Rolls-Royce')
  ]
};

// Статусы заявки: что видит клиент в «Мой ремонт» и владелец в кабинете
const STATUSES={
  new:      {t:'Новая',        client:'Ждём подтверждения',        step:1, pct:15},
  confirmed:{t:'Подтверждена', client:'Запись подтверждена',       step:2, pct:30},
  work:     {t:'В работе',     client:'Мастер работает с автомобилем', step:3, pct:65},
  ready:    {t:'Готова',       client:'Автомобиль готов к выдаче', step:4, pct:100},
  done:     {t:'Выдана',       client:'Ремонт завершён',           step:5, pct:100},
  cancelled:{t:'Отменена',     client:'Запись отменена',           step:0, pct:0}
};

const MEM={};
function load(k,d){try{const v=localStorage.getItem(k);if(v!=null)return JSON.parse(v)}catch(e){}return k in MEM?MEM[k]:d}
function save(k,v){MEM[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
const clone=o=>JSON.parse(JSON.stringify(o));
const pad=n=>String(n).padStart(2,'0');

const K={cfg:'bmwx_cfg',orders:'bmwx_orders',my:'bmwx_my',car:'bmwx_car'};

// Проверка и починка настроек: всё, чего не хватает или что сломано, берётся из DEFAULTS.
// Защищает приложение от битой резервной копии и от ошибок ввода.
const okId=id=>typeof id==='string'&&/^[\w-]{1,40}$/.test(id)?id:uid();
const str=(v,d)=>v==null?d:String(v);
function normCfg(c){
  const d=clone(DEFAULTS);
  if(!c||typeof c!=='object')return d;
  const r=Object.assign({},d,c,{v:DEFAULTS.v});
  ['name','city','address','addressNote','phone','pin'].forEach(k=>r[k]=str(r[k],d[k]));
  if(!/^\d{4}$/.test(r.pin))r.pin=d.pin;
  r.mapUrl=/^https?:\/\//i.test(str(r.mapUrl,''))?String(r.mapUrl):d.mapUrl;
  const h=r.hours&&typeof r.hours==='object'?r.hours:{};r.hours={};
  for(let i=0;i<7;i++){const x=h[i];r.hours[i]=x===null?null:Array.isArray(x)&&x.length===2&&+x[0]>=0&&+x[1]<=24&&+x[0]<+x[1]?[+x[0],+x[1]]:d.hours[i]}
  r.posts=Math.min(10,Math.max(1,Math.round(+r.posts)||d.posts));
  r.closedDates=Array.isArray(r.closedDates)?r.closedDates.filter(x=>/^\d{4}-\d\d-\d\d$/.test(x)):[];
  r.promo=Object.assign({},d.promo,r.promo&&typeof r.promo==='object'?r.promo:{});r.promo.on=!!r.promo.on;r.promo.title=str(r.promo.title,'');r.promo.text=str(r.promo.text,'');
  r.cats=(Array.isArray(r.cats)?r.cats:d.cats).filter(x=>x&&typeof x==='object').map(x=>({id:okId(x.id),name:str(x.name,'Без названия'),ic:/^\w+$/.test(x.ic)?x.ic:'wrench',hidden:!!x.hidden,
    items:(Array.isArray(x.items)?x.items:[]).filter(s=>s&&typeof s==='object').map(s=>({id:okId(s.id),name:str(s.name,'Услуга'),desc:str(s.desc,''),price:Math.max(0,Math.round(+s.price)||0),fixed:!!s.fixed,hidden:!!s.hidden}))}));
  r.cars=(Array.isArray(r.cars)?r.cars:d.cars).filter(x=>x&&typeof x==='object').map(x=>({id:okId(x.id),name:str(x.name,'Серия'),brand:['BMW','MINI','Rolls-Royce'].includes(x.brand)?x.brand:'BMW',hidden:!!x.hidden,
    models:(Array.isArray(x.models)?x.models:[]).map(String)}));
  return r;
}
// Заявки: отбрасываем битые, поля приводим к нужным типам, статус — только из списка
function cleanOrders(a){
  return (Array.isArray(a)?a:[]).filter(o=>o&&typeof o==='object'&&/^[\w-]{1,40}$/.test(o.id)&&Array.isArray(o.services)&&/^\d{4}-\d\d-\d\d$/.test(o.date)&&/^\d\d:00$/.test(o.time))
    .map(o=>Object.assign({},o,{status:STATUSES[o.status]?o.status:'new',num:Math.round(+o.num)||0,name:str(o.name,''),phone:str(o.phone,''),car:str(o.car,''),
      year:str(o.year,''),km:str(o.km,''),note:str(o.note,''),ownerNote:str(o.ownerNote,''),adminNote:str(o.adminNote,''),final:Math.max(0,+o.final||0),
      created:str(o.created,new Date().toISOString()),services:o.services.filter(s=>s&&typeof s==='object').map(s=>({n:str(s.n,''),p:Math.max(0,+s.p||0),fix:!!s.fix,own:!!s.own}))}));
}

const Store={
  STATUSES,uid,pad,normCfg,cleanOrders,
  cfg(){
    const raw=load(K.cfg,null),c=normCfg(raw);
    if(!raw)save(K.cfg,c);
    return c;
  },
  saveCfg(c){save(K.cfg,normCfg(c));Store.emit()},
  resetCfg(){const c=clone(DEFAULTS);save(K.cfg,c);Store.emit();return c},
  orders(){return cleanOrders(load(K.orders,[]))},
  saveOrders(a){save(K.orders,cleanOrders(a));Store.emit()},
  addOrder(o){const a=Store.orders();a.push(o);Store.saveOrders(a);const my=load(K.my,[]);my.push(o.id);save(K.my,my)},
  updateOrder(id,patch){const a=Store.orders(),o=a.find(x=>x.id===id);if(o){Object.assign(o,patch,{updated:new Date().toISOString()});Store.saveOrders(a)}return o},
  removeOrder(id){Store.saveOrders(Store.orders().filter(x=>x.id!==id))},
  myOrders(){const my=load(K.my,[]);return Store.orders().filter(o=>my.includes(o.id))},
  myCar(){return load(K.car,null)},
  saveMyCar(c){save(K.car,c)},
  // занятость: сколько активных заявок на день+час
  busy(date,time){return Store.orders().filter(o=>o.date===date&&o.time===time&&o.status!=='cancelled').length},
  // время по Казани (МСК, UTC+3) независимо от часового пояса телефона
  now(){const d=new Date();return new Date(d.getTime()+(d.getTimezoneOffset()+180)*60000)},
  iso(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`},
  parse(iso){const[y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d)},
  hoursFor(c,d){return c.closedDates.includes(Store.iso(d))?null:c.hours[d.getDay()]},
  total(o){return o.services.reduce((a,s)=>a+(+s.p||0),0)},
  // ссылка tel: — понимает «8 (843)…», «+7…» и 10 цифр без кода страны
  tel(p){let d=String(p).replace(/\D/g,'');if(d.length===11&&d[0]==='8')d='7'+d.slice(1);if(d.length===10)d='7'+d;return 'tel:+'+d},
  // подписка на изменения: из этой же вкладки и из соседних (кабинет ↔ приложение)
  _subs:[],
  on(fn){Store._subs.push(fn)},
  emit(){Store._subs.forEach(f=>{try{f()}catch(e){console.error(e)}})}
};
window.addEventListener('storage',e=>{if(e.key&&e.key.startsWith('bmwx_'))Store.emit()});
window.Store=Store;
})();
