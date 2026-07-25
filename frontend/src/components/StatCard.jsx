const ACCENTS = {
  blue: "border-l-dha-blue",
  steel: "border-l-dha-steel",
  green: "border-l-success",
  red: "border-l-overdue",
  orange: "border-l-pending",
};

export default function StatCard({ label, value, accent = "blue" }) {
  return (
    <div className={`card border-l-4 ${ACCENTS[accent]} p-4`}>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="mt-1 text-sm text-gray-600">{label}</div>
    </div>
  );
}