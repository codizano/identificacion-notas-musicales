import { useEffect, useRef } from "react";
import { Formatter, Renderer, Stave, StaveNote, Voice } from "vexflow";
import type { NoteData } from "../types";
import type { IntervalClef } from "../data/intervals";

interface IntervalStaffProps {
  lowerNote: NoteData;
  upperNote: NoteData;
  clef: IntervalClef;
}

export default function IntervalStaff({ lowerNote, upperNote, clef }: IntervalStaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    try {
      const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
      renderer.resize(320, 150);
      const context = renderer.getContext();
      const stave = new Stave(20, 28, 280);
      stave.addClef(clef).setContext(context).draw();

      const voice = new Voice({ numBeats: 2, beatValue: 4 });
      voice.setStrict(false);
      voice.addTickables(
        [lowerNote, upperNote].map(
          (note) => new StaveNote({ keys: [note.vexKey], duration: "q", clef })
        )
      );

      new Formatter().joinVoices([voice]).format([voice], 190);
      voice.draw(context, stave);

      containerRef.current.querySelectorAll(".vf-notehead path, .vf-stavenote path").forEach((el) => {
        (el as SVGElement).setAttribute("fill", "#4f46e5");
        (el as SVGElement).setAttribute("stroke", "#4f46e5");
      });
    } catch (err) {
      console.error("VexFlow error:", err);
    }
  }, [clef, lowerNote, upperNote]);

  return <div ref={containerRef} style={{ display: "flex", justifyContent: "center" }} />;
}
