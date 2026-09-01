import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getCuratedSubCategories,
  getSubCategoryDisplayName,
  normalizeName,
} from "../features/products/categoryConfig";
import CategoryHero from "../features/products/components/CategoryHero";
import CategoryList from "../features/products/components/CategoryList";
import CategorySubCategoryFooter from "../features/products/components/CategorySubCategoryFooter";
import CategorySubCategories from "../features/products/components/CategorySubCategories";
import ProductCardSkeleton from "../features/products/components/ProductCardSkeleton";
import ProductFilters, {
  type AttributeFilterOption,
  type ColorFilterOption,
} from "../features/products/components/ProductFilters";
import ProductGrid from "../features/products/components/ProductGrid";
import EmptyProducts from "../shared/components/EmptyProducts";
import { getCategories } from "../shared/services/category.service";
import {
  getFeaturedProducts,
  getProducts,
} from "../shared/services/product.service";
import { getSubCategoriesByCategory } from "../shared/services/subcategory.service";
import type { Category } from "../shared/types/Category";
import type { Product } from "../shared/types/Product";
import type { SubCategory } from "../shared/types/SubCategory";
import { getProductCategoryId } from "../shared/utils/productCategories";

const categoryPageThemes: Record<
  string,
  { background: string; title: string; muted: string; panel: string }
> = {
  mascotas: {
    background:
      "linear-gradient(180deg,#ffc68f 0%,#ffd3a6 22%,#ffe0bd 44%,#ffecd6 68%,#fff6eb 86%,#fffaf4 100%)",
    title: "#3f2a1d",
    muted: "#7a5438",
    panel: "rgba(255,255,255,0.58)",
  },
  tecno: {
    background:
      "linear-gradient(180deg,#83baf8 0%,#9dccf9 22%,#b9ddfa 44%,#d2eafb 66%,#e9f6ff 84%,#f7fbff 100%)",
    title: "#082f49",
    muted: "#155e75",
    panel: "rgba(255,255,255,0.60)",
  },
  indumentaria: {
    background:
      "linear-gradient(180deg,#c9b6ef 0%,#d4c5f3 22%,#dfd5f7 44%,#e9e2fa 66%,#f3effd 84%,#faf8ff 100%)",
    title: "#39206d",
    muted: "#67508d",
    panel: "rgba(255,255,255,0.58)",
  },
  computacion: {
    background:
      "linear-gradient(180deg,#10295c 0%,#15356d 22%,#1a417d 44%,#214c89 66%,#2b5895 84%,#3564a0 100%)",
    title: "#ffffff",
    muted: "#bfdbfe",
    panel: "rgba(255,255,255,0.08)",
  },
  calzados: {
    background:
      "linear-gradient(180deg,#dddddd 0%,#e5e5e5 22%,#ebebeb 44%,#f1f1f1 66%,#f7f7f7 84%,#fcfcfc 100%)",
    title: "#171717",
    muted: "#525252",
    panel: "rgba(255,255,255,0.62)",
  },
  calzado: {
    background:
      "linear-gradient(180deg,#dddddd 0%,#e5e5e5 22%,#ebebeb 44%,#f1f1f1 66%,#f7f7f7 84%,#fcfcfc 100%)",
    title: "#171717",
    muted: "#525252",
    panel: "rgba(255,255,255,0.62)",
  },
  decobazar: {
    background:
      "linear-gradient(180deg,#f7d9dc 0%,#f9e1df 22%,#fbe9e5 44%,#fcf0ec 66%,#fdf7f4 84%,#fffdfb 100%)",
    title: "#55306f",
    muted: "#765e82",
    panel: "rgba(255,255,255,0.56)",
  },
  belleza: {
    background:
      "linear-gradient(180deg,#eed0ca 0%,#f1d8d3 22%,#f4e0dc 44%,#f7e9e5 66%,#faf2ef 84%,#fdf9f7 100%)",
    title: "#754240",
    muted: "#986865",
    panel: "rgba(255,255,255,0.58)",
  },
  alimentos: {
    background:
      "linear-gradient(180deg,#f8e8c8 0%,#faecd1 22%,#fbf0db 44%,#fcf4e5 66%,#fdf8ef 84%,#fffdf8 100%)",
    title: "#5a4334",
    muted: "#806650",
    panel: "rgba(255,255,255,0.58)",
  },
  accesorios: {
    background:
      "linear-gradient(180deg,#eaded2 0%,#eee4da 22%,#f2eae2 44%,#f6f0ea 66%,#faf6f2 84%,#fdfbf8 100%)",
    title: "#875d48",
    muted: "#6f6b66",
    panel: "rgba(255,255,255,0.58)",
  },
  bebes: {
    background:
      "linear-gradient(180deg,#d8eeee 0%,#e0f1f0 22%,#e7f3f2 44%,#edf6f4 66%,#f5f9f6 84%,#fbfaf6 100%)",
    title: "#267f86",
    muted: "#4d7781",
    panel: "rgba(255,255,255,0.60)",
  },
  cotillon: {
    background:
      "linear-gradient(180deg,#f8d2ca 0%,#f9dcd5 22%,#fae5df 44%,#fbece7 66%,#fdf4ef 84%,#fffaf6 100%)",
    title: "#71379b",
    muted: "#80638f",
    panel: "rgba(255,255,255,0.58)",
  },
  deportes: {
    background:
      "linear-gradient(180deg,#d4e7dc 0%,#dcebe1 22%,#e3efe7 44%,#eaf3ed 66%,#f2f7f3 84%,#fafcf9 100%)",
    title: "#0a3b66",
    muted: "#416b75",
    panel: "rgba(255,255,255,0.62)",
  },
  gimnasio: {
    background:
      "linear-gradient(180deg,#0b170b 0%,#102311 22%,#172f17 44%,#1d3b1d 66%,#264826 84%,#305630 100%)",
    title: "#ffffff",
    muted: "#d9f99d",
    panel: "rgba(255,255,255,0.08)",
  },
  jardineria: {
    background:
      "linear-gradient(180deg,#a7b66d 0%,#b7c17f 22%,#c7cc94 44%,#d8d8aa 66%,#e9e7ca 84%,#faf8ed 100%)",
    title: "#244c21",
    muted: "#58734a",
    panel: "rgba(255,255,255,0.58)",
  },
  juguetes: {
    background:
      "linear-gradient(180deg,#f7dcca 0%,#f9e2d3 22%,#fae8dc 44%,#fbeee5 66%,#fcf4ed 84%,#fdfaf6 100%)",
    title: "#173b68",
    muted: "#536b87",
    panel: "rgba(255,255,255,0.60)",
  },
  jugueteria: {
    background:
      "linear-gradient(180deg,#f7dcca 0%,#f9e2d3 22%,#fae8dc 44%,#fbeee5 66%,#fcf4ed 84%,#fdfaf6 100%)",
    title: "#173b68",
    muted: "#536b87",
    panel: "rgba(255,255,255,0.60)",
  },
  textiles: {
    background:
      "linear-gradient(180deg,#eadbd7 0%,#ede2de 22%,#f0e8e4 44%,#f4eeeb 66%,#f8f5f1 84%,#fcfaf7 100%)",
    title: "#0d4b5b",
    muted: "#6f7478",
    panel: "rgba(255,255,255,0.60)",
  },
  lenceria: {
    background:
      "linear-gradient(180deg,#dfd2c5 0%,#e5dacf 22%,#eae2d9 44%,#f0e9e2 66%,#f5f0eb 84%,#faf7f3 100%)",
    title: "#241b17",
    muted: "#75675e",
    panel: "rgba(255,255,255,0.58)",
  },
  libreria: {
    background:
      "linear-gradient(180deg,#f9dca2 0%,#fae3b3 22%,#fbe9c4 44%,#fcf0d5 66%,#fdf6e6 84%,#fffaf2 100%)",
    title: "#083d63",
    muted: "#507084",
    panel: "rgba(255,255,255,0.60)",
  },
  limpieza: {
    background:
      "linear-gradient(180deg,#c7eaf1 0%,#d2edf3 22%,#ddf1f5 44%,#e7f5f7 66%,#f1f9f9 84%,#fbfdfc 100%)",
    title: "#0b5271",
    muted: "#527b89",
    panel: "rgba(255,255,255,0.60)",
  },
  videojuegos: {
    background:
      "linear-gradient(180deg,#151039 0%,#20164a 22%,#2b1d5b 44%,#36256c 66%,#432f7d 84%,#50398c 100%)",
    title: "#ffffff",
    muted: "#ddd6fe",
    panel: "rgba(255,255,255,0.08)",
  },
  libros: {
    background:
      "linear-gradient(180deg,#a96f43 0%,#bb8154 22%,#cc9769 44%,#dcaf82 66%,#edcda4 84%,#f8ead4 100%)",
    title: "#172d3c",
    muted: "#76563a",
    panel: "rgba(255,255,255,0.52)",
  },
  suplementos: {
    background:
      "linear-gradient(180deg,#cfe2bd 0%,#d6e6c8 22%,#deead3 44%,#e7efdf 66%,#f0f5ea 84%,#fafcf5 100%)",
    title: "#165d58",
    muted: "#55766f",
    panel: "rgba(255,255,255,0.60)",
  },
};

function getProductSubCategoryName(product: Product) {
  return normalizeName(
    product.subCategory?.name ?? product.subcategory?.name ?? ""
  );
}

function getEmptyMessage(
  hasSearch: boolean,
  hasCategory: boolean,
  hasSubCategory: boolean,
  brand: string
) {
  if (hasSubCategory) return "No hay productos para esta subcategoria.";
  if (brand) return `No se encontraron productos de la marca ${brand}.`;
  if (hasCategory) return "No hay productos para esta categoria.";
  if (hasSearch) return "No encontramos productos con esa busqueda.";
  return "Todavia no hay productos publicados.";
}

function getProductAttributeMap(product: Product) {
  const map = new Map<string, Set<string>>();

  function push(name?: string, value?: string) {
    if (!name) return;
    const key = name.trim();
    const itemValue = value == null ? "" : String(value).trim();

    if (!key || !itemValue || itemValue === "true" || itemValue === "false") {
      return;
    }

    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(itemValue);
  }

  const attributes =
    product.attributes ??
    product.attributeValues ??
    product.productAttributes ??
    product.productAttributeValues ??
    [];

  for (const attribute of attributes) {
    push(
      attribute.attribute?.name ??
        attribute.subCategoryAttribute?.name ??
        attribute.name,
      attribute.value
    );
  }

  for (const variant of product.variants ?? []) {
    for (const attribute of variant.attributes ?? []) {
      push(
        attribute.attribute?.name ??
          attribute.subCategoryAttribute?.name ??
          attribute.name,
        attribute.value
      );
    }
  }

  return map;
}

function productMatchesBrand(product: Product, normalizedBrand: string) {
  if (!normalizedBrand) return true;

  const attributeMap = getProductAttributeMap(product);

  for (const [name, values] of attributeMap) {
    if (normalizeName(name) !== "marca") continue;

    for (const value of values) {
      if (normalizeName(value) === normalizedBrand) return true;
    }
  }

  const seller = product.seller ?? product.owner ?? product.user;

  if (seller) {
    const sellerText =
      typeof seller === "string"
        ? seller
        : `${seller.name ?? ""} ${seller.firstName ?? ""} ${
            seller.lastName ?? ""
          } ${seller.email ?? ""}`;

    if (normalizeName(sellerText).includes(normalizedBrand)) return true;
  }

  return normalizeName(`${product.title} ${product.description}`).includes(
    normalizedBrand
  );
}

function productMatchesVariantFilters(
  product: Product,
  colors: string[],
  sizes: string[]
) {
  const variants = product.variants ?? [];

  if (variants.length === 0) {
    return colors.length === 0 && sizes.length === 0;
  }

  return variants.some((variant) => {
    const variantColor = variant.color?.trim().toLowerCase();
    const matchesColor =
      colors.length === 0 ||
      Boolean(
        variantColor &&
          colors.some((color) => color.toLowerCase() === variantColor)
      );
    const matchesSize =
      sizes.length === 0 ||
      (variant.size ? sizes.includes(variant.size.trim()) : false);

    return matchesColor && matchesSize;
  });
}

function productMatchesAttributes(
  product: Product,
  attributes: Record<string, string[]>
) {
  const entries = Object.entries(attributes);

  if (entries.length === 0) return true;

  const productAttributes = getProductAttributeMap(product);

  return entries.every(([name, values]) => {
    const productValues = productAttributes.get(name);

    return Boolean(
      productValues && values.some((value) => productValues.has(value))
    );
  });
}

type ProductListingProps = {
  products: Product[];
  featuredProducts: Product[];
  categories: Category[];
  selectedCategoryId: string;
  selectedSubCategoryName: string;
  categoryName: string;
  search: string;
  brand: string;
  isLoading: boolean;
  error: string;
  withCategoryFilter: boolean;
  title: string;
  onUpdateFilters: (next: {
    category?: string;
    subCategory?: string;
  }) => void;
};

function ProductListing({
  products,
  featuredProducts,
  categories,
  selectedCategoryId,
  selectedSubCategoryName,
  categoryName,
  search,
  brand,
  isLoading,
  error,
  withCategoryFilter,
  title,
  onUpdateFilters,
}: ProductListingProps) {
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<Record<string, string[]>>({});
  const [visibleCount, setVisibleCount] = useState(8);

  const normalizedSearch = search.toLowerCase();
  const normalizedBrand = normalizeName(brand);

  const subCategoryOptions = useMemo(
    () => getCuratedSubCategories(categoryName),
    [categoryName]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = normalizedSearch
        ? `${product.title} ${product.description}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesCategory = selectedCategoryId
        ? getProductCategoryId(product) === selectedCategoryId
        : true;
      const matchesSubCategory = selectedSubCategoryName
        ? getProductSubCategoryName(product) === selectedSubCategoryName
        : true;
      const matchesBrand = productMatchesBrand(product, normalizedBrand);
      const matchesVariantFilters = productMatchesVariantFilters(
        product,
        colors,
        sizes
      );
      const matchesAttributes = productMatchesAttributes(product, attributes);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubCategory &&
        matchesBrand &&
        matchesVariantFilters &&
        matchesAttributes
      );
    });
  }, [
    normalizedSearch,
    normalizedBrand,
    products,
    selectedCategoryId,
    selectedSubCategoryName,
    colors,
    sizes,
    attributes,
  ]);

  const orderedProducts = useMemo(() => {
    const featuredIds = new Set(featuredProducts.map((product) => product.id));
    const featured = filteredProducts.filter((product) =>
      featuredIds.has(product.id)
    );
    const rest = filteredProducts.filter(
      (product) => !featuredIds.has(product.id)
    );

    return [...featured, ...rest];
  }, [filteredProducts, featuredProducts]);

  const filterOptions = useMemo(() => {
    const scope = selectedCategoryId
      ? products.filter(
          (product) => getProductCategoryId(product) === selectedCategoryId
        )
      : products;

    const colorMap = new Map<string, { label: string; swatch: string }>();
    const sizeSet = new Set<string>();
    const attributeMap = new Map<string, Set<string>>();

    for (const product of scope) {
      for (const variant of product.variants ?? []) {
        const color = variant.color?.trim();
        if (color) {
          const key = color.toLowerCase();
          if (!colorMap.has(key)) {
            colorMap.set(key, {
              label: color,
              swatch: variant.colorHex?.trim() || "#e2e8f0",
            });
          }
        }

        const size = variant.size?.trim();
        if (size) sizeSet.add(size);
      }

      for (const [name, values] of getProductAttributeMap(product)) {
        if (!attributeMap.has(name)) attributeMap.set(name, new Set());
        values.forEach((value) => attributeMap.get(name)!.add(value));
      }
    }

    const colorOptions: ColorFilterOption[] = Array.from(colorMap.values()).sort(
      (a, b) => a.label.localeCompare(b.label, "es")
    );
    const sizeOptions = Array.from(sizeSet).sort((a, b) =>
      a.localeCompare(b, "es", { numeric: true })
    );
    const attributeOptions: AttributeFilterOption[] = Array.from(
      attributeMap.entries()
    )
      .map(([name, values]) => ({
        name,
        values: Array.from(values).sort((a, b) => a.localeCompare(b, "es")),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));

    return { colorOptions, sizeOptions, attributeOptions };
  }, [products, selectedCategoryId]);

  const visibleProducts = orderedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < orderedProducts.length;

  function toggleListValue(list: string[], value: string) {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
  }

  function handleToggleColor(color: string) {
    setColors((current) => toggleListValue(current, color));
    setVisibleCount(8);
  }

  function handleToggleSize(size: string) {
    setSizes((current) => toggleListValue(current, size));
    setVisibleCount(8);
  }

  function handleToggleAttribute(name: string, value: string) {
    setAttributes((current) => {
      const currentValues = current[name] ?? [];
      const nextValues = toggleListValue(currentValues, value);
      const copy = { ...current };

      if (nextValues.length === 0) delete copy[name];
      else copy[name] = nextValues;

      return copy;
    });
    setVisibleCount(8);
  }

  function handleClearFilters() {
    setColors([]);
    setSizes([]);
    setAttributes({});
    setVisibleCount(8);
  }

  function renderProducts() {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <ProductCardSkeleton key={item} />
          ))}
        </div>
      );
    }

    if (error) {
      return <p className="font-semibold text-red-500">{error}</p>;
    }

    if (filteredProducts.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <EmptyProducts />
          <p className="mt-4 font-semibold text-slate-500">
            {getEmptyMessage(
              Boolean(search),
              Boolean(selectedCategoryId),
              Boolean(selectedSubCategoryName),
              brand
            )}
          </p>
        </div>
      );
    }

    return (
      <>
        <ProductGrid products={visibleProducts} />
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + 8)}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-black text-[var(--brand)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)]"
            >
              Ver mas productos
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-6 rounded-[30px] border border-white/50 bg-[var(--category-panel,transparent)] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="m-0 text-2xl font-black text-[var(--category-title,#020617)] sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 font-semibold text-[var(--category-muted,#64748b)]">
            {brand
              ? `${filteredProducts.length} producto${
                  filteredProducts.length === 1 ? "" : "s"
                } de ${brand}${categoryName ? ` en ${categoryName}` : ""}`
              : search
                ? `Resultados para "${search}"`
                : `${filteredProducts.length} producto${
                    filteredProducts.length === 1 ? "" : "s"
                  }${categoryName ? ` en ${categoryName}` : ""}`}
          </p>
        </div>

        <ProductFilters
          withCategoryFilter={withCategoryFilter}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(categoryId) =>
            onUpdateFilters({ category: categoryId })
          }
          subCategoryOptions={subCategoryOptions}
          selectedSubCategoryName={selectedSubCategoryName}
          onSelectSubCategory={(subCategoryName) =>
            onUpdateFilters({ subCategory: subCategoryName })
          }
          colorOptions={filterOptions.colorOptions}
          selectedColors={colors}
          onToggleColor={handleToggleColor}
          sizeOptions={filterOptions.sizeOptions}
          selectedSizes={sizes}
          onToggleSize={handleToggleSize}
          attributeOptions={filterOptions.attributeOptions}
          selectedAttributes={attributes}
          onToggleAttribute={handleToggleAttribute}
          onClearFilters={handleClearFilters}
        />
      </div>

      {renderProducts()}
    </div>
  );
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadedCategorySubCategories, setLoadedCategorySubCategories] =
    useState<{ categoryId: string; items: SubCategory[] }>({
      categoryId: "",
      items: [],
    });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const productsSectionRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef(false);

  const search = searchParams.get("search")?.trim() ?? "";
  const brand = searchParams.get("brand")?.trim() ?? "";
  const selectedCategoryId = searchParams.get("category") ?? "";
  const selectedSubCategoryName = normalizeName(
    searchParams.get("subCategory") ?? ""
  );
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );
  const categoryPageTheme = selectedCategory
    ? categoryPageThemes[normalizeName(selectedCategory.name)]
    : undefined;
  const showCategoryView = Boolean(selectedCategoryId);
  const showAllView =
    searchParams.get("view") === "all" ||
    Boolean(search) ||
    Boolean(brand) ||
    Boolean(selectedSubCategoryName);

  const selectedSubCategoryDisplayName =
    getSubCategoryDisplayName(selectedSubCategoryName);
  const selectedCategorySubCategories = useMemo(
    () => {
      const uniqueSubCategories = new Map<
        string,
        { id?: string; name: string }
      >();
      const remoteSubCategories =
        loadedCategorySubCategories.categoryId === selectedCategoryId
          ? loadedCategorySubCategories.items
          : [];
      const availableSubCategories =
        remoteSubCategories.length > 0
          ? remoteSubCategories
          : products
              .filter(
                (product) =>
                  getProductCategoryId(product) === selectedCategoryId
              )
              .map((product) => product.subCategory ?? product.subcategory)
              .filter(
                (
                  subCategory
                ): subCategory is NonNullable<typeof subCategory> =>
                  Boolean(subCategory?.name)
              );

      for (const subCategory of availableSubCategories) {
        const key = normalizeName(subCategory.name);
        if (!uniqueSubCategories.has(key)) {
          uniqueSubCategories.set(key, {
            id: subCategory.id,
            name: subCategory.name,
          });
        }
      }

      return Array.from(uniqueSubCategories.values()).sort((a, b) =>
        a.name.localeCompare(b.name, "es")
      );
    },
    [loadedCategorySubCategories, products, selectedCategoryId]
  );

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [productsData, categoriesData, featuredData] =
          await Promise.all([
            getProducts(),
            getCategories(),
            getFeaturedProducts().catch(() => []),
          ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setFeaturedProducts(featuredData);
      } catch {
        setError("No se pudieron cargar los productos.");
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;

    if (!selectedCategoryId) {
      return () => {
        isCurrentRequest = false;
      };
    }

    getSubCategoriesByCategory(selectedCategoryId)
      .then((data) => {
        if (isCurrentRequest) {
          setLoadedCategorySubCategories({
            categoryId: selectedCategoryId,
            items: data,
          });
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          setLoadedCategorySubCategories({
            categoryId: selectedCategoryId,
            items: [],
          });
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedCategoryId]);

  useEffect(() => {
    if (!pendingScrollRef.current) return;

    pendingScrollRef.current = false;
    productsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [showAllView]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [selectedCategoryId, brand, search, selectedSubCategoryName]);

  function updateFilters(nextFilters: {
    category?: string;
    subCategory?: string;
  }) {
    const nextParams = new URLSearchParams(searchParams);

    if (nextFilters.category !== undefined) {
      if (nextFilters.category) {
        nextParams.set("category", nextFilters.category);
      } else {
        nextParams.delete("category");
      }
      nextParams.delete("subCategory");
    }

    if (nextFilters.subCategory !== undefined) {
      if (nextFilters.subCategory) {
        nextParams.set("subCategory", nextFilters.subCategory);
        nextParams.delete("category");
      } else {
        nextParams.delete("subCategory");
      }
    }

    setSearchParams(nextParams);
  }

  function handleShowAll() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("view", "all");
    pendingScrollRef.current = true;
    setSearchParams(nextParams);
  }

  return (
    <section>
      {showCategoryView && selectedCategory ? (
        <div
          className="relative left-1/2 min-h-[calc(100vh-7rem)] w-screen -translate-x-1/2 pb-14"
          style={
            categoryPageTheme
              ? ({
                  background: categoryPageTheme.background,
                  "--category-title": categoryPageTheme.title,
                  "--category-muted": categoryPageTheme.muted,
                  "--category-panel": categoryPageTheme.panel,
                } as React.CSSProperties)
              : undefined
          }
        >
          <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <CategoryHero category={selectedCategory} />
              <CategorySubCategories
                categoryName={selectedCategory.name}
                selectedSubCategoryName={selectedSubCategoryName}
                onSelect={(subCategoryName) =>
                  updateFilters({ subCategory: subCategoryName })
                }
              />
            </div>

            <div ref={productsSectionRef} className="mt-4 scroll-mt-28">
              <ProductListing
                key={selectedCategoryId}
                products={products}
                featuredProducts={featuredProducts}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                selectedSubCategoryName={selectedSubCategoryName}
                categoryName={selectedCategory.name}
                search={search}
                brand={brand}
                isLoading={isLoading}
                error={error}
                withCategoryFilter={false}
                title={
                  selectedSubCategoryDisplayName
                    ? `Productos de ${selectedSubCategoryDisplayName}`
                    : "Todos los productos"
                }
                onUpdateFilters={updateFilters}
              />
            </div>

            <CategorySubCategoryFooter
              categoryName={selectedCategory.name}
              subCategories={selectedCategorySubCategories}
              selectedSubCategoryName={selectedSubCategoryName}
              onSelect={(subCategoryName) =>
                updateFilters({ subCategory: subCategoryName })
              }
            />
          </div>
        </div>
      ) : showAllView ? (
        <div className="space-y-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
              {brand
                ? `Productos de ${brand}`
                : selectedSubCategoryName
                  ? selectedSubCategoryDisplayName
                  : "Explorar productos"}
            </h1>
            <p className="mt-2 text-slate-500">
              {brand
                ? `Todos los productos de la marca ${brand} en BuyMarket.`
                : selectedSubCategoryName
                  ? `Todos los productos de la subcategoria ${selectedSubCategoryDisplayName} en BuyMarket.`
                  : search
                    ? `Resultados para "${search}"`
                    : "Todos los productos publicados en BuyMarket."}
            </p>
          </div>

          <div ref={productsSectionRef} className="scroll-mt-28">
            <ProductListing
              key={`all|${search}|${brand}|${selectedSubCategoryName}`}
              products={products}
              featuredProducts={featuredProducts}
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              selectedSubCategoryName={selectedSubCategoryName}
              categoryName=""
              search={search}
              brand={brand}
              isLoading={isLoading}
              error={error}
              withCategoryFilter
              title={
                selectedSubCategoryName
                  ? selectedSubCategoryDisplayName
                  : "Todos los productos"
              }
              onUpdateFilters={updateFilters}
            />
          </div>
        </div>
      ) : (
        <div className="relative left-1/2 -mt-5 min-h-[calc(100vh-5rem)] w-screen -translate-x-1/2 overflow-hidden bg-[#eaf5ff] bg-[url('/categories/categories-page-background.png')] bg-cover bg-center py-6 shadow-[inset_0_18px_45px_rgba(255,255,255,0.30)] sm:-mt-8 sm:py-8">
          <div className="relative mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="m-0 text-3xl font-black tracking-[-0.03em] text-[#07183c] sm:text-4xl">
              Explorar categorías
            </h1>
            <p className="mt-2 w-full text-center text-sm font-medium text-slate-600 sm:text-base">
              Elegí una categoria para descubrir todos sus productos.
            </p>
          </div>

          <CategoryList
            categories={categories}
            isLoading={isLoading}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(categoryId) =>
              updateFilters({ category: categoryId })
            }
            onShowAll={handleShowAll}
          />
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductsPage;
