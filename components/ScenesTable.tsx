type Scene = { id: string; caption: string; voiceover?: string };

export default function ScenesTable({ scenes = [] as Scene[] }) {
  if (!scenes?.length) return <p className="text-gray-500">No scenes yet.</p>;
  return (
    <div className="overflow-x-auto border rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">ID</th>
            <th className="text-left p-2">Caption</th>
            <th className="text-left p-2">Voiceover</th>
          </tr>
        </thead>
        <tbody>
          {scenes.map((s: Scene) => (
            <tr key={s.id} className="border-t">
              <td className="p-2 align-top font-medium">{s.id}</td>
              <td className="p-2 align-top">{s.caption}</td>
              <td className="p-2 align-top text-gray-700">{s.voiceover || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

