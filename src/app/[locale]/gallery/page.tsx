import { BentoGridGalleryDemo } from "@/components/ui/bento-gallery-demo"

// Force dynamic rendering since this page uses client components
export const dynamic = 'force-dynamic'

export default function GalleryPage() {
  return <BentoGridGalleryDemo />
}
