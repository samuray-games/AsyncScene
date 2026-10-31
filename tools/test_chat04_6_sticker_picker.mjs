import assert from "node:assert/strict";
import { STICKERS, stickerById, stickerPayload, createStickerPicker } from "./chat04_6_sticker_picker.mjs";

let checks = 0;
const check = (fn) => { fn(); checks++; };
const expected = [
  ["046-0001", "Блик", "О, свои!"],
  ["046-0002", "Блик", "АХАХА!"],
  ["046-0003", "Блик", "Фигасе!"],
  ["046-0004", "Искра", "Ага, щас!"],
  ["046-0005", "Искра", "ДААА!"],
  ["046-0006", "Искра", "Ну привет..."],
  ["046-0007", "Штиль", "Да и ладно."],
  ["046-0008", "Штиль", "Мой дзен."],
  ["046-0009", "Штиль", "Кайф."],
  ["046-0010", "Эхо", "Для тебя."],
  ["046-0011", "Эхо", "Иди обниму."],
  ["046-0012", "Эхо", "Я в домике."]
];
check(() => assert.equal(STICKERS.length, 12));
check(() => assert.deepEqual(STICKERS.map(({ id, character, title }) => [id, character, title]), expected));
check(() => assert.equal(new Set(STICKERS.map(s => s.id)).size, 12));
check(() => assert.equal(new Set(STICKERS.map(s => s.filename)).size, 12));
check(() => assert.equal(Object.isFrozen(STICKERS), true));
for (const sticker of STICKERS) {
  check(() => assert.equal(Object.isFrozen(sticker), true));
  check(() => assert.match(sticker.id, /^046-00(?:0[1-9]|1[0-2])$/));
  check(() => assert.match(sticker.filename, /^[А-ЯЁа-яё0-9_]+\.png$/u));
  check(() => assert.ok(sticker.alt.length >= 30));
  check(() => assert.ok(!/(сангвиник|холерик|флегматик|меланхолик)/iu.test(sticker.alt)));
  check(() => assert.equal(stickerById(sticker.id), sticker));
  check(() => assert.deepEqual(stickerPayload(sticker.id), { stickerId: sticker.id }));
}
check(() => assert.equal(stickerById("046-9999"), null));
check(() => assert.throws(() => stickerPayload("046-9999"), RangeError));
check(() => assert.throws(() => createStickerPicker(), TypeError));
console.log("CHAT04_6_STICKER_CATALOG_PASS " + checks + " проверок");
