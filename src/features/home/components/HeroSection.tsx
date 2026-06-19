// import React from 'react'

function HeroSection() {
  return (
    <div className='flex flex-col items-center'>
        <span className='rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600'>
            Marketplace moderno 
        </span>
        <h1 className='text-5xl font-bold leading-light'>
            Comprá y vende productos de manera rapida. 
        </h1>

        <p className='mt-6 text-lg text-slate-500'>
            Buy Market conecta vendedores y compradores en una plataforma moderna, rapida
            y segura.
        </p>

        <div className='mt-8 flex gap-4'>
            <button className='rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700'>
                Explorar productos
            </button>
            <button className='rounded-xl border border-slate-600 px-6 py-3 font-semibold transition hover:bg-slate-800 hover:text-white'>
                Vender ahora
            </button>
        </div>
    </div>
  )
}

export default HeroSection