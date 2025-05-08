export default function InsertionIndicator({ projected }) {
  if (!projected) return null;
  return (
    <div
      className="absolute inset-x-0 h-0.5 bg-indigo-500 rounded"
      style={{ top: -2 }}
    />
  );
}

