import { Button } from '@/components/ui/button'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black z-0" />
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            Real estate platform
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="outline" className="uppercase border-white text-white hover:bg-white hover:text-black">
              Large Estate Demo
            </Button>
            <Button size="lg" variant="outline" className="uppercase border-white text-white hover:bg-white hover:text-black">
              Small Estate Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}