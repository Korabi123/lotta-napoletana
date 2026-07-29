import heroPizza from "@/assets/hero-pizza.jpg";
import margherita from "@/assets/margherita.jpg";
import burrata from "@/assets/burrata.jpg";
import cortado from "@/assets/cortado.jpg";

export type MenuItem = {
  name: string;
  desc: string;
  descSq: string;
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
      {
        name: "Sallatë Burrata",
        desc: "Whole burrata, heirloom tomato, basil, olio evo, black pepper.",
        descSq: "Burratë e plotë, domate heirloom, borzilok, olio evo, piper i zi.",
        price: "€9",
        img: burrata,
        tags: ["vegetarian"],
      },
      {
        name: "Bruschetta al Pomodoro",
        desc: "Wood-toasted bread, San Marzano, garlic, basil.",
        descSq: "Bukë e pjekur me dru, San Marzano, hudhër, borzilok.",
        price: "€4",
        tags: ["vegan"],
      },
      {
        name: "Tagliere Misto",
        desc: "Prosciutto, salame, pecorino, taralli.",
        descSq: "Proshutë, salame, pecorino, taralli.",
        price: "€10",
      },
    ],
  },
  {
    title: "Pizza Classiche",
    subtitle: "48-hour dough, wood-fired at 450°",
    items: [
      {
        name: "Marinara",
        desc: "San Marzano, garlic, oregano, olio evo. No cheese — all soul.",
        descSq: "San Marzano, hudhër, rigon, olio evo. Pa djathë — me shpirt.",
        price: "€6",
        img: heroPizza,
        tags: ["vegan"],
      },
      {
        name: "Margherita",
        desc: "Fior di latte, San Marzano, basil, olio evo.",
        descSq: "Fior di latte, San Marzano, borzilok, olio evo.",
        price: "€7",
        img: margherita,
        tags: ["vegetarian"],
      },
      {
        name: "Bufalina",
        desc: "Mozzarella di bufala, San Marzano, basil.",
        descSq: "Mozzarella di bufala, San Marzano, borzilok.",
        price: "€9",
        tags: ["vegetarian"],
      },
      {
        name: "Diavola",
        desc: "Fior di latte, spicy salame, San Marzano, chili oil.",
        descSq: "Fior di latte, salame pikant, San Marzano, vaj djegës.",
        price: "€8",
      },
      {
        name: "Prosciutto e Rucola",
        desc: "Fior di latte, prosciutto crudo, rucola, parmigiano.",
        descSq: "Fior di latte, proshutë crudo, rrokullë, parmigiano.",
        price: "€9",
      },
      {
        name: "Capricciosa",
        desc: "Fior di latte, prosciutto cotto, mushroom, artichoke, olive.",
        descSq: "Fior di latte, proshutë cotto, kërpudha, angjinare, ullinj.",
        price: "€9",
      },
    ],
  },
  {
    title: "Pizza Speciali",
    subtitle: "House favorites",
    items: [
      {
        name: "Quattro Formaggi",
        desc: "Mozzarella, gorgonzola, pecorino, parmigiano.",
        descSq: "Mozzarella, gorgonzola, pecorino, parmigiano.",
        price: "€9",
        tags: ["vegetarian"],
      },
      {
        name: "Vegetariana",
        desc: "Fior di latte, zucchini, peppers, mushroom, olives.",
        descSq: "Fior di latte, kungull i njomë, speca, kërpudha, ullinj.",
        price: "€8",
        tags: ["vegetarian"],
      },
      {
        name: "Vegana",
        desc: "San Marzano, roasted vegetables, olives, garlic, basil.",
        descSq: "San Marzano, perime të pjekura, ullinj, hudhër, borzilok.",
        price: "€8",
        tags: ["vegan"],
      },
      {
        name: "Funghi",
        desc: "Fior di latte, mixed mushrooms, thyme, olio evo.",
        descSq: "Fior di latte, kërpudha të ndryshme, trumzë, olio evo.",
        price: "€8",
        tags: ["vegetarian"],
      },
      {
        name: "Tartufo",
        desc: "Fior di latte, cream, mushrooms, truffle oil.",
        descSq: "Fior di latte, krem, kërpudha, vaj tartufi.",
        price: "€11",
        tags: ["vegetarian"],
      },
    ],
  },
  {
    title: "Dolci & Caffè",
    subtitle: "To end",
    items: [
      {
        name: "Tiramisù della Casa",
        desc: "Espresso, mascarpone, savoiardi, cocoa.",
        descSq: "Espresso, mascarpone, savoiardi, kakao.",
        price: "€4",
        tags: ["vegetarian"],
      },
      {
        name: "Cannoli Siciliani",
        desc: "Ricotta, pistachio, dark chocolate.",
        descSq: "Ricotta, pistache, çokollatë e zezë.",
        price: "€4",
        tags: ["vegetarian"],
      },
      {
        name: "Espresso",
        desc: "Single origin, dark roast.",
        descSq: "Origjinë e vetme, djegëse e errët.",
        price: "€1.5",
        tags: ["vegan"],
      },
      {
        name: "Cortado",
        desc: "Double espresso, a whisper of steamed milk.",
        descSq: "Espresso i dyfishtë, pak qumësht me avull.",
        price: "€2",
        img: cortado,
        tags: ["vegetarian"],
      },
    ],
  },
  {
    title: "Vini & Bevande",
    subtitle: "House pours",
    items: [
      {
        name: "Vino della Casa",
        desc: "Kosovan house wine, red or white. Glass.",
        descSq: "Verë shtëpie kosovare, e kuqe ose e bardhë. Gotë.",
        price: "€3",
      },
      {
        name: "Vino della Casa",
        desc: "Kosovan house wine, red or white. Half litre.",
        descSq: "Verë shtëpie kosovare, e kuqe ose e bardhë. Gjysmë litri.",
        price: "€8",
      },
      {
        name: "Birra Peroni",
        desc: "Italian lager, 33cl.",
        descSq: "Birrë italiane lager, 33cl.",
        price: "€2.5",
      },
      {
        name: "Acqua Naturale",
        desc: "Still water, 75cl.",
        descSq: "Ujë pa gaz, 75cl.",
        price: "€1.5",
      },
      {
        name: "San Pellegrino",
        desc: "Sparkling, 33cl.",
        descSq: "Me gaz, 33cl.",
        price: "€2",
      },
    ],
  },
];
