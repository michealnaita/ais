"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { RepositoryDocument } from "./types";

/* Poll while anything is still being analysed so rows flip to "complete" on their own. */
const pollWhileProcessing = ({ state }: { state: { data?: RepositoryDocument[] } }) =>
  state.data?.some(d => d.status === "queued") ? 3000 : false;

/** Every document in the repository, newest first (admin only). */
export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: () => api.get<RepositoryDocument[]>("/documents/").then(r =>
      [...r.data].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))),
    refetchInterval: pollWhileProcessing,
  });
}
