import HeroSection from '../features/home/components/HeroSection'
import CategoryProductSections from '../features/products/components/CategoryProductSections'
import FeaturedProducts from '../features/products/components/FeaturedProducts'
function HomePage() {
  return (
    <div className='space-y-20'>
        <HeroSection/>
        <FeaturedProducts/>
        <CategoryProductSections/>
    </div>
  )
}

export default HomePage
