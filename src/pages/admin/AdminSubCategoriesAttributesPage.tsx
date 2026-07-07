import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { getCategories } from "../../shared/services/category.service";
import {
  createSubCategory,
  deleteSubCategory,
  getSubCategoriesByCategory,
  updateSubCategory,
} from "../../shared/services/subcategory.service";
import {
  createSubCategoryAttribute,
  deleteSubCategoryAttribute,
  getSubCategoryAttributesBySubCategory,
  updateSubCategoryAttribute,
} from "../../shared/services/subCategoryAttribute.service";
import type { Category } from "../../shared/types/Category";
import type { SubCategory } from "../../shared/types/SubCategory";
import type {
  CreateSubCategoryAttributePayload,
  SubCategoryAttribute,
  SubCategoryAttributeAppliesTo,
  SubCategoryAttributeType,
  SubCategoryAttributeUsage,
} from "../../shared/types/SubCategoryAttribute";
import { subCategoryAttributeTypes } from "../../shared/types/SubCategoryAttribute";

type AttributeFormState = {
  name: string;
  type: SubCategoryAttributeType;
  appliesTo: SubCategoryAttributeAppliesTo;
  usage: SubCategoryAttributeUsage;
  required: boolean;
  optionsText: string;
};

const emptyAttributeForm: AttributeFormState = {
  name: "",
  type: "text",
  appliesTo: "PRODUCT",
  usage: "product_attribute",
  required: false,
  optionsText: "",
};

function AdminSubCategoriesAttributesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [attributes, setAttributes] = useState<SubCategoryAttribute[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

  const [subCategoryName, setSubCategoryName] = useState("");
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<
    string | null
  >(null);

  const [attributeForm, setAttributeForm] =
    useState<AttributeFormState>(emptyAttributeForm);
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(
    null
  );
  const [applyAttributeToMultiple, setApplyAttributeToMultiple] =
    useState(false);
  const [attributeSubCategoryIds, setAttributeSubCategoryIds] = useState<
    string[]
  >([]);

  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [savingSubCategory, setSavingSubCategory] = useState(false);
  const [savingAttribute, setSavingAttribute] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const selectedSubCategory = useMemo(
    () =>
      subCategories.find(
        (subCategory) => subCategory.id === selectedSubCategoryId
      ),
    [selectedSubCategoryId, subCategories]
  );

  async function loadSubCategories(categoryId: string) {
    setIsLoadingSubCategories(true);
    setError("");

    try {
      const data = await getSubCategoriesByCategory(categoryId);
      setSubCategories(data);
    } catch {
      setError("No se pudieron cargar las subcategorias.");
    } finally {
      setIsLoadingSubCategories(false);
    }
  }

  async function loadAttributes(subCategoryId: string) {
    setIsLoadingAttributes(true);
    setError("");

    try {
      const data = await getSubCategoryAttributesBySubCategory(subCategoryId);
      setAttributes(data);
    } catch {
      setError("No se pudieron cargar los atributos.");
    } finally {
      setIsLoadingAttributes(false);
    }
  }

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        setError("No se pudieron cargar las categorias.");
      } finally {
        setIsLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  function resetMessages() {
    setError("");
    setSuccess("");
  }

  function resetSubCategoryForm() {
    setSubCategoryName("");
    setEditingSubCategoryId(null);
  }

  function resetAttributeForm(subCategoryId = selectedSubCategoryId) {
    setAttributeForm(emptyAttributeForm);
    setEditingAttributeId(null);
    setApplyAttributeToMultiple(false);
    setAttributeSubCategoryIds(subCategoryId ? [subCategoryId] : []);
  }

  async function handleSelectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId("");
    setSubCategories([]);
    setAttributes([]);
    setSubCategoryName("");
    setEditingSubCategoryId(null);
    resetAttributeForm("");
    resetMessages();

    if (categoryId) {
      await loadSubCategories(categoryId);
    }
  }

  async function handleSelectSubCategory(subCategoryId: string) {
    setSelectedSubCategoryId(subCategoryId);
    setAttributes([]);
    resetAttributeForm(subCategoryId);
    resetMessages();

    if (subCategoryId) {
      await loadAttributes(subCategoryId);
    }
  }

  async function handleSaveSubCategory(event: React.FormEvent) {
    event.preventDefault();
    resetMessages();

    const name = subCategoryName.trim();

    if (!selectedCategoryId) {
      setError("Selecciona una categoria antes de guardar.");
      return;
    }

    if (!name) {
      setError("El nombre de la subcategoria es obligatorio.");
      return;
    }

    setSavingSubCategory(true);

    try {
      if (editingSubCategoryId) {
        const updatedSubCategory = await updateSubCategory(
          editingSubCategoryId,
          { name, categoryId: selectedCategoryId }
        );
        setSubCategories((currentSubCategories) =>
          currentSubCategories.map((subCategory) =>
            subCategory.id === editingSubCategoryId
              ? updatedSubCategory
              : subCategory
          )
        );
        setSuccess("Subcategoria actualizada correctamente.");
      } else {
        const createdSubCategory = await createSubCategory({
          name,
          categoryId: selectedCategoryId,
        });
        setSubCategories((currentSubCategories) => [
          ...currentSubCategories,
          createdSubCategory,
        ]);
        setSuccess("Subcategoria creada correctamente.");
      }

      resetSubCategoryForm();
    } catch {
      setError("No se pudo guardar la subcategoria.");
    } finally {
      setSavingSubCategory(false);
    }
  }

  function handleEditSubCategory(subCategory: SubCategory) {
    resetMessages();
    setSubCategoryName(subCategory.name);
    setEditingSubCategoryId(subCategory.id);
  }

  async function handleDeleteSubCategory(subCategory: SubCategory) {
    const shouldDelete = window.confirm(
      `Seguro que queres eliminar la subcategoria "${subCategory.name}"?`
    );

    if (!shouldDelete) {
      return;
    }

    resetMessages();
    setDeletingId(subCategory.id);

    try {
      await deleteSubCategory(subCategory.id);
      setSubCategories((currentSubCategories) =>
        currentSubCategories.filter((item) => item.id !== subCategory.id)
      );

      if (selectedSubCategoryId === subCategory.id) {
        setSelectedSubCategoryId("");
        setAttributes([]);
      }

      setSuccess("Subcategoria eliminada correctamente.");
    } catch {
      setError("No se pudo eliminar la subcategoria.");
    } finally {
      setDeletingId(null);
    }
  }

  function getAttributePayload(
    subCategoryId: string
  ): CreateSubCategoryAttributePayload | null {
    const name = attributeForm.name.trim();
    const options = attributeForm.optionsText
      .split(",")
      .map((option) => option.trim())
      .filter(Boolean);

    if (!subCategoryId) {
      setError("Selecciona una subcategoria antes de guardar atributos.");
      return null;
    }

    if (!name) {
      setError("El nombre del atributo es obligatorio.");
      return null;
    }

    if (attributeForm.type === "select" && options.length === 0) {
      setError("Los atributos select necesitan al menos una opcion.");
      return null;
    }

    return {
      name,
      type: attributeForm.type,
      appliesTo: attributeForm.appliesTo,
      usage: attributeForm.usage,
      required: attributeForm.required,
      subCategoryId,
      options: attributeForm.type === "select" ? options : [],
    };
  }

  async function handleSaveAttribute(event: React.FormEvent) {
    event.preventDefault();
    resetMessages();

    const targetSubCategoryIds =
      applyAttributeToMultiple && !editingAttributeId
        ? attributeSubCategoryIds
        : selectedSubCategoryId
          ? [selectedSubCategoryId]
          : [];

    if (targetSubCategoryIds.length === 0) {
      setError("Selecciona al menos una subcategoria para guardar el atributo.");
      return;
    }

    const payload = getAttributePayload(targetSubCategoryIds[0]);

    if (!payload) {
      return;
    }

    setSavingAttribute(true);

    try {
      if (editingAttributeId) {
        const updatedAttribute = await updateSubCategoryAttribute(
          editingAttributeId,
          payload
        );
        setAttributes((currentAttributes) =>
          currentAttributes.map((attribute) =>
            attribute.id === editingAttributeId ? updatedAttribute : attribute
          )
        );
        setSuccess("Atributo actualizado correctamente.");
      } else {
        const createdAttributes = await Promise.all(
          targetSubCategoryIds.map((subCategoryId) =>
            createSubCategoryAttribute({
              ...payload,
              subCategoryId,
            })
          )
        );
        const selectedSubCategoryAttribute = createdAttributes.find(
          (attribute) => attribute.subCategoryId === selectedSubCategoryId
        );

        if (selectedSubCategoryAttribute) {
          setAttributes((currentAttributes) => [
            ...currentAttributes,
            selectedSubCategoryAttribute,
          ]);
        }

        setSuccess(
          targetSubCategoryIds.length === 1
            ? "Atributo creado correctamente."
            : `Atributo creado en ${targetSubCategoryIds.length} subcategorias.`
        );
      }

      resetAttributeForm();
    } catch {
      setError("No se pudo guardar el atributo.");
    } finally {
      setSavingAttribute(false);
    }
  }

  function handleEditAttribute(attribute: SubCategoryAttribute) {
    resetMessages();
    setEditingAttributeId(attribute.id);
    setApplyAttributeToMultiple(false);
    setAttributeSubCategoryIds([attribute.subCategoryId]);
    setAttributeForm({
      name: attribute.name,
      type: attribute.type,
      appliesTo: attribute.appliesTo ?? "PRODUCT",
      usage: attribute.usage ?? "product_attribute",
      required: attribute.required,
      optionsText: attribute.options?.join(", ") ?? "",
    });
  }

  async function handleDeleteAttribute(attribute: SubCategoryAttribute) {
    const shouldDelete = window.confirm(
      `Seguro que queres eliminar el atributo "${attribute.name}"?`
    );

    if (!shouldDelete) {
      return;
    }

    resetMessages();
    setDeletingId(attribute.id);

    try {
      await deleteSubCategoryAttribute(attribute.id);
      setAttributes((currentAttributes) =>
        currentAttributes.filter((item) => item.id !== attribute.id)
      );
      setSuccess("Atributo eliminado correctamente.");
    } catch {
      setError("No se pudo eliminar el atributo.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleToggleAttributeSubCategory(subCategoryId: string) {
    setAttributeSubCategoryIds((currentIds) =>
      currentIds.includes(subCategoryId)
        ? currentIds.filter((id) => id !== subCategoryId)
        : [...currentIds, subCategoryId]
    );
  }

  function handleSelectAllAttributeSubCategories() {
    setAttributeSubCategoryIds(
      subCategories.map((subCategory) => subCategory.id)
    );
  }

  return (
    <section className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          Subcategorias y atributos
        </h1>

        <p className="mt-2 text-slate-500">
          Defini que atributos completa el usuario segun la subcategoria del
          producto.
        </p>
      </div>

      {(error || success) && (
        <div className="mb-6 space-y-3">
          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-700">
              {success}
            </p>
          )}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <label className="block">
          <span className="mb-2 block font-bold text-slate-700">
            Categoria
          </span>

          <select
            value={selectedCategoryId}
            onChange={(event) => void handleSelectCategory(event.target.value)}
            disabled={isLoadingCategories}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {isLoadingCategories
                ? "Cargando categorias..."
                : "Selecciona una categoria"}
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="m-0 text-xl font-black text-slate-950 sm:text-2xl">
                Subcategorias
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedCategory
                  ? `Categoria: ${selectedCategory.name}`
                  : "Selecciona una categoria para comenzar."}
              </p>
            </div>
          </div>

          <form
            className="mb-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSaveSubCategory}
          >
            <input
              value={subCategoryName}
              onChange={(event) => setSubCategoryName(event.target.value)}
              disabled={!selectedCategoryId || savingSubCategory}
              placeholder="Nombre de la subcategoria"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            {editingSubCategoryId && (
              <button
                type="button"
                onClick={resetSubCategoryForm}
                aria-label="Cancelar edicion de subcategoria"
                className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 sm:w-12"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}

            <button
              type="submit"
              disabled={!selectedCategoryId || savingSubCategory}
              className="flex h-12 w-full min-w-12 items-center justify-center rounded-xl bg-[var(--brand)] px-4 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              <span className="ml-2">
                {editingSubCategoryId ? "Guardar" : "Agregar"}
              </span>
            </button>
          </form>

          {isLoadingSubCategories ? (
            <p className="text-slate-500">Cargando subcategorias...</p>
          ) : (
            <div className="space-y-3">
              {subCategories.length === 0 && selectedCategoryId && (
                <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-500">
                  Todavia no hay subcategorias para esta categoria.
                </p>
              )}

              {subCategories.map((subCategory) => (
                <div
                  key={subCategory.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                    selectedSubCategoryId === subCategory.id
                      ? "border-[var(--brand-border)] bg-[var(--brand-soft)]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => void handleSelectSubCategory(subCategory.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate font-black text-slate-950">
                      {subCategory.name}
                    </span>
                  </button>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditSubCategory(subCategory)}
                      aria-label={`Editar subcategoria ${subCategory.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubCategory(subCategory)}
                      disabled={deletingId === subCategory.id}
                      aria-label={`Eliminar subcategoria ${subCategory.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="m-0 text-xl font-black text-slate-950 sm:text-2xl">
              Atributos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedSubCategory
                ? `Subcategoria: ${selectedSubCategory.name}`
                : "Selecciona una subcategoria para administrar sus atributos."}
            </p>
          </div>

          <form className="mb-6 space-y-4" onSubmit={handleSaveAttribute}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                value={attributeForm.name}
                onChange={(event) =>
                  setAttributeForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }))
                }
                disabled={!selectedSubCategoryId || savingAttribute}
                placeholder="Nombre del atributo"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <select
                value={attributeForm.type}
                onChange={(event) =>
                  setAttributeForm((currentForm) => ({
                    ...currentForm,
                    type: event.target.value as SubCategoryAttributeType,
                    optionsText:
                      event.target.value === "select"
                        ? currentForm.optionsText
                        : "",
                  }))
                }
                disabled={!selectedSubCategoryId || savingAttribute}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {subCategoryAttributeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={attributeForm.appliesTo}
                onChange={(event) =>
                  setAttributeForm((currentForm) => ({
                    ...currentForm,
                    appliesTo: event.target.value as SubCategoryAttributeAppliesTo,
                  }))
                }
                disabled={!selectedSubCategoryId || savingAttribute}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="PRODUCT">Caracteristica del producto</option>
                <option value="VARIANT">Caracteristica de variante</option>
              </select>

              <select
                value={attributeForm.usage}
                onChange={(event) =>
                  setAttributeForm((currentForm) => ({
                    ...currentForm,
                    usage: event.target.value as SubCategoryAttributeUsage,
                  }))
                }
                disabled={!selectedSubCategoryId || savingAttribute}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="product_attribute">Caracteristica del producto</option>
                <option value="variant_size">Talle de variante</option>
                <option value="variant_color">Color de variante</option>
                <option value="variant_measure">Medida por talle</option>
              </select>
            </div>

            {(attributeForm.usage === "variant_size" ||
              attributeForm.usage === "variant_color") &&
              attributeForm.type !== "select" && (
                <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-700">
                  Para talles y colores se recomienda usar tipo select y cargar opciones.
                </p>
              )}

            <label className="flex items-center gap-3 font-bold text-slate-700">
              <input
                type="checkbox"
                checked={attributeForm.required}
                onChange={(event) =>
                  setAttributeForm((currentForm) => ({
                    ...currentForm,
                    required: event.target.checked,
                  }))
                }
                disabled={!selectedSubCategoryId || savingAttribute}
                className="h-5 w-5 rounded border-slate-300 text-[var(--brand)]"
              />
              Obligatorio
            </label>

            <label className="flex items-center gap-3 font-bold text-slate-700">
              <input
                type="checkbox"
                checked={applyAttributeToMultiple}
                onChange={(event) => {
                  const isChecked = event.target.checked;
                  setApplyAttributeToMultiple(isChecked);
                  setAttributeSubCategoryIds(
                    isChecked
                      ? attributeSubCategoryIds.length > 0
                        ? attributeSubCategoryIds
                        : selectedSubCategoryId
                          ? [selectedSubCategoryId]
                          : []
                      : selectedSubCategoryId
                        ? [selectedSubCategoryId]
                        : []
                  );
                }}
                disabled={
                  !selectedCategoryId || Boolean(editingAttributeId) || savingAttribute
                }
                className="h-5 w-5 rounded border-slate-300 text-[var(--brand)]"
              />
              Aplicar este atributo a varias subcategorias
            </label>

            {applyAttributeToMultiple && !editingAttributeId && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-bold text-slate-700">
                    Subcategorias seleccionadas:{" "}
                    {attributeSubCategoryIds.length}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllAttributeSubCategories}
                      className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttributeSubCategoryIds([])}
                      className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {subCategories.map((subCategory) => (
                    <label
                      key={subCategory.id}
                      className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={attributeSubCategoryIds.includes(
                          subCategory.id
                        )}
                        onChange={() =>
                          handleToggleAttributeSubCategory(subCategory.id)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-[var(--brand)]"
                      />
                      <span className="min-w-0 truncate">
                        {subCategory.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {attributeForm.type === "select" && (
              <input
                value={attributeForm.optionsText}
                onChange={(event) =>
                  setAttributeForm((currentForm) => ({
                    ...currentForm,
                    optionsText: event.target.value,
                  }))
                }
                disabled={!selectedSubCategoryId || savingAttribute}
                placeholder="Opciones separadas por coma: S, M, L, XL"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {editingAttributeId && (
                <button
                  type="button"
                  onClick={() => resetAttributeForm()}
                  className="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-200"
                >
                  Cancelar
                </button>
              )}

              <button
                type="submit"
                disabled={!selectedSubCategoryId || savingAttribute}
                className="rounded-xl bg-[var(--brand)] px-6 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingAttributeId ? "Guardar atributo" : "Agregar atributo"}
              </button>
            </div>
          </form>

          {isLoadingAttributes ? (
            <p className="text-slate-500">Cargando atributos...</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-[620px] text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Aplica a</th>
                    <th className="px-4 py-3">Uso</th>
                    <th className="px-4 py-3">Opciones</th>
                    <th className="px-4 py-3">Req.</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {attributes.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-slate-500"
                      >
                        {selectedSubCategoryId
                          ? "Todavia no hay atributos."
                          : "Selecciona una subcategoria."}
                      </td>
                    </tr>
                  )}

                  {attributes.map((attribute) => (
                    <tr key={attribute.id}>
                      <td className="px-4 py-3 font-bold text-slate-950">
                        {attribute.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {attribute.type}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                        {attribute.appliesTo === "VARIANT"
                          ? "Variante"
                          : "Producto"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                        {attribute.usage === "variant_size"
                          ? "Talle"
                          : attribute.usage === "variant_color"
                            ? "Color"
                            : attribute.usage === "variant_measure"
                              ? "Medida por talle"
                            : "Caracteristica"}
                      </td>
                      <td className="max-w-48 px-4 py-3 text-sm text-slate-500">
                        {attribute.type === "select" &&
                        attribute.options?.length
                          ? attribute.options.join(", ")
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-bold ${
                            attribute.required
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {attribute.required ? "Si" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditAttribute(attribute)}
                            aria-label={`Editar atributo ${attribute.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAttribute(attribute)}
                            disabled={deletingId === attribute.id}
                            aria-label={`Eliminar atributo ${attribute.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default AdminSubCategoriesAttributesPage;
