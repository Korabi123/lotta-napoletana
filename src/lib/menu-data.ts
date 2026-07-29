import heroPizza from "@/assets/hero-pizza.jpg";
import margherita from "@/assets/margherita.jpg";
import burrata from "@/assets/burrata.jpg";
import cortado from "@/assets/cortado.jpg";

export type MenuItem = {
  name: string;
  desc: string;
  price: string;
  tags?: string[];
  img?: string;
};

export type MenuSection = {
  title: string;
  subtitle: string;
  items: MenuItem[];
};

export const MENU: MenuSection[] = [
  {
    title: "Antipasti",
    subtitle: "To start",
    items: [
      { name: "Sallatë Burrata", desc: "Whole burrata, heirloom tomato, basil, olio evo, black pepper.", price: "€9", img: burrata, tags: ["vegetarian"] },
      { name: "Bruschetta al Pomodoro", desc: "Wood-toasted bread, San Marzano, garlic, basil.", price: "€4", tags: ["vegan"] },
      { name: "Tagliere Misto", desc: "Prosciutto, salame, pecorino, taralli.", price: "€10" },
    ],
  },
  {
    title: "Pizza Classiche",
    subtitle: "48-hour dough, wood-fired at 450°",
    items: [
      { name: "Marinara", desc: "San Marzano, garlic, oregano, olio evo. No cheese — all soul.", price: "€6", img: heroPizza, tags: ["vegan"] },
      { name: "Margherita", desc: "Fior di latte, San Marzano, basil, olio evo.", price: "€7", img: margherita, tags: ["vegetarian"] },
      { name: "Bufalina", desc: "Mozzarella di bufala, San Marzano, basil.", price: "€9", tags: ["vegetarian"] },
      { name: "Diavola", desc: "Fior di latte, spicy salame, San Marzano, chili oil.", price: "€8" },
      { name: "Prosciutto e Rucola", desc: "Fior di latte, prosciutto crudo, rucola, parmigiano.", price: "€9" },
      { name: "Capricciosa", desc: "Fior di latte, prosciutto cotto, mushroom, artichoke, olive.", price: "€9" },
    ],
  },
  {
    title: "Pizza Speciali",
    subtitle: "House favorites",
    items: [
      { name: "Quattro Formaggi", desc: "Mozzarella, gorgonzola, pecorino, parmigiano.", price: "€9", tags: ["vegetarian"] },
      { name: "Vegetariana", desc: "Fior di latte, zucchini, peppers, mushroom, olives.", price: "€8", tags: ["vegetarian"] },
      { name: "Vegana", desc: "San Marzano, roasted vegetables, olives, garlic, basil.", price: "€8", tags: ["vegan"] },
      { name: "Funghi", desc: "Fior di latte, mixed mushrooms, thyme, olio evo.", price: "€8", tags: ["vegetarian"] },
      { name: "Tartufo", desc: "Fior di latte, cream, mushrooms, truffle oil.", price: "€11", tags: ["vegetarian"] },
    ],
  },
  {
    title: "Dolci & Caffè",
    subtitle: "To end",
    items: [
      { name: "Tiramisù della Casa", desc: "Espresso, mascarpone, savoiardi, cocoa.", price: "€4", tags: ["vegetarian"] },
      { name: "Cannoli Siciliani", desc: "Ricotta, pistachio, dark chocolate.", price: "€4", tags: ["vegetarian"] },
      { name: "Espresso", desc: "Single origin, dark roast.", price: "€1.5", tags: ["vegan"] },
      { name: "Cortado", desc: "Double espresso, a whisper of steamed milk.", price: "€2", img: cortado, tags: ["vegetarian"] },
    ],
  },
  {
    title: "Vini & Bevande",
    subtitle: "House pours",
    items: [
      { name: "Vino della Casa", desc: "Kosovan house wine, red or white. Glass.", price: "€3" },
      { name: "Vino della Casa", desc: "Kosovan house wine, red or white. Half litre.", price: "€8" },
      { name: "Birra Peroni", desc: "Italian lager, 33cl.", price: "€2.5" },
      { name: "Acqua Naturale", desc: "Still water, 75cl.", price: "€1.5" },
      { name: "San Pellegrino", desc: "Sparkling, 33cl.", price: "€2" },
    ],
  },
];
