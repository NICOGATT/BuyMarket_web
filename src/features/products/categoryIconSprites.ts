import { normalizeName } from "./categoryConfig";

type IconPosition = {
  left: number;
  top: number;
};

export type CategoryIconSprite = IconPosition & {
  imageUrl: string;
  backgroundSize: string;
};

const categoryAliases: Record<string, string> = {
  calzado: "calzados",
};

const primaryIconPositions: Record<string, IconPosition> = {
  accesorios: { left: 0, top: 0 },
  alimentos: { left: -100, top: 0 },
  bebes: { left: -200, top: 0 },
  belleza: { left: -300, top: 0 },
  calzados: { left: -400, top: 0 },
  computacion: { left: 0, top: -100 },
  cotillon: { left: -100, top: -100 },
  decobazar: { left: -200, top: -100 },
  deportes: { left: -300, top: -100 },
  gimnasio: { left: -400, top: -100 },
};

const secondaryIconPositions: Record<string, IconPosition> = {
  indumentaria: { left: 0, top: 0 },
  jardineria: { left: -100, top: 0 },
  juguetes: { left: -200, top: 0 },
  lenceria: { left: -300, top: 0 },
  libreria: { left: -400, top: 0 },
  libros: { left: 0, top: -100 },
  limpieza: { left: -100, top: -100 },
  mascotas: { left: -200, top: -100 },
  suplementos: { left: -300, top: -100 },
  tecno: { left: -400, top: -100 },
  textiles: { left: 0, top: -200 },
  videojuegos: { left: -100, top: -200 },
};

export function getCategoryIconKey(categoryName: string) {
  const normalizedName = normalizeName(categoryName);
  return categoryAliases[normalizedName] ?? normalizedName;
}

export function getCategoryIconSprite(
  categoryName: string
): CategoryIconSprite | undefined {
  const categoryKey = getCategoryIconKey(categoryName);
  const primaryPosition = primaryIconPositions[categoryKey];

  if (primaryPosition) {
    return {
      ...primaryPosition,
      imageUrl: "/categories/category-icons-white.png",
      backgroundSize: "500px 200px",
    };
  }

  const secondaryPosition = secondaryIconPositions[categoryKey];

  if (!secondaryPosition) return undefined;

  return {
    ...secondaryPosition,
    imageUrl: "/categories/category-icons-secondary-white.png",
    backgroundSize: "500px 300px",
  };
}
