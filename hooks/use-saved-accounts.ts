"use client";

import { useEffect, useState, useCallback } from "react";
import { SafeUser } from "@/types";

const ACCOUNTS_KEY = "tourpal_saved_accounts";
export const SWITCH_EMAIL_KEY = "tourpal_switch_email";
const ADMIN_EMAIL = "suruihan07@gmail.com";

export interface SavedAccount {
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  isAdmin: boolean;
}

export function getDisplayRole(
  account: Pick<SavedAccount, "role" | "isAdmin">
): string {
  if (account.isAdmin) return "Admin";
  if (account.role === "GUIDE") return "Guide";
  return "Tourist";
}

function loadAccounts(): SavedAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedAccount[];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: SavedAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}
}

export function useSavedAccounts(currentUser?: SafeUser | null) {
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

  // Load persisted accounts on mount
  useEffect(() => {
    setSavedAccounts(loadAccounts());
  }, []);

  // Upsert current user into the saved list whenever they change
  useEffect(() => {
    if (!currentUser?.email) return;

    setSavedAccounts((prev) => {
      const entry: SavedAccount = {
        email: currentUser.email!,
        name: currentUser.name ?? null,
        image: currentUser.image ?? null,
        role: currentUser.role ?? "TOURIST",
        isAdmin: currentUser.email === ADMIN_EMAIL,
      };
      const filtered = prev.filter((a) => a.email !== entry.email);
      const updated = [entry, ...filtered];
      saveAccounts(updated);
      return updated;
    });
  }, [currentUser?.email, currentUser?.name, currentUser?.image, currentUser?.role]);

  const removeAccount = useCallback((email: string) => {
    setSavedAccounts((prev) => {
      const updated = prev.filter((a) => a.email !== email);
      saveAccounts(updated);
      return updated;
    });
  }, []);

  const otherAccounts = savedAccounts.filter(
    (a) => a.email !== currentUser?.email
  );

  return { savedAccounts, otherAccounts, removeAccount };
}
