import React, { useRef } from "react";

// שדה תאריך שמוצג תמיד בפורמט ישראלי (יום/חודש/שנה), בלי קשר לשפת הדפדפן.
// הערך שנשמר נשאר YYYY-MM-DD, כמו בשדה תאריך רגיל, כך שאין שינוי בנתונים.
export const toILDate = (v) => {
  if (!v) return "";
  const [y, m, d] = String(v).slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : String(v);
};

export default function DateInputIL({ value, onChange, className = "", disabled, style, placeholder = "יום/חודש/שנה", ...rest }) {
  const ref = useRef(null);
  const open = () => {
    const el = ref.current;
    if (!el || disabled) return;
    try { el.showPicker(); } catch { el.focus(); }
  };
  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      style={{ cursor: disabled ? "default" : "pointer", ...style }}
      onClick={open}
    >
      <span dir="ltr" className={value ? "" : "text-gray-400"} style={{ unicodeBidi: "isolate" }}>
        {value ? toILDate(value) : placeholder}
      </span>
      <input
        ref={ref}
        type="date"
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        {...rest}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "inherit" }}
      />
    </span>
  );
}
