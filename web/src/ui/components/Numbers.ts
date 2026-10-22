/** Keep mixed-sign numbers left-to-right inside RTL text. */
export const ltr = (text: string) => `\u2066${text}\u2069`;
export const signed = (value: number, plusZero = false) => ltr(value > 0 || (plusZero && value === 0) ? `+${value}` : String(value));
export const plus = (formatted: string) => ltr(`+${formatted}`);
