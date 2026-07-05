import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Check, ChevronLeft, ImagePlus, UploadCloud } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../shared/services/category.service";
import { createCategorySuggestion } from "../shared/services/categorySuggestion.service";
import {
  createProduct,
  uploadProductMediaFiles,
} from "../shared/services/product.service";
import { getSubCategoryAttributesBySubCategory } from "../shared/services/subCategoryAttribute.service";
import { getSubCategoriesByCategory } from "../shared/services/subcategory.service";
import { getMyAddresses } from "../shared/services/userAddress.service";
import type { Category } from "../shared/types/Category";
import type { ProductMedia } from "../shared/types/Product";
import type { SubCategory } from "../shared/types/SubCategory";
import type { SubCategoryAttribute } from "../shared/types/SubCategoryAttribute";
import type { UserAddress } from "../shared/types/UserAddress";
import { buildImageUrl } from "../shared/utils/buildImageUrl";
import {
  getCategoryDisplayImageUrls,
  getCategoryInitials,
} from "../shared/utils/categoryImages";
import { formatUserAddress } from "../shared/utils/userAddress";

type Step = 1 | 2 | 3;

type ProductDetailsForm = {
  title: string;
  description: string;
  price: string;
  stock: string;
  horarioDisponible: string;
  pickupAddressId: string;
};

type CategorySuggestionForm = {
  name: string;
  description: string;
};

type ProductVariantForm = {
  id: string;
  size: string;
  color: string;
  price: string;
  stock: string;
  isActive: boolean;
};

const emptyDetailsForm: ProductDetailsForm = {
  title: "",
  description: "",
  price: "",
  stock: "",
  horarioDisponible: "",
  pickupAddressId: "",
};

const emptyCategorySuggestionForm: CategorySuggestionForm = {
  name: "",
  description: "",
};

function createEmptyVariant(): ProductVariantForm {
  return {
    id: crypto.randomUUID(),
    size: "",
    color: "",
    price: "",
    stock: "",
    isActive: true,
  };
}

function CreateProductPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [attributes, setAttributes] = useState<SubCategoryAttribute[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<ProductMedia[]>([]);
  const [detailsForm, setDetailsForm] = useState<ProductDetailsForm>(emptyDetailsForm);
  const [categorySuggestionForm, setCategorySuggestionForm] =
    useState<CategorySuggestionForm>(emptyCategorySuggestionForm);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [variants, setVariants] = useState<ProductVariantForm[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [isSendingCategorySuggestion, setIsSendingCategorySuggestion] =
    useState(false);
  const [error, setError] = useState("");
  const [categorySuggestionError, setCategorySuggestionError] = useState("");
  const [categorySuggestionSuccess, setCategorySuggestionSuccess] = useState("");
  const [categoryImageAttempts, setCategoryImageAttempts] = useState<
    Record<string, number>
  >({});

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );
  const selectedSubCategory = subCategories.find(
    (subCategory) => subCategory.id === selectedSubCategoryId
  );

  const imagePreviews = useMemo(
    () => imageFiles.map((file) => URL.createObjectURL(file)),
    [imageFiles]
  );
  const productAttributes = useMemo(
    () =>
      attributes.filter(
        (attribute) => (attribute.usage ?? "product_attribute") === "product_attribute"
      ),
    [attributes]
  );
  const sizeAttribute = useMemo(
    () => attributes.find((attribute) => attribute.usage === "variant_size"),
    [attributes]
  );
  const colorAttribute = useMemo(
    () => attributes.find((attribute) => attribute.usage === "variant_color"),
    [attributes]
  );
  const sizeOptions = sizeAttribute?.options?.filter(Boolean) ?? [];
  const colorOptions = colorAttribute?.options?.filter(Boolean) ?? [];

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [categoriesData, addressesData] = await Promise.all([
          getCategories(),
          getMyAddresses().catch(() => []),
        ]);
        const defaultAddress = addressesData.find((address) => address.isDefault);

        setCategories(categoriesData);
        setAddresses(addressesData);
        setDetailsForm((prev) => ({
          ...prev,
          pickupAddressId: defaultAddress?.id ?? "",
        }));
      } catch {
        setError("No se pudieron cargar los datos para publicar.");
      } finally {
        setIsLoadingCategories(false);
        setIsLoadingAddresses(false);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      return;
    }

    async function loadSubCategories() {
      setIsLoadingSubCategories(true);
      setError("");

      try {
        const data = await getSubCategoriesByCategory(selectedCategoryId);
        setSubCategories(data);
        setSelectedSubCategoryId("");
        setAttributes([]);
        setAttributeValues({});
      } catch {
        setError("No se pudieron cargar las subcategorías.");
      } finally {
        setIsLoadingSubCategories(false);
      }
    }

    loadSubCategories();
  }, [selectedCategoryId]);

  useEffect(() => {
    if (!selectedSubCategoryId) {
      return;
    }

    async function loadAttributes() {
      setIsLoadingAttributes(true);
      setError("");

      try {
        const data = await getSubCategoryAttributesBySubCategory(
          selectedSubCategoryId
        );
        setAttributes(data);
        setAttributeValues(
          data.reduce<Record<string, string>>((values, attribute) => {
            if ((attribute.usage ?? "product_attribute") === "product_attribute") {
              values[attribute.id] = attribute.type === "boolean" ? "false" : "";
            }
            return values;
          }, {})
        );
      } catch {
        setError("No se pudieron cargar los atributos de la subcategoría.");
      } finally {
        setIsLoadingAttributes(false);
      }
    }

    loadAttributes();
  }, [selectedSubCategoryId]);

  function handleDetailsChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setDetailsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleCategorySuggestionChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setCategorySuggestionError("");
    setCategorySuggestionSuccess("");
    setCategorySuggestionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleCategoryImageError(categoryId: string) {
    setCategoryImageAttempts((current) => ({
      ...current,
      [categoryId]: (current[categoryId] ?? 0) + 1,
    }));
  }

  async function handleCategorySuggestionSubmit(event: FormEvent) {
    event.preventDefault();

    const name = categorySuggestionForm.name.trim();
    const description = categorySuggestionForm.description.trim();

    if (!name) {
      setCategorySuggestionError("Ingresá el nombre de la categoría sugerida.");
      setCategorySuggestionSuccess("");
      return;
    }

    try {
      setIsSendingCategorySuggestion(true);
      setCategorySuggestionError("");
      setCategorySuggestionSuccess("");
      await createCategorySuggestion({
        name,
        ...(description ? { description } : {}),
      });
      setCategorySuggestionForm(emptyCategorySuggestionForm);
      setCategorySuggestionSuccess(
        "Recibimos tu sugerencia. Cuando el equipo la apruebe, vas a poder publicar productos en esa categoría."
      );
    } catch {
      setCategorySuggestionError(
        "No pudimos enviar la sugerencia. Revisá los datos e intentá nuevamente."
      );
    } finally {
      setIsSendingCategorySuggestion(false);
    }
  }

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    setImageFiles(Array.from(event.target.files ?? []));
    setUploadedMedia([]);
  }

  function handleAddVariant() {
    setVariants((currentVariants) => currentVariants.concat(createEmptyVariant()));
  }

  function handleRemoveVariant(id: string) {
    setVariants((currentVariants) =>
      currentVariants.filter((variant) => variant.id !== id)
    );
  }

  function handleVariantChange(
    id: string,
    field: keyof Omit<ProductVariantForm, "id">,
    value: string | boolean
  ) {
    setVariants((currentVariants) =>
      currentVariants.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    );
  }

  function validateClassification() {
    if (!selectedCategoryId || !selectedSubCategoryId) {
      setError("Elegí una categoría y una subcategoría.");
      return false;
    }

    setError("");
    return true;
  }

  async function handleContinueFromMedia() {
    if (imageFiles.length === 0) {
      setError("Subí al menos una imagen del producto.");
      return;
    }

    if (uploadedMedia.length > 0) {
      setStep(3);
      return;
    }

    try {
      setIsUploadingMedia(true);
      setError("");
      const media = await uploadProductMediaFiles(imageFiles);
      setUploadedMedia(media);
      setStep(3);
    } catch {
      setError("No se pudieron subir las imágenes.");
    } finally {
      setIsUploadingMedia(false);
    }
  }

  function validateDetails() {
    const missingRequiredAttribute = productAttributes.find(
      (attribute) => attribute.required && !attributeValues[attribute.id]?.trim()
    );
    const hasVariants = variants.length > 0;

    if (
      !detailsForm.title.trim() ||
      !detailsForm.description.trim() ||
      (!hasVariants && (!detailsForm.price || !detailsForm.stock))
    ) {
      setError("Completá titulo, descripcion, precio y stock.");
      return false;
    }

    if (
      !hasVariants &&
      (Number(detailsForm.price) <= 0 || Number(detailsForm.stock) < 0)
    ) {
      setError("El precio debe ser mayor a 0 y el stock no puede ser negativo.");
      return false;
    }

    if (!detailsForm.pickupAddressId) {
      setError("Elegí una dirección para que el repartidor sepa dónde retirar.");
      return false;
    }

    if (missingRequiredAttribute) {
      setError(`Completá el atributo obligatorio: ${missingRequiredAttribute.name}.`);
      return false;
    }

    for (const variant of variants) {
      const size = variant.size.trim();
      const color = variant.color.trim();
      const price = Number(variant.price);
      const stock = Number(variant.stock);

      if (!size) {
        setError("Todas las variantes necesitan talle.");
        return false;
      }

      if (!Number.isFinite(price) || price <= 0) {
        setError("El precio de cada variante debe ser mayor a 0.");
        return false;
      }

      if (!Number.isFinite(stock) || stock < 0) {
        setError("El stock de cada variante no puede ser negativo.");
        return false;
      }

      if (sizeOptions.length > 0 && !sizeOptions.includes(size)) {
        setError("El talle de cada variante debe estar dentro de las opciones.");
        return false;
      }

      if (color && colorOptions.length > 0 && !colorOptions.includes(color)) {
        setError("El color de cada variante debe estar dentro de las opciones.");
        return false;
      }
    }

    setError("");
    return true;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!validateDetails()) return;

    const selectedAddress = addresses.find(
      (address) => address.id === detailsForm.pickupAddressId
    );
    const variantPayload = variants.map((variant) => ({
      size: variant.size.trim(),
      ...(variant.color.trim() ? { color: variant.color.trim() } : {}),
      price: Number(variant.price),
      stock: Number(variant.stock),
      isActive: variant.isActive,
    }));
    const activeVariantPayload = variantPayload.filter(
      (variant) => variant.isActive !== false
    );
    const computedPrice =
      activeVariantPayload.length > 0
        ? Math.min(...activeVariantPayload.map((variant) => variant.price))
        : Number(detailsForm.price);
    const computedStock =
      activeVariantPayload.length > 0
        ? activeVariantPayload.reduce((total, variant) => total + variant.stock, 0)
        : Number(detailsForm.stock);

    try {
      setIsSubmiting(true);
      await createProduct({
        title: detailsForm.title.trim(),
        description: detailsForm.description.trim(),
        price: computedPrice,
        stock: computedStock,
        category: selectedSubCategoryId,
        subCategoryId: selectedSubCategoryId,
        direccionRetiro: selectedAddress ? formatUserAddress(selectedAddress) : "",
        horarioDisponible: detailsForm.horarioDisponible,
        pickupAddressId: detailsForm.pickupAddressId,
        mediaIds: uploadedMedia.map((media) => media.id).filter(Boolean) as string[],
        attributes: productAttributes
          .map((attribute) => ({
            attributeId: attribute.id,
            value: attributeValues[attribute.id] ?? "",
          }))
          .filter((item) => item.value.trim() !== ""),
        ...(variantPayload.length > 0 ? { variants: variantPayload } : {}),
      });

      navigate("/profile");
    } catch (submitError) {
      console.log(submitError);
      setError("No se pudo publicar el producto.");
    } finally {
      setIsSubmiting(false);
    }
  }

  function renderAttributeInput(attribute: SubCategoryAttribute) {
    const value = attributeValues[attribute.id] ?? "";
    const commonClass =
      "w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]";

    if (attribute.type === "select") {
      return (
        <select
          value={value}
          onChange={(event) =>
            setAttributeValues((prev) => ({
              ...prev,
              [attribute.id]: event.target.value,
            }))
          }
          required={attribute.required}
          className={commonClass}
        >
          <option value="">Seleccionar</option>
          {attribute.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (attribute.type === "boolean") {
      return (
        <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 font-bold text-slate-700">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(event) =>
              setAttributeValues((prev) => ({
                ...prev,
                [attribute.id]: String(event.target.checked),
              }))
            }
            className="h-4 w-4"
          />
          Si
        </label>
      );
    }

    return (
      <input
        type={attribute.type === "number" ? "number" : "text"}
        value={value}
        onChange={(event) =>
          setAttributeValues((prev) => ({
            ...prev,
            [attribute.id]: event.target.value,
          }))
        }
        required={attribute.required}
        className={commonClass}
      />
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <div>
          <p className="text-sm font-black uppercase text-[var(--brand)]">
            Nueva publicación
          </p>
          <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
            Publicar producto
          </h1>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </p>
      )}

      {step === 1 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="m-0 text-2xl font-black text-slate-950">
            Elegí dónde encaja
          </h2>

          {isLoadingCategories ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
              Cargando categorías...
            </p>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const imageUrls = getCategoryDisplayImageUrls(category);
                const imageAttempt = categoryImageAttempts[category.id] ?? 0;
                const imageUrl = imageUrls[imageAttempt];

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`flex min-w-0 items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      selectedCategoryId === category.id
                        ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                        : "border-slate-200 bg-white hover:border-[var(--brand-border)]"
                    }`}
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white text-sm font-black text-[var(--brand)] shadow-sm">
                      {imageUrl ? (
                        <img
                          key={imageUrl}
                          src={imageUrl}
                          alt={`Icono de ${category.name}`}
                          loading="lazy"
                          onError={() => handleCategoryImageError(category.id)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getCategoryInitials(category)
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-lg font-black text-slate-950">
                        {category.name}
                      </span>
                      {category.description && (
                        <span className="mt-1 line-clamp-2 block text-sm font-semibold text-slate-500">
                          {category.description}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-6">
            <label className="mb-2 block font-bold text-slate-700">
              Subcategoría
            </label>
            <select
              value={selectedSubCategoryId}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedSubCategoryId(value);
                if (!value) {
                  setAttributes([]);
                  setAttributeValues({});
                  setVariants([]);
                }
              }}
              disabled={!selectedCategoryId || isLoadingSubCategories}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-[var(--brand)] disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">
                {isLoadingSubCategories
                  ? "Cargando subcategorías..."
                  : selectedCategoryId
                    ? "Seleccioná una subcategoría"
                    : "Primero elegí una categoría"}
              </option>
              {subCategories.map((subCategory) => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          <form
            onSubmit={handleCategorySuggestionSubmit}
            className="mt-6 rounded-2xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-soft)]/45 p-5"
            noValidate
          >
            <div>
              <h3 className="m-0 text-xl font-black text-slate-950">
                ¿No encontrás la categoría?
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                Sugerí una categoría principal nueva. Si el equipo la aprueba,
                vas a poder usarla para publicar más adelante.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input
                name="name"
                value={categorySuggestionForm.name}
                onChange={handleCategorySuggestionChange}
                placeholder="Nombre de la categoría sugerida"
                className="min-h-[48px] rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[var(--brand)]"
              />
              <button
                type="submit"
                disabled={isSendingCategorySuggestion}
                className="min-h-[48px] rounded-xl bg-[var(--nav-blue)] px-5 py-3 font-bold text-white transition hover:bg-[var(--nav-blue-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingCategorySuggestion ? "Enviando..." : "Enviar sugerencia"}
              </button>
            </div>

            <textarea
              name="description"
              value={categorySuggestionForm.description}
              onChange={handleCategorySuggestionChange}
              placeholder="Descripción opcional"
              className="mt-3 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[var(--brand)]"
            />

            {categorySuggestionError && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                {categorySuggestionError}
              </p>
            )}

            {categorySuggestionSuccess && (
              <p className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-700">
                {categorySuggestionSuccess}
              </p>
            )}
          </form>

          <button
            type="button"
            onClick={() => validateClassification() && setStep(2)}
            className="mt-6 w-full rounded-xl bg-[var(--brand)] px-6 py-4 font-bold text-white transition hover:bg-[var(--brand-hover)]"
          >
            Continuar
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mb-5 inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-[var(--brand)]"
          >
            <ChevronLeft size={18} />
            Volver
          </button>

          <h2 className="m-0 text-2xl font-black text-slate-950">
            Subí las imágenes
          </h2>
          <p className="mt-1 font-semibold text-slate-500">
            {selectedCategory?.name} / {selectedSubCategory?.name}
          </p>

          <label className="mt-6 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)]">
            <ImagePlus className="h-10 w-10 text-[var(--brand)]" aria-hidden="true" />
            <span className="mt-3 text-lg font-black text-slate-950">
              Seleccionar imágenes
            </span>
            <span className="mt-1 text-sm font-semibold text-slate-500">
              Podés subir hasta 10 archivos.
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              className="sr-only"
            />
          </label>

          {imagePreviews.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={preview}
                  className="aspect-square overflow-hidden rounded-2xl bg-slate-100"
                >
                  <img
                    src={preview}
                    alt={`Imagen ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {uploadedMedia.length > 0 && (
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 font-bold text-green-700">
              <Check size={18} />
              Imágenes cargadas en product-media.
            </p>
          )}

          <button
            type="button"
            onClick={handleContinueFromMedia}
            disabled={isUploadingMedia}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-6 py-4 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:bg-[#BBA7E8]"
          >
            <UploadCloud size={20} />
            {isUploadingMedia ? "Subiendo..." : "Continuar"}
          </button>
        </div>
      )}

      {step === 3 && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mb-5 inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-[var(--brand)]"
          >
            <ChevronLeft size={18} />
            Volver
          </button>

          <h2 className="m-0 text-2xl font-black text-slate-950">
            Datos del producto
          </h2>
          <p className="mt-1 font-semibold text-slate-500">
            {uploadedMedia.length} imagen{uploadedMedia.length === 1 ? "" : "es"} lista
            {uploadedMedia.length === 1 ? "" : "s"}.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              name="title"
              placeholder="Titulo"
              value={detailsForm.title}
              onChange={handleDetailsChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] sm:col-span-2"
            />

            <textarea
              name="description"
              placeholder="Descripcion"
              value={detailsForm.description}
              onChange={handleDetailsChange}
              className="min-h-32 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] sm:col-span-2"
            />

            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio"
              value={detailsForm.price}
              onChange={handleDetailsChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
            />

            <input
              name="stock"
              type="number"
              min="0"
              placeholder="Stock"
              value={detailsForm.stock}
              onChange={handleDetailsChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
            />

            <select
              name="pickupAddressId"
              value={detailsForm.pickupAddressId}
              onChange={handleDetailsChange}
              disabled={isLoadingAddresses || addresses.length === 0}
              className="rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-[var(--brand)] disabled:bg-slate-100 disabled:text-slate-500 sm:col-span-2"
            >
              <option value="">
                {isLoadingAddresses
                  ? "Cargando direcciones..."
                  : addresses.length === 0
                    ? "No tenés direcciones guardadas"
                    : "Seleccioná la dirección para el repartidor"}
              </option>
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.label} - {formatUserAddress(address)}
                </option>
              ))}
            </select>

            {addresses.length === 0 && !isLoadingAddresses && (
              <p className="text-sm font-semibold text-slate-500 sm:col-span-2">
                Cargá una dirección desde{" "}
                <Link to="/profile" className="font-bold text-[var(--brand)] hover:underline">
                  Mi perfil
                </Link>
                .
              </p>
            )}

            <input
              name="horarioDisponible"
              placeholder="Horario disponible"
              value={detailsForm.horarioDisponible}
              onChange={handleDetailsChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] sm:col-span-2"
            />
          </div>

          <div className="mt-8">
            <h3 className="m-0 text-xl font-black text-slate-950">
              Caracteristicas del producto
            </h3>

            {isLoadingAttributes ? (
              <p className="mt-4 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
                Cargando atributos...
              </p>
            ) : productAttributes.length === 0 ? (
              <p className="mt-4 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
                Esta subcategoría no tiene atributos extra.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {productAttributes.map((attribute) => (
                  <label key={attribute.id} className="block">
                    <span className="mb-2 block font-bold text-slate-700">
                      {attribute.name}
                      {attribute.required ? " *" : ""}
                    </span>
                    {renderAttributeInput(attribute)}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="m-0 text-xl font-black text-slate-950">
                  Variantes
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Crea combinaciones comprables con talle, color, precio y stock.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="rounded-xl bg-[var(--nav-blue)] px-4 py-2 font-bold text-white transition hover:bg-[var(--nav-blue-hover)]"
              >
                Agregar variante
              </button>
            </div>

            {variants.length === 0 ? (
              <p className="mt-4 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
                Si no agregas variantes, se usaran el precio y stock base.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="font-black text-slate-950">
                        Variante {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variant.id)}
                        className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                      >
                        Quitar
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      {sizeOptions.length > 0 ? (
                        <select
                          value={variant.size}
                          onChange={(event) =>
                            handleVariantChange(variant.id, "size", event.target.value)
                          }
                          className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
                        >
                          <option value="">Talle</option>
                          {sizeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={variant.size}
                          onChange={(event) =>
                            handleVariantChange(variant.id, "size", event.target.value)
                          }
                          placeholder="Talle"
                          className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
                        />
                      )}

                      {colorOptions.length > 0 ? (
                        <select
                          value={variant.color}
                          onChange={(event) =>
                            handleVariantChange(variant.id, "color", event.target.value)
                          }
                          className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
                        >
                          <option value="">Color opcional</option>
                          {colorOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={variant.color}
                          onChange={(event) =>
                            handleVariantChange(variant.id, "color", event.target.value)
                          }
                          placeholder="Color opcional"
                          className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
                        />
                      )}

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
                        onChange={(event) =>
                          handleVariantChange(variant.id, "price", event.target.value)
                        }
                        placeholder="Precio"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
                      />

                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(event) =>
                          handleVariantChange(variant.id, "stock", event.target.value)
                        }
                        placeholder="Stock"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
                      />

                      <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(event) =>
                            handleVariantChange(
                              variant.id,
                              "isActive",
                              event.target.checked
                            )
                          }
                          className="h-4 w-4"
                        />
                        Activa
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {uploadedMedia.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {uploadedMedia.map((media) => {
                const url = buildImageUrl(media.url);

                return (
                  <div
                    key={media.id}
                    className="aspect-square overflow-hidden rounded-2xl bg-slate-100"
                  >
                    {url && (
                      <img
                        src={url}
                        alt="Imagen cargada"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 font-semibold text-yellow-800">
            Cuando envíes la publicación, quedará pendiente de aprobación por el
            equipo de BuyMarket.
          </p>

          <button
            disabled={isSubmiting}
            className="mt-8 w-full rounded-xl bg-[var(--brand)] px-6 py-4 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:bg-[#BBA7E8]"
          >
            {isSubmiting ? "Publicando..." : "Publicar producto"}
          </button>
        </form>
      )}
    </section>
  );
}

export default CreateProductPage;
