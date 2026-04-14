"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Range } from "react-date-range";
import queryString from "query-string";
import { formatISO } from "date-fns";

import useSearchModal from "@/hooks/use-search-modal";

import Modal from "./modal";
import Heading from "@/components/heading";
import Calendar from "@/components/inputs/calendar";
import Counter from "@/components/inputs/counter";

enum STEPS {
  GUESTS = 0,
  DATE = 1,
  PREFERENCES = 2,
}

const TIME_SLOTS = [
  { value: "MORNING",   label: "Morning",   icon: "🌅", sub: "6 AM – 12 PM" },
  { value: "AFTERNOON", label: "Afternoon", icon: "☀️", sub: "12 PM – 6 PM" },
  { value: "EVENING",   label: "Evening",   icon: "🌙", sub: "6 PM – 10 PM" },
];

const LANGUAGES = [
  "English", "French", "Spanish", "Italian", "German",
  "Japanese", "Korean", "Arabic", "Portuguese", "Russian",
];

const SearchModal: React.FC = () => {
  const router = useRouter();
  const params = useSearchParams();
  const searchModal = useSearchModal();
  const { initialStep } = searchModal;

  const [step, setStep] = React.useState(STEPS.GUESTS);

  React.useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const [guestCount, setGuestCount] = React.useState(1);
  const [dateRange, setDateRange] = React.useState<Range>({
    key: "selection",
    startDate: new Date(),
    endDate: new Date(),
  });
  const [timeSlot, setTimeSlot] = React.useState<string>("");
  const [minBudget, setMinBudget] = React.useState<string>("");
  const [maxBudget, setMaxBudget] = React.useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>([]);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const onBack = React.useCallback(() => setStep((v) => v - 1), []);
  const onNext = React.useCallback(() => setStep((v) => v + 1), []);

  const onSubmit = React.useCallback(async () => {
    if (step !== STEPS.PREFERENCES) return onNext();

    let currentQuery: Record<string, any> = {};
    if (params) currentQuery = queryString.parse(params.toString());

    const updatedQuery: Record<string, any> = {
      ...currentQuery,
      guestCount,
    };

    if (dateRange.startDate) updatedQuery.startDate = formatISO(dateRange.startDate);
    if (dateRange.endDate) updatedQuery.endDate = formatISO(dateRange.endDate);
    if (timeSlot) updatedQuery.timeSlot = timeSlot;
    if (minBudget) updatedQuery.minBudget = minBudget;
    if (maxBudget) updatedQuery.maxBudget = maxBudget;
    if (selectedLanguages.length > 0) updatedQuery.languages = selectedLanguages.join(",");

    const url = queryString.stringifyUrl(
      { url: "/", query: updatedQuery },
      { skipNull: true, skipEmptyString: true }
    );

    setStep(STEPS.GUESTS);
    searchModal.onClose();
    router.push(url);
  }, [step, onNext, guestCount, dateRange, timeSlot, minBudget, maxBudget, selectedLanguages, params, router, searchModal]);

  const actionLabel = React.useMemo(() => {
    if (step === STEPS.PREFERENCES) return "Search";
    return "Next";
  }, [step]);

  const secondaryActionLabel = React.useMemo(() => {
    if (step === STEPS.GUESTS) return undefined;
    return "Back";
  }, [step]);

  // Step 0: Guest count
  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="How many guests?"
        subtitle="Choose the number of people joining this experience."
      />
      <Counter
        title="Guests"
        subtitle="How many tourists are in your group?"
        value={guestCount}
        onChange={setGuestCount}
      />
    </div>
  );

  // Step 1: Dates
  if (step === STEPS.DATE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="When are you visiting?"
          subtitle="Pick your preferred travel dates."
        />
        <Calendar
          value={dateRange}
          onChange={(value) => setDateRange(value.selection)}
        />
      </div>
    );
  }

  // Step 2: Preferences
  if (step === STEPS.PREFERENCES) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Your preferences"
          subtitle="Help us find the perfect experience for you."
        />

        {/* Time of day */}
        <div>
          <p className="font-medium text-gray-800 mb-2">Preferred time of day</p>
          <div className="grid grid-cols-3 gap-3">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.value}
                type="button"
                onClick={() => setTimeSlot(timeSlot === slot.value ? "" : slot.value)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${
                  timeSlot === slot.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-2xl mb-1">{slot.icon}</span>
                <span className="text-sm font-semibold text-gray-700">{slot.label}</span>
                <span className="text-xs text-gray-400">{slot.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Budget range */}
        <div>
          <p className="font-medium text-gray-800 mb-2">Budget (per person, ¥)</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* Languages */}
        <div>
          <p className="font-medium text-gray-800 mb-2">Guide speaks…</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  selectedLanguages.includes(lang)
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-400"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={searchModal.isOpen}
      onClose={searchModal.onClose}
      onSubmit={onSubmit}
      title="Find your experience"
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.GUESTS ? undefined : onBack}
      body={bodyContent}
    />
  );
};

export default SearchModal;
