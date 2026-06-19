import HeroSection from '../features/home/components/HeroSection'
import FeaturedProducts from '../features/products/components/FeaturedProducts'
function HomePage() {
  return (
    <div className='space-y-20'>
        <HeroSection/>
        <FeaturedProducts/>
    </div>
  )
}

export default HomePage