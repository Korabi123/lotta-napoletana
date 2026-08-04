import heroPizza from "@/assets/ai/hero-pizza.jpg";
import margherita from "@/assets/ai/margherita.jpg";
import burrata from "@/assets/ai/burrata.jpg";
import cortado from "@/assets/ai/cortado.jpg";

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
    title: "Pizza",
    subtitle: "48-hour dough, wood-fired at 450°",
    items: [
      {
        name: "Marinara",
        desc: "Tomato sauce, basil, oregano, olive oil, garlic.",
        descSq: "Salcë domate, borzilok, rigon, vaj ulliri, hudher.",
        price: "€4.00",
        img: heroPizza,
        tags: ["vegan"],
      },
      {
        name: "Margherita",
        desc: "Tomato sauce, mozzarella, oregano, olive oil, basil.",
        descSq: "Salcë domate, mozzarella, rigon, vaj ulliri, borzilok.",
        price: "€5.50",
        img: margherita,
        tags: ["vegetarian"],
      },
      {
        name: "Dried Meat",
        desc: "Tomato sauce, mozzarella, dried meat, oregano, olive oil.",
        descSq: "Salcë domate, mozzarella, mish i thatë, rigon, vaj ulliri.",
        price: "€6.70",
      },
      {
        name: "Lotta's (Homemade Pizza)",
        desc: "Tomato sauce, mozzarella, dried meat, sujuk, mushrooms, olive oil, oregano.",
        descSq: "Salcë domate, mozzarella, mish i thatë, sugjuk, kërpudha, vaj ulliri, rigon.",
        price: "€7.80",
      },
      {
        name: "Mushrooms",
        desc: "Tomato sauce, mozzarella, basil, mushrooms, olive oil, oregano.",
        descSq: "Salcë domate, mozzarella, borzilok, kërpudha, vaj ulliri, rigon.",
        price: "€6.50",
        tags: ["vegetarian"],
      },
      {
        name: "Sardine (Anchovies)",
        desc: "Tomato sauce, mozzarella, sardines, oregano, olive oil.",
        descSq: "Salcë domate, mozzarella, sardele, rigon, vaj ulliri.",
        price: "€7.80",
      },
      {
        name: "Four Cheeses",
        desc: "Mozzarella, Sharri cheese, gorgonzola, cream cheese, oregano, olive oil, basil.",
        descSq: "Mozzarella, djathë Sharri, gorgonzola, djathë krem, rigon, vaj ulliri, borzilok.",
        price: "€7.50",
        tags: ["vegetarian"],
      },
      {
        name: "Rucola",
        desc: "Tomato sauce, mozzarella, tomatoes, arugula, ground beef, Sharri cheese, olive oil, basil.",
        descSq: "Salcë domate, mozzarella, domate, rrokullë, mish i grirë viçi, djathë Sharri, vaj ulliri, borzilok.",
        price: "€7.50",
      },
      {
        name: "Chief",
        desc: "Tomato sauce, mozzarella, Sharri cheese, spinach, ground beef, oregano, olive oil.",
        descSq: "Salcë domate, mozzarella, djathë Sharri, spinaq, mish i grirë viçi, rigon, vaj ulliri.",
        price: "€7.50",
      },
      {
        name: "Tuna",
        desc: "Tomato sauce, mozzarella, tuna, olive oil, oregano, basil.",
        descSq: "Salcë domate, mozzarella, ton, vaj ulliri, rigon, borzilok.",
        price: "€6.50",
      },
      {
        name: "Peperoni",
        desc: "Tomato sauce, mozzarella, pepperoni, olive oil, oregano, basil.",
        descSq: "Salcë domate, mozzarella, peperoni, vaj ulliri, rigon, borzilok.",
        price: "€6.50",
      },
      {
        name: "Pesto",
        desc: "Mozzarella, al pesto, chicken, oregano, garlic, olive oil, mushrooms.",
        descSq: "Mozzarella, pesto, pulë, rigon, hudher, vaj ulliri, kërpudha.",
        price: "€7.80",
      },
      {
        name: "Vegetarians",
        desc: "Tomato sauce, peppers, mozzarella, black olives, mushrooms, basil, oregano.",
        descSq: "Salcë domate, speca, mozzarella, ullinj të zinj, kërpudha, borzilok, rigon.",
        price: "€6.50",
        tags: ["vegetarian"],
      },
      {
        name: "Pizza Fritta",
        desc: "Deep-fried pizza dough, Neapolitan style.",
        descSq: "Picë e skuqur, stil napolitane.",
        price: "€6.00",
        tags: ["vegetarian"],
      },
      {
        name: "Garlic Bread",
        desc: "Wood-fired bread with garlic butter.",
        descSq: "Bukë me hudher dhe gjalp.",
        price: "€2.70",
        tags: ["vegetarian"],
      },
      {
        name: "Pizza Nutella",
        desc: "Sweet pizza with Nutella spread.",
        descSq: "Picë e ëmbël me Nutella.",
        price: "€3.80",
        tags: ["vegetarian"],
      },
    ],
  },
  {
    title: "Pasta",
    subtitle: "Fresh pasta, made daily",
    items: [
      {
        name: "Chicken Pesto",
        desc: "Pasta with basil pesto and grilled chicken.",
        descSq: "Pasta me pesto dhe pulë të pjekur.",
        price: "€4.50",
      },
      {
        name: "Bolognese",
        desc: "Classic meat sauce with tomato and herbs.",
        descSq: "Salcë mishi klasike me domate dhe erëza.",
        price: "€4.50",
      },
      {
        name: "Arrabbiata",
        desc: "Spicy tomato sauce with garlic and chili.",
        descSq: "Salcë domate pikante me hudher dhe djegëse.",
        price: "€4.00",
        tags: ["vegan"],
      },
      {
        name: "Al Forno",
        desc: "Oven-baked pasta with cheese and tomato sauce.",
        descSq: "Pasta e pjekur në furrë me djathë dhe salcë domate.",
        price: "€5.00",
        tags: ["vegetarian"],
      },
      {
        name: "Carbonara",
        desc: "Creamy sauce with eggs, pecorino, and pancetta.",
        descSq: "Salcë kremoze me vezë, pecorino dhe pancetta.",
        price: "€4.50",
      },
      {
        name: "Caprese",
        desc: "Fresh tomatoes, mozzarella, basil, olive oil.",
        descSq: "Domate të freskëta, mozzarella, borzilok, vaj ulliri.",
        price: "€4.50",
        tags: ["vegetarian"],
      },
    ],
  },
  {
    title: "Sandwich Napoletana",
    subtitle: "Freshly baked sandwiches",
    items: [
      {
        name: "Pulë",
        desc: "Mozzarella, house sauce, pretzel chicken, arugula, olive oil.",
        descSq: "Mozzarella, salcë shtëpie, pulë pretzel, rrokullë, vaj ulliri.",
        price: "€4.00",
      },
      {
        name: "Proshut",
        desc: "Mozzarella, ham (dried meat), house sauce, arugula, olive oil.",
        descSq: "Mozzarella, proshutë (mish i thatë), salcë shtëpie, rrokullë, vaj ulliri.",
        price: "€4.00",
      },
    ],
  },
  {
    title: "Salads",
    subtitle: "Fresh & crisp",
    items: [
      {
        name: "Homemade Salad",
        desc: "Tomatoes, cucumbers, Sharri cheese, peppers, olives.",
        descSq: "Domate, kastraveca, djathë Sharri, speca, ullinj.",
        price: "€3.90",
        tags: ["vegetarian"],
      },
      {
        name: "Rukolla",
        desc: "Tomato, Sharri cheese, arugula.",
        descSq: "Domate, djathë Sharri, rrokullë.",
        price: "€4.00",
        tags: ["vegetarian"],
      },
      {
        name: "Caprese",
        desc: "Tomato, mozzarella, basil, olive oil.",
        descSq: "Domate, mozzarella, borzilok, vaj ulliri.",
        price: "€4.00",
        tags: ["vegetarian"],
      },
      {
        name: "Burrata",
        desc: "Tomato, arugula, olives, whole burrata.",
        descSq: "Domate, rrokullë, ullinj, burratë e plotë.",
        price: "€5.50",
        img: burrata,
        tags: ["vegetarian"],
      },
    ],
  },
  {
    title: "Extras",
    subtitle: "Add to your meal",
    items: [
      {
        name: "Burrata",
        desc: "Whole burrata cheese.",
        descSq: "Djathë burrata i plotë.",
        price: "€3.80",
        tags: ["vegetarian"],
      },
      {
        name: "Olives",
        desc: "Mixed olives.",
        descSq: "Ullinj të përzier.",
        price: "€1.50",
        tags: ["vegan"],
      },
      {
        name: "Extra Ingredients",
        desc: "Add any pizza topping.",
        descSq: "Shto çfarëdo përbërës për picë.",
        price: "€1.50",
      },
    ],
  },
  {
    title: "Drinks",
    subtitle: "Soft drinks & water",
    items: [
      {
        name: "Carbonated Drinks",
        desc: "Coca-Cola, Fanta, Sprite.",
        descSq: "Coca-Cola, Fanta, Sprite.",
        price: "€1.50",
      },
      {
        name: "Soft Drinks",
        desc: "Juices and iced tea.",
        descSq: "Lëngje dhe çaj i ftohtë.",
        price: "€1.50",
      },
      {
        name: "Water 0.25L",
        desc: "Still water, small bottle.",
        descSq: "Ujë pa gaz, shishe e vogël.",
        price: "€1.20",
      },
      {
        name: "Water 0.75L",
        desc: "Still water, large bottle.",
        descSq: "Ujë pa gaz, shishe e madhe.",
        price: "€2.50",
      },
    ],
  },
  {
    title: "Coffee",
    subtitle: "Espresso bar",
    items: [
      {
        name: "Espresso",
        desc: "Single shot, dark roast.",
        descSq: "Një shot, djegëse e errët.",
        price: "€1.00",
        tags: ["vegan"],
      },
      {
        name: "Macchiato",
        desc: "Espresso with a dash of milk.",
        descSq: "Espresso me pak qumësht.",
        price: "€1.50",
        tags: ["vegetarian"],
      },
      {
        name: "Cortado",
        desc: "Double espresso, a whisper of steamed milk.",
        descSq: "Espresso i dyfishtë, pak qumësht me avull.",
        price: "€2.00",
        img: cortado,
        tags: ["vegetarian"],
      },
    ],
  },
  {
    title: "Beer",
    subtitle: "Draft & bottled",
    items: [
      {
        name: "Beer Peja",
        desc: "Local Kosovan lager.",
        descSq: "Birrë lokale kosovare.",
        price: "€2.00",
      },
      {
        name: "Draft Beer 0.3L",
        desc: "Fresh draft beer.",
        descSq: "Birrë nga fuçia.",
        price: "€2.00",
      },
      {
        name: "Beer Krudo",
        desc: "Premium Kosovan craft beer.",
        descSq: "Birrë premium artizanale kosovare.",
        price: "€2.50",
      },
      {
        name: "Laško",
        desc: "Slovenian lager.",
        descSq: "Birrë sllovene.",
        price: "€3.00",
      },
    ],
  },
  {
    title: "Raki",
    subtitle: "Traditional spirits",
    items: [
      {
        name: "Grape Raki",
        desc: "Traditional grape brandy.",
        descSq: "Raki rrushi tradicionale.",
        price: "€2.50",
      },
      {
        name: "Raki Doma",
        desc: "Homemade style raki.",
        descSq: "Raki stil shtëpiak.",
        price: "€3.00",
      },
      {
        name: "Raki Ftoni",
        desc: "Premium raki blend.",
        descSq: "Raki premium.",
        price: "€3.00",
      },
      {
        name: "Limoncello",
        desc: "Italian lemon liqueur.",
        descSq: "Liker italian me limon.",
        price: "€2.50",
      },
    ],
  },
  {
    title: "Wine (Red & White)",
    subtitle: "House pours & bottles",
    items: [
      {
        name: "House Wine (Glass)",
        desc: "Red or white house wine, glass.",
        descSq: "Verë shtëpie e kuqe ose e bardhë, gotë.",
        price: "€2.90",
      },
      {
        name: "House Wine (Bottle)",
        desc: "Red or white house wine, bottle.",
        descSq: "Verë shtëpie e kuqe ose e bardhë, shishe.",
        price: "€11.00",
      },
      {
        name: "Wine Aleksandria (Glass)",
        desc: "Premium Kosovan wine, glass.",
        descSq: "Verë premium kosovare, gotë.",
        price: "€3.00",
      },
      {
        name: "Wine Aleksandria (Bottle)",
        desc: "Premium Kosovan wine, bottle.",
        descSq: "Verë premium kosovare, shishe.",
        price: "€14.50",
      },
    ],
  },
];
