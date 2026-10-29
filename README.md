# Sledování elektřiny
Nahraj všech 7 souborů (index.html, manifest.webmanifest, sw.js, apple-touch-icon.png, icon-192.png, icon-512.png, README.md; soubor shelly-pro3em.js nahrávat nemusíš, je to kopie skriptu pro Shelly) do kořene repozitáře na GitHubu. Starý `icon-512.PNG` a soubory `.txt` smaž.
Na iPhonu otevři stránku v Safari -> Sdílet -> Přidat na plochu.
Po aktualizaci aplikaci na iPhonu zavři (přejetím nahoru) a otevři znovu; případně ji jednou otevři v Safari, ať se nahraje nová verze (cache fve-v22).
Roční shrnutí: tlačítko „Otevřít report · PDF“ otevře náhled. „Uložit / sdílet PDF“ na iPhonu otevře sdílení (Uložit do Souborů), na počítači stáhne PDF; „Sdílet text“ / „Zkopírovat text“ pošle shrnutí jako text; „Tisk“ je jen mimo iPhone.

Automatický odečet ze Shelly Pro 3EM (jednou denně v 0:00):
1. V Záloha → Cloud synchronizace vlož do Firebase nová pravidla (blok „Bezpečná pravidla“ obsahuje i část „shelly“) a přihlas se.
2. V Záloha → „Automatický odečet ze Shelly Pro 3EM“ klepni na „Zkopírovat skript“ (adresa databáze a tvoje UID se doplní samy).
3. V rozhraní Shelly: Scripts → Add script → vlož, ulož, zapni „Run on startup“ a spusť. Hned se pošle zkušební odečet; dál každý den v 0:00.
4. V aplikaci „Načíst odečty ze Shelly“ → na kartě Elektřina se objeví denní odběr a přetok.
Časové pásmo v Shelly musí být Europe/Prague, jinak se odečet pošle v 0:00 jiného pásma.
