//
//  util.js
//  AsyncScene
//
//  Created by Ray on 2025/12/15.
//


// util.js
window.Game = window.Game || {};

(() => {
  const Game = window.Game;

  const Util = {};

  Util.nowHHMM = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  Util.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Pick one item by weights: [{ item, weight }]
  Util.pickWeighted = (list) => {
    if (!Array.isArray(list) || !list.length) return null;
    let sum = 0;
    for (const x of list) sum += Math.max(0, x.weight|0);
    if (sum <= 0) return list[0].item ?? list[0];
    let r = Math.random() * sum;
    for (const x of list) {
      r -= Math.max(0, x.weight|0);
      if (r <= 0) return x.item ?? x;
    }
    return list[list.length - 1].item ?? list[list.length - 1];
  };

  Util.clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  Util.randInt = (min, max) => {
    const a = Math.ceil(min);
    const b = Math.floor(max);
    return Math.floor(Math.random() * (b - a + 1)) + a;
  };

  Util.safeId = () => `id_${Date.now()}_${Math.floor(Math.random()*999999)}`;

  Util.normalizeChatText = (s) => {
    // Только для чата: без заглавных и точек, но системные строки не трогаем в UI.
    let t = String(s || "").trim();

    // убрать финальную пунктуацию
    t = t.replace(/[.!?]+$/g, "");

    // lower-case
    t = t.toLowerCase();

    // мини-чистка двойных пробелов
    t = t.replace(/\s+/g, " ").trim();

    return t;
  };

  // Chat mention helper (lowercase, safe)
  Util.mention = (name) => {
    if (!name) return "";
    return String(name).toLowerCase();
  };

  Util.escapeHtml = (s) => {
    return String(s || "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;");
  };

  // lottery bias: 0 чаще всего, но диапазон честный 0..max (например N×10)
  // max должен приходить из Data.LOTTERY.multiplier и ставки, без магии 100.
  Util.lottery = (max) => {
    const m = Math.max(0, (max == null ? 0 : (max | 0)));

    // Тривиальные случаи
    if (m <= 0) return 0;

    // 0 выпадает чаще всего
    const r = Math.random();
    if (r < 0.72) return 0;

    // Остальные значения равновероятны на 1..m
    return Util.randInt(1, m);
  };

  Game.Util = Util;

  if (!Game.Time) {
    Game.Time = {
      _nowFn: null,
      now() {
        try {
          if (typeof this._nowFn === "function") return this._nowFn();
        } catch (_) {}
        return Date.now();
      },
      setNow(fn) {
        this._nowFn = (typeof fn === "function") ? fn : null;
      }
    };
  }
})();
