'use client';
import { Table, THead, TBody, TR, TH, TD } from "./ui/table";
import { Input } from "./ui/input";

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
      <Table>
        <THead>
          <TR>
            <TH>#</TH>
            <TH>Start</TH>
            <TH>End</TH>
            <TH>Visual</TH>
            <TH>Text</TH>
            <TH>VO</TH>
            <TH>Image Prompt</TH>
          </TR>
        </THead>
        <TBody>
          {scenes.map((s, i) => (
            <TR key={i}>
              <TD className="w-10">{s.index ?? i + 1}</TD>
              <TD className="w-24"><Input value={s.start || ""} onChange={(e)=>update(i, "start", e.target.value)} /></TD>
              <TD className="w-24"><Input value={s.end || ""} onChange={(e)=>update(i, "end", e.target.value)} /></TD>
              <TD className="min-w-64"><Input value={s.visual || ""} onChange={(e)=>update(i, "visual", e.target.value)} /></TD>
              <TD className="min-w-48"><Input value={s.text || ""} onChange={(e)=>update(i, "text", e.target.value)} /></TD>
              <TD className="min-w-64"><Input value={s.vo || ""} onChange={(e)=>update(i, "vo", e.target.value)} /></TD>
              <TD className="min-w-64"><Input value={s.imagePrompt || ""} onChange={(e)=>update(i, "imagePrompt", e.target.value)} /></TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
