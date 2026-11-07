/** Presentation-only seed data. Production pages should use server-side feature services. */
export const demoDashboard = {
  wedding: { id: "demo-wedding", title: "Aarav & Meera's Wedding", coupleNames: ["Aarav", "Meera"], weddingDate: "14 February 2027", city: "Jaipur" },
  upcomingEvents: [
    { id: "mehendi", name: "Mehendi", dateLocal: "2027-02-12", startTimeLocal: "11:00", venue: { name: "Garden Terrace", address: "Jaipur, Rajasthan" } },
    { id: "sangeet", name: "Sangeet", dateLocal: "2027-02-13", startTimeLocal: "19:00", venue: { name: "The Courtyard", address: "Jaipur, Rajasthan" } }
  ],
  guests: { confirmed: 186, awaiting: 34, declined: 28 }, tasks: { open: 12, dueSoon: 4, overdue: 1 },
  budget: { spentMinor: 184000000, remainingMinor: 116000000 },
  recentExpenses: [{ id: "1", description: "Mehendi artist advance", eventName: "Mehendi", paymentStatus: "Paid", amountMinor: 2500000 }, { id: "2", description: "Stage floral samples", eventName: "Sangeet", paymentStatus: "Due", amountMinor: 1800000 }]
};
