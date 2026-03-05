// assets/chatbot.js
(function(){
  const $ = (s,p=document)=>p.querySelector(s);

  const PAY = {
    kaspiQrImg: "assets/kaspi-qr.png", // суретті кейін саласың
    kaspiPayLink: "https://kaspi.kz/pay/XXXXXX", // болса қой
    cardText: "KZ00 XXXX XXXX XXXX XXXX • Kaspi Gold • Qoima Go (ИИН/БИН ...)",
    invoiceText: "Invoice үшін: b2b@qoimago.kz / +7 XXX XXX XX XX"
  };

  const state = {
    step: 0,
    data: { sqm: 5, months: 2, km: 8, delivery: true, ret: true, name:"", phone:"", address:"" },
  };

  function money(n){ return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₸"; }

  function quote(){
    // QOIMA_APP.calcQuote already exists from assets/app.js
    const d = state.data;
    return window.QOIMA_APP.calcQuote({
      sqm:Number(d.sqm), months:Number(d.months), km:Number(d.km),
      needDelivery: !!d.delivery,
      needReturn: !!d.ret,
      packing:false, heavy:false, insured:true
    });
  }

  function uid(){
    return "QG-" + Math.random().toString(16).slice(2,6).toUpperCase() + "-" + Date.now().toString().slice(-4);
  }

  function saveBooking(status){
    const q = quote();
    const b = {
      id: uid(),
      createdAt: new Date().toLocaleString("ru-RU"),
      name: state.data.name || "Клиент",
      phone: state.data.phone || "",
      address: state.data.address || "",
      sqm: Number(state.data.sqm),
      months: Number(state.data.months),
      km: Number(state.data.km),
      needDelivery: !!state.data.delivery,
      needReturn: !!state.data.ret,
      locName: "Qoima Go (қала ішіндегі нүкте)", // қаласаң таңдауды қосамыз
      total: q.total,
      status
    };
    window.QOIMA_APP.upsertBooking(b);
    return b;
  }

  // UI
  const btn = document.createElement("button");
  btn.innerHTML = "💬 Брондау";
  btn.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:9999;padding:12px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.15);background:#4ea1ff;color:#061022;font-weight:800;cursor:pointer;";
  document.body.appendChild(btn);

  const box = document.createElement("div");
  box.style.cssText = "position:fixed;right:16px;bottom:72px;width:340px;max-width:calc(100vw - 32px);z-index:9999;background:rgba(18,26,44,.97);border:1px solid rgba(255,255,255,.12);border-radius:16px;display:none;overflow:hidden;";
  box.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.10)">
      <b>Qoima Go чат-бот</b>
      <button id="qgClose" style="background:transparent;border:0;color:#e9eefc;cursor:pointer;font-size:16px">✕</button>
    </div>
    <div id="qgLog" style="padding:10px 12px;max-height:360px;overflow:auto;font-size:13px"></div>
    <div id="qgControls" style="padding:10px 12px;border-top:1px solid rgba(255,255,255,.10)"></div>
  `;
  document.body.appendChild(box);

  function bot(msg){ add("🤖", msg); }
  function user(msg){ add("👤", msg); }
  function add(who, msg){
    const log = $("#qgLog", box);
    const div = document.createElement("div");
    div.style.margin = "8px 0";
    div.innerHTML = `<div style="color:rgba(233,238,252,.9)"><b>${who}</b> ${msg}</div>`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function controls(html){
    $("#qgControls", box).innerHTML = html;
  }

  function start(){
    $("#qgLog", box).innerHTML = "";
    state.step = 0;
    state.data = { sqm: 5, months: 2, km: 8, delivery: true, ret: true, name:"", phone:"", address:"" };
    bot("Сәлем! 👋 Бронь жасап беремін. Қай қызмет керек?");
    controls(`
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="qgBtn" data-a="full">📦 Тасымалдау + сақтау + жеткізу</button>
        <button class="qgBtn" data-a="storage">🧊 Тек сақтау</button>
      </div>
      <style>
        .qgBtn{padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:#e9eefc;cursor:pointer;font-weight:700}
        .qgBtn:hover{border-color:rgba(78,161,255,.8)}
        .qgIn{width:100%;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);color:#e9eefc}
      </style>
    `);
    $(".qgBtn[data-a='full']", box).onclick = ()=>{ user("Толық сервис"); state.step=1; askSqm(); };
    $(".qgBtn[data-a='storage']", box).onclick = ()=>{ user("Тек сақтау"); state.data.delivery=false; state.data.ret=false; state.step=1; askSqm(); };
  }

  function askSqm(){
    bot("Қанша м² керек? (мысалы: 2 / 5 / 10 / 15)");
    controls(`
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="qgBtn" data-s="2">2 м²</button>
        <button class="qgBtn" data-s="5">5 м²</button>
        <button class="qgBtn" data-s="10">10 м²</button>
        <button class="qgBtn" data-s="15">15 м²</button>
      </div>
      <div style="margin-top:8px">
        <input id="qgSqm" class="qgIn" type="number" min="1" placeholder="Өзім енгізем (м²)">
      </div>
      <div style="margin-top:8px;display:flex;gap:8px">
        <button class="qgBtn" id="qgNextSqm">Жалғастыру</button>
      </div>
    `);
    $$(".qgBtn[data-s]", box).forEach(b=>{
      b.onclick=()=>{ state.data.sqm=Number(b.dataset.s); user(`${b.dataset.s} м²`); askMonths(); };
    });
    $("#qgNextSqm", box).onclick=()=>{
      const v = Number($("#qgSqm", box).value);
      if(!v) return bot("м² енгізіңіз 🙂");
      state.data.sqm=v; user(`${v} м²`); askMonths();
    };
  }

  function askMonths(){
    bot("Қанша ай сақтаймыз?");
    controls(`
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="qgBtn" data-m="1">1 ай</button>
        <button class="qgBtn" data-m="2">2 ай</button>
        <button class="qgBtn" data-m="3">3 ай</button>
        <button class="qgBtn" data-m="6">6 ай</button>
        <button class="qgBtn" data-m="12">12 ай</button>
      </div>
    `);
    $$(".qgBtn[data-m]", box).forEach(b=>{
      b.onclick=()=>{ state.data.months=Number(b.dataset.m); user(`${b.dataset.m} ай`); askAddress(); };
    });
  }

  function askAddress(){
    bot("Контейнерді қай адреске апарамыз? (район/көше жеткілікті)");
    controls(`
      <input id="qgAddr" class="qgIn" placeholder="Алматы, ...">
      <div style="margin-top:8px;display:flex;gap:8px">
        <button class="qgBtn" id="qgAddrNext">Жалғастыру</button>
      </div>
    `);
    $("#qgAddrNext", box).onclick=()=>{
      const v = $("#qgAddr", box).value.trim();
      if(!v) return bot("Адрес жазыңыз 🙂");
      state.data.address=v; user(v); askPhone();
    };
  }

  function askPhone(){
    bot("Телефон нөміріңіз? (бронь үшін)");
    controls(`
      <input id="qgPhone" class="qgIn" placeholder="+7...">
      <div style="margin-top:8px;display:flex;gap:8px">
        <button class="qgBtn" id="qgPhoneNext">Бағаны шығару</button>
      </div>
    `);
    $("#qgPhoneNext", box).onclick=()=>{
      const v = $("#qgPhone", box).value.trim();
      if(!v) return bot("Телефон керек 🙂");
      state.data.phone=v; user(v);
      showQuote();
    };
  }

  function showQuote(){
    const q = quote();
    bot(`Есеп дайын ✅<br>
      • Сақтау: <b>${money(q.storage)}</b><br>
      • Жеткізу: <b>${money(q.delivery)}</b><br>
      • Қосымша: <b>${money(q.extras)}</b><br>
      • Барлығы: <b style="color:#2bd576">${money(q.total)}</b><br><br>
      Енді төлем түрін таңдаңыз:`);
    controls(`
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="qgBtn" id="payKaspiQR">Kaspi QR</button>
        <button class="qgBtn" id="payKaspiLink">Kaspi Pay link</button>
        <button class="qgBtn" id="payCard">Картаға аудару</button>
        <button class="qgBtn" id="payCash">Қолма-қол/терминал</button>
        <button class="qgBtn" id="payInvoice">Invoice (B2B)</button>
      </div>
    `);

    $("#payKaspiQR", box).onclick=()=>{
      user("Kaspi QR");
      bot(`Kaspi QR арқылы төлеңіз 👇<br><img src="${PAY.kaspiQrImg}" style="width:180px;border-radius:12px;border:1px solid rgba(255,255,255,.15)"><br>
      Төлеген соң “Төледім” басыңыз.`);
      finalize("Pending verification");
    };

    $("#payKaspiLink", box).onclick=()=>{
      user("Kaspi Pay link");
      bot(`Мына сілтеме арқылы төлем жасай аласыз: <br><a href="${PAY.kaspiPayLink}" target="_blank" style="color:#7cf0ff">${PAY.kaspiPayLink}</a><br>
      Төлеген соң “Төледім” басыңыз.`);
      finalize("Pending verification");
    };

    $("#payCard", box).onclick=()=>{
      user("Картаға аудару");
      bot(`Реквизит:<br><b>${PAY.cardText}</b><br>Төлем жасаған соң “Төледім” басыңыз.`);
      finalize("Pending verification");
    };

    $("#payCash", box).onclick=()=>{
      user("Қолма-қол/терминал");
      bot("Жақсы. Қоймада немесе курьер келгенде төлеуге болады. “Бронь жасау” басыңыз.");
      finalize("Booked (pay on delivery)");
    };

    $("#payInvoice", box).onclick=()=>{
      user("Invoice (B2B)");
      bot(`Invoice сұрату үшін: <b>${PAY.invoiceText}</b><br>“Бронь жасау” басыңыз.`);
      finalize("Invoice requested");
    };
  }

  function finalize(status){
    controls(`
      <div class="notice" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);padding:10px 12px;border-radius:12px">
        <div style="font-size:12px;color:rgba(233,238,252,.75)">Броньды сақтаймыз, кейін кабинеттен көресіз.</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="qgBtn" id="qgConfirm">Бронь жасау</button>
          <a class="qgBtn" href="cabinet.html" style="display:inline-block">Кабинет</a>
        </div>
      </div>
    `);
    $("#qgConfirm", box).onclick=()=>{
      const b = saveBooking(status);
      bot(`Дайын ✅ Бронь № <b>${b.id}</b><br>Статус: <b>${b.status}</b><br>Кабинетте көре аласыз.`);
      controls(`<a class="qgBtn" href="cabinet.html" style="display:inline-block">Кабинетке өту</a>`);
    };
  }

  btn.onclick = ()=>{
    box.style.display = (box.style.display==="none") ? "block" : "none";
    if(box.style.display==="block") start();
  };
  $("#qgClose", box).onclick = ()=> box.style.display="none";
})();
