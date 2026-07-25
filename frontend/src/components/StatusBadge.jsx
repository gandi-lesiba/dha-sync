const KIND_STYLES = {
  success: "bg-success-bg text-success",
  overdue: "bg-overdue-bg text-overdue",
  pending: "bg-pending-bg text-pending",
  neutral: "bg-gray-200 text-gray-700",
};

/** Small pill used everywhere a case/order/claim status needs colour-coding
 * (see DESIGN.docx UI Style Guide — status indicators). */
export default function StatusBadge({ label, kind = "neutral" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${KIND_STYLES[kind] || KIND_STYLES.neutral}`}
    >
      {label}
    </span>
  );
}