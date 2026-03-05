// assets/data.js
window.QOIMA = {
  brand: "Qoima Go",
  sloganKZ: "Qoima Go — бәрі бір жерде, бәрі бір сәтте.",
  sloganRU: "Qoima Go — всё в одном месте, всё за один миг.",

  // 6 нүкте / 5440 м² (сен айтқан)
  locations: [
    { name: "Дулатова 17а", area: 545,  district: "Сейфуллина–Дулатова" },
    { name: "Бекмаханова 88в", area: 1000, district: "Промзона/Север" },
    { name: "Спасская 78", area: 1000,  district: "Промзона/Запад" },
    { name: "мкр Кайрат 46/5", area: 855, district: "Кульджинский тракт" },
    { name: "Аль-Фараби 71/18а", area: 1250, district: "Бостандык/центр" },
    { name: "Қосымша нүкте (қала ішінде)",  rent: 3500000, district: "қала ішкі радиусы" }
  ],

  boxTypes: [
    { id:"XS", title:"XS", sqm:2,  fits:"2–3 чемодан, қораптар", base:30000 },
    { id:"S",  title:"S",  sqm:5,  fits:"1 бөлмелік заттар", base:70000 },
    { id:"M",  title:"M",  sqm:10, fits:"2 бөлме / шағын офис", base:120000 },
    { id:"L",  title:"L",  sqm:15, fits:"толық квартира + техника", base:170000 }
  ],

  pricing: {
    // сақтау бағасы (айлық) — демо
    storagePerSqm: 18000,     // ₸/м²/ай
    minStorageMonths: 1,
    // жеткізу (бір бағыт) — демо
    deliveryBase: 25000,      // ₸
    deliveryPerKm: 450,       // ₸/км
    // қосымша сервис
    packingAvg: 8000,         // ₸
    heavyItemFee: 6000,       // ₸
    insuranceRate: 0.004      // 0.4% (айлық сақтандыру демо)
  },

  // Админ құпиясөз (демо). Кейін ауыстырасың.
  adminPin: "2026"
};
