// Synthetic home screen content for the customer app, one entry per scenario id.
// Names and amounts are invented. tone picks the tile colour, cents are kept apart for display.
export const homes = {
  "household-maes": {
    accounts: [
      { id: "personal", name: "Personal Account", tone: "blue", amount: "4 218", cents: "36", active: true },
      { id: "joint", name: "Joint Account", tone: "navy", amount: "2 905", cents: "12" },
      { id: "savings", name: "Savings Account", tone: "sky", amount: "11 480", cents: "00" },
      { id: "card", name: "SOFIE MAES", tone: "card", amount: "1 026", cents: "90", tag: "Just activated" },
    ],
    feed: [
      { icon: "document", text: "Your September energy bill is ready." },
      { icon: "card", text: "Spread a big expense with a credit card." },
      { icon: "chart", text: "Invest online. Learn more." },
    ],
  },
  "bakery-leuven": {
    accounts: [
      { id: "company", name: "Company Account", tone: "blue", amount: "5 328", cents: "52", active: true },
      { id: "reserve", name: "Reserve Account", tone: "sky", amount: "9 750", cents: "00" },
      { id: "card", name: "PIETER JANSSENS", tone: "card", amount: "812", cents: "40", tag: "Just activated" },
    ],
    feed: [
      { icon: "document", text: "A billing statement has arrived." },
      { icon: "card", text: "Pay business expenses with a business credit card." },
      { icon: "chart", text: "Invest online. Learn more." },
    ],
  },
};

export const walletPromo = {
  title: "Wallet",
  link: "Open wallet",
  body: "Your cards in one place.",
};

export function homeOf(scenarioId) {
  return homes[scenarioId] ?? homes["household-maes"];
}
