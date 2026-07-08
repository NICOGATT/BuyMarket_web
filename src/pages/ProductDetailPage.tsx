import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, User, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addCart,
  addProductToCart,
  isAuthRequiredError,
} from "../features/cart/store/cartStore";
import { getProductById } from "../shared/services/product.service";
import type {
  Product,
  ProductAttributeValue,
  ProductPublisher,
  ProductVariant,
} from "../shared/types/Product";
import { getProductImageUrls } from "../shared/utils/productImages";
import {
  formatVariantLabel,
  getDisplayPrice,
  getPurchasableVariants,
  getVariantTotalStock,
} from "../shared/utils/productVariants";
import { formatUserAddress } from "../shared/utils/userAddress";

function getTextValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getPublisherLabel(publisher: ProductPublisher) {
  if (typeof publisher === "string") return publisher;

  const fullName = [publisher.firstName, publisher.lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || publisher.email || "";
}

function getPublisherName(product: Product) {
  const publisher =
    product.seller ??
    product.owner ??
    product.user ??
    product.createdBy ??
    product.publishedBy;

  if (publisher) return getPublisherLabel(publisher);

  return (
    getTextValue(product.sellerId) ||
    getTextValue(product.ownerId) ||
    getTextValue(product.userId) ||
    getTextValue(product.createdById) ||
    getTextValue(product.publishedById)
  );
}

function getProductAddress(product: Product) {
  const address = getTextValue(product.direccionRetiro);

  if (address) return address;
  if (product.pickupAddress) return formatUserAddress(product.pickupAddress);

  return "";
}

function getProductFeatures(product: Product) {
  const attributes =
    product.attributes ??
    product.attributeValues ??
    product.productAttributes ??
    product.productAttributeValues ??
    [];

  return attributes
    .map((attribute: ProductAttributeValue) => {
      const name =
        attribute.attribute?.name ??
        attribute.subCategoryAttribute?.name ??
        attribute.name ??
        "";
      const value = getTextValue(attribute.value);

      return {
        name: name.trim(),
        value: value === "true" ? "Si" : value === "false" ? "No" : value,
      };
    })
    .filter((feature) => feature.name && feature.value);
}

function getVariantFeatures(variant?: ProductVariant | null) {
  return (variant?.attributes ?? [])
    .map((attribute) => {
      const name =
        attribute.attribute?.name ??
        attribute.subCategoryAttribute?.name ??
        attribute.name ??
        "";
      const value = getTextValue(attribute.value);

      return {
        id:
          attribute.id ??
          attribute.attributeId ??
          attribute.subCategoryAttributeId ??
          attribute.attribute?.id ??
          attribute.subCategoryAttribute?.id ??
          name,
        name: name.trim(),
        value: value === "true" ? "Si" : value === "false" ? "No" : value,
      };
    })
    .filter((feature) => feature.name && feature.value);
}

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [buyNowError, setBuyNowError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;

      const data = await getProductById(id);
      setProduct(data);
      setSelectedImageIndex(0);
      setSelectedSize("");
      setSelectedColor("");
    }

    loadProduct();
  }, [id]);

  if (!product) {
    return <p className="text-slate-500">Cargando producto...</p>;
  }

  const imageUrls = getProductImageUrls(product);
  const selectedImage = imageUrls[selectedImageIndex];
  const hasMultipleImages = imageUrls.length > 1;
  const features = getProductFeatures(product);
  const publisherName = getPublisherName(product);
  const productAddress = getProductAddress(product);
  const availableSchedule = getTextValue(product.horarioDisponible);
  const purchasableVariants = getPurchasableVariants(product);
  const hasVariants = (product.variants ?? []).length > 0;
  const sizeOptions = Array.from(
    new Set(purchasableVariants.map((variant) => variant.size))
  );
  const colorOptions = Array.from(
    new Set(
      purchasableVariants
        .filter((variant) => variant.size === selectedSize)
        .map((variant) => variant.color ?? "")
    )
  );
  const selectedVariant =
    hasVariants && selectedSize
      ? purchasableVariants.find(
          (variant) =>
            variant.size === selectedSize &&
            (variant.color ?? "") === selectedColor
        ) ?? null
      : null;
  const displayedPrice = selectedVariant?.price ?? getDisplayPrice(product);
  const displayedStock =
    selectedVariant?.stock ?? getVariantTotalStock(product) ?? product.stock;
  const selectedVariantFeatures = getVariantFeatures(selectedVariant);

  function showPreviousImage() {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0 ? imageUrls.length - 1 : currentIndex - 1
    );
  }

  function showNextImage() {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === imageUrls.length - 1 ? 0 : currentIndex + 1
    );
  }

  async function handleBuyNow() {
    if (!product) return;

    if (hasVariants && !selectedVariant?.id) {
      setBuyNowError("Elegí talle y color para comprar este producto.");
      return;
    }

    try {
      setIsBuyingNow(true);
      setBuyNowError("");
      if (selectedVariant?.id) {
        await addProductToCart({
          productId: product.id,
          variantId: selectedVariant.id,
          quantity: 1,
        });
      } else {
        await addCart(product);
      }
      navigate("/checkout");
    } catch (error) {
      if (isAuthRequiredError(error)) {
        navigate("/login");
        return;
      }

      setBuyNowError("No se pudo preparar tu compra. Intentalo nuevamente.");
    } finally {
      setIsBuyingNow(false);
    }
  }

  async function handleAddToCart() {
    if (!product) return;

    if (hasVariants && !selectedVariant?.id) {
      setBuyNowError("Elegí talle y color para agregar este producto.");
      return;
    }

    try {
      setIsAddingToCart(true);
      setBuyNowError("");
      if (selectedVariant?.id) {
        await addProductToCart({
          productId: product.id,
          variantId: selectedVariant.id,
          quantity: 1,
        });
      } else {
        await addCart(product);
      }
    } catch (error) {
      if (isAuthRequiredError(error)) {
        navigate("/login");
        return;
      }

      setBuyNowError("No se pudo agregar el producto al carrito.");
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <section className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
      <div className="min-w-0">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm sm:rounded-3xl">
          {selectedImage ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="block w-full"
              aria-label="Ampliar imagen del producto"
            >
              <img
                src={selectedImage}
                alt={product.title}
                className="aspect-[4/3] w-full object-contain"
              />
            </button>
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center text-sm font-bold text-slate-400">
              Sin imagen
            </div>
          )}

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={showPreviousImage}
                aria-label="Ver imagen anterior"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm transition hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={showNextImage}
                aria-label="Ver imagen siguiente"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm transition hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>

              <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/80 px-3 py-1 text-sm font-bold text-white">
                {selectedImageIndex + 1} / {imageUrls.length}
              </span>
            </>
          )}
        </div>

        {hasMultipleImages && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {imageUrls.map((imageUrl, index) => (
              <button
                key={imageUrl}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`Ver imagen ${index + 1}`}
                className={`h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-2 bg-slate-100 transition ${
                  selectedImageIndex === index
                    ? "border-[var(--brand)]"
                    : "border-transparent hover:border-slate-300"
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`${product.title} ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
          <h2 className="m-0 text-xl font-black text-slate-950">
            Datos de la publicacion
          </h2>

          <div className="grid gap-3">
            <div className="flex min-w-0 gap-3 rounded-2xl bg-slate-50 p-4">
              <User className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="m-0 text-sm font-black uppercase text-slate-500">
                  Publicado por
                </p>
                <p className="m-0 mt-1 break-words font-bold text-slate-900">
                  {publisherName || "No informado"}
                </p>
              </div>
            </div>
            <div className="flex min-w-0 gap-3 rounded-2xl bg-slate-50 p-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="m-0 text-sm font-black uppercase text-slate-500">
                  Horario
                </p>
                <p className="m-0 mt-1 break-words font-bold text-slate-900">
                  {availableSchedule || "No informado"}
                </p>
              </div>
            </div>
            <div className="flex min-w-0 gap-3 rounded-2xl bg-slate-50 p-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="m-0 text-sm font-black uppercase text-slate-500">
                  Retiro
                </p>
                <p className="m-0 mt-1 break-words font-bold text-slate-900">
                  {productAddress || "No informado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
          <h2 className="m-0 text-xl font-black text-slate-950">
            Caracteristicas
          </h2>

          {features.length > 0 ? (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={`${feature.name}-${feature.value}`}
                  className="rounded-2xl bg-slate-50 p-4"
                >
                  <dt className="text-sm font-black uppercase text-slate-500">
                    {feature.name}
                  </dt>
                  <dd className="m-0 mt-1 font-bold text-slate-900">
                    {feature.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 rounded-2xl bg-slate-50 p-4 font-semibold text-slate-500">
              Este producto no tiene caracteristicas significativas.
            </p>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          {product.title}
        </h1>
        <p className="mt-4 break-words text-slate-600">{product.description}</p>

        <p className="mt-6 text-3xl font-black text-[var(--brand)] sm:text-4xl">
          {hasVariants && !selectedVariant ? "Desde " : ""}$
          {displayedPrice.toLocaleString("es-AR")}
        </p>

        <p className="mt-2 text-sm font-bold text-slate-500">
          Stock disponible: {displayedStock}
        </p>

        {hasVariants && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="m-0 text-lg font-black text-slate-950">
              Variantes
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-bold text-slate-700">
                  Talle
                </span>
                <select
                  value={selectedSize}
                  onChange={(event) => {
                    setSelectedSize(event.target.value);
                    setSelectedColor("");
                    setBuyNowError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-[var(--brand)]"
                >
                  <option value="">Elegir talle</option>
                  {sizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-bold text-slate-700">
                  Color
                </span>
                <select
                  value={selectedColor}
                  onChange={(event) => {
                    setSelectedColor(event.target.value);
                    setBuyNowError("");
                  }}
                  disabled={!selectedSize}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-[var(--brand)] disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">
                    {selectedSize ? "Elegir color" : "Primero elegí talle"}
                  </option>
                  {colorOptions.map((color) => (
                    <option key={color || "sin-color"} value={color}>
                      {color || "Sin color"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedVariant && (
              <p className="mt-4 rounded-xl bg-slate-50 p-3 font-semibold text-slate-600">
                Seleccionado: {formatVariantLabel(selectedVariant)} - $
                {selectedVariant.price.toLocaleString("es-AR")}
              </p>
            )}

            {selectedVariantFeatures.length > 0 && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <h3 className="m-0 text-base font-black text-slate-950">
                  Caracteristicas de la variante
                </h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {selectedVariantFeatures.map((feature) => (
                    <div
                      key={`${feature.id}-${feature.name}`}
                      className="rounded-xl bg-white p-3"
                    >
                      <dt className="text-xs font-black uppercase text-slate-500">
                        {feature.name}
                      </dt>
                      <dd className="m-0 mt-1 font-bold text-slate-900">
                        {feature.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}

        {buyNowError && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
            {buyNowError}
          </p>
        )}

        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAddingToCart || isBuyingNow}
            className="w-full rounded-xl bg-[var(--brand)] px-6 py-4 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:bg-[#BBA7E8] sm:w-auto sm:px-8"
          >
            {isAddingToCart ? "Agregando..." : "Agregar al carrito"}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isAddingToCart || isBuyingNow}
            className="w-full rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:w-auto sm:px-8"
          >
            {isBuyingNow ? "Preparando tu compra..." : "Comprar ahora"}
          </button>
        </div>
      </div>

      {isBuyingNow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-xl">
            <p className="text-lg font-black text-slate-950">
              Se esta preparando tu compra
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Estamos agregando el producto al carrito...
            </p>
          </div>
        </div>
      )}

      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative flex max-h-full w-full max-w-5xl items-center justify-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Cerrar imagen ampliada"
              className="absolute right-0 top-0 z-10 flex h-11 w-11 -translate-y-2 translate-x-2 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            {hasMultipleImages && (
              <button
                type="button"
                onClick={showPreviousImage}
                aria-label="Ver imagen anterior"
                className="absolute left-0 z-10 flex h-12 w-12 -translate-x-2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
            )}

            <img
              src={selectedImage}
              alt={product.title}
              className="max-h-[86vh] w-auto max-w-full rounded-2xl bg-white object-contain shadow-2xl"
            />

            {hasMultipleImages && (
              <button
                type="button"
                onClick={showNextImage}
                aria-label="Ver imagen siguiente"
                className="absolute right-0 z-10 flex h-12 w-12 translate-x-2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            )}

            {hasMultipleImages && (
              <span className="absolute bottom-3 rounded-full bg-slate-950/80 px-3 py-1 text-sm font-bold text-white">
                {selectedImageIndex + 1} / {imageUrls.length}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductDetailPage;
