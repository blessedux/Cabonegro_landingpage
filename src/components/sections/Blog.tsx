import { Button } from '@/components/ui/button'

export default function Blog() {
  return (
    <section className="py-20 px-6 bg-white/5" id="Blog">
      <div className="container mx-auto text-center">
        <Button variant="outline" className="uppercase border-white text-white hover:bg-white hover:text-black">
          Read More Articles
        </Button>
      </div>
    </section>
  )
}