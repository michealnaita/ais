"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

type FileDropzoneProps = {
  hint: string;
  onSelect: (file: File) => void;
};

export function FileDropzone({ hint, onSelect }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button variant="outline" className="h-auto w-full flex-col py-5 whitespace-normal" onClick={() => inputRef.current?.click()}>
        <span className="flex items-center gap-2 text-sm font-semibold"><Upload size={17} /> Choose a file to upload</span>
        <span className="text-[12.5px] text-ink-tertiary">{hint}</span>
      </Button>
      <input ref={inputRef} type="file" hidden onChange={e => { const f = e.target.files?.[0]; if (f) onSelect(f); }} />
    </>
  );
}
