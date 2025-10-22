export default function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-white/5">
      <div className="container mx-auto">
        <h2 className="text-5xl font-bold mb-12">How it works</h2>
        <p className="text-gray-400 mb-12 max-w-3xl">
          We create real estate projects that captivate the audience, utilizing cutting-edge 3D tools that make the experience unique
        </p>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="text-sm text-gray-400">Step 01</div>
            <h3 className="text-2xl font-bold">Unreal Scene</h3>
            <p className="text-gray-400">
              If you have ready-made 3D models, just import them into Unreal Engine!
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-sm text-gray-400">Step 02</div>
            <h3 className="text-2xl font-bold">Vinode Plugin</h3>
            <p className="text-gray-400">
              Setup our plugin inside Unreal Engine and render the whole webapp.
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-sm text-gray-400">Step 03</div>
            <h3 className="text-2xl font-bold">Vinode webapp</h3>
            <p className="text-gray-400">
              With content ready, we develop a dedicated webapp for your project.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}