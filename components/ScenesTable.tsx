'use client';
export default function ScenesTable({
  scenes,
  onChange
}: {
  scenes: any[];
  onChange: (v: any[]) => void;
}) {
  function update(idx: number, field: string, value: string) {
    const copy = scenes.slice();
    copy[idx] = { ...copy[idx], [field]: value };
    onChange(copy);
  }

  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Start</th>
            <th className="p-2 text-left">End</th>
            <th className="p-2 text-left">Visual</th>
            <th className="p-2 text-left">Text</th>
            <th className="p-2 text-left">VO</th>
            <th className="p-2 text-left">Image Prompt</th>
          </tr>
        </thead>
        <tbody>
          {scenes.map((s, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{s.index ?? i + 1}</td>
              <td className="p-2">
                <input className="w-20 rounded border p-1"
                       value={s.start || ""}
                       onChange={(e)=>update(i, "start", e.target.value)} />
              </td>
              <td className="p-2">
                <input className="w-20 rounded border p-1"
                       value={s.end || ""}
                       onChange={(e)=>update(i, "end", e.target.value)} />
              </td>
              <td className="p-2">
                <input className="w-64 rounded border p-1"
                       value={s.visual || ""}
                       onChange={(e)=>update(i, "visual", e.target.value)} />
              </td>
              <td className="p-2">
                <input className="w-48 rounded border p-1"
                       value={s.text || ""}
                       onChange={(e)=>update(i, "text", e.target.value)} />
              </td>
              <td className="p-2">
                <input className="w-64 rounded border p-1"
                       value={s.vo || ""}
                       onChange={(e)=>update(i, "vo", e.target.value)} />
              </td>
              <td className="p-2">
                <input className="w-64 rounded border p-1"
                       value={s.imagePrompt || ""}
                       onChange={(e)=>update(i, "imagePrompt", e.target.value)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
