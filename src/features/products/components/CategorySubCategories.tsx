import {
  getCuratedSubCategories,
  normalizeName,
} from "../categoryConfig";

type CategorySubCategoriesProps = {
  categoryName: string;
  selectedSubCategoryName: string;
  onSelect: (subCategoryName: string) => void;
};

const subCategoryImages: Record<string, Record<string, string>> = {
  tecno: {
    celulares: "/subcategories/tecno/celulares.png",
    auriculares: "/subcategories/tecno/auriculares.png",
    smartwatches: "/subcategories/tecno/smartwatches.png",
    camaras: "/subcategories/tecno/camaras.png",
    cargadores: "/subcategories/tecno/cargadores.png",
    tablets: "/subcategories/tecno/tablets.png",
  },
  mascotas: {
    ropaparamascotas: "/subcategories/mascotas/ropa-para-mascotas.png",
    ropaparaprofesionales:
      "/subcategories/mascotas/ropa-para-profesionales.png",
    alimentoparaperros:
      "/subcategories/mascotas/alimento-para-perros.png",
    alimentoparagatos:
      "/subcategories/mascotas/alimento-para-gatos.png",
    correasycollares:
      "/subcategories/mascotas/correas-y-collares.png",
    juguetes: "/subcategories/mascotas/juguetes.png",
    bolsostransportadores:
      "/subcategories/mascotas/bolsos-transportadores.png",
  },
};

const subCategorySheets: Record<string, string> = {
  deportes: "/subcategories/deportes/sheet.png",
  indumentaria: "/subcategories/indumentaria/sheet.png",
  belleza: "/subcategories/belleza/sheet.png",
  bebes: "/subcategories/bebes/sheet.png",
  computacion: "/subcategories/computacion/sheet.png",
  libros: "/subcategories/libros/sheet.png",
  juguetes: "/subcategories/juguetes/sheet.png",
  libreria: "/subcategories/libreria/sheet.png",
  cotillon: "/subcategories/cotillon/sheet.png",
  lenceria: "/subcategories/lenceria/sheet.png",
  limpieza: "/subcategories/limpieza/sheet.png",
  calzados: "/subcategories/calzados/sheet.png",
  calzado: "/subcategories/calzados/sheet.png",
  alimentos: "/subcategories/alimentos/sheet.png",
  decobazar: "/subcategories/decobazar/sheet.png",
  accesorios: "/subcategories/accesorios/sheet.png",
  suplementos: "/subcategories/suplementos/sheet.png",
  videojuegos: "/subcategories/videojuegos/sheet.png",
  textiles: "/subcategories/textiles/sheet.png",
};

function CategorySubCategories({
  categoryName,
  selectedSubCategoryName,
  onSelect,
}: CategorySubCategoriesProps) {
  const subCategories = getCuratedSubCategories(categoryName);
  const normalizedCategoryName = normalizeName(categoryName);

  if (subCategories.length === 0) return null;

  return (
    <section
      aria-label="Subcategorias"
      className="rounded-[28px] border border-white/50 bg-[var(--category-panel,rgba(255,255,255,0.52))] px-4 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)] backdrop-blur-sm sm:px-6"
    >
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-4 pb-2 sm:gap-x-5 sm:gap-y-5">
        {subCategories.map((subCategory, index) => {
          const normalizedName = normalizeName(subCategory.name);
          const Icon = subCategory.icon;
          const isActive = selectedSubCategoryName === normalizedName;
          const imageUrl =
            subCategoryImages[normalizedCategoryName]?.[normalizedName];
          const sheetUrl = subCategorySheets[normalizedCategoryName];
          const sheetPosition = `${(index % 3) * 50}% ${Math.floor(index / 3) * 100}%`;

          return (
            <button
              key={normalizedName}
              type="button"
              onClick={() => onSelect(isActive ? "" : normalizedName)}
              className="group flex w-24 shrink-0 flex-col items-center gap-2 sm:w-28"
              title={subCategory.name}
            >
              <span
                className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 bg-white shadow-[0_10px_28px_rgba(18,60,105,0.10)] transition group-hover:-translate-y-1 sm:h-20 sm:w-20 ${
                  isActive
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                    : "border-slate-100 text-slate-500 group-hover:border-[var(--brand-border)] group-hover:text-[var(--brand)]"
                }`}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-contain p-1"
                    loading="lazy"
                  />
                ) : sheetUrl ? (
                  <span
                    aria-hidden="true"
                    className="h-full w-full bg-white bg-no-repeat"
                    style={{
                      backgroundImage: `url(${sheetUrl})`,
                      backgroundPosition: sheetPosition,
                      backgroundSize: "300% 200%",
                    }}
                  />
                ) : (
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
                )}
              </span>
              <span
                className={`line-clamp-2 text-center text-xs font-bold leading-4 sm:text-sm ${
                  isActive
                    ? "text-[var(--brand-hover)]"
                    : "text-[var(--category-muted,#475569)]"
                }`}
              >
                {subCategory.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CategorySubCategories;
