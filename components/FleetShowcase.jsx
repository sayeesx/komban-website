"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

const BUSES = [
  {
    id: "dawood",
    name: "Komban Dawood",
    image:
      "https://res.cloudinary.com/dhh2nd2bg/image/upload/v1777650788/dawood_ouyj83.png",
    seats: "40-49",
    type: "AC Luxury",
    features: [
      "LED exterior lighting",
      "Ambient interior lights",
      "Premium seats",
      "Sound system",
    ],
    best: "Tours, night travel",
  },
  {
    id: "bombay",
    name: "Komban Bombay",
    image:
      "https://res.cloudinary.com/dhh2nd2bg/image/upload/v1777650787/bombay_gzwbwb.png",
    seats: "40-49",
    type: "AC / Non-AC",
    features: [
      "Signature Komban exterior",
      "Comfort seating",
      "Event-ready look",
      "Long-route capable",
    ],
    best: "Weddings, event transport",
  },
  {
    id: "big-brother",
    name: "Komban Big Brother",
    image:
      "https://res.cloudinary.com/dhh2nd2bg/image/upload/v1777650786/big-brother_ze9aua.png",
    seats: "40-49",
    type: "AC Premium",
    features: [
      "High road presence",
      "Premium interior feel",
      "Powerful lighting setup",
      "Group travel optimized",
    ],
    best: "Corporate groups, long tours",
  },
  {
    id: "yodhavu",
    name: "Komban Yodhavu",
    image:
      "https://res.cloudinary.com/dhh2nd2bg/image/upload/v1777650780/yodhavu_usbkhq.png",
    seats: "40-49",
    type: "AC / Sleeper Ready",
    features: [
      "Bold custom body graphics",
      "Comfort-focused cabin",
      "Tour-grade reliability",
      "Premium passenger experience",
    ],
    best: "Interstate and long-distance trips",
  },
];

const TIME_SLOTS = [
  "06:00 AM",
  "08:00 AM",
  "10:00 AM",
  "12:00 PM",
  "02:00 PM",
  "04:00 PM",
  "06:00 PM",
  "08:00 PM",
];

const CONTACT_NUMBER = "75940070005";

function hashSeed(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getBookedSlotIndexes(busId, date) {
  const seed = hashSeed(`${busId}-${date}`);
  const count = 2 + (seed % 3); // 2-4 random booked slots
  const indexes = new Set();
  let n = seed;
  while (indexes.size < count) {
    n = (n * 1664525 + 1013904223) >>> 0;
    indexes.add(n % TIME_SLOTS.length);
  }
  return indexes;
}

export default function FleetShowcase() {
  const [selectedBusId, setSelectedBusId] = useState(BUSES[0].id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedBus = useMemo(
    () => BUSES.find((b) => b.id === selectedBusId) || BUSES[0],
    [selectedBusId]
  );

  const bookedSlotIndexes = useMemo(
    () => getBookedSlotIndexes(selectedBus.id, date),
    [selectedBus.id, date]
  );

  const whatsappText = encodeURIComponent(
    `Hi Komban, I want to book ${selectedBus.name} on ${date} at ${
      selectedSlot || "a preferred slot"
    }.`
  );

  const openBookingModal = (busId) => {
    setSelectedBusId(busId);
    setSelectedSlot("");
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsModalOpen(false);
    setSelectedSlot("");
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen]);

  return (
    <section id="fleet" className="section-fade relative py-16 md:py-24 lg:py-28 px-4 md:px-6 bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-glow-red opacity-30"
      />
      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-[0.35em] text-white/50 font-body mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
          Our Fleet
        </div>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
          Choose Your Ride
        </h2>
        <div className="divider" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {BUSES.map((bus) => {
            const isActive = bus.id === selectedBusId;
            return (
              <div
                key={bus.id}
                className={`glass rounded-2xl overflow-hidden flex flex-col border transition-all ${
                  isActive
                    ? "border-accent/70 -translate-y-1"
                    : "border-white/5 hover:border-accent/30"
                }`}
              >
                <div className="relative w-full h-48 bg-surface-raised">
                  <Image
                    src={bus.image}
                    alt={bus.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="p-5 flex flex-col gap-3 text-left flex-1">
                  <div>
                    <h3 className="font-display text-2xl text-white">{bus.name}</h3>
                    <p className="text-xs text-white/45 font-body mt-0.5">
                      {bus.type} · {bus.seats} seats
                    </p>
                  </div>
                  <ul className="space-y-1.5">
                    {bus.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-white/65 font-body"
                      >
                        <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-white/35 font-body uppercase tracking-widest mt-auto">
                    Best for: {bus.best}
                  </p>
                  <button
                    type="button"
                    onClick={() => openBookingModal(bus.id)}
                    className={`w-full py-3 rounded-xl text-sm font-body font-medium uppercase tracking-[0.15em] transition-colors ${
                      isActive
                        ? "bg-accent text-white"
                        : "bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {isActive ? "Book This Bus" : "Select to Book"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 py-4">
            <div
              aria-hidden
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={closeBookingModal}
            />
            <div className="relative z-10 w-full max-w-3xl glass rounded-2xl p-6 md:p-8 pb-8 text-left max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-white/40 font-body">
                    Booking for
                  </p>
                  <h3 className="font-display text-3xl text-white">{selectedBus.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="w-10 h-10 rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
                  aria-label="Close booking modal"
                >
                  ✕
                </button>
              </div>

              <div className="w-full mt-6">
                <label
                  htmlFor="fleet-booking-date"
                  className="block text-[10px] uppercase tracking-widest text-white/40 font-body mb-2"
                >
                  Select Date
                </label>
                <input
                  id="fleet-booking-date"
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSelectedSlot("");
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-accent/60"
                />
              </div>

              <p className="mt-6 text-[10px] uppercase tracking-widest text-white/40 font-body">
                Choose Slot (grey = booked)
              </p>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot, idx) => {
                  const isBooked = bookedSlotIndexes.has(idx);
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 rounded-lg text-xs font-body uppercase tracking-[0.12em] transition-colors ${
                        isBooked
                          ? "bg-zinc-700/80 text-zinc-300 cursor-not-allowed"
                          : isSelected
                          ? "bg-accent text-white"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/91${CONTACT_NUMBER}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-body font-semibold uppercase tracking-[0.16em] transition-colors ${
                    selectedSlot
                      ? "bg-accent text-white hover:bg-accent-dark"
                      : "bg-zinc-700 text-zinc-300 cursor-not-allowed pointer-events-none"
                  }`}
                >
                  Book Selected Slot
                </a>
                <a
                  href="#contact"
                  onClick={closeBookingModal}
                  className="inline-flex items-center justify-center px-6 py-3 border border-white/20 rounded-xl text-sm font-body font-medium uppercase tracking-[0.16em] text-white hover:bg-white/5 transition-colors"
                >
                  Enquiry Form
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

