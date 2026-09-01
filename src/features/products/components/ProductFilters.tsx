import { Check, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Category } from "../../../shared/types/Category";
import { normalizeName } from "../categoryConfig";

export type ColorFilterOption = { label: string; swatch: string };
export type AttributeFilterOption = { name: string; values: string[] };

type ProductFiltersProps = {
  withCategoryFilter: boolean;
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  subCategoryOptions: { name: string }[];
  selectedSubCategoryName: string;
  onSelectSubCategory: (subCategoryName: string) => void;
  colorOptions: ColorFilterOption[];
  selectedColors: string[];
  onToggleColor: (color: string) => void;
  sizeOptions: string[];
  selectedSizes: string[];
  onToggleSize: (size: string) => void;
  attributeOptions: AttributeFilterOption[];
  selectedAttributes: Record<string, string[]>;
  onToggleAttribute: (name: string, value: string) => void;
  onClearFilters: () => void;
};

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition ${
        active
          ? "border-slate-400 bg-slate-100 text-slate-900"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function ProductFilters({
  withCategoryFilter,
  categories,
  selectedCategoryId,
  onSelectCategory,
  subCategoryOptions,
  selectedSubCategoryName,
  onSelectSubCategory,
  colorOptions,
  selectedColors,
  onToggleColor,
  sizeOptions,
  selectedSizes,
  onToggleSize,
  attributeOptions,
  selectedAttributes,
  onToggleAttribute,
  onClearFilters,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const hasAnyOption =
    withCategoryFilter ||
    subCategoryOptions.length > 0 ||
    colorOptions.length > 0 ||
    sizeOptions.length > 0 ||
    attributeOptions.length > 0;

  const activeFilterCount =
    (selectedCategoryId ? 1 : 0) +
    (selectedSubCategoryName ? 1 : 0) +
    selectedColors.length +
    selectedSizes.length +
    Object.keys(selectedAttributes).reduce(
      (sum, name) => sum + selectedAttributes[name].length,
      0
    );

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [isOpen]);

  if (!hasAnyOption) return null;

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 ${
          activeFilterCount > 0
            ? "border-slate-300 bg-slate-100 text-slate-900"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
        }`}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filtros
        {activeFilterCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-700 px-1.5 text-xs font-black text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={handleBackdropClick}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-filters-modal-title"
              className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="m-0 text-sm font-semibold text-slate-500">
                    Refinar búsqueda
                  </p>
                  <h2
                    id="product-filters-modal-title"
                    className="m-0 mt-1 text-2xl font-black text-slate-950"
                  >
                    Filtros
                  </h2>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Cerrar filtros"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-5 grid gap-4 overflow-y-auto pr-1">
                {withCategoryFilter && (
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-slate-700">
                      Categoría
                    </span>
                    <select
                      value={selectedCategoryId}
                      onChange={(event) => onSelectCategory(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 font-semibold outline-none focus:border-slate-500"
                    >
                      <option value="">Todas</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {subCategoryOptions.length > 0 && (
                  <div>
                    <span className="mb-2 block text-sm font-black text-slate-700">
                      Subcategoría
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <ToggleChip
                        active={!selectedSubCategoryName}
                        onClick={() => onSelectSubCategory("")}
                      >
                        Todas
                      </ToggleChip>
                      {subCategoryOptions.map((subCategory) => {
                        const subCategoryName = normalizeName(subCategory.name);
                        const isSelected =
                          selectedSubCategoryName === subCategoryName;

                        return (
                          <ToggleChip
                            key={subCategoryName}
                            active={isSelected}
                            onClick={() => onSelectSubCategory(subCategoryName)}
                          >
                            {subCategory.name}
                          </ToggleChip>
                        );
                      })}
                    </div>
                  </div>
                )}

                {colorOptions.length > 0 && (
                  <div>
                    <span className="mb-2 block text-sm font-black text-slate-700">
                      Color
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => {
                        const isSelected = selectedColors.includes(color.label);

                        return (
                          <ToggleChip
                            key={color.label}
                            active={isSelected}
                            onClick={() => onToggleColor(color.label)}
                          >
                            <span
                              className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                              style={{ backgroundColor: color.swatch }}
                              aria-hidden="true"
                            />
                            {color.label}
                          </ToggleChip>
                        );
                      })}
                    </div>
                  </div>
                )}

                {sizeOptions.length > 0 && (
                  <div>
                    <span className="mb-2 block text-sm font-black text-slate-700">
                      Talle
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((size) => (
                        <ToggleChip
                          key={size}
                          active={selectedSizes.includes(size)}
                          onClick={() => onToggleSize(size)}
                        >
                          {size}
                        </ToggleChip>
                      ))}
                    </div>
                  </div>
                )}

                {attributeOptions.map((group) => {
                  const selectedValues = selectedAttributes[group.name] ?? [];

                  return (
                    <div key={group.name}>
                      <span className="mb-2 block text-sm font-black text-slate-700">
                        {group.name}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {group.values.map((value) => (
                          <ToggleChip
                            key={value}
                            active={selectedValues.includes(value)}
                            onClick={() => onToggleAttribute(group.name, value)}
                          >
                            {value}
                          </ToggleChip>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                {activeFilterCount > 0 ? (
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                  >
                    <X className="h-4 w-4" />
                    Limpiar filtros
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">
                    Sin filtros aplicados
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Listo
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default ProductFilters;
