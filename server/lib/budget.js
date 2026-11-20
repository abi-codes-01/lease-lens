const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const spendByIstDate = new Map();

export function todayIstDate() {
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export function getTodaySpendInr() {
  return spendByIstDate.get(todayIstDate()) ?? 0;
}

export function isDailyCapReached() {
  const capInr = Number(process.env.DAILY_CAP_INR);
  if (Number.isNaN(capInr)) {
    return false;
  }
  return getTodaySpendInr() >= capInr;
}

export function recordSpendInr(amountInr) {
  const today = todayIstDate();
  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    return spendByIstDate.get(today) ?? 0;
  }

  for (const existingDate of spendByIstDate.keys()) {
    if (existingDate !== today) {
      spendByIstDate.delete(existingDate);
    }
  }

  const nextTotal = Number(((spendByIstDate.get(today) ?? 0) + amountInr).toFixed(4));
  spendByIstDate.set(today, nextTotal);
  return nextTotal;
}
