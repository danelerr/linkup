import assert from "node:assert/strict";
import test from "node:test";
import {
  closingLabel,
  daysBetween,
  formatDayMonth,
  relativePast,
} from "../lib/dates";

const today = "2026-09-25";

test("closing dates read as urgency, not as raw dates", () => {
  assert.equal(closingLabel(undefined, today), null);
  assert.deepEqual(closingLabel("2026-09-25", today), {
    text: "Cierra hoy",
    urgent: true,
    closed: false,
  });
  assert.equal(closingLabel("2026-09-26", today)?.text, "Cierra mañana");
  assert.deepEqual(closingLabel("2026-09-28", today), {
    text: "Cierra en 3 días",
    urgent: true,
    closed: false,
  });
  assert.equal(closingLabel("2026-10-01", today)?.urgent, false);
  assert.equal(closingLabel("2026-10-18", today)?.text, "Cierra el 18 oct");
  assert.equal(closingLabel("2026-09-18", today)?.closed, true);
});

test("relative past dates switch to an absolute date after a month", () => {
  assert.equal(relativePast("2026-09-25T10:00:00.000Z", today), "hoy");
  assert.equal(relativePast("2026-09-24", today), "ayer");
  assert.equal(relativePast("2026-09-20", today), "hace 5 días");
  assert.equal(relativePast("2026-09-11", today), "hace 2 semanas");
  assert.match(relativePast("2026-07-01", today), /^el 1 jul 2026$/);
});

test("calendar math ignores time of day and shows the year only when it changes", () => {
  assert.equal(daysBetween("2026-09-25T23:59:00Z", "2026-09-26T00:01:00Z"), 1);
  assert.equal(formatDayMonth("2026-12-31", today), "31 dic");
  assert.equal(formatDayMonth("2027-01-05", today), "5 ene 2027");
});
