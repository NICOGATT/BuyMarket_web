import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, User, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { getProductById } from "../shared/services/product.service";
import type {
  Product,
  ProductAttributeValue,
  ProductPublisher,
} from "../shared/types/Product";
import { getProductImageUrls } from "../shared/utils/productImages";
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

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;

      const data = await getProductById(id);
      setProduct(data);
      setSelectedImageIndex(0);
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

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
      <div className="min-w-0">
        <div className="relative max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
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
                    ? "border-blue-600"
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

        <div className="mt-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm w-230">
          <h2 className="m-0 text-xl font-black text-slate-950">
            Datos de la publicacion
          </h2>

          <div className="grid gap-3">
            <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <User className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
              <div>
                <p className="m-0 text-sm font-black uppercase text-slate-500">
                  Publicado por
                </p>
                <p className="m-0 mt-1 font-bold text-slate-900">
                  {publisherName || "No informado"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
              <div>
                <p className="m-0 text-sm font-black uppercase text-slate-500">
                  Direccion
                </p>
                <p className="m-0 mt-1 font-bold text-slate-900">
                  {productAddress || "No informada"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
              <div>
                <p className="m-0 text-sm font-black uppercase text-slate-500">
                  Horario
                </p>
                <p className="m-0 mt-1 font-bold text-slate-900">
                  {availableSchedule || "No informado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm w-230">
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

      <div>
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          {product.title}
        </h1>
        <p className="mt-4 text-slate-600">{product.description}</p>

        <p className="mt-6 text-4xl font-black text-blue-600">
          ${product.price.toLocaleString("es-AR")}
        </p>

        <button className="mt-8 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700">
          Comprar ahora
        </button>
      </div>

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
