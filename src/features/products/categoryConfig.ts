import {
  Activity,
  Armchair,
  Baby,
  Backpack,
  Balloon,
  Bath,
  BatteryCharging,
  Bed,
  Bone,
  BookOpen,
  Briefcase,
  Cake,
  Camera,
  Candy,
  CircleDot,
  Citrus,
  Cookie,
  CookingPot,
  Cpu,
  Crown,
  Diamond,
  Dices,
  Droplets,
  Dumbbell,
  Fish,
  Flower,
  FolderOpen,
  Footprints,
  Gamepad2,
  Gem,
  Gift,
  Hand,
  Handbag,
  HardDrive,
  Headphones,
  Headset,
  Heart,
  HeartPulse,
  Highlighter,
  IceCream,
  Image,
  Joystick,
  Keyboard,
  Laptop,
  Lightbulb,
  Link,
  Megaphone,
  Mic,
  Milk,
  Monitor,
  Moon,
  Mouse,
  NotebookPen,
  Package,
  Palette,
  PartyPopper,
  Pen,
  Pencil,
  Pill,
  Ruler,
  Scissors,
  Shirt,
  ShoppingBag,
  ShowerHead,
  Smartphone,
  Snowflake,
  Sofa,
  Soup,
  Sparkles,
  SprayCan,
  Sun,
  Tablet,
  Tag,
  ToyBrick,
  User,
  Utensils,
  Volleyball,
  Wallet,
  Watch,
  Waves,
  Wheat,
  Wind,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const displayFont = '"Bebas Neue", system-ui, sans-serif';
export const scriptFont = '"Pacifico", system-ui, sans-serif';

export function normalizeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]/g, "");
}

export type CategoryBrand = {
  name: string;
  accent: string;
};

export type CategoryConfig = {
  font: string;
  accent: string;
  description?: string;
  brands: CategoryBrand[];
  subCategoryIcons: Record<string, LucideIcon>;
};

const tecnoIcons: Record<string, LucideIcon> = {
  Celulares: Smartphone,
  Auriculares: Headphones,
  Smartwatches: Watch,
  Cámaras: Camera,
  Cargadores: BatteryCharging,
  Tablets: Tablet,
};

const deportesIcons: Record<string, LucideIcon> = {
  Pelotas: Volleyball,
  Guantes: Hand,
  Camisetas: Shirt,
  Raquetas: Activity,
  Bolsos: ShoppingBag,
  Botines: Footprints,
};

const indumentariaIcons: Record<string, LucideIcon> = {
  Mujeres: Heart,
  Hombres: User,
  "Niños": Baby,
  "Talles especiales": Ruler,
};

const bellezaIcons: Record<string, LucideIcon> = {
  Skincare: Droplets,
  Maquillaje: Palette,
  Cabello: Scissors,
  Uñas: Sparkles,
  Perfumes: Flower,
  Depilación: Zap,
};

const bebesIcons: Record<string, LucideIcon> = {
  Baberos: Baby,
  "Conjuntos de ropa": Shirt,
  Pañales: Package,
  Mamaderas: Milk,
  Chupetes: CircleDot,
};

const computacionIcons: Record<string, LucideIcon> = {
  Notebooks: Laptop,
  Teclados: Keyboard,
  Mouse: Mouse,
  "Auriculares gamer": Headset,
  "Micrófonos gamer": Mic,
  Pendrives: HardDrive,
};

const mascotasIcons: Record<string, LucideIcon> = {
  "Ropa para mascotas": Shirt,
  "Ropa para profesionales": Shirt,
  "Alimento para perros": Bone,
  "Alimento para gatos": Fish,
  "Correas y collares": Link,
  Juguetes: ToyBrick,
  "Bolsos transportadores": ShoppingBag,
};

const librosIcons: Record<string, LucideIcon> = {
  "Desarrollo personal": BookOpen,
  Autoayuda: HeartPulse,
  "Negocios y finanzas": Briefcase,
  "Marketing y ventas": Megaphone,
  "Salud y bienestar": Activity,
  Infantiles: Baby,
};

const juguetesIcons: Record<string, LucideIcon> = {
  Peluches: Heart,
  "Figuras de acción": Gamepad2,
  Muñecas: Baby,
  "Juegos de mesa": Dices,
  "Juegos de cartas": Diamond,
  "Tablets infantiles": Tablet,
};

const libreriaIcons: Record<string, LucideIcon> = {
  Lápices: Pencil,
  Marcadores: Highlighter,
  Agendas: NotebookPen,
  Mochilas: Backpack,
  Cartucheras: Pen,
  Carpetas: FolderOpen,
};

const cotillonIcons: Record<string, LucideIcon> = {
  Globos: Balloon,
  "Decoración para tortas": Cake,
  Disfraces: PartyPopper,
  "Maquillaje artístico": Palette,
  Piñatas: Gift,
  "Moldes para tortas": CookingPot,
};

const lenceriaIcons: Record<string, LucideIcon> = {
  "Conjuntos básicos": Shirt,
  "Conjuntos sensuales": Heart,
  "Pijamas de invierno": Moon,
  "Pijamas de verano": Sun,
  Pantuflas: Footprints,
  "Pijamas de niños": Baby,
};

const limpiezaIcons: Record<string, LucideIcon> = {
  Desinfectantes: SprayCan,
  Quitamanchas: Droplets,
  Aromatizantes: Flower,
  "Alcohol en gel": Hand,
  Detergentes: Waves,
  Sahumerios: Wind,
};

const calzadosIcons: Record<string, LucideIcon> = {
  Femenino: Heart,
  Masculino: User,
  "Niños": Baby,
  Deportivos: Footprints,
  Especiales: Ruler,
  Accesorios: Gem,
};

const alimentosIcons: Record<string, LucideIcon> = {
  Caramelos: Candy,
  Chocolates: Cookie,
  Alfajores: IceCream,
  "Productos sin TACC": Wheat,
  "Golosinas importadas": ShoppingBag,
  Almacén: Package,
};

const decoBazarIcons: Record<string, LucideIcon> = {
  Cuadros: Image,
  Adornos: Sparkles,
  "Utensilios de cocina": Utensils,
  "Sets de vajilla": Soup,
  Sartenes: CookingPot,
  Iluminación: Lightbulb,
};

const accesoriosIcons: Record<string, LucideIcon> = {
  Carteras: Handbag,
  Billeteras: Wallet,
  Mochilas: Backpack,
  Bolsos: ShoppingBag,
  Bijouterie: Gem,
  Joyería: Crown,
};

const suplementosIcons: Record<string, LucideIcon> = {
  Proteínas: Dumbbell,
  Creatina: Zap,
  Multivitamínicos: Pill,
  "Vitamina C": Citrus,
  Magnesio: Sparkles,
  "Omega 3": Fish,
};

const videojuegosIcons: Record<string, LucideIcon> = {
  Consolas: Gamepad2,
  "Juegos PlayStation": Joystick,
  "Juegos Xbox": Cpu,
  PS5: Monitor,
  "Auriculares gamer": Headset,
  "Teclados gamer": Keyboard,
};

const textilesIcons: Record<string, LucideIcon> = {
  "Juegos de sábanas": Bed,
  Acolchados: Snowflake,
  Almohadones: Armchair,
  Toallones: ShowerHead,
  "Juegos de toallas": Bath,
  Manteles: Sofa,
};

const categoryConfigs: Record<string, CategoryConfig> = {
  tecno: {
    font: displayFont,
    accent: "from-sky-500 to-indigo-600",
    description:
      "Celulares, tablets, audio y dispositivos para vivir conectado.",
    brands: [
      { name: "Samsung", accent: "from-sky-300 to-blue-600" },
      { name: "Apple", accent: "from-slate-200 to-slate-500" },
      { name: "Xiaomi", accent: "from-orange-300 to-orange-600" },
      { name: "Motorola", accent: "from-emerald-300 to-teal-600" },
    ],
    subCategoryIcons: tecnoIcons,
  },
  deportes: {
    font: displayFont,
    accent: "from-emerald-400 to-teal-700",
    description: "Indumentaria, pelotas y accesorios para entrenar y competir.",
    brands: [
      { name: "Nike", accent: "from-orange-300 to-orange-600" },
      { name: "Adidas", accent: "from-cyan-300 to-teal-600" },
      { name: "Puma", accent: "from-red-300 to-rose-600" },
      { name: "Under Armour", accent: "from-slate-300 to-slate-600" },
    ],
    subCategoryIcons: deportesIcons,
  },
  indumentaria: {
    font: scriptFont,
    accent: "from-pink-400 to-rose-700",
    description: "Ropa y talles para todos los estilos y edades.",
    brands: [
      { name: "Levi's", accent: "from-blue-300 to-blue-600" },
      { name: "Zara", accent: "from-slate-200 to-slate-500" },
      { name: "H&M", accent: "from-red-300 to-red-600" },
      { name: "Diesel", accent: "from-amber-300 to-amber-600" },
    ],
    subCategoryIcons: indumentariaIcons,
  },
  belleza: {
    font: scriptFont,
    accent: "from-fuchsia-400 to-purple-700",
    description: "Skincare, maquillaje y cuidado personal para tu rutina.",
    brands: [
      { name: "Maybelline", accent: "from-pink-300 to-pink-600" },
      { name: "L'Oreal", accent: "from-amber-300 to-amber-600" },
      { name: "Nivea", accent: "from-sky-300 to-blue-600" },
      { name: "Natura", accent: "from-orange-300 to-orange-600" },
    ],
    subCategoryIcons: bellezaIcons,
  },
  bebes: {
    font: scriptFont,
    accent: "from-cyan-300 to-sky-700",
    description: "Todo para los mas chiquitos: ropa, higiene y accesorios.",
    brands: [
      { name: "Pampers", accent: "from-sky-300 to-blue-600" },
      { name: "Babysec", accent: "from-emerald-300 to-teal-600" },
      { name: "Johnson's", accent: "from-pink-300 to-rose-600" },
      { name: "Nuk", accent: "from-amber-300 to-orange-600" },
    ],
    subCategoryIcons: bebesIcons,
  },
  computacion: {
    font: displayFont,
    accent: "from-indigo-500 to-violet-700",
    description: "Notebooks, perifericos y accesorios para tu escritorio.",
    brands: [
      { name: "Lenovo", accent: "from-red-300 to-red-600" },
      { name: "HP", accent: "from-sky-300 to-blue-600" },
      { name: "Logitech", accent: "from-slate-200 to-slate-600" },
      { name: "Razer", accent: "from-emerald-300 to-green-600" },
    ],
    subCategoryIcons: computacionIcons,
  },
  mascotas: {
    font: scriptFont,
    accent: "from-amber-400 to-orange-700",
    description: "Alimento, accesorios y juguetes para tu mejor amigo.",
    brands: [
      { name: "Pedigree", accent: "from-orange-300 to-orange-600" },
      { name: "Royal Canin", accent: "from-red-300 to-rose-600" },
      { name: "Purina", accent: "from-amber-300 to-amber-600" },
      { name: "Pro Plan", accent: "from-sky-300 to-blue-600" },
      { name: "RPM", accent: "from-violet-300 to-indigo-600" },
    ],
    subCategoryIcons: mascotasIcons,
  },
  libros: {
    font: displayFont,
    accent: "from-rose-500 to-red-700",
    description: "Lecturas para crecer, aprender y disfrutar.",
    brands: [
      { name: "Planeta", accent: "from-blue-300 to-blue-600" },
      { name: "Penguin", accent: "from-slate-300 to-slate-600" },
      { name: "Sudamericana", accent: "from-emerald-300 to-teal-600" },
      { name: "El Ateneo", accent: "from-amber-300 to-amber-600" },
    ],
    subCategoryIcons: librosIcons,
  },
  juguetes: {
    font: displayFont,
    accent: "from-pink-500 to-fuchsia-700",
    description: "Juegos y juguetes para grandes y chicos.",
    brands: [
      { name: "Mattel", accent: "from-red-300 to-red-600" },
      { name: "Hasbro", accent: "from-blue-300 to-blue-600" },
      { name: "LEGO", accent: "from-red-300 to-red-600" },
      { name: "Fisher-Price", accent: "from-emerald-300 to-teal-600" },
    ],
    subCategoryIcons: juguetesIcons,
  },
  jardineria: {
    font: displayFont,
    accent: "from-green-400 to-emerald-700",
    description: "Plantas, herramientas y todo para tu jardin.",
    brands: [
      { name: "Philips", accent: "from-sky-300 to-blue-600" },
      { name: "Black+Decker", accent: "from-amber-300 to-orange-600" },
      { name: "Stanley", accent: "from-yellow-300 to-yellow-700" },
      { name: "Bosch", accent: "from-red-300 to-red-600" },
    ],
    subCategoryIcons: {},
  },
  libreria: {
    font: displayFont,
    accent: "from-amber-400 to-yellow-700",
    description: "Escritura, mochilas y utiles para la escuela y la oficina.",
    brands: [
      { name: "Faber-Castell", accent: "from-green-300 to-green-600" },
      { name: "Bic", accent: "from-orange-300 to-orange-600" },
      { name: "Pelikan", accent: "from-blue-300 to-blue-600" },
      { name: "Maped", accent: "from-rose-300 to-rose-600" },
    ],
    subCategoryIcons: libreriaIcons,
  },
  cotillon: {
    font: displayFont,
    accent: "from-fuchsia-500 to-pink-700",
    description: "Globos, decoracion y accesorios para tus fiestas.",
    brands: [
      { name: "Globos Fiesta", accent: "from-pink-300 to-rose-600" },
      { name: "Cotillón Total", accent: "from-fuchsia-300 to-purple-600" },
      { name: "Pica Party", accent: "from-cyan-300 to-sky-600" },
      { name: "Happy Day", accent: "from-amber-300 to-amber-600" },
    ],
    subCategoryIcons: cotillonIcons,
  },
  lenceria: {
    font: scriptFont,
    accent: "from-rose-400 to-pink-700",
    description: "Conjuntos, pijamas y comodidad para todos los dias.",
    brands: [
      { name: "Intimissimi", accent: "from-rose-300 to-rose-600" },
      { name: "Victoria's Secret", accent: "from-pink-300 to-pink-600" },
      { name: "Honey Birdette", accent: "from-fuchsia-300 to-purple-600" },
    ],
    subCategoryIcons: lenceriaIcons,
  },
  limpieza: {
    font: displayFont,
    accent: "from-cyan-400 to-sky-700",
    description: "Productos para mantener tu hogar impecable.",
    brands: [
      { name: "Cif", accent: "from-cyan-300 to-cyan-600" },
      { name: "Ayudin", accent: "from-green-300 to-green-600" },
      { name: "Mr. Musculo", accent: "from-amber-300 to-orange-600" },
      { name: "Ala", accent: "from-blue-300 to-blue-600" },
    ],
    subCategoryIcons: limpiezaIcons,
  },
  calzados: {
    font: displayFont,
    accent: "from-orange-400 to-red-700",
    description: "Zapatillas y calzado para cada ocasion.",
    brands: [
      { name: "Nike", accent: "from-orange-300 to-orange-600" },
      { name: "Adidas", accent: "from-cyan-300 to-teal-600" },
      { name: "Vans", accent: "from-slate-300 to-slate-600" },
      { name: "Converse", accent: "from-red-300 to-red-600" },
    ],
    subCategoryIcons: calzadosIcons,
  },
  alimentos: {
    font: displayFont,
    accent: "from-amber-400 to-red-600",
    description: "Golosinas, chocolates y productos para compartir.",
    brands: [
      { name: "Arcor", accent: "from-red-300 to-red-600" },
      { name: "Mondelez", accent: "from-amber-300 to-amber-600" },
      { name: "Cadbury", accent: "from-purple-300 to-purple-600" },
      { name: "Georgalos", accent: "from-blue-300 to-blue-600" },
    ],
    subCategoryIcons: alimentosIcons,
  },
  decobazar: {
    font: displayFont,
    accent: "from-amber-300 to-amber-700",
    description: "Decoracion, cocina y detalles para tu hogar.",
    brands: [
      { name: "Tramontina", accent: "from-slate-300 to-slate-600" },
      { name: "Bergner", accent: "from-rose-300 to-rose-600" },
      { name: "San Lorenzo", accent: "from-sky-300 to-blue-600" },
      { name: "Sammic", accent: "from-emerald-300 to-teal-600" },
    ],
    subCategoryIcons: decoBazarIcons,
  },
  accesorios: {
    font: displayFont,
    accent: "from-amber-400 to-orange-700",
    description: "Carteras, mochilas y complementos para sumar estilo.",
    brands: [
      { name: "Coach", accent: "from-amber-300 to-amber-600" },
      { name: "Guess", accent: "from-slate-300 to-slate-600" },
      { name: "Swarovski", accent: "from-cyan-300 to-blue-600" },
      { name: "Furla", accent: "from-pink-300 to-rose-600" },
    ],
    subCategoryIcons: accesoriosIcons,
  },
  suplementos: {
    font: displayFont,
    accent: "from-lime-400 to-green-700",
    description: "Proteinas, vitaminas y suplementos para tu rendimiento.",
    brands: [
      { name: "ENA", accent: "from-emerald-300 to-emerald-600" },
      { name: "Star Nutrition", accent: "from-lime-300 to-lime-600" },
      { name: "Gentech", accent: "from-blue-300 to-blue-600" },
      { name: "Procell", accent: "from-orange-300 to-orange-600" },
    ],
    subCategoryIcons: suplementosIcons,
  },
  gimnasio: {
    font: displayFont,
    accent: "from-slate-500 to-slate-800",
    description: "Equipamiento y accesorios para entrenar en casa.",
    brands: [
      { name: "Under Armour", accent: "from-slate-300 to-slate-600" },
      { name: "Nike", accent: "from-orange-300 to-orange-600" },
      { name: "Reebok", accent: "from-red-300 to-red-600" },
      { name: "Adidas", accent: "from-cyan-300 to-teal-600" },
    ],
    subCategoryIcons: {},
  },
  videojuegos: {
    font: displayFont,
    accent: "from-violet-500 to-indigo-700",
    description: "Consolas, juegos y perifericos para gamers.",
    brands: [
      { name: "PlayStation", accent: "from-blue-300 to-blue-600" },
      { name: "Xbox", accent: "from-emerald-300 to-green-600" },
      { name: "Nintendo", accent: "from-red-300 to-red-600" },
      { name: "Sony", accent: "from-slate-300 to-slate-600" },
    ],
    subCategoryIcons: videojuegosIcons,
  },
  textiles: {
    font: displayFont,
    accent: "from-purple-400 to-indigo-700",
    description: "Ropa de cama, toallas y textiles para tu casa.",
    brands: [
      { name: "Arredo", accent: "from-purple-300 to-indigo-600" },
      { name: "Dohop", accent: "from-cyan-300 to-sky-600" },
      { name: "Saccardi", accent: "from-rose-300 to-rose-600" },
      { name: "Calvin Klein Home", accent: "from-slate-300 to-slate-600" },
    ],
    subCategoryIcons: textilesIcons,
  },
};

const DEFAULT_CATEGORY_CONFIG: CategoryConfig = {
  font: displayFont,
  accent: "from-slate-400 to-slate-700",
  description: "Explora los productos de esta categoria.",
  brands: [],
  subCategoryIcons: {},
};

const categoryAliases: Record<string, string> = {
  calzado: "calzados",
};

export function getCategoryConfig(categoryName: string): CategoryConfig {
  const normalized = normalizeName(categoryName);
  const key = categoryAliases[normalized] ?? normalized;

  return categoryConfigs[key] ?? DEFAULT_CATEGORY_CONFIG;
}

export function getCuratedSubCategories(
  categoryName: string
): Array<{ name: string; icon: LucideIcon }> {
  const config = getCategoryConfig(categoryName);

  return Object.entries(config.subCategoryIcons).map(([name, icon]) => ({
    name,
    icon,
  }));
}

export function getSubCategoryIcon(
  categoryName: string,
  subCategoryName: string
): LucideIcon {
  const config = getCategoryConfig(categoryName);
  const icon = config.subCategoryIcons[subCategoryName];

  return icon ?? Tag;
}

export function getSubCategoryDisplayName(
  normalizedSubCategoryName: string
): string {
  if (!normalizedSubCategoryName) return "";

  for (const config of Object.values(categoryConfigs)) {
    for (const name of Object.keys(config.subCategoryIcons)) {
      if (normalizeName(name) === normalizedSubCategoryName) return name;
    }
  }

  return normalizedSubCategoryName;
}
