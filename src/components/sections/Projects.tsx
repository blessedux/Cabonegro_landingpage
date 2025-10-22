import { Card, CardContent } from '@/components/ui/card'

const projects = [
  {
    title: 'Safa Al Fursan',
    description: 'A modern residential project in northeast Riyadh, developed in partnership with NHC as part of Vision 2030',
    tags: ['3D scene', 'Back Panel', 'Website', 'Mobile app'],
    link: 'https://safaalfursan.sa/Alfursan/Zone_All'
  },
  {
    title: 'Tropical Mirage Bayahibe',
    description: 'Tropical Mirage is a luxury apartment complex near Bayahibe Beach, offering upscale amenities',
    tags: ['3D scene', 'Back Panel', 'Website', 'Branding'],
    link: 'https://tropicalmiragebayahibe.com/'
  },
  {
    title: 'Mascolonia',
    description: '+Colonia is a smart city development in Uruguay, designed to attract tech talent and innovation',
    tags: ['3D scene', 'Back Panel', 'Website', '360 interiors'],
    link: 'https://www.mascolonia.com/'
  },
  {
    title: 'Malinowskiego',
    description: 'A quiet place in an excellent neighborhood. Enjoy unlimited nature and the charms of city life',
    tags: ['3D scene', 'Back Panel', 'Website'],
    link: 'https://malinowskiego.com/'
  }
]

export default function Projects() {
  return (
    <section className="py-20 px-6" id="Projects">
      <div className="container mx-auto">
        <h2 className="text-5xl font-bold mb-12">Recent projects</h2>
        <p className="text-gray-400 mb-12">
          Check out our recent projects, all crafted with cutting-edge technologies and tailored to meet diverse client needs.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <Card key={index} className="bg-white/5 border-white/10 overflow-hidden group cursor-pointer">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900" />
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-400 mb-4 text-sm">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-3 py-1 bg-white/10 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white hover:text-gray-300 underline"
                >
                  explore the project
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}