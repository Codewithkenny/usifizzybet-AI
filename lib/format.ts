import moment from "moment";

export const todayISO = (): string => moment().format("YYYY-MM-DD");

export const fmtKickoff = (iso: string | Date | null | undefined): string =>
  iso ? moment(iso).format("ddd D MMM · HH:mm") : "Kick-off TBC";

export const fmtDate = (iso: string | Date | null | undefined): string =>
  iso ? moment(iso).format("D MMM YYYY") : "—";

export const fmtOdds = (value: string | number | null | undefined): string => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n.toFixed(2) : "—";
};

export const fmtMoney = (
  value: string | number | null | undefined,
  currency: string = "NGN",
): string => {
  const n = Number(value);
  const validAmount = Number.isFinite(n) ? n : 0;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(validAmount) ? 0 : 2,
  }).format(validAmount);
};

export const winRate = (won: number = 0, lost: number = 0): string => {
  const graded = won + lost;
  if (!graded) return "—";
  return `${((won / graded) * 100).toFixed(1)}%`;
};

export const copyText = async (
  text: string | null | undefined,
): Promise<boolean> => {
  if (!text || typeof navigator === "undefined" || !navigator.clipboard)
    return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
