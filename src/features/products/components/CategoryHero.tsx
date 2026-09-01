import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { Category } from "../../../shared/types/Category";
import { getCategoryBannerUrl } from "../../../shared/utils/categoryImages";
import {
  getCategoryConfig,
  normalizeName,
  type CategoryBrand,
} from "../categoryConfig";

type CategoryHeroProps = {
  category: Category;
};

type DisplayedBrand = CategoryBrand & {
  placeholder: boolean;
};

function CategoryHero({ category }: CategoryHeroProps) {
  const config = getCategoryConfig(category.name);
  const normalizedCategoryName = normalizeName(category.name);
  const description = category.description?.trim() || config.description || "";
  const bannerUrl = getCategoryBannerUrl(category);
  const brandCards = config.brands;
  const panoramicTheme =
    normalizedCategoryName === "mascotas"
      ? {
          banner: "/banners/mascotas-banner-profesional.png",
          background: "bg-[#fdb258]",
          brandsBackground:
            "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,202,151,0.58)_58%,#ffc68f_100%),linear-gradient(90deg,#f8a52c_0%,#fdb75f_52%,#ffc88e_100%)]",
          circleBorder: "border-orange-100",
          shadow: "shadow-[0_24px_70px_rgba(234,88,12,0.14)]",
          titleColor: "text-slate-950",
          brandNameColor: "text-slate-900",
          alt: "Todo para tu mascota: descuentos y envíos en el mismo día",
        }
      : normalizedCategoryName === "tecno"
        ? {
            banner: "/banners/tecno-banner-moderno.png",
            background: "bg-[#16afe9]",
            brandsBackground:
              "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(121,198,255,0.52)_58%,#83baf8_100%),linear-gradient(90deg,#2bc4ed_0%,#19afe8_50%,#6377f5_100%)]",
            circleBorder: "border-sky-100",
            shadow: "shadow-[0_24px_70px_rgba(14,116,190,0.18)]",
            titleColor: "text-slate-950",
            brandNameColor: "text-slate-900",
            alt: "Lo mejor en tecnología: descuentos y envíos en el mismo día",
          }
        : normalizedCategoryName === "indumentaria"
          ? {
              banner: "/banners/indumentaria-banner-panoramico.png",
              background: "bg-[#b6a0e8]",
              brandsBackground:
                "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(211,196,247,0.50)_58%,#c9b6ef_100%),linear-gradient(90deg,#d6cdf2_0%,#b59ce7_50%,#8460cc_100%)]",
              circleBorder: "border-violet-100",
              shadow: "shadow-[0_24px_70px_rgba(91,55,160,0.18)]",
              titleColor: "text-slate-950",
              brandNameColor: "text-slate-900",
              alt: "Indumentaria: encontrá todo para el mejor look, descuentos y envíos en el mismo día",
            }
          : normalizedCategoryName === "computacion"
            ? {
                banner: "/banners/computacion-banner-panoramico.png",
                background: "bg-[#070b14]",
                brandsBackground:
                  "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(12,39,91,0.42)_58%,#10295c_100%),linear-gradient(90deg,#070b14_0%,#0b1428_50%,#102d68_100%)]",
                circleBorder: "border-blue-400/40",
                shadow: "shadow-[0_24px_70px_rgba(0,45,145,0.28)]",
                titleColor: "text-white",
                brandNameColor: "text-blue-50",
                alt: "Computación: todo para tu mundo digital, descuentos y envíos en el mismo día",
              }
            : normalizedCategoryName === "calzados" ||
                normalizedCategoryName === "calzado"
              ? {
                  banner: "/banners/calzados-banner-panoramico.png",
                  background: "bg-[#f1f1f1]",
                  brandsBackground:
                    "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(235,235,235,0.58)_58%,#dddddd_100%),linear-gradient(90deg,#f7f7f7_0%,#e9e9e9_50%,#bdbdbd_100%)]",
                  circleBorder: "border-slate-200",
                  shadow: "shadow-[0_24px_70px_rgba(40,40,40,0.14)]",
                  titleColor: "text-slate-950",
                  brandNameColor: "text-slate-900",
                  alt: "Las mejores ofertas en calzados, descuentos y envíos en el mismo día",
                }
              : normalizedCategoryName === "decobazar"
                ? {
                    banner: "/banners/deco-bazar-banner-panoramico.png",
                    background: "bg-[#f6d8c9]",
                    brandsBackground:
                      "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,232,208,0.44)_58%,#f7d9dc_100%),linear-gradient(90deg,#f7b9b9_0%,#ffe09d_28%,#ccebd6_57%,#c9e5f8_76%,#e8c3ef_100%)]",
                    circleBorder: "border-white/80",
                    shadow: "shadow-[0_24px_70px_rgba(179,85,117,0.16)]",
                    titleColor: "text-[#55306f]",
                    brandNameColor: "text-[#55306f]",
                    alt: "Tu espacio, tu estilo: Deco y Bazar, descuentos y envíos en el mismo día",
                  }
                : normalizedCategoryName === "belleza"
                  ? {
                      banner: "/banners/belleza-banner-panoramico.png",
                      background: "bg-[#f4d7d1]",
                      brandsBackground:
                        "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(249,225,218,0.48)_58%,#eed0ca_100%),linear-gradient(90deg,#f8e5df_0%,#f2d4ce_42%,#e8bbb6_100%)]",
                      circleBorder: "border-white/80",
                      shadow: "shadow-[0_24px_70px_rgba(157,86,84,0.16)]",
                      titleColor: "text-[#8f514f]",
                      brandNameColor: "text-[#754240]",
                      alt: "Belleza: tu mejor versión todos los días, descuentos y envíos en el mismo día",
                    }
                  : normalizedCategoryName === "alimentos"
                    ? {
                        banner: "/banners/alimentos-banner-panoramico.png",
                        background: "bg-[#fff5df]",
                        brandsBackground:
                          "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,245,218,0.52)_56%,#f8e8c8_100%),linear-gradient(90deg,#fbe6ad_0%,#fff3db_30%,#f8d4cf_57%,#e4e8bd_100%)]",
                        circleBorder: "border-white/85",
                        shadow: "shadow-[0_24px_70px_rgba(183,118,47,0.14)]",
                        titleColor: "text-[#5a4334]",
                        brandNameColor: "text-[#5a4334]",
                        alt: "Alimentos: todo lo que te gusta en un solo lugar, descuentos y envíos en el mismo día",
                      }
                    : normalizedCategoryName === "accesorios"
                      ? {
                          banner: "/banners/accesorios-banner-panoramico.png",
                          background: "bg-[#f8eee5]",
                          brandsBackground:
                            "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(249,239,226,0.48)_56%,#eaded2_100%),linear-gradient(90deg,#f8e7d8_0%,#f5efe8_31%,#dce8e8_65%,#f3d5b6_100%)]",
                          circleBorder: "border-white/85",
                          shadow: "shadow-[0_24px_70px_rgba(167,111,72,0.14)]",
                          titleColor: "text-[#875d48]",
                          brandNameColor: "text-[#67554c]",
                          alt: "Accesorios que realzan tu estilo, descuentos y envíos en el mismo día",
                        }
                      : normalizedCategoryName === "bebes"
                        ? {
                            banner: "/banners/bebes-banner-panoramico.png",
                            background: "bg-[#f8f5ef]",
                            brandsBackground:
                              "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(236,248,245,0.52)_56%,#d8eeee_100%),linear-gradient(90deg,#f7f4ed_0%,#dff1ed_35%,#dbeafb_68%,#e9f5f1_100%)]",
                            circleBorder: "border-white/85",
                            shadow: "shadow-[0_24px_70px_rgba(75,145,160,0.14)]",
                            titleColor: "text-[#267f86]",
                            brandNameColor: "text-[#376f7a]",
                            alt: "Bebés: todo para los primeros pasos, descuentos y envíos en el mismo día",
                          }
                        : normalizedCategoryName === "cotillon"
                          ? {
                              banner: "/banners/cotillon-banner-panoramico.png",
                              background: "bg-[#ffe5bd]",
                              brandsBackground:
                                "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,224,193,0.46)_56%,#f8d2ca_100%),linear-gradient(90deg,#ffd998_0%,#ffc7cf_30%,#d8e9df_62%,#bde6ee_100%)]",
                              circleBorder: "border-white/85",
                              shadow: "shadow-[0_24px_70px_rgba(190,73,128,0.16)]",
                              titleColor: "text-[#71379b]",
                              brandNameColor: "text-[#71379b]",
                              alt: "Cotillón: todo para festejar a lo grande, descuentos y envíos en el mismo día",
                            }
                          : normalizedCategoryName === "deportes"
                            ? {
                                banner: "/banners/deportes-banner-panoramico.png",
                                background: "bg-[#f4f5f3]",
                                brandsBackground:
                                  "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(229,237,229,0.52)_56%,#d4e7dc_100%),linear-gradient(90deg,#f2f4f1_0%,#dcebdc_32%,#b9dcbf_62%,#9bc7c5_100%)]",
                                circleBorder: "border-white/85",
                                shadow: "shadow-[0_24px_70px_rgba(10,55,94,0.17)]",
                                titleColor: "text-[#0a3b66]",
                                brandNameColor: "text-[#0a3b66]",
                                alt: "Deportes: equipamiento, indumentaria y accesorios para llevar tu rendimiento al máximo nivel",
                              }
                            : normalizedCategoryName === "gimnasio"
                              ? {
                                  banner: "/banners/gimnasio-banner-panoramico.png",
                                  background: "bg-[#050706]",
                                  brandsBackground:
                                    "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(9,20,10,0.70)_54%,#0b170b_100%),linear-gradient(90deg,#020403_0%,#071008_38%,#102410_68%,#173516_100%)]",
                                  circleBorder: "border-lime-400/40",
                                  shadow: "shadow-[0_24px_70px_rgba(58,190,24,0.18)]",
                                  titleColor: "text-white",
                                  brandNameColor: "text-white",
                                  alt: "Gimnasio: entrená sin excusas con equipamiento de alta calidad y envíos en el mismo día",
                                }
                              : normalizedCategoryName === "jardineria"
                                ? {
                                    banner:
                                      "/banners/jardineria-banner-ultrapanoramico.png",
                                    background: "bg-[#c5b56e]",
                                    brandsBackground:
                                      "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(185,177,104,0.54)_56%,#a7b66d_100%),linear-gradient(90deg,#d5bd75_0%,#c5b56e_38%,#8fa65e_70%,#6f8f4d_100%)]",
                                    circleBorder: "border-lime-50/90",
                                    shadow:
                                      "shadow-[0_24px_70px_rgba(60,90,38,0.18)]",
                                    titleColor: "text-[#244c21]",
                                    brandNameColor: "text-[#244c21]",
                                    alt: "Jardinería: todo para cuidar y transformar tus espacios",
                                  }
                                : normalizedCategoryName === "juguetes" ||
                                    normalizedCategoryName === "jugueteria"
                                  ? {
                                      banner:
                                        "/banners/juguetes-banner-ultrapanoramico.png",
                                      background: "bg-[#fff5ea]",
                                      brandsBackground:
                                        "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,239,222,0.54)_56%,#f7dcca_100%),linear-gradient(90deg,#ffd5cf_0%,#fff0bc_28%,#cdeedd_56%,#cce8f4_78%,#d8d6f5_100%)]",
                                      circleBorder: "border-white/90",
                                      shadow:
                                        "shadow-[0_24px_70px_rgba(222,92,92,0.15)]",
                                      titleColor: "text-[#173b68]",
                                      brandNameColor: "text-[#173b68]",
                                      alt: "Juguetes: creá tu propia aventura con miles de sonrisas",
                                    }
                                  : normalizedCategoryName === "textiles"
                                    ? {
                                        banner:
                                          "/banners/textiles-banner-ultrapanoramico.png",
                                        background: "bg-[#eee7df]",
                                        brandsBackground:
                                          "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(242,232,224,0.56)_56%,#eadbd7_100%),linear-gradient(90deg,#f4eee7_0%,#eedfd9_32%,#e6d1d3_60%,#dce8ed_100%)]",
                                        circleBorder: "border-white/90",
                                        shadow:
                                          "shadow-[0_24px_70px_rgba(115,80,86,0.14)]",
                                        titleColor: "text-[#0d4b5b]",
                                        brandNameColor: "text-[#0d4b5b]",
                                        alt: "Textiles para un hogar que te cuida con suavidad",
                                      }
                                    : normalizedCategoryName === "lenceria"
                                      ? {
                                          banner:
                                            "/banners/lenceria-banner-ultrapanoramico-v2.png",
                                          background: "bg-[#eee7df]",
                                          brandsBackground:
                                            "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(235,225,214,0.56)_56%,#dfd2c5_100%),linear-gradient(90deg,#f3eee7_0%,#e7dbce_34%,#d6c5b6_68%,#bda897_100%)]",
                                          circleBorder: "border-white/90",
                                          shadow:
                                            "shadow-[0_24px_70px_rgba(66,48,39,0.16)]",
                                          titleColor: "text-[#241b17]",
                                          brandNameColor: "text-[#241b17]",
                                          alt: "Lencería: ropa íntima, pijamas y colección exclusiva",
                                        }
                                      : normalizedCategoryName === "libreria"
                                        ? {
                                            banner:
                                              "/banners/libreria-banner-ultrapanoramico.png",
                                            background: "bg-[#fff0ca]",
                                            brandsBackground:
                                              "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,235,194,0.52)_56%,#f9dca2_100%),linear-gradient(90deg,#ffd26e_0%,#ffb75e_26%,#7edfd4_58%,#43bdda_78%,#f98c78_100%)]",
                                            circleBorder: "border-white/90",
                                            shadow:
                                              "shadow-[0_24px_70px_rgba(213,93,41,0.16)]",
                                            titleColor: "text-[#083d63]",
                                            brandNameColor: "text-[#083d63]",
                                            alt: "Librería: cuadernos, bolígrafos, mochilas y más",
                                          }
                                        : normalizedCategoryName === "limpieza"
                                          ? {
                                              banner:
                                                "/banners/limpieza-banner-ultrapanoramico.png",
                                              background: "bg-[#dff5fa]",
                                              brandsBackground:
                                                "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(213,241,247,0.54)_56%,#c7eaf1_100%),linear-gradient(90deg,#eefafa_0%,#bfe7ee_34%,#83d1df_66%,#68bdcf_100%)]",
                                              circleBorder: "border-white/90",
                                              shadow:
                                                "shadow-[0_24px_70px_rgba(22,126,157,0.15)]",
                                              titleColor: "text-[#0b5271]",
                                              brandNameColor: "text-[#0b5271]",
                                              alt: "Limpieza para un hogar impecable y una vida radiante",
                                            }
                                          : normalizedCategoryName ===
                                              "videojuegos"
                                            ? {
                                                banner:
                                                  "/banners/videojuegos-banner-ultrapanoramico.png",
                                                background: "bg-[#070a1d]",
                                                brandsBackground:
                                                  "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(21,15,61,0.72)_54%,#151039_100%),linear-gradient(90deg,#080a1c_0%,#29104e_28%,#441465_52%,#0d3c5e_76%,#082a32_100%)]",
                                                circleBorder:
                                                  "border-fuchsia-400/40",
                                                shadow:
                                                  "shadow-[0_24px_70px_rgba(123,44,191,0.24)]",
                                                titleColor: "text-white",
                                                brandNameColor: "text-white",
                                                alt: "Videojuegos: aventuras épicas y mundos sin límites",
                                              }
                                            : normalizedCategoryName === "libros"
                                              ? {
                                                  banner:
                                                    "/banners/libros-banner-ultrapanoramico.png",
                                                  background: "bg-[#c99762]",
                                                  brandsBackground:
                                                    "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(189,137,87,0.54)_56%,#a96f43_100%),linear-gradient(90deg,#d9b27b_0%,#c5925d_34%,#a66d42_68%,#74442d_100%)]",
                                                  circleBorder:
                                                    "border-amber-50/90",
                                                  shadow:
                                                    "shadow-[0_24px_70px_rgba(92,50,27,0.20)]",
                                                  titleColor: "text-[#172d3c]",
                                                  brandNameColor:
                                                    "text-[#172d3c]",
                                                  alt: "Libros: tu próxima gran historia está aquí",
                                                }
                                              : normalizedCategoryName ===
                                                  "suplementos"
                                                ? {
                                                    banner:
                                                      "/banners/suplementos-banner-ultrapanoramico.png",
                                                    background: "bg-[#edf3df]",
                                                    brandsBackground:
                                                      "bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(226,238,209,0.56)_56%,#cfe2bd_100%),linear-gradient(90deg,#f3f5e7_0%,#deebcf_34%,#bcd9b0_66%,#93c1a7_100%)]",
                                                    circleBorder:
                                                      "border-white/90",
                                                    shadow:
                                                      "shadow-[0_24px_70px_rgba(36,112,91,0.15)]",
                                                    titleColor:
                                                      "text-[#165d58]",
                                                    brandNameColor:
                                                      "text-[#165d58]",
                                                    alt: "Suplementos para un bienestar completo y una vida equilibrada",
                                                  }
                                                : null;

  const isDarkPanoramicTheme =
    normalizedCategoryName === "computacion" ||
    normalizedCategoryName === "gimnasio" ||
    normalizedCategoryName === "videojuegos";

  const displayedBrandCards: DisplayedBrand[] = panoramicTheme
    ? [
        ...brandCards.map((brand) => ({ ...brand, placeholder: false })),
        ...Array.from(
          { length: Math.max(0, 12 - brandCards.length) },
          (_, index) => ({
            name: `Marca ${index + 1}`,
            accent: "from-white/70 to-white/35",
            placeholder: true,
          }),
        ),
      ]
    : brandCards.map((brand) => ({ ...brand, placeholder: false }));

  if (panoramicTheme) {
    return (
      <section
        className={`relative left-1/2 -mt-5 w-screen -translate-x-1/2 overflow-hidden ${panoramicTheme.background} ${panoramicTheme.shadow} sm:-mt-8`}
      >
        <h1 className="sr-only">{category.name}</h1>

        <div
          className={`relative z-0 flex w-full justify-center overflow-hidden pb-14 ${panoramicTheme.background}`}
        >
          <img
            src={panoramicTheme.banner}
            alt={panoramicTheme.alt}
            className="block h-auto w-full max-w-full object-contain"
          />
        </div>

        {brandCards.length > 0 && (
          <div
            className={`relative z-10 -mt-px ${panoramicTheme.brandsBackground} px-4 pb-7 pt-3 sm:px-8 sm:pb-9 sm:pt-4 lg:px-12`}
          >
            <div
              aria-hidden="true"
              className={`absolute -top-[46px] left-[-5%] h-[92px] w-[110%] rounded-[50%] ${panoramicTheme.brandsBackground}`}
            />

            <div
              className={`relative -mt-3.5 flex items-center justify-center gap-3 ${panoramicTheme.titleColor} sm:-mt-4 sm:gap-5`}
              style={
                isDarkPanoramicTheme
                  ? {
                      color: "#FFFFFF",
                      textShadow: "none",
                    }
                  : undefined
              }
            >
              <span
                className={`relative h-px max-w-56 flex-1 bg-current opacity-55 after:absolute after:-right-0.5 after:-top-1 after:h-2 after:w-2 after:rounded-full after:bg-current ${
                  isDarkPanoramicTheme ? "!bg-white" : ""
                }`}
              />
              <h2
                className={`shrink-0 text-center text-lg font-black uppercase tracking-[0.06em] sm:text-2xl ${
                  isDarkPanoramicTheme ? "!text-white" : ""
                }`}
                style={
                  isDarkPanoramicTheme
                    ? { color: "#ffffff" }
                    : undefined
                }
              >
                Marcas destacadas
              </h2>
              <span
                className={`relative h-px max-w-56 flex-1 bg-current opacity-55 before:absolute before:-left-0.5 before:-top-1 before:h-2 before:w-2 before:rounded-full before:bg-current ${
                  isDarkPanoramicTheme ? "!bg-white" : ""
                }`}
              />
            </div>

            <div className="relative -mx-4 mt-2.5 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:mt-3 sm:gap-4 sm:px-8 lg:mx-0 lg:w-full lg:justify-between lg:gap-2 lg:px-0">
              {displayedBrandCards.map((brand, index) => {
                const cardContent = (
                  <>
                  <span
                    className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border ${panoramicTheme.circleBorder} bg-gradient-to-br ${brand.accent} text-lg font-black ${brand.placeholder ? panoramicTheme.brandNameColor : "text-white"} shadow-[0_6px_16px_rgba(15,65,120,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_10px_22px_rgba(15,65,120,0.16)] sm:text-xl`}
                  >
                    {"logo" in brand && brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={`Logo de ${brand.name}`}
                        className="h-full w-full bg-white object-contain p-2.5"
                        loading="lazy"
                      />
                    ) : (
                      brand.placeholder
                        ? String(index - brandCards.length + 1).padStart(2, "0")
                        : brand.name.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <span
                    className={`mt-2 block w-full truncate text-[10px] font-bold uppercase tracking-wide ${panoramicTheme.brandNameColor} sm:text-xs`}
                  >
                    {brand.name}
                  </span>
                  </>
                );

                return brand.placeholder ? (
                  <div
                    key={`placeholder-${index}`}
                    className="flex w-20 shrink-0 flex-col items-center text-center opacity-70 sm:w-24"
                    aria-label={`${brand.name}, espacio disponible`}
                  >
                    {cardContent}
                  </div>
                ) : (
                  <Link
                    key={`${brand.name}-${index}`}
                    to={`/products?brand=${encodeURIComponent(brand.name)}`}
                    className="group flex w-20 shrink-0 flex-col items-center text-center sm:w-24"
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      className={`relative isolate overflow-hidden rounded-2xl bg-gradient-to-br ${config.accent} px-4 py-7 text-white shadow-[0_34px_100px_rgba(18,60,105,0.24)] sm:rounded-[32px] sm:px-8 sm:py-9 lg:px-12 lg:py-12`}
    >
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(255,255,255,0.28),transparent_32%)]" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          <Sparkles className="h-4 w-4 shrink-0" />
          Categoria
        </span>

        <h1
          className="mt-4 text-4xl font-black leading-[0.95] tracking-wide text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.18)] sm:text-6xl lg:text-7xl"
          style={{ fontFamily: config.font }}
        >
          {category.name}
        </h1>

        {description && (
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/90 sm:text-lg sm:leading-8">
            {description}
          </p>
        )}

        {brandCards.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-black uppercase tracking-widest text-white/70">
              Marcas destacadas
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              {brandCards.map((brand, index) => (
                <Link
                  key={`${brand.name}-${index}`}
                  to={`/products?brand=${encodeURIComponent(brand.name)}`}
                  className="group w-36 shrink-0 rounded-2xl border border-white/20 bg-white/92 p-3 text-[var(--text-main)] shadow-[0_16px_38px_rgba(0,0,0,0.16)] transition hover:-translate-y-1 hover:bg-white sm:w-44"
                >
                  <span
                    className={`mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${brand.accent} text-2xl font-black text-white shadow-sm sm:h-24`}
                  >
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={`Logo de ${brand.name}`}
                        className="h-full w-full bg-white object-contain p-2"
                        loading="lazy"
                      />
                    ) : (
                      brand.name.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <span className="block truncate text-base font-black">
                    {brand.name}
                  </span>
                  <span className="mt-2 inline-flex rounded-lg bg-[var(--brand-orange)] px-3 py-1 text-xs font-black text-white transition group-hover:bg-[var(--brand-orange-hover)]">
                    Ver ofertas
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CategoryHero;
