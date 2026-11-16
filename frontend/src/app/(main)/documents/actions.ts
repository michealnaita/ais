"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { uploadDocument } from "@/services/documents";
import type { PersistDocumentsResponse } from "@/types/api";

export type UploadResult = {
  persisted: number;
  /** Files that couldn't be uploaded, with the reason. */
  failed: { name: string; reason: string }[];
};

/** Admin adds documents straight to the repository: each file is uploaded, then all of
    them are persisted (kept past the usual expiry) and queued for analysis. */
export function useUploadDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]): Promise<UploadResult> => {
      const results = await Promise.allSettled(files.map(uploadDocument));
      const failed = results.flatMap((r, i) => r.status === "rejected"
        ? [{ name: files[i].name, reason: r.reason instanceof Error ? r.reason.message : "Upload failed" }]
        : []);
      const ids = results.flatMap(r => r.status === "fulfilled" ? [r.value.id] : []);
      if (!ids.length) return { persisted: 0, failed };
      const { data } = await api.post<PersistDocumentsResponse>("/documents/bulk-upload", { documentIds: ids });
      return { persisted: data.persistedIds.length, failed };
    },
    onSettled: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.documents }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    ]),
  });
}
