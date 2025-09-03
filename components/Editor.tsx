type Props = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function Editor({ label, value, onChange, placeholder }: Props) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm text-gray-700">{label}</label>}
      <textarea
        className="w-full border rounded p-2 min-h-40"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

