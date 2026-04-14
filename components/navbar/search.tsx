"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { differenceInDays } from "date-fns";
import { BiSearch } from "react-icons/bi";

import useSearchModal from "@/hooks/use-search-modal";

const Search = () => {
  const params = useSearchParams();
  const searchModal = useSearchModal();

  const guestCount = params?.get("guestCount");
  const startDate = params?.get("startDate");
  const endDate = params?.get("endDate");
  const languages = params?.get("languages");
  const minBudget = params?.get("minBudget");
  const maxBudget = params?.get("maxBudget");

  const guestLabel = React.useMemo(() => {
    if (guestCount && +guestCount > 0) {
      return `${guestCount} ${+guestCount === 1 ? "Guest" : "Guests"}`;
    }
    return "Guests";
  }, [guestCount]);

  const datesLabel = React.useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = Math.max(differenceInDays(end, start), 1);
      return `${diff} ${diff === 1 ? "Day" : "Days"}`;
    }
    return "Dates";
  }, [startDate, endDate]);

  const preferencesLabel = React.useMemo(() => {
    const parts: string[] = [];
    if (minBudget || maxBudget) {
      if (minBudget && maxBudget) parts.push(`¥${minBudget}–${maxBudget}`);
      else if (minBudget) parts.push(`From ¥${minBudget}`);
      else parts.push(`Up to ¥${maxBudget}`);
    }
    if (languages) {
      const langs = languages.split(",");
      parts.push(langs.length === 1 ? langs[0] : `${langs.length} languages`);
    }
    return parts.length > 0 ? parts.join(" · ") : "Preferences";
  }, [minBudget, maxBudget, languages]);

  return (
    <div className="border-[1px] w-full md:w-auto py-2 rounded-full shadow-sm hover:shadow-md transition cursor-pointer">
      <div className="flex items-center justify-between">
        <div
          onClick={() => searchModal.onOpen(0)}
          className="font-semibold text-sm px-6"
        >
          {guestLabel}
        </div>
        <div
          onClick={() => searchModal.onOpen(1)}
          className="hidden sm:block font-semibold text-sm text-center px-6 border-x-[1px] flex-1"
        >
          {datesLabel}
        </div>
        <div
          onClick={() => searchModal.onOpen(2)}
          className="flex items-center gap-3 text-sm pl-6 pr-2 text-gray-600"
        >
          <div className="hidden sm:block truncate max-w-[120px]">{preferencesLabel}</div>
          <div className="bg-black text-white p-2 rounded-full">
            <BiSearch size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
