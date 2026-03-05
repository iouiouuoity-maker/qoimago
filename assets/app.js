// assets/app.js
const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

const store = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch(e){ return d } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};

function money(n){ return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₸"; }

function calcQuote({sqm, months, km, needDelivery, needReturn, packing, heavy, insured}){
  const P = window.QOIMA.pricing;

  const storage = sqm * P.storagePerSqm * months;
  const deliveryOne = P.deliveryBase + (km * P.deliveryPerKm);
  const delivery = (needDelivery ? deliveryOne : 0) + (needReturn ? deliveryOne : 0);

  const extras = (packing ? P.packingAvg : 0) + (heavy ? P.heavyItemFee : 0);
  const insurance = insured ? (storage * P.insuranceRate) : 0;

  const total = storage + delivery + extras + insurance;
  return {storage, delivery, extras, insurance, total};
}

function seedIfEmpty(){
  const bookings = store.get("qoimago_bookings", []);
  if(bookings.length===0){
    store.set("qoimago_bookings", []);
  }
}
seedIfEmpty();

function renderLocationsTable(el){
  const locs = window.QOIMA.locations;
  el.innerHTML = `
    <table>
      <thead><tr><th>Локация</th><th>Ауданы</th><th>Аренда</th><th>Аудан</th></tr></thead>
      <tbody>
        ${locs.map(l=>`
          <tr>
            <td><b>${l.name}</b></td>
            <td>${l.area} м²</td>
            <td>${money(l.rent)}</td>
            <td>${l.district}</td>
          </tr>`).join("")}
      </tbody>
    </table>
  `;
}

function renderBoxes(el){
  const b = window.QOIMA.boxTypes;
  el.innerHTML = `
    <table>
      <thead><tr><th>Тип</th><th>м²</th><th>Неге сыяды</th><th>Баға (ай)</th><th></th></tr></thead>
      <tbody>
        ${b.map(x=>`
          <tr>
            <td><b>${x.title}</b></td>
            <td>${x.sqm}</td>
            <td class="mini">${x.fits}</td>
            <td>${money(x.base)}</td>
            <td><a class="pill" href="book.html?box=${encodeURIComponent(x.id)}">Брондау</a></td>
          </tr>`).join("")}
      </tbody>
    </table>
  `;
}

function upsertBooking(b){
  const list = store.get("qoimago_bookings", []);
  list.push(b);
  store.set("qoimago_bookings", list);
}

function getMyBookings(phone){
  const list = store.get("qoimago_bookings", []);
  return list.filter(x => (x.phone||"").replace(/\D/g,"") === phone.replace(/\D/g,""));
}

function renderAdmin(el){
  const list = store.get("qoimago_bookings", []);
  if(list.length===0){
    el.innerHTML = `<div class="notice">Әзірге брондау жоқ.</div>`;
    return;
  }
  el.innerHTML = `
    <table>
      <thead><tr>
        <th>Күні</th><th>Клиент</th><th>Қызмет</th><th>Сома</th><th>Статус</th>
      </tr></thead>
      <tbody>
        ${list.slice().reverse().map(x=>`
          <tr>
            <td class="mini">${x.createdAt}</td>
            <td><b>${x.name}</b><div class="mini">${x.phone}</div></td>
            <td class="mini">
              ${x.boxLabel} • ${x.sqm}м² • ${x.months} ай
              <br>Жеткізу: ${x.needDelivery?"Иә":"Жоқ"} / Қайта: ${x.needReturn?"Иә":"Жоқ"} • ${x.km}км
            </td>
            <td><b>${money(x.total)}</b></td>
            <td class="${x.status==='Paid'?'ok':''}">${x.status}</td>
          </tr>`).join("")}
      </tbody>
    </table>
  `;
}

window.QOIMA_APP = {
  money, calcQuote, renderLocationsTable, renderBoxes, upsertBooking, getMyBookings, renderAdmin
};
