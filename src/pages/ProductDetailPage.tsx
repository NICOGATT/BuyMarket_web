import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { getProductById } from "../shared/services/product.service";
import type { Product } from "../shared/types/Product";
import { getProductImageUrls } from "../shared/utils/productImages";

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
