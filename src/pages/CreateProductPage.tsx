import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Check, ChevronLeft, ImagePlus, UploadCloud } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../shared/services/category.service";
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

const emptyDetailsForm: ProductDetailsForm = {
  title: "",
  description: "",
  price: "",
  stock: "",
  horarioDisponible: "",
  pickupAddressId: "",
};

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
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [error, setError] = useState("");

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
      setSubCategories([]);
      setSelectedSubCategoryId("");
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
        setError("No se pudieron cargar las subcategorias.");
      } finally {
        setIsLoadingSubCategories(false);
      }
    }

    loadSubCategories();
  }, [selectedCategoryId]);

  useEffect(() => {
    if (!selectedSubCategoryId) {
      setAttributes([]);
      setAttributeValues({});
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
            values[attribute.id] = attribute.type === "boolean" ? "false" : "";
            return values;
          }, {})
        );
      } catch {
        setError("No se pudieron cargar los atributos de la subcategoria.");
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

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    setImageFiles(Array.from(event.target.files ?? []));
    setUploadedMedia([]);
  }

  function validateClassification() {
    if (!selectedCategoryId || !selectedSubCategoryId) {
      setError("Elegí una categoria y una subcategoria.");
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
      setError("No se pudieron subir las imagenes.");
    } finally {
      setIsUploadingMedia(false);
    }
  }

  function validateDetails() {
    const missingRequiredAttribute = attributes.find(
      (attribute) => attribute.required && !attributeValues[attribute.id]?.trim()
    );

    if (
      !detailsForm.title.trim() ||
      !detailsForm.description.trim() ||
      !detailsForm.price ||
      !detailsForm.stock
    ) {
      setError("Completá titulo, descripcion, precio y stock.");
      return false;
    }

    if (Number(detailsForm.price) <= 0 || Number(detailsForm.stock) < 0) {
      setError("El precio debe ser mayor a 0 y el stock no puede ser negativo.");
      return false;
    }

    if (!detailsForm.pickupAddressId) {
      setError("Elegí una direccion para que el repartidor sepa donde retirar.");
      return false;
    }

    if (missingRequiredAttribute) {
      setError(`Completá el atributo obligatorio: ${missingRequiredAttribute.name}.`);
      return false;
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

    try {
      setIsSubmiting(true);
      await createProduct({
        title: detailsForm.title.trim(),
        description: detailsForm.description.trim(),
        price: Number(detailsForm.price),
        stock: Number(detailsForm.stock),
        category: selectedSubCategoryId,
        subCategoryId: selectedSubCategoryId,
        direccionRetiro: selectedAddress ? formatUserAddress(selectedAddress) : "",
        horarioDisponible: detailsForm.horarioDisponible,
        pickupAddressId: detailsForm.pickupAddressId,
        mediaIds: uploadedMedia.map((media) => media.id).filter(Boolean) as string[],
        attributes: attributes
          .map((attribute) => ({
            attributeId: attribute.id,
            value: attributeValues[attribute.id] ?? "",
          }))
          .filter((item) => item.value.trim() !== ""),
      });

      navigate("/products");
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
      "w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600";

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-blue-600">
            Nueva publicación
          </p>
          <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
            Publicar producto
          </h1>
        </div>

        <div className="flex gap-2">
          {[1, 2, 3].map((item) => (
            <span
              key={item}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
                step >= item
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {item}
            </span>
          ))}
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
              Cargando categorias...
            </p>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedCategoryId === category.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-200"
                  }`}
                >
                  <span className="block text-lg font-black text-slate-950">
                    {category.name}
                  </span>
                  {category.description && (
                    <span className="mt-1 block text-sm font-semibold text-slate-500">
                      {category.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <label className="mb-2 block font-bold text-slate-700">
              Subcategoria
            </label>
            <select
              value={selectedSubCategoryId}
              onChange={(event) => setSelectedSubCategoryId(event.target.value)}
              disabled={!selectedCategoryId || isLoadingSubCategories}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">
                {isLoadingSubCategories
                  ? "Cargando subcategorias..."
                  : selectedCategoryId
                    ? "Selecciona una subcategoria"
                    : "Primero elegí una categoria"}
              </option>
              {subCategories.map((subCategory) => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => validateClassification() && setStep(2)}
            className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
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
            className="mb-5 inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-blue-600"
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

          <label className="mt-6 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-blue-300 hover:bg-blue-50">
            <ImagePlus className="h-10 w-10 text-blue-600" aria-hidden="true" />
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
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
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
            className="mb-5 inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-blue-600"
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
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 sm:col-span-2"
            />

            <textarea
              name="description"
              placeholder="Descripcion"
              value={detailsForm.description}
              onChange={handleDetailsChange}
              className="min-h-32 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 sm:col-span-2"
            />

            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio"
              value={detailsForm.price}
              onChange={handleDetailsChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />

            <input
              name="stock"
              type="number"
              min="0"
              placeholder="Stock"
              value={detailsForm.stock}
              onChange={handleDetailsChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />

            <select
              name="pickupAddressId"
              value={detailsForm.pickupAddressId}
              onChange={handleDetailsChange}
              disabled={isLoadingAddresses || addresses.length === 0}
              className="rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500 sm:col-span-2"
            >
              <option value="">
                {isLoadingAddresses
                  ? "Cargando direcciones..."
                  : addresses.length === 0
                    ? "No tenes direcciones guardadas"
                    : "Selecciona la direccion para el repartidor"}
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
                <Link to="/profile" className="font-bold text-blue-600 hover:underline">
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
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 sm:col-span-2"
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
            ) : attributes.length === 0 ? (
              <p className="mt-4 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
                Esta subcategoria no tiene atributos extra.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {attributes.map((attribute) => (
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

          <button
            disabled={isSubmiting}
            className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmiting ? "Publicando..." : "Publicar producto"}
          </button>
        </form>
      )}
    </section>
  );
}

export default CreateProductPage;
