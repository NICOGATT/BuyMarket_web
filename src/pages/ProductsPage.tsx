import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getCuratedSubCategories,
  getSubCategoryDisplayName,
  normalizeName,
} from "../features/products/categoryConfig";
import CategoryHero from "../features/products/components/CategoryHero";
import CategoryList from "../features/products/components/CategoryList";
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
import type { Category } from "../shared/types/Category";
import type { Product } from "../shared/types/Product";
import { getProductCategoryId } from "../shared/utils/productCategories";

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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="m-0 text-2xl font-black text-slate-950 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 font-semibold text-slate-500">
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
  const showCategoryView = Boolean(selectedCategoryId);
  const showAllView =
    searchParams.get("view") === "all" ||
    Boolean(search) ||
    Boolean(brand) ||
    Boolean(selectedSubCategoryName);

  const selectedSubCategoryDisplayName =
    getSubCategoryDisplayName(selectedSubCategoryName);

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
        <div className="space-y-8">
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
        <div className="space-y-8">
          <div className="mb-2 sm:mb-4">
            <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
              Explorar categorias
            </h1>
            <p className="mt-2 text-slate-500">
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
      )}
    </section>
  );
}

export default ProductsPage;
