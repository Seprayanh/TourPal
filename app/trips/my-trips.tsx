"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";

import { SafeReservation, SafeUser } from "@/types";
import Container from "@/components/container";
import Heading from "@/components/heading";
import ListingCard from "@/components/listings/listing-card";
import EmptyState from "@/components/empty-state";

type Tab = "active" | "completed" | "cancelled";

const TABS: { key: Tab; label: string }[] = [
  { key: "active",    label: "Active"    },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const ACTIVE_STATUSES = new Set(["PENDING", "ACCEPTED", "IN_PROGRESS"]);

function filterByTab(reservations: SafeReservation[], tab: Tab) {
  if (tab === "active")    return reservations.filter((r) => ACTIVE_STATUSES.has(r.status));
  if (tab === "completed") return reservations.filter((r) => r.status === "COMPLETED");
  if (tab === "cancelled") return reservations.filter((r) => r.status === "CANCELLED");
  return reservations;
}

const EMPTY_MESSAGES: Record<Tab, { title: string; subtitle: string }> = {
  active:    { title: "No active trips",    subtitle: "Book a tour to get started!" },
  completed: { title: "No completed trips", subtitle: "Your completed tours will appear here." },
  cancelled: { title: "No cancelled trips", subtitle: "Any cancelled reservations will appear here." },
};

interface MyTripsProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const MyTrips: React.FC<MyTripsProps> = ({ reservations, currentUser }) => {
  const router = useRouter();
  const [deleteId, setDeleteId] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<Tab>("active");

  const onCancel = React.useCallback(
    async (id: string) => {
      setDeleteId(id);
      try {
        await axios.delete(`/api/reservations/${id}`);
        toast.success("Reservation cancelled successfully.");
        router.refresh();
      } catch (error) {
        toast.error((error as Error).message ?? "Something went wrong");
      } finally {
        setDeleteId("");
      }
    },
    [router]
  );

  const filtered = filterByTab(reservations, activeTab);
  const empty    = EMPTY_MESSAGES[activeTab];

  return (
    <Container>
      <Heading title="My Trips" subtitle="Manage all your trips in one place." />

      {/* Tabs */}
      <div className="flex gap-6 border-b border-neutral-200 mt-6">
        {TABS.map(({ key, label }) => {
          const count = filterByTab(reservations, key).length;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                isActive
                  ? "text-neutral-900 font-semibold"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {label}
              {count > 0 && (
                <span className="ml-1.5 text-xs text-neutral-400">({count})</span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState title={empty.title} subtitle={empty.subtitle} showReset={false} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 mt-10">
          {filtered.map((reservation) => (
            <ListingCard
              key={reservation.id}
              data={reservation.listing}
              reservation={reservation}
              actionId={reservation.id}
              onAction={activeTab === "active" ? onCancel : undefined}
              disabled={deleteId === reservation.id}
              actionLabel={activeTab === "active" ? "Cancel reservation" : undefined}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default MyTrips;
