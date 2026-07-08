import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Check, ChevronLeft, ImagePlus, UploadCloud } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCategories } from "../shared/services/category.service";
import { createCategorySuggestion } from "../shared/services/categorySuggestion.service";
import {
  createProduct,
  getProductById,
  updateProduct,
  uploadProductMediaFiles,
} from "../shared/services/product.service";
import { getSubCategoryAttributesBySubCategory } from "../shared/services/subCategoryAttribute.service";
import { getSubCategoriesByCategory } from "../shared/services/subcategory.service";
import { getMyAddresses } from "../shared/services/userAddress.service";
import type { Category } from "../shared/types/Category";
import type {
  Product,
  ProductAttributeValue,
  ProductImage,
  ProductMedia,
} from "../shared/types/Product";
import type { SubCategory } from "../shared/types/SubCategory";
import type { SubCategoryAttribute } from "../shared/types/SubCategoryAttribute";
import type { UserAddress } from "../shared/types/UserAddress";
import { buildImageUrl } from "../shared/utils/buildImageUrl";
import {
  getCategoryDisplayImageUrls,
  getCategoryInitials,
} from "../shared/utils/categoryImages";
import { getProductImageUrls } from "../shared/utils/productImages";
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
  attributes: Record<string, string>;
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
    attributes: {},
  };
}

function getAttributeAppliesTo(attribute: SubCategoryAttribute) {
  return attribute.appliesTo;
}

function isVariantSizeAttribute(attribute: SubCategoryAttribute) {
  return attribute.usage === "VARIANT_SIZE";
}

function isVariantColorAttribute(attribute: SubCategoryAttribute) {
  return attribute.usage === "VARIANT_COLOR";
}

function getVariantDisplayLabel(variant: ProductVariantForm) {
  return [variant.size.trim(), variant.color.trim()]
    .filter(Boolean)
    .join(" / ");
}

function getProductSubCategoryId(product: Product) {
  return product.subCategoryId ?? product.subcategoryId ?? product.subCategory?.id ?? product.subcategory?.id ?? "";
}

function getProductCategoryId(product: Product) {
  const category = product.category;

  if (typeof category === "string") return category;

  return (
    category?.id ??
    product.subCategory?.categoryId ??
    product.subcategory?.categoryId ??
    product.subCategory?.category?.id ??
    product.subcategory?.category?.id ??
    ""
  );
}

function getProductAttributeValues(product: Product): ProductAttributeValue[] {
  return (
    product.attributes ??
    product.attributeValues ??
    product.productAttributes ??
    product.productAttributeValues ??
    []
  );
}

function getProductAttributeId(attribute: ProductAttributeValue) {
  const rawAttribute = attribute as ProductAttributeValue & {
    attributeId?: string;
    subCategoryAttributeId?: string;
  };

  return (
    rawAttribute.attributeId ??
    rawAttribute.subCategoryAttributeId ??
    attribute.attribute?.id ??
    attribute.subCategoryAttribute?.id ??
    ""
  );
}

function getProductMediaItems(product: Product): ProductImage[] {
  return [
    ...(product.images ?? []),
    ...(product.productMedia ?? []),
    ...(product.media ?? []),
  ];
}

function getProductMediaIds(product: Product) {
  return getProductMediaItems(product)
    .map((media) => (typeof media === "object" ? media.id : undefined))
    .filter((id): id is string => Boolean(id));
}

function CreateProductPage() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(productId);
  const [step, setStep] = useState<Step>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [attributes, setAttributes] = useState<SubCategoryAttribute[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [existingMediaIds, setExistingMediaIds] = useState<string[]>([]);
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
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode);
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
  const [variantsTouched, setVariantsTouched] = useState(false);
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
      attributes.filter((attribute) => getAttributeAppliesTo(attribute) === "PRODUCT"),
    [attributes]
  );
  const sizeAttribute = useMemo(
    () => attributes.find(isVariantSizeAttribute),
    [attributes]
  );
  const colorAttribute = useMemo(
    () => attributes.find(isVariantColorAttribute),
    [attributes]
  );
  const variantAttributes = useMemo(
    () =>
      attributes.filter(
        (attribute) =>
          getAttributeAppliesTo(attribute) === "VARIANT" &&
          !isVariantSizeAttribute(attribute) &&
          !isVariantColorAttribute(attribute)
      ),
    [attributes]
  );
  const unclassifiedAttributes = useMemo(
    () => attributes.filter((attribute) => !getAttributeAppliesTo(attribute)),
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
        const [categoriesData, addressesData, productData] = await Promise.all([
          getCategories(),
          getMyAddresses().catch(() => []),
          productId ? getProductById(productId) : Promise.resolve(null),
        ]);
        const defaultAddress = addressesData.find((address) => address.isDefault);

        setCategories(categoriesData);
        setAddresses(addressesData);
        if (productData) {
          const subCategoryId = getProductSubCategoryId(productData);
          const categoryId = getProductCategoryId(productData);

          setEditingProduct(productData);
          setExistingImageUrls(getProductImageUrls(productData));
          setExistingMediaIds(getProductMediaIds(productData));
          setSelectedCategoryId(categoryId);
          setSelectedSubCategoryId(subCategoryId);
          setSubCategories(
            productData.subCategory
              ? [productData.subCategory]
              : productData.subcategory
                ? [productData.subcategory]
                : []
          );
          setDetailsForm({
            title: productData.title ?? "",
            description: productData.description ?? "",
            price: String(productData.price ?? ""),
            stock: String(productData.stock ?? ""),
            horarioDisponible: productData.horarioDisponible ?? "",
            pickupAddressId: productData.pickupAddress?.id ?? defaultAddress?.id ?? "",
          });
          setVariants(
            (productData.variants ?? []).map((variant) => ({
              id: variant.id ?? crypto.randomUUID(),
              size: variant.size ?? "",
              color: variant.color ?? "",
              price: String(variant.price ?? ""),
              stock: String(variant.stock ?? ""),
              isActive: variant.isActive !== false,
              attributes: (variant.attributes ?? []).reduce<Record<string, string>>(
                (values, attribute) => {
                  const attributeId = getProductAttributeId(attribute);
                  if (attributeId) {
                    values[attributeId] = attribute.value ?? "";
                  }
                  return values;
                },
                {}
              ),
            }))
          );
          setVariantsTouched(false);
          setStep(3);
        } else {
          setDetailsForm((prev) => ({
            ...prev,
            pickupAddressId: defaultAddress?.id ?? "",
          }));
        }
      } catch {
        setError(
          isEditMode
            ? "No se pudieron cargar los datos del producto."
            : "No se pudieron cargar los datos para publicar."
        );
      } finally {
        setIsLoadingCategories(false);
        setIsLoadingAddresses(false);
        setIsLoadingProduct(false);
      }
    }

    loadInitialData();
  }, [isEditMode, productId]);

  useEffect(() => {
    if (!selectedCategoryId || isEditMode) {
      return;
    }

    async function loadSubCategories() {
      setIsLoadingSubCategories(true);
      setError("");

      try {
        const data = await getSubCategoriesByCategory(selectedCategoryId);
        if (import.meta.env.DEV) {
          console.debug("Subcategorias cargadas", {
            categoryId: selectedCategoryId,
            subCategories: data,
          });
        }
        setSubCategories(data);
        setSelectedSubCategoryId("");
        setAttributes([]);
        setAttributeValues({});
        setVariants([]);
        setVariantsTouched(false);
      } catch {
        setError("No se pudieron cargar las subcategorías.");
      } finally {
        setIsLoadingSubCategories(false);
      }
    }

    loadSubCategories();
  }, [isEditMode, selectedCategoryId]);

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
        if (import.meta.env.DEV) {
          console.debug("Atributos de subcategoria cargados", {
            subCategoryId: selectedSubCategoryId,
            attributes: data,
          });
        }
        setAttributes(data);
        const currentProductAttributes = editingProduct
          ? getProductAttributeValues(editingProduct)
          : [];
        setAttributeValues(
          data.reduce<Record<string, string>>((values, attribute) => {
            if (getAttributeAppliesTo(attribute) === "PRODUCT") {
              const productAttribute = currentProductAttributes.find(
                (item) => getProductAttributeId(item) === attribute.id
              );
              values[attribute.id] =
                productAttribute?.value ??
                (attribute.type === "boolean" ? "false" : "");
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
  }, [editingProduct, selectedSubCategoryId]);

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
    setVariantsTouched(true);
  }

  function handleRemoveVariant(id: string) {
    setVariants((currentVariants) =>
      currentVariants.filter((variant) => variant.id !== id)
    );
    setVariantsTouched(true);
  }

  function handleVariantChange(
    id: string,
    field: Exclude<keyof ProductVariantForm, "id" | "attributes">,
    value: string | boolean
  ) {
    setVariants((currentVariants) =>
      currentVariants.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    );
    setVariantsTouched(true);
  }

  function handleVariantAttributeChange(
    variantId: string,
    attributeId: string,
    value: string
  ) {
    setVariants((currentVariants) =>
      currentVariants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              attributes: {
                ...variant.attributes,
                [attributeId]: value,
              },
            }
          : variant
      )
    );
    setVariantsTouched(true);
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
    if (isEditMode && imageFiles.length === 0) {
      setStep(3);
      return;
    }

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

      if (sizeOptions.length > 0 && !sizeOptions.includes(size)) {
        setError("El talle de cada variante debe estar dentro de las opciones.");
        return false;
      }

      if (colorAttribute?.required && !color) {
        setError("Todas las variantes necesitan color.");
        return false;
      }

      if (color && colorOptions.length > 0 && !colorOptions.includes(color)) {
        setError("El color de cada variante debe estar dentro de las opciones.");
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

      const missingRequiredVariantAttribute = variantAttributes.find(
        (attribute) =>
          attribute.required && !variant.attributes[attribute.id]?.trim()
      );

      if (missingRequiredVariantAttribute) {
        const variantLabel = getVariantDisplayLabel(variant) || variant.id;
        setError(
          `Completá ${missingRequiredVariantAttribute.name} para la variante ${variantLabel}.`
        );
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
      attributes: variantAttributes
        .map((attribute) => ({
          attributeId: attribute.id,
          value: variant.attributes[attribute.id] ?? "",
        }))
        .filter((attribute) => attribute.value.trim() !== ""),
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
    const uploadedMediaIds = uploadedMedia
      .map((media) => media.id)
      .filter(Boolean) as string[];
    const mediaIds = isEditMode
      ? Array.from(new Set(existingMediaIds.concat(uploadedMediaIds)))
      : uploadedMediaIds;

    try {
      setIsSubmiting(true);
      const payload = {
        title: detailsForm.title.trim(),
        description: detailsForm.description.trim(),
        price: computedPrice,
        stock: computedStock,
        category: selectedSubCategoryId,
        subCategoryId: selectedSubCategoryId,
        direccionRetiro: selectedAddress ? formatUserAddress(selectedAddress) : "",
        horarioDisponible: detailsForm.horarioDisponible,
        pickupAddressId: detailsForm.pickupAddressId,
        ...(!isEditMode || uploadedMediaIds.length > 0 ? { mediaIds } : {}),
        attributes: productAttributes
          .map((attribute) => ({
            attributeId: attribute.id,
            value: attributeValues[attribute.id] ?? "",
          }))
          .filter((item) => item.value.trim() !== ""),
        ...(!isEditMode || variantsTouched ? { variants: variantPayload } : {}),
      };

      if (isEditMode && productId) {
        await updateProduct(productId, payload);
      } else {
        await createProduct(payload);
      }

      navigate("/profile");
    } catch (submitError) {
      console.log(submitError);
      setError(
        isEditMode
          ? "No se pudo guardar el producto."
          : "No se pudo publicar el producto."
      );
    } finally {
      setIsSubmiting(false);
    }
  }

  function renderAttributeControl(
    attribute: SubCategoryAttribute,
    value: string,
    onChange: (value: string) => void,
    surfaceClassName = "bg-slate-50"
  ) {
    const commonClass =
      "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]";

    if (attribute.type === "select") {
      return (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
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
        <label
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-slate-700 ${surfaceClassName}`}
        >
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(event) => onChange(String(event.target.checked))}
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
        onChange={(event) => onChange(event.target.value)}
        required={attribute.required}
        className={commonClass}
      />
    );
  }

  function renderAttributeInput(attribute: SubCategoryAttribute) {
    return renderAttributeControl(
      attribute,
      attributeValues[attribute.id] ?? "",
      (value) =>
        setAttributeValues((prev) => ({
          ...prev,
          [attribute.id]: value,
        }))
    );
  }

  function renderVariantAttributeInput(
    variant: ProductVariantForm,
    attribute: SubCategoryAttribute
  ) {
    return renderAttributeControl(
      attribute,
      variant.attributes[attribute.id] ?? "",
      (value) => handleVariantAttributeChange(variant.id, attribute.id, value),
      "bg-white"
    );
  }

  if (isEditMode && isLoadingProduct) {
    return (
      <p className="rounded-2xl bg-white p-6 font-semibold text-slate-500 shadow-sm">
        Cargando producto...
      </p>
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
            {isEditMode ? "Editar producto" : "Publicar producto"}
          </h1>
          {isEditMode && (
            <p className="mt-2 font-semibold text-slate-500">
              {selectedCategory?.name ?? "Categoria"} /{" "}
              {selectedSubCategory?.name ??
                editingProduct?.subCategory?.name ??
                editingProduct?.subcategory?.name ??
                "Subcategoria"}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </p>
      )}

      {!isEditMode && step === 1 && (
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
                setAttributes([]);
                setAttributeValues({});
                setVariants([]);
                setVariantsTouched(false);
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
            onClick={() => setStep(isEditMode ? 3 : 1)}
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

          {existingImageUrls.length > 0 && (
            <div className="mt-5">
              <p className="mb-3 text-sm font-black uppercase text-slate-500">
                Imagenes actuales
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {existingImageUrls.map((imageUrl) => (
                  <div
                    key={imageUrl}
                    className="aspect-square overflow-hidden rounded-2xl bg-slate-100"
                  >
                    <img
                      src={imageUrl}
                      alt="Imagen actual"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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
            {existingImageUrls.length + uploadedMedia.length} imagen
            {existingImageUrls.length + uploadedMedia.length === 1 ? "" : "es"} lista
            {existingImageUrls.length + uploadedMedia.length === 1 ? "" : "s"}.
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

            {unclassifiedAttributes.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-800">
                <p className="font-black">
                  Hay atributos sin clasificar en esta subcategoria.
                </p>
                <p className="mt-1 text-sm">
                  No se van a mostrar hasta que tengan appliesTo PRODUCT o
                  VARIANT:{" "}
                  {unclassifiedAttributes
                    .map((attribute) => attribute.name)
                    .join(", ")}
                </p>
              </div>
            )}

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
                {!sizeAttribute && !colorAttribute && variantAttributes.length === 0 && (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-800">
                    Esta subcategoria no tiene atributos de variante. Si esperabas
                    ver Talle, Color o medidas, revisa que esos atributos tengan
                    appliesTo VARIANT.
                  </p>
                )}

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

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <label className="block">
                        <span className="mb-2 block font-bold text-slate-700">
                          {sizeAttribute?.name ?? "Talle"} *
                        </span>
                        {sizeOptions.length > 0 ? (
                          <select
                            value={variant.size}
                            onChange={(event) =>
                              handleVariantChange(
                                variant.id,
                                "size",
                                event.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
                          >
                            <option value="">Seleccionar</option>
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
                              handleVariantChange(
                                variant.id,
                                "size",
                                event.target.value
                              )
                            }
                            placeholder={sizeAttribute?.name ?? "Talle"}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
                          />
                        )}
                      </label>

                      <label className="block">
                        <span className="mb-2 block font-bold text-slate-700">
                          {colorAttribute?.name ?? "Color"}
                          {colorAttribute?.required ? " *" : ""}
                        </span>
                        {colorOptions.length > 0 ? (
                          <select
                            value={variant.color}
                            onChange={(event) =>
                              handleVariantChange(
                                variant.id,
                                "color",
                                event.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
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
                              handleVariantChange(
                                variant.id,
                                "color",
                                event.target.value
                              )
                            }
                            placeholder={colorAttribute?.name ?? "Color opcional"}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
                          />
                        )}
                      </label>

                      {variantAttributes.map((attribute) => (
                        <label key={attribute.id} className="block">
                          <span className="mb-2 block font-bold text-slate-700">
                            {attribute.name}
                            {attribute.required ? " *" : ""}
                          </span>
                          {renderVariantAttributeInput(variant, attribute)}
                        </label>
                      ))}

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

          {(existingImageUrls.length > 0 || uploadedMedia.length > 0) && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {existingImageUrls.map((imageUrl) => (
                <div
                  key={imageUrl}
                  className="aspect-square overflow-hidden rounded-2xl bg-slate-100"
                >
                  <img
                    src={imageUrl}
                    alt="Imagen actual"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
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
            {isSubmiting
              ? isEditMode
                ? "Guardando..."
                : "Publicando..."
              : isEditMode
                ? "Guardar cambios"
                : "Publicar producto"}
          </button>
        </form>
      )}
    </section>
  );
}

export default CreateProductPage;
