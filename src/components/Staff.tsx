import { useEffect, useRef } from "react";
import { Renderer, Stave, StaveNote, Voice, Formatter } from "vexflow";
import type { NoteData } from "../types";

interface StaffProps {
  trebleNote: NoteData;
  bassNote: NoteData;
}

export default function Staff({ trebleNote, bassNote }: StaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    try {
      const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
      renderer.resize(320, 320);
      const context = renderer.getContext();

      const topStave = new Stave(20, 20, 275);
      topStave.addClef("treble");
      topStave.setContext(context).draw();

      const bottomStave = new Stave(20, 180, 275);
      bottomStave.addClef("bass");
      bottomStave.setContext(context).draw();

      const drawNote = (stave: Stave, note: NoteData, clef: "treble" | "bass") => {
        const staveNote = new StaveNote({
          keys: [note.vexKey],
          duration: "w",
          clef,
        });

        const voice = new Voice({ numBeats: 4, beatValue: 4 });
        voice.setStrict(false);
        voice.addTickables([staveNote]);

        new Formatter().joinVoices([voice]).format([voice], 200);
        voice.draw(context, stave);
      };

      drawNote(topStave, trebleNote, "treble");
      drawNote(bottomStave, bassNote, "bass");

      containerRef.current.querySelectorAll(
        ".vf-notehead path, .vf-stavenote path"
      ).forEach((el) => {
        (el as SVGElement).setAttribute("fill", "#4f46e5");
        (el as SVGElement).setAttribute("stroke", "#4f46e5");
      });
    } catch (err) {
      console.error("VexFlow error:", err);
    }
  }, [trebleNote, bassNote]);

  return (
    <div ref={containerRef} style={{ display: "flex", justifyContent: "center" }} />
  );
}