// Sledovani elektriny - denni odecet ze Shelly Pro 3EM do Firebase
// Kazdy den v 0:00 (mistni cas zarizeni) precte citace odebrane a dodane energie
// a zapise je do Firebase Realtime Database. Po spusteni skriptu posle jeden
// zkusebni odecet hned (poznate tak, ze vse funguje).
//
// Napsano jen v jednoduche podmnozine JavaScriptu (pouze var, klasicke funkce,
// bez novejsich konstrukci), aby bezelo v Shelly skriptech. Vypisy najdete v konzoli skriptu.

var DB_URL = "DOPLNIT_URL";   // adresa Realtime Database bez lomitka na konci
var UID = "DOPLNIT_UID";      // vase Firebase UID (aplikace ho doplni sama)
var VALIDATE_TLS = true;      // kdyz konzole hlasi chybu certifikatu, zkuste false
var EM_ID = 0;                // cislo komponenty EM (u Pro 3EM 0)

var CHECK_MS = 30000;         // jak casto se kontroluje, zda je 0:00
var RETRY_MS = 300000;        // opakovani po chybe: 5 minut
var MAX_TRIES = 36;           // ... nejvyse 36x (3 hodiny)

var busy = false;
var tries = 0;
var lastTrig = 0;

function fail(why) {
  print("Odecet: chyba " + tries + "/" + MAX_TRIES + ": " + why);
  if (tries >= MAX_TRIES) {
    print("Odecet: vzdavam to, dalsi pokus bude pri pristim odectu.");
    busy = false;
    return;
  }
  Timer.set(RETRY_MS, false, attempt);
}

function attempt() {
  tries = tries + 1;
  Shelly.call("EMData.GetStatus", { id: EM_ID }, function (r, e, m) {
    var s = Shelly.getComponentStatus("sys");
    if (!r || typeof r.total_act !== "number" || typeof r.total_act_ret !== "number") {
      fail("nelze precist citace EMData (" + e + " " + m + "). Zkontrolujte, ze je v Pro 3EM nastaven typ klesti.");
      return;
    }
    if (!s || !s.unixtime) {
      fail("cas zarizeni neni synchronizovany");
      return;
    }
    var ts = s.unixtime;
    var imp = Math.round(r.total_act * 10) / 10;
    var exp = Math.round(r.total_act_ret * 10) / 10;
    var req = {
      method: "PUT",
      url: DB_URL + "/shelly/" + UID + "/" + ts + ".json",
      body: JSON.stringify({ imp: imp, exp: exp }),
      headers: { "Content-Type": "application/json" },
      timeout: 20
    };
    if (!VALIDATE_TLS) {
      req.ssl_ca = "*";
    }
    Shelly.call("HTTP.Request", req, function (res, err, msg) {
      if (res && res.code >= 200 && res.code < 300) {
        print("Odecet: odeslano " + ts + " odebrano " + imp + " Wh, dodano " + exp + " Wh");
        busy = false;
        return;
      }
      if (res && res.code === 401) {
        fail("Firebase odmitl zapis (HTTP 401) - zkontrolujte pravidla databaze a UID");
        return;
      }
      if (res) {
        fail("HTTP " + res.code);
        return;
      }
      fail("pozadavek se nezdaril (" + err + " " + msg + ")");
    });
  });
}

function tick() {
  if (busy) {
    return;
  }
  var s = Shelly.getComponentStatus("sys");
  if (!s || !s.unixtime || !s.time) {
    return;
  }
  var now = s.unixtime;
  if (lastTrig === 0 || (s.time === "00:00" && now - lastTrig >= 3600)) {
    lastTrig = now;
    busy = true;
    tries = 0;
    attempt();
  }
}

if (DB_URL.indexOf("https://") !== 0 || UID.length < 10) {
  print("Odecet: doplnte DB_URL a UID na zacatku skriptu.");
} else {
  Timer.set(CHECK_MS, true, tick);
  tick();
  print("Odecet: skript bezi, odecet se posila kazdy den v 0:00.");
}
