import InteractiveBentoGallery from "@/components/ui/interactive-bento-gallery"

const mediaItems = [
  {
    id: 1,
    type: "image",
    title: "Mountain Landscape",
    desc: "Breathtaking mountain vista",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 2,
    type: "image",
    title: "Ocean Waves",
    desc: "Serene ocean waves at sunset",
    url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop&crop=center",
    span: "md:col-span-2 md:row-span-2 col-span-1 sm:col-span-2 sm:row-span-2",
  },
  {
    id: 3,
    type: "image",
    title: "Forest Path",
    desc: "Mystical forest trail",
    url: "/cabonegro_astillero.webp",
    span: "md:col-span-1 md:row-span-3 sm:col-span-2 sm:row-span-2",
  },
  {
    id: 4,
    type: "image",
    title: "Autumn Leaves",
    desc: "Beautiful autumn scenery",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop&crop=center",
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 5,
    type: "image",
    title: "City Skyline",
    desc: "Modern urban landscape",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop&crop=center",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 6,
    type: "image",
    title: "Desert Dunes",
    desc: "Golden sand dunes",
    url: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop&crop=center",
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 7,
    type: "image",
    title: "Northern Lights",
    desc: "Aurora borealis display",
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop&crop=center",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
]

export function BentoGridGalleryDemo() {
  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <InteractiveBentoGallery
        mediaItems={mediaItems}
        title="Gallery Collection"
        description="Drag and explore our curated collection of stunning images"
      />
    </div>
  )
}
