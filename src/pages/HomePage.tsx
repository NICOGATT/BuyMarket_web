import HeroSection from '../features/home/components/HeroSection'
import CategoryProductSections from '../features/products/components/CategoryProductSections'
import FeaturedProducts from '../features/products/components/FeaturedProducts'
import {
  BadgeCheck,
  Headphones,
  Home,
  Laptop,
  PackageCheck,
  Shirt,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Watch,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const categories = [
  { name: 'Tecnología', icon: Laptop, to: '/products?search=tecnologia', gradient: 'from-cyan-500 to-blue-700' },
  { name: 'Celulares', icon: Smartphone, to: '/products?search=celular', gradient: 'from-violet-500 to-indigo-700' },
  { name: 'Hogar', icon: Home, to: '/products?search=hogar', gradient: 'from-sky-500 to-cyan-700' },
  { name: 'Moda', icon: Shirt, to: '/products?search=moda', gradient: 'from-fuchsia-500 to-violet-700' },
  { name: 'Accesorios', icon: Watch, to: '/products?search=accesorios', gradient: 'from-blue-500 to-violet-700' },
  { name: 'Audio', icon: Headphones, to: '/products?search=audio', gradient: 'from-cyan-400 to-indigo-600' },
]

const popularSearches = [
  'iPhone',
  'Notebook',
  'Zapatillas',
  'Silla gamer',
  'Smart TV',
  'Auriculares',
  'Mesa',
  'PlayStation',
]

const benefits = [
  {
    title: 'Compra segura',
    description: 'Flujos claros para sumar productos al carrito, revisar tu compra y avanzar al checkout.',
    icon: ShieldCheck,
  },
  {
    title: 'Vendedores verificados',
    description: 'Perfiles y publicaciones pensadas para que puedas comprar con más contexto.',
    icon: BadgeCheck,
  },
  {
    title: 'Envíos y retiros',
    description: 'Seguimiento de compras, envíos y puntos de retiro desde tu cuenta.',
    icon: Truck,
  },
  {
    title: 'Soporte cercano',
    description: 'Una experiencia preparada para acompañarte antes y después de comprar.',
    icon: PackageCheck,
  },
]

function HomeCategories() {
  return (
    <section className="rounded-[32px] border border-white/80 bg-white/72 p-5 shadow-[0_24px_70px_rgba(18,60,105,0.10)] backdrop-blur-xl sm:p-7">
      <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-black text-[var(--nav-blue)]">
            <Sparkles className="h-4 w-4" />
            Explorá por rubro
          </span>
          <h2 className="mt-3 text-3xl font-black text-slate-950">Categorías populares</h2>
          <p className="mt-2 max-w-2xl font-semibold text-slate-500">
            Accesos rápidos a los mundos de productos que más movimiento tienen en BuyMarket.
          </p>
        </div>
        <Link to="/products" className="font-black text-[var(--brand)] transition hover:text-[var(--brand-hover)]">
          Ver productos
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {categories.map(({ name, icon: Icon, to, gradient }) => (
          <Link
            key={name}
            to={to}
            className="group rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(18,60,105,0.14)]"
          >
            <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition group-hover:scale-105`}>
              <Icon className="h-7 w-7" />
            </span>
            <span className="mt-4 block font-black text-slate-950">{name}</span>
            <span className="mt-1 block text-sm font-semibold text-slate-500">Buscar ahora</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function PopularSearches() {
  return (
    <section className="grid gap-6 rounded-[32px] bg-[linear-gradient(135deg,#EEF8FF,#F6F0FF)] p-5 shadow-[0_20px_60px_rgba(18,60,105,0.08)] sm:p-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
      <div>
        <h2 className="text-3xl font-black text-slate-950">Más buscados</h2>
        <p className="mt-2 font-semibold text-slate-500">
          Tendencias rápidas para entrar directo a productos con alta intención de compra.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {popularSearches.map((term) => (
          <Link
            key={term}
            to={`/products?search=${encodeURIComponent(term)}`}
            className="rounded-2xl border border-white bg-white/78 px-4 py-3 font-black text-[var(--nav-blue)] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-[var(--brand)]"
          >
            {term}
          </Link>
        ))}
      </div>
    </section>
  )
}

function BenefitsSection() {
  return (
    <section>
      <div className="mb-8 max-w-2xl">
        <h2 className="text-3xl font-black text-slate-950">Comprar y vender con confianza</h2>
        <p className="mt-2 font-semibold text-slate-500">
          Beneficios pensados para que la experiencia se sienta simple, clara y profesional.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(18,60,105,0.12)]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--nav-blue-soft)] text-[var(--nav-blue)]">
              <Icon className="h-7 w-7" />
            </span>
            <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function HomePage() {
  return (
    <div className="space-y-16 pb-8 sm:space-y-20">
        <HeroSection />
        <HomeCategories />
        <FeaturedProducts />
        <PopularSearches />
        <BenefitsSection />
        <CategoryProductSections />
    </div>
  )
}

export default HomePage
