import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Check,
  ChevronLeft,
  CircleEllipsis,
  Clock3,
  ImagePlus,
  MapPin,
  ShieldAlert,
  UploadCloud,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategoryIconSprite } from "../features/products/categoryIconSprites";
import { normalizeName } from "../features/products/categoryConfig";
import { subCategoryRequiresManualApproval } from "../features/products/productApprovalPolicy";
import { getCategories } from "../shared/services/category.service";
import { createCategorySuggestion } from "../shared/services/categorySuggestion.service";
import { getColors } from "../shared/services/color.service";
import {
  createProduct,
  getProductById,
  updateProduct,
  uploadProductMediaFiles,
} from "../shared/services/product.service";
import { getSubCategoryAttributesBySubCategory } from "../shared/services/subCategoryAttribute.service";
import { getSubCategoriesByCategory } from "../shared/services/subcategory.service";
import {
  createUserAddress,
  getMyAddresses,
} from "../shared/services/userAddress.service";
import type { Category } from "../shared/types/Category";
import type { Color } from "../shared/types/Color";
import type {
  Product,
  ProductAttributeValue,
  ProductImage,
  ProductMedia,
} from "../shared/types/Product";
import type { SubCategory } from "../shared/types/SubCategory";
import type { SubCategoryAttribute } from "../shared/types/SubCategoryAttribute";
import type {
  CreateUserAddressPayload,
  UserAddress,
} from "../shared/types/UserAddress";
import { buildImageUrl } from "../shared/utils/buildImageUrl";
import {
  getCategoryDisplayImageUrls,
  getCategoryInitials,
} from "../shared/utils/categoryImages";
import {
  getProductMediaItems as getProductDisplayMediaItems,
  type ProductMediaItem,
} from "../shared/utils/productImages";
import {
  normalizePriceInput,
  parsePriceInput,
} from "../shared/utils/price";
import {
  buildAddressPayload,
  emptyAddressForm,
  formatUserAddress,
} from "../shared/utils/userAddress";

type Step = 1 | 2 | 3 | 4;

const maxProductMediaFiles = 10;
const newAddressOptionValue = "__new_address__";

function sanitizeStockInput(value: string) {
  return value.replace(/\D/g, "");
}

function sanitizePriceFieldInput(value: string) {
  const numericValue = value.replace(/[^\d.,]/g, "");
  const separatorIndex = numericValue.search(/[.,]/);

  if (separatorIndex === -1) return numericValue;

  const wholePart = numericValue.slice(0, separatorIndex);
  const separator = numericValue[separatorIndex];
  const decimalPart = numericValue
    .slice(separatorIndex + 1)
    .replace(/[.,]/g, "")
    .slice(0, 2);

  return `${wholePart}${separator}${decimalPart}`;
}

type ProductDetailsForm = {
  title: string;
  description: string;
  price: string;
  stock: string;
  horarioDesde: string;
  horarioHasta: string;
  pickupAddressId: string;
};

type CategorySuggestionForm = {
  name: string;
  description: string;
};

type ProductVariantForm = {
  clientId: string;
  persistedId?: string;
  size: string;
  color: string;
  colorHex: string;
  price: string;
  stock: string;
  isActive: boolean;
  attributes: Record<string, string>;
};

const defaultVariantColorPreview = "#94a3b8";

const emptyDetailsForm: ProductDetailsForm = {
  title: "",
  description: "",
  price: "",
  stock: "",
  horarioDesde: "",
  horarioHasta: "",
  pickupAddressId: "",
};

function parseAvailableHours(value?: string | null) {
  const times = value?.match(/(?:[01]\d|2[0-3]):[0-5]\d/g) ?? [];

  return {
    horarioDesde: times[0] ?? "",
    horarioHasta: times[1] ?? "",
  };
}

const emptyCategorySuggestionForm: CategorySuggestionForm = {
  name: "",
  description: "",
};

function createEmptyVariant(): ProductVariantForm {
  return {
    clientId: crypto.randomUUID(),
    size: "",
    color: "",
    colorHex: "",
    price: "",
    stock: "",
    isActive: true,
    attributes: {},
  };
}

function getSubmitErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;

  const message = error.response?.data?.message;

  if (Array.isArray(message)) return message.join(". ");
  return typeof message === "string" ? message : fallback;
}

function getAttributeAppliesTo(attribute: SubCategoryAttribute) {
  return attribute.appliesTo;
}

function isVariantSizeAttribute(attribute: SubCategoryAttribute) {
  return attribute.usage === "variant_size";
}

function isVariantColorAttribute(attribute: SubCategoryAttribute) {
  return attribute.usage === "variant_color";
}

function getVariantDisplayLabel(variant: ProductVariantForm) {
  return [variant.size.trim(), variant.color.trim()]
    .filter(Boolean)
    .join(" / ");
}

function normalizeColorName(name: string) {
  return name
    .trim()
    .toLocaleLowerCase("es-AR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
  const [catalogColors, setCatalogColors] = useState<Color[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [existingMediaItems, setExistingMediaItems] = useState<ProductMediaItem[]>([]);
  const [existingMediaIds, setExistingMediaIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [isOtherCategorySelected, setIsOtherCategorySelected] = useState(false);
  const [isOtherSubCategorySelected, setIsOtherSubCategorySelected] =
    useState(false);
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
  const [isLoadingColors, setIsLoadingColors] = useState(true);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [isSendingCategorySuggestion, setIsSendingCategorySuggestion] =
    useState(false);
  const [error, setError] = useState("");
  const [mediaValidationError, setMediaValidationError] = useState("");
  const [colorCatalogError, setColorCatalogError] = useState("");
  const [openColorVariantId, setOpenColorVariantId] = useState<string | null>(
    null
  );
  const [categorySuggestionError, setCategorySuggestionError] = useState("");
  const [categorySuggestionSuccess, setCategorySuggestionSuccess] = useState("");
  const [variantsTouched, setVariantsTouched] = useState(false);
  const [categoryImageAttempts, setCategoryImageAttempts] = useState<
    Record<string, number>
  >({});
  const [isApprovalNoticeOpen, setIsApprovalNoticeOpen] = useState(false);
  const [previewMediaIndex, setPreviewMediaIndex] = useState<number | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] =
    useState<CreateUserAddressPayload>(emptyAddressForm);
  const [newAddressError, setNewAddressError] = useState("");
  const [isSavingNewAddress, setIsSavingNewAddress] = useState(false);

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );
  const selectedSubCategory = subCategories.find(
    (subCategory) => subCategory.id === selectedSubCategoryId
  );
  const selectedRequiresApproval =
    isOtherSubCategorySelected ||
    Boolean(selectedSubCategory?.requiresApproval) ||
    Boolean(
      selectedSubCategory &&
        subCategoryRequiresManualApproval(selectedSubCategory.name)
    );
  const orderedSubCategories = useMemo(
    () =>
      [...subCategories].sort((left, right) => {
        const leftIsOther = normalizeName(left.name) === "otros";
        const rightIsOther = normalizeName(right.name) === "otros";

        if (leftIsOther === rightIsOther) return 0;
        return leftIsOther ? 1 : -1;
      }),
    [subCategories]
  );
  const hasPersistedOtherSubCategory = orderedSubCategories.some(
    (subCategory) => normalizeName(subCategory.name) === "otros"
  );

  const imagePreviews = useMemo(
    () => imageFiles.map((file) => URL.createObjectURL(file)),
    [imageFiles]
  );
  const previewedFile =
    previewMediaIndex === null ? undefined : imageFiles[previewMediaIndex];
  const previewedFileUrl =
    previewMediaIndex === null ? undefined : imagePreviews[previewMediaIndex];
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
  const catalogColorsByName = useMemo(
    () =>
      new Map(
        catalogColors.map((color) => [normalizeColorName(color.name), color])
      ),
    [catalogColors]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  useEffect(() => {
    if (previewMediaIndex === null) return;

    function handlePreviewKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPreviewMediaIndex(null);
    }

    window.addEventListener("keydown", handlePreviewKeyDown);
    return () => window.removeEventListener("keydown", handlePreviewKeyDown);
  }, [previewMediaIndex]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [categoriesData, addressesData, productData, colorsResult] =
          await Promise.all([
          getCategories(),
          getMyAddresses().catch(() => []),
          productId ? getProductById(productId) : Promise.resolve(null),
            getColors()
              .then((colors) => ({ colors, failed: false }))
              .catch(() => ({ colors: [] as Color[], failed: true })),
          ]);
        const defaultAddress = addressesData.find((address) => address.isDefault);

        setCatalogColors(colorsResult.colors);
        setColorCatalogError(
          colorsResult.failed
            ? "No se pudo cargar el catálogo de colores."
            : colorsResult.colors.length === 0
              ? "No hay colores disponibles en el catálogo."
              : ""
        );

        setCategories(categoriesData);
        setAddresses(addressesData);
        if (productData) {
          const subCategoryId = getProductSubCategoryId(productData);
          const categoryId = getProductCategoryId(productData);

          setEditingProduct(productData);
          setExistingMediaItems(getProductDisplayMediaItems(productData));
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
            ...parseAvailableHours(productData.horarioDisponible),
            pickupAddressId: productData.pickupAddress?.id ?? defaultAddress?.id ?? "",
          });
          const colorsByName = new Map(
            colorsResult.colors.map((color) => [
              normalizeColorName(color.name),
              color,
            ])
          );

          setVariants(
            (productData.variants ?? []).map((variant) => {
              const catalogColor = variant.color
                ? colorsByName.get(normalizeColorName(variant.color))
                : undefined;

              return {
                clientId: crypto.randomUUID(),
                persistedId: variant.id,
                size: variant.size ?? "",
                color: catalogColor?.name ?? variant.color ?? "",
                colorHex: catalogColor?.hex ?? variant.colorHex ?? "",
                price: String(variant.price ?? ""),
                stock: String(variant.stock ?? ""),
                isActive: variant.isActive !== false,
                attributes: (variant.attributes ?? []).reduce<
                  Record<string, string>
                >((values, attribute) => {
                  const attributeId = getProductAttributeId(attribute);
                  if (attributeId) {
                    values[attributeId] = attribute.value ?? "";
                  }
                  return values;
                }, {}),
              };
            })
          );
          setVariantsTouched(false);
          setStep(4);
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
        setIsLoadingColors(false);
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
        setIsOtherSubCategorySelected(false);
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
    const sanitizedValue =
      name === "price"
        ? sanitizePriceFieldInput(value)
        : name === "stock"
          ? sanitizeStockInput(value)
          : value;

    setDetailsForm((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
  }

  function handleDetailsPriceBlur() {
    const normalizedPrice = normalizePriceInput(detailsForm.price);

    if (normalizedPrice === null) return;

    setDetailsForm((currentDetails) => ({
      ...currentDetails,
      price: normalizedPrice,
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
    const files = Array.from(event.target.files ?? []);
    const unsupportedFile = files.find(
      (file) => !file.type.startsWith("image/") && !file.type.startsWith("video/")
    );

    if (unsupportedFile) {
      setError("Solo podés subir archivos de imagen o video.");
      event.target.value = "";
      return;
    }

    const selectedFileKeys = new Set(
      imageFiles.map(
        (file) => `${file.name}-${file.size}-${file.lastModified}`
      )
    );
    const newFiles = files.filter((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (selectedFileKeys.has(key)) return false;
      selectedFileKeys.add(key);
      return true;
    });
    const availableSlots = Math.max(
      0,
      maxProductMediaFiles - existingMediaItems.length - imageFiles.length
    );
    const filesToAdd = newFiles.slice(0, availableSlots);

    if (filesToAdd.length === 0) {
      setError(
        availableSlots === 0
          ? `Alcanzaste el límite de ${maxProductMediaFiles} archivos por publicación.`
          : "Esos archivos ya estaban seleccionados."
      );
      event.target.value = "";
      return;
    }

    setError(
      filesToAdd.length < newFiles.length
        ? `Se agregaron ${filesToAdd.length} archivos. El límite es de ${maxProductMediaFiles} por publicación.`
        : ""
    );
    setImageFiles((currentFiles) => currentFiles.concat(filesToAdd));
    setUploadedMedia([]);
    setMediaValidationError("");
    event.target.value = "";
  }

  function handlePickupAddressChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (event.target.value === newAddressOptionValue) {
      setNewAddressError("");
      setIsAddressModalOpen(true);
      return;
    }

    handleDetailsChange(event);
  }

  function handleNewAddressChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = event.target;
    const checked =
      type === "checkbox" ? (event.target as HTMLInputElement).checked : undefined;

    setNewAddressForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleCreateAddress(event: FormEvent) {
    event.preventDefault();
    setNewAddressError("");

    const payload = buildAddressPayload(newAddressForm, "");

    if (typeof payload === "string") {
      setNewAddressError(payload);
      return;
    }

    try {
      setIsSavingNewAddress(true);
      const createdAddress = await createUserAddress(payload);

      setAddresses((currentAddresses) =>
        createdAddress.isDefault
          ? currentAddresses
              .map((address) => ({ ...address, isDefault: false }))
              .concat(createdAddress)
          : currentAddresses.concat(createdAddress)
      );
      setDetailsForm((currentDetails) => ({
        ...currentDetails,
        pickupAddressId: createdAddress.id,
      }));
      setNewAddressForm(emptyAddressForm);
      setIsAddressModalOpen(false);
    } catch (createError) {
      setNewAddressError(
        createError instanceof Error
          ? createError.message
          : "No se pudo guardar la dirección."
      );
    } finally {
      setIsSavingNewAddress(false);
    }
  }

  function handleRemoveFile(indexToRemove: number) {
    setPreviewMediaIndex(null);
    setImageFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove)
    );
    setUploadedMedia([]);
    setError("");
  }

  function handleAddVariant() {
    setVariants((currentVariants) => currentVariants.concat(createEmptyVariant()));
    setVariantsTouched(true);
  }

  function handleRemoveVariant(clientId: string) {
    setVariants((currentVariants) =>
      currentVariants.filter((variant) => variant.clientId !== clientId)
    );
    setVariantsTouched(true);
  }

  function handleVariantChange(
    clientId: string,
    field: Exclude<
      keyof ProductVariantForm,
      "clientId" | "persistedId" | "attributes"
    >,
    value: string | boolean
  ) {
    const sanitizedValue =
      typeof value === "string" && field === "price"
        ? sanitizePriceFieldInput(value)
        : typeof value === "string" && field === "stock"
          ? sanitizeStockInput(value)
          : value;

    setVariants((currentVariants) =>
      currentVariants.map((variant) =>
        variant.clientId === clientId
          ? { ...variant, [field]: sanitizedValue }
          : variant
      )
    );
    setVariantsTouched(true);
  }

  function handleVariantColorChange(clientId: string, value: string) {
    const catalogColor = catalogColorsByName.get(normalizeColorName(value));

    setVariants((currentVariants) =>
      currentVariants.map((variant) =>
        variant.clientId === clientId
          ? {
              ...variant,
              color: catalogColor?.name ?? value,
              colorHex: catalogColor?.hex ?? "",
            }
          : variant
      )
    );
    setVariantsTouched(true);
  }

  function handleCatalogColorSelect(clientId: string, color: Color) {
    setVariants((currentVariants) =>
      currentVariants.map((variant) =>
        variant.clientId === clientId
          ? { ...variant, color: color.name, colorHex: color.hex }
          : variant
      )
    );
    setOpenColorVariantId(null);
    setVariantsTouched(true);
  }

  function handleVariantPriceBlur(variant: ProductVariantForm) {
    const normalizedPrice = normalizePriceInput(variant.price);

    if (normalizedPrice === null) return;

    handleVariantChange(variant.clientId, "price", normalizedPrice);
  }

  function handleVariantAttributeChange(
    variantId: string,
    attributeId: string,
    value: string
  ) {
    setVariants((currentVariants) =>
      currentVariants.map((variant) =>
        variant.clientId === variantId
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
    if (
      !selectedCategoryId ||
      (!selectedSubCategoryId && !isOtherSubCategorySelected)
    ) {
      setError("Elegí una categoría y una subcategoría.");
      return false;
    }

    setError("");
    return true;
  }

  function validateCategory() {
    if (!selectedCategoryId) {
      setError("ElegÃ­ una categorÃ­a para continuar.");
      return false;
    }

    setError("");
    return true;
  }

  async function handleContinueFromMedia() {
    const hasExistingOrSelectedMedia =
      existingMediaItems.length > 0 ||
      uploadedMedia.length > 0 ||
      imageFiles.length > 0;

    if (!hasExistingOrSelectedMedia) {
      setMediaValidationError(
        "Debés agregar al menos un archivo para continuar."
      );
      return;
    }

    setMediaValidationError("");

    if (imageFiles.length === 0) {
      setStep(4);
      return;
    }

    if (uploadedMedia.length > 0) {
      setStep(4);
      return;
    }

    try {
      setIsUploadingMedia(true);
      setError("");
      const media = await uploadProductMediaFiles(imageFiles);
      setUploadedMedia(media);
      setStep(4);
    } catch {
      setError("No se pudieron subir las fotos o los videos.");
    } finally {
      setIsUploadingMedia(false);
    }
  }

  function validateDetails() {
    const missingRequiredAttribute = productAttributes.find(
      (attribute) => attribute.required && !attributeValues[attribute.id]?.trim()
    );
    const hasVariants = variants.length > 0;

    if (Boolean(detailsForm.horarioDesde) !== Boolean(detailsForm.horarioHasta)) {
      setError("Elegí tanto la hora de inicio como la hora de finalización.");
      return false;
    }

    if (
      !detailsForm.title.trim() ||
      !detailsForm.description.trim() ||
      (!hasVariants && (!detailsForm.price || !detailsForm.stock))
    ) {
      setError(
        hasVariants
          ? "Completá titulo y descripcion."
          : "Completá titulo, descripcion, precio y stock."
      );
      return false;
    }

    if (!hasVariants) {
      const price = parsePriceInput(detailsForm.price);

      if (price === null || price <= 0) {
        setError(
          "El precio debe ser mayor a 0 y tener hasta dos decimales (punto o coma)."
        );
        return false;
      }

      if (Number(detailsForm.stock) < 0) {
        setError("El stock no puede ser negativo.");
        return false;
      }
    }

    if (hasVariants && !variants.some((variant) => variant.isActive)) {
      setError("El producto debe tener al menos una variante activa.");
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
      const colorHex = variant.colorHex.trim();
      const catalogColor = color
        ? catalogColorsByName.get(normalizeColorName(color))
        : undefined;
      const price = parsePriceInput(variant.price);
      const stock = Number(variant.stock);

      if (!size) {
        setError("Todas las variantes necesitan talle.");
        return false;
      }

      if (sizeOptions.length > 0 && !sizeOptions.includes(size)) {
        setError("El talle de cada variante debe estar dentro de las opciones.");
        return false;
      }

      if (colorAttribute?.required && (!color || !colorHex)) {
        setError(
          "Todas las variantes necesitan un nombre de color y una muestra elegida con el picker."
        );
        return false;
      }

      if (Boolean(color) !== Boolean(colorHex)) {
        setError("Elegí un color del catálogo.");
        return false;
      }

      if (
        color &&
        (!catalogColor ||
          catalogColor.hex.toUpperCase() !== colorHex.toUpperCase())
      ) {
        setError("Elegí un color del catálogo.");
        return false;
      }

      if (price === null || price <= 0) {
        setError(
          "El precio de cada variante debe ser mayor a 0 y tener hasta dos decimales (punto o coma)."
        );
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
        const variantLabel =
          getVariantDisplayLabel(variant) || variant.clientId;
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

    if (existingMediaItems.length === 0 && uploadedMedia.length === 0) {
      setMediaValidationError(
        "Debés agregar al menos un archivo para continuar."
      );
      setStep(3);
      return;
    }

    if (!validateDetails()) return;

    const selectedAddress = addresses.find(
      (address) => address.id === detailsForm.pickupAddressId
    );
    const variantPayload = variants.map((variant) => ({
      ...(isEditMode && variant.persistedId
        ? { id: variant.persistedId }
        : {}),
      size: variant.size.trim(),
      ...(variant.color.trim() && variant.colorHex.trim()
        ? {
            color: variant.color.trim(),
            colorHex: variant.colorHex.trim(),
          }
        : {}),
      price: parsePriceInput(variant.price)!,
      stock: Number(variant.stock),
      isActive: variant.isActive,
      attributes: variantAttributes
        .map((attribute) => ({
          attributeId: attribute.id,
          value: variant.attributes[attribute.id] ?? "",
        }))
        .filter((attribute) => attribute.value.trim() !== ""),
    }));
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
        ...(variants.length === 0
          ? {
              price: parsePriceInput(detailsForm.price)!,
              stock: Number(detailsForm.stock),
            }
          : {}),
        category: isOtherSubCategorySelected
          ? selectedCategoryId
          : selectedSubCategoryId,
        ...(!isOtherSubCategorySelected
          ? { subCategoryId: selectedSubCategoryId }
          : {}),
        direccionRetiro: selectedAddress ? formatUserAddress(selectedAddress) : "",
        horarioDisponible:
          detailsForm.horarioDesde && detailsForm.horarioHasta
            ? `${detailsForm.horarioDesde} a ${detailsForm.horarioHasta}`
            : detailsForm.horarioDesde || detailsForm.horarioHasta,
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

      navigate("/profile", {
        state: {
          productSuccess: isEditMode
            ? "Producto editado correctamente."
            : selectedRequiresApproval
              ? "Producto enviado. Quedó pendiente de aprobación y será revisado dentro de las próximas 24 horas."
              : "Producto creado correctamente.",
        },
      });
    } catch (submitError) {
      console.error(submitError);
      setError(
        getSubmitErrorMessage(
          submitError,
          isEditMode
            ? "No se pudo guardar el producto."
            : "No se pudo publicar el producto."
        )
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
      (value) =>
        handleVariantAttributeChange(variant.clientId, attribute.id, value),
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
    <section className="relative left-1/2 min-h-screen w-screen -translate-x-1/2 bg-[#eaf5ff] bg-[url('/categories/categories-page-background.png')] bg-cover bg-center px-4 py-6 shadow-[inset_0_18px_45px_rgba(255,255,255,0.30)] sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
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
        <div className="w-full py-2">
          <div className="mx-auto max-w-5xl rounded-3xl border border-white/80 bg-white/45 p-5 shadow-[0_20px_50px_rgba(42,101,153,0.14)] backdrop-blur-[2px] sm:p-6">
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
                const iconSprite = getCategoryIconSprite(category.name);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      if (selectedCategoryId === category.id) return;
                      setIsOtherCategorySelected(false);
                      setSelectedCategoryId(category.id);
                      setSelectedSubCategoryId("");
                      setIsOtherSubCategorySelected(false);
                      setSubCategories([]);
                      setAttributes([]);
                      setAttributeValues({});
                      setVariants([]);
                      setVariantsTouched(false);
                    }}
                    className={`group flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left shadow-[0_8px_20px_rgba(42,101,153,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_13px_28px_rgba(42,101,153,0.17)] ${
                      selectedCategoryId === category.id
                        ? "border-[#0068b5] bg-white ring-2 ring-[#cfeaff]"
                        : "border-white/90 bg-white/95 hover:border-[#a8d9f7]"
                    }`}
                  >
                    <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-sm font-black text-[var(--brand)]">
                      {iconSprite ? (
                        <span
                          aria-hidden="true"
                          className="block h-[100px] w-[100px] scale-[0.78] bg-white bg-no-repeat transition duration-300 group-hover:scale-[0.84]"
                          style={{
                            backgroundImage: `url('${iconSprite.imageUrl}')`,
                            backgroundPosition: `${iconSprite.left}px ${iconSprite.top}px`,
                            backgroundSize: iconSprite.backgroundSize,
                          }}
                        />
                      ) : imageUrl ? (
                        <img
                          key={imageUrl}
                          src={imageUrl}
                          alt={`Icono de ${category.name}`}
                          loading="lazy"
                          onError={() => handleCategoryImageError(category.id)}
                          className="h-full w-full object-contain p-1"
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

              <button
                type="button"
                onClick={() => {
                  setIsOtherCategorySelected(true);
                  setSelectedCategoryId("");
                  setSelectedSubCategoryId("");
                  setIsOtherSubCategorySelected(false);
                  setSubCategories([]);
                  setAttributes([]);
                  setAttributeValues({});
                  setVariants([]);
                  setVariantsTouched(false);
                  setError("");
                }}
                className={`group flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left shadow-[0_8px_20px_rgba(42,101,153,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_13px_28px_rgba(42,101,153,0.17)] ${
                  isOtherCategorySelected
                    ? "border-[#0068b5] bg-white ring-2 ring-[#cfeaff]"
                    : "border-white/90 bg-white/95 hover:border-[#a8d9f7]"
                }`}
              >
                <span
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ${
                    isOtherCategorySelected
                      ? "bg-[#d8ebff] text-[#0754b8]"
                      : "bg-[#edf7ff] text-[#2879b8]"
                  }`}
                >
                  <CircleEllipsis className="h-10 w-10" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-black text-slate-950">
                    Otros
                  </span>
                </span>
              </button>
            </div>
          )}

          {isOtherCategorySelected && (
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
          )}

          {!isOtherCategorySelected && (
          <button
            type="button"
            onClick={() => validateCategory() && setStep(2)}
            className="mt-6 w-full rounded-xl bg-[var(--brand)] px-6 py-4 font-bold text-white transition hover:bg-[var(--brand-hover)]"
          >
            Continuar
          </button>
          )}
          </div>
        </div>
      )}

      {!isEditMode && step === 2 && (
        <div className="w-full py-2">
          <div className="mx-auto max-w-5xl rounded-3xl border border-white/80 bg-white/55 p-5 shadow-[0_20px_50px_rgba(42,101,153,0.14)] backdrop-blur-[2px] sm:p-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-5 inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-[var(--brand)]"
            >
              <ChevronLeft size={18} />
              Volver a categorías
            </button>

            <h2 className="m-0 text-2xl font-black text-slate-950">
              Elegí la subcategoría
            </h2>

            {isLoadingSubCategories ? (
              <p className="mt-6 rounded-2xl border border-white bg-white/85 p-5 font-semibold text-slate-500">
                Cargando subcategorías...
              </p>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-[#c6e2fb] bg-white/95 shadow-[0_10px_28px_rgba(42,101,153,0.10)]">
                {orderedSubCategories.map((subCategory, index) => {
                  const isSelected = selectedSubCategoryId === subCategory.id;

                  return (
                    <button
                      key={subCategory.id}
                      type="button"
                      onClick={() => {
                        setIsOtherSubCategorySelected(false);
                        setSelectedSubCategoryId(subCategory.id);
                        setAttributes([]);
                        setAttributeValues({});
                        setVariants([]);
                        setVariantsTouched(false);
                        setError("");
                      }}
                      className={`flex min-h-14 w-full items-center justify-between px-5 py-4 text-left font-bold transition ${
                        index > 0 ? "border-t border-[#d9ebfa]" : ""
                      } ${
                        isSelected
                          ? "bg-[#d8ebff] text-[#0754b8]"
                          : "bg-white text-slate-800 hover:bg-[#edf7ff] hover:text-[#0754b8]"
                      }`}
                    >
                      <span>{subCategory.name}</span>
                      {isSelected && (
                        <span className="text-sm font-black">Seleccionada</span>
                      )}
                    </button>
                  );
                })}

                {!hasPersistedOtherSubCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtherSubCategorySelected(true);
                      setSelectedSubCategoryId("");
                      setAttributes([]);
                      setAttributeValues({});
                      setVariants([]);
                      setVariantsTouched(false);
                      setError("");
                    }}
                    className={`flex min-h-14 w-full items-center justify-between border-t border-[#d9ebfa] px-5 py-4 text-left font-bold transition ${
                      isOtherSubCategorySelected
                        ? "bg-[#d8ebff] text-[#0754b8]"
                        : "bg-white text-slate-800 hover:bg-[#edf7ff] hover:text-[#0754b8]"
                    }`}
                  >
                    <span>Otros</span>
                    {isOtherSubCategorySelected && (
                      <span className="text-sm font-black">Seleccionada</span>
                    )}
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (!validateClassification()) return;

                if (selectedRequiresApproval) {
                  setIsApprovalNoticeOpen(true);
                  return;
                }

                setStep(3);
              }}
              disabled={isLoadingSubCategories}
              className="mt-6 w-full rounded-xl bg-[var(--brand)] px-6 py-4 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setStep(isEditMode ? 4 : 2)}
            className="mb-5 inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-[var(--brand)]"
          >
            <ChevronLeft size={18} />
            Volver
          </button>

          <h2 className="m-0 text-2xl font-black text-slate-950">
            Subí fotos o videos
          </h2>
          <p className="mt-1 font-semibold text-slate-500">
            {selectedCategory?.name} / {isOtherSubCategorySelected ? "Otros" : selectedSubCategory?.name}
          </p>

          {existingMediaItems.length > 0 && (
            <div className="mt-5">
              <p className="mb-3 text-sm font-black uppercase text-slate-500">
                Archivos actuales
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {existingMediaItems.map((media) => (
                  <div
                    key={media.url}
                    className="aspect-square overflow-hidden rounded-2xl bg-slate-100"
                  >
                    {media.type === "video" ? (
                      <video src={media.url} controls preload="metadata" className="h-full w-full object-contain" />
                    ) : (
                      <img src={media.url} alt="Imagen actual" className="h-full w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="mt-6 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)]">
            <ImagePlus className="h-10 w-10 text-[var(--brand)]" aria-hidden="true" />
            <span className="mt-3 text-lg font-black text-slate-950">
              Seleccionar fotos o videos
            </span>
            <span className="mt-1 text-sm font-semibold text-slate-500">
              Podés combinar hasta {maxProductMediaFiles} fotos o videos y agregarlos en varias selecciones.
            </span>
            <input
              type="file"
              accept="image/*,video/*"
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
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                >
                  <button
                    type="button"
                    onClick={() => setPreviewMediaIndex(index)}
                    className="block h-full w-full cursor-zoom-in"
                    aria-label={`Abrir vista previa de ${imageFiles[index]?.name ?? `archivo ${index + 1}`}`}
                  >
                    {imageFiles[index]?.type.startsWith("video/") ? (
                      <video src={preview} muted preload="metadata" className="h-full w-full object-contain" />
                    ) : (
                      <img src={preview} alt={`Imagen ${index + 1}`} className="h-full w-full object-cover" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/80 text-white shadow-lg transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80"
                    aria-label={`Quitar ${imageFiles[index]?.name ?? `archivo ${index + 1}`}`}
                    title="Quitar archivo"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                  <span className="pointer-events-none absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-bold text-white">
                    {imageFiles[index]?.name}
                  </span>
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

          {mediaValidationError && (
            <p
              role="alert"
              className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-center font-bold text-red-700"
            >
              {mediaValidationError}
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

      {step === 4 && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <button
            type="button"
            onClick={() => setStep(3)}
            className="mb-5 inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-[var(--brand)]"
          >
            <ChevronLeft size={18} />
            Volver
          </button>

          <h2 className="m-0 text-2xl font-black text-slate-950">
            Datos del producto
          </h2>
          <p className="mt-1 font-semibold text-slate-500">
            {existingMediaItems.length + uploadedMedia.length} archivo
            {existingMediaItems.length + uploadedMedia.length === 1 ? "" : "s"} listo
            {existingMediaItems.length + uploadedMedia.length === 1 ? "" : "s"}.
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

            {variants.length === 0 ? (
              <>
                <input
                  name="price"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]+([.,][0-9]{0,2})?"
                  placeholder="Precio"
                  value={detailsForm.price}
                  onChange={handleDetailsChange}
                  onBlur={handleDetailsPriceBlur}
                  className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
                />

                <input
                  name="stock"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Stock"
                  value={detailsForm.stock}
                  onChange={handleDetailsChange}
                  className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
                />
              </>
            ) : (
              <p className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800 sm:col-span-2">
                El precio y el stock del producto se calculan automáticamente
                desde las variantes activas.
              </p>
            )}

            <select
              name="pickupAddressId"
              value={detailsForm.pickupAddressId}
              onChange={handlePickupAddressChange}
              disabled={isLoadingAddresses}
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
              <option value={newAddressOptionValue}>＋ Agregar una nueva dirección</option>
            </select>

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <legend className="px-2 font-black text-slate-800">
                Horario disponible
              </legend>
              <p className="mb-3 mt-0 text-sm font-semibold text-slate-500">
                Elegí desde qué hora y hasta qué hora pueden retirar el producto.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-600">Desde</span>
                  <span className="relative block">
                    <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--brand)]" aria-hidden="true" />
                    <input
                      name="horarioDesde"
                      type="time"
                      step="900"
                      value={detailsForm.horarioDesde}
                      onChange={handleDetailsChange}
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 font-bold text-slate-800 outline-none focus:border-[var(--brand)]"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-600">Hasta</span>
                  <span className="relative block">
                    <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--brand)]" aria-hidden="true" />
                    <input
                      name="horarioHasta"
                      type="time"
                      step="900"
                      value={detailsForm.horarioHasta}
                      onChange={handleDetailsChange}
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 font-bold text-slate-800 outline-none focus:border-[var(--brand)]"
                    />
                  </span>
                </label>
              </div>
            </fieldset>
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

            {(isLoadingColors || colorCatalogError) && (
              <p
                className={`mt-4 rounded-xl border p-4 font-semibold ${
                  colorCatalogError
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {colorCatalogError || "Cargando catálogo de colores..."}
              </p>
            )}

            {variants.length === 0 ? (
              <p className="mt-4 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
                Si no agregas variantes, se usaran el precio y stock base.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {variants.map((variant, index) => {
                  const normalizedSearch = normalizeColorName(variant.color);
                  const matchingColors = normalizedSearch
                    ? catalogColors.filter((color) =>
                        normalizeColorName(color.name).includes(normalizedSearch)
                      )
                    : catalogColors;
                  const colorListId = `product-variant-color-options-${variant.clientId}`;
                  const isColorMenuOpen =
                    openColorVariantId === variant.clientId;

                  return (
                    <div
                      key={variant.clientId}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="font-black text-slate-950">
                        Variante {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variant.clientId)}
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
                                variant.clientId,
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
                                variant.clientId,
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
                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                          <div
                            className="relative"
                            onBlur={(event) => {
                              if (
                                !event.currentTarget.contains(event.relatedTarget)
                              ) {
                                setOpenColorVariantId(null);
                              }
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Escape") {
                                setOpenColorVariantId(null);
                              }
                            }}
                          >
                            <input
                              value={variant.color}
                              disabled={
                                isLoadingColors || Boolean(colorCatalogError)
                              }
                              onFocus={() =>
                                setOpenColorVariantId(variant.clientId)
                              }
                              onChange={(event) => {
                                handleVariantColorChange(
                                  variant.clientId,
                                  event.target.value
                                );
                                setOpenColorVariantId(variant.clientId);
                              }}
                              placeholder={
                                colorAttribute?.name ?? "Color opcional"
                              }
                              role="combobox"
                              aria-autocomplete="list"
                              aria-expanded={isColorMenuOpen}
                              aria-controls={colorListId}
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
                            />

                            {isColorMenuOpen && (
                              <div
                                id={colorListId}
                                role="listbox"
                                className="absolute left-0 top-full z-30 mt-2 max-h-56 w-[min(26rem,calc(100vw-3rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
                              >
                                {matchingColors.length > 0 ? (
                                  matchingColors.map((color) => (
                                    <button
                                      key={color.id}
                                      type="button"
                                      role="option"
                                      aria-selected={
                                        normalizeColorName(variant.color) ===
                                        normalizeColorName(color.name)
                                      }
                                      onClick={() =>
                                        handleCatalogColorSelect(
                                          variant.clientId,
                                          color
                                        )
                                      }
                                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                                    >
                                      <span
                                        className="h-6 w-6 shrink-0 rounded-full border border-slate-300"
                                        style={{ backgroundColor: color.hex }}
                                        aria-hidden="true"
                                      />
                                      <span className="min-w-0 flex-1 font-semibold text-slate-800">
                                        {color.name}
                                      </span>
                                      <span className="text-xs font-bold text-slate-500">
                                        {color.hex}
                                      </span>
                                    </button>
                                  ))
                                ) : (
                                  <p className="px-3 py-4 text-sm font-semibold text-slate-500">
                                    No encontramos colores.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <label className="flex h-12 min-w-28 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3">
                            <span
                              className="h-6 w-6 rounded-full border border-slate-300"
                              style={{
                                backgroundColor:
                                  variant.colorHex || defaultVariantColorPreview,
                              }}
                              aria-hidden="true"
                            />
                            <input
                              type="color"
                              value={
                                variant.colorHex || defaultVariantColorPreview
                              }
                              disabled
                              aria-label="Muestra de color del catálogo"
                              className="h-8 w-10 cursor-not-allowed border-0 bg-transparent p-0"
                            />
                          </label>
                        </div>
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
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]+([.,][0-9]{0,2})?"
                        value={variant.price}
                        onChange={(event) =>
                          handleVariantChange(
                            variant.clientId,
                            "price",
                            event.target.value
                          )
                        }
                        onBlur={() => handleVariantPriceBlur(variant)}
                        placeholder="Precio"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
                      />

                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={variant.stock}
                        onChange={(event) =>
                          handleVariantChange(
                            variant.clientId,
                            "stock",
                            event.target.value
                          )
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
                              variant.clientId,
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
                  );
                })}
              </div>
            )}
          </div>

          {(existingMediaItems.length > 0 || uploadedMedia.length > 0) && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {existingMediaItems.map((media) => (
                <div
                  key={media.url}
                  className="aspect-square overflow-hidden rounded-2xl bg-slate-100"
                >
                  {media.type === "video" ? (
                    <video src={media.url} controls preload="metadata" className="h-full w-full object-contain" />
                  ) : (
                    <img src={media.url} alt="Imagen actual" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
              {uploadedMedia.map((media) => {
                const url = buildImageUrl(media.url);

                return (
                  <div
                    key={media.id}
                    className="aspect-square overflow-hidden rounded-2xl bg-slate-100"
                  >
                    {url && (media.type === "video" ? (
                      <video src={url} controls preload="metadata" className="h-full w-full object-contain" />
                    ) : (
                      <img src={url} alt="Imagen cargada" className="h-full w-full object-cover" />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {selectedRequiresApproval ? (
            <p className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-4 font-semibold text-blue-800">
              Esta publicación quedará pendiente de aprobación. La revisión
              demora aproximadamente 24 horas o menos.
            </p>
          ) : (
            <p className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-800">
              Cuando completes el formulario, el producto se publicará automáticamente.
            </p>
          )}

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

      </div>

      {previewedFile && previewedFileUrl && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="media-preview-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewMediaIndex(null);
          }}
        >
          <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <h2 id="media-preview-title" className="m-0 truncate text-lg font-black text-slate-950">
                  {previewedFile.name}
                </h2>
                <p className="m-0 mt-0.5 text-sm font-semibold text-slate-500">
                  Vista previa del archivo seleccionado
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMediaIndex(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                aria-label="Cerrar vista previa"
              >
                <X size={21} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-950 p-4 sm:p-6">
              {previewedFile.type.startsWith("video/") ? (
                <video
                  src={previewedFileUrl}
                  controls
                  autoPlay
                  className="max-h-[75vh] max-w-full rounded-xl object-contain"
                >
                  Tu navegador no puede reproducir este video.
                </video>
              ) : (
                <img
                  src={previewedFileUrl}
                  alt={`Vista previa de ${previewedFile.name}`}
                  className="max-h-[75vh] max-w-full rounded-xl object-contain"
                />
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  if (previewMediaIndex !== null) handleRemoveFile(previewMediaIndex);
                }}
                className="rounded-xl border border-red-200 px-4 py-2.5 font-bold text-red-600 transition hover:bg-red-50"
              >
                Quitar archivo
              </button>
              <button
                type="button"
                onClick={() => setPreviewMediaIndex(null)}
                className="rounded-xl bg-[var(--brand)] px-5 py-2.5 font-bold text-white transition hover:bg-[var(--brand-hover)]"
              >
                Es el correcto
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddressModalOpen && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-address-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSavingNewAddress) {
              setIsAddressModalOpen(false);
            }
          }}
        >
          <form
            onSubmit={handleCreateAddress}
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              disabled={isSavingNewAddress}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
              aria-label="Cerrar formulario de dirección"
            >
              <X size={20} />
            </button>

            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <MapPin size={25} />
            </span>
            <h2 id="new-address-title" className="mb-0 mt-4 text-2xl font-black text-slate-950">
              Agregar una nueva dirección
            </h2>
            <p className="mt-1 font-semibold text-slate-500">
              Se guardará en tu cuenta y quedará seleccionada para esta publicación.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <input name="label" value={newAddressForm.label} onChange={handleNewAddressChange} placeholder="Etiqueta: Casa, Trabajo o Local" required className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]" />
              <input name="receiverName" value={newAddressForm.receiverName ?? ""} onChange={handleNewAddressChange} placeholder="Nombre de quien recibe (opcional)" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]" />
              <input name="phone" value={newAddressForm.phone} onChange={handleNewAddressChange} placeholder="Teléfono de contacto" required className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]" />
              <input name="street" value={newAddressForm.street} onChange={handleNewAddressChange} placeholder="Calle" required className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]" />
              <input name="number" value={newAddressForm.number} onChange={handleNewAddressChange} placeholder="Número" required className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]" />
              <input name="postalCode" value={newAddressForm.postalCode} onChange={handleNewAddressChange} placeholder="Código postal" required className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]" />
              <input name="city" value={newAddressForm.city} onChange={handleNewAddressChange} placeholder="Ciudad o localidad" required className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]" />
              <input name="province" value={newAddressForm.province} onChange={handleNewAddressChange} placeholder="Provincia" required className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]" />
              <input name="floor" value={newAddressForm.floor ?? ""} onChange={handleNewAddressChange} placeholder="Piso (opcional)" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]" />
              <input name="apartment" value={newAddressForm.apartment ?? ""} onChange={handleNewAddressChange} placeholder="Departamento (opcional)" className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]" />
              <textarea name="reference" value={newAddressForm.reference ?? ""} onChange={handleNewAddressChange} placeholder="Referencia para el repartidor (opcional)" className="min-h-24 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] sm:col-span-2" />
              <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 font-bold text-slate-700 sm:col-span-2">
                <input name="isDefault" type="checkbox" checked={Boolean(newAddressForm.isDefault)} onChange={handleNewAddressChange} className="h-4 w-4" />
                Usar como dirección predeterminada
              </label>
            </div>

            {newAddressError && (
              <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
                {newAddressError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setIsAddressModalOpen(false)} disabled={isSavingNewAddress} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                Cancelar
              </button>
              <button disabled={isSavingNewAddress} className="rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60">
                {isSavingNewAddress ? "Guardando..." : "Guardar y seleccionar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isApprovalNoticeOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approval-notice-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsApprovalNoticeOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-md rounded-3xl border border-blue-100 bg-white p-7 text-center shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
            <button
              type="button"
              onClick={() => setIsApprovalNoticeOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cerrar aviso"
            >
              <X size={20} />
            </button>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/60">
              <ShieldAlert className="text-blue-600" size={38} strokeWidth={1.8} />
            </div>

            <h2
              id="approval-notice-title"
              className="mb-0 mt-7 text-2xl font-black text-slate-950"
            >
              Esta publicación requiere revisión
            </h2>
            <p className="mx-auto mt-3 max-w-sm font-semibold leading-6 text-slate-600">
              Por la subcategoría elegida, el producto quedará pendiente de
              aprobación antes de aparecer publicado.
            </p>

            <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 font-bold text-blue-800">
              <Clock3 size={20} />
              La revisión demora aproximadamente 24 horas o menos
            </div>

            <button
              type="button"
              onClick={() => {
                setIsApprovalNoticeOpen(false);
                setStep(3);
              }}
              className="mt-6 w-full rounded-xl bg-[var(--brand)] px-6 py-3.5 font-bold text-white transition hover:bg-[var(--brand-hover)]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default CreateProductPage;
