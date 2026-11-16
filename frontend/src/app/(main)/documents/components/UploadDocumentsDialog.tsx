"use client";

import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileIcon } from "@/components/FileIcon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { ACCEPTED_DOCUMENT_TYPES, isAcceptedDocument } from "@/services/documents";
import { formatSize } from "@/utils/formatSize";
import { useUploadDocuments } from "../actions";

export function UploadDocumentsDialog({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const upload = useUploadDocuments();

  function add(list: FileList | null) {
    if (!list) return;
    const all = Array.from(list);
    setRejected(all.filter(f => !isAcceptedDocument(f)).map(f => f.name));
    const picked = all.filter(isAcceptedDocument);
    // Skip files already in the list (same name and size).
    setFiles(prev => [...prev, ...picked.filter(p => !prev.some(f => f.name === p.name && f.size === p.size))]);
  }

  function submit() {
    if (!files.length || upload.isPending) return;
    upload.mutate(files, {
      onSuccess: ({ persisted, failed }) => {
        if (persisted) toast.success(`${persisted} document${persisted === 1 ? "" : "s"} added to the repository`);
        failed.forEach(f => toast.error(`${f.name}: ${f.reason}`));
        if (!failed.length) onClose();
        else setFiles(prev => prev.filter(p => failed.some(f => f.name === p.name)));
      },
      onError: () => toast.error("Couldn't upload the documents. Try again."),
    });
  }

  return (
    <Dialog open onOpenChange={open => { if (!open && !upload.isPending) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload documents</DialogTitle>
          <DialogDescription>
            Add documents straight to the repository. They aren&apos;t tied to an assignment, but future submissions are
            checked against them.
          </DialogDescription>
        </DialogHeader>

        <Button variant="outline" className="h-auto w-full flex-col py-5 whitespace-normal" disabled={upload.isPending}
          onClick={() => inputRef.current?.click()}>
          <span className="flex items-center gap-2 text-sm font-semibold"><Upload size={17} /> Choose files to upload</span>
          <span className="text-[12.5px] text-ink-tertiary">Word documents (.docx) · select several at once</span>
        </Button>
        <input ref={inputRef} type="file" accept={ACCEPTED_DOCUMENT_TYPES} multiple hidden
          onChange={e => { add(e.target.files); e.target.value = ""; }} />

        {rejected.length > 0 && (
          <p className="text-sm text-destructive">Only .docx files can be uploaded. Skipped: {rejected.join(", ")}</p>
        )}

        {files.length > 0 && (
          <ul className="grid max-h-[40vh] gap-2 overflow-y-auto">
            {files.map((f, i) => (
              <li key={`${f.name}-${f.size}`} className="flex items-center gap-3 rounded-[14px] border border-line-strong bg-white px-3.5 py-2.5">
                <FileIcon />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{f.name}</div>
                  <div className="text-[12.5px] text-ink-tertiary">{formatSize(f.size)}</div>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label={`Remove ${f.name}`} disabled={upload.isPending}
                  onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>
                  <X size={16} />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={upload.isPending} />}>Cancel</DialogClose>
          <Button disabled={!files.length || upload.isPending} onClick={submit}>
            {upload.isPending && <Spinner />}
            Upload{files.length > 0 ? ` ${files.length} document${files.length === 1 ? "" : "s"}` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
