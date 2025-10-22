export default function Stats() {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-4">Enhanced user experience</h2>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Cutting-edge brand image</h2>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Stand out in the market</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="text-7xl font-bold mb-4">73%</div>
            <p className="text-gray-400 text-sm">prioritize customer experience</p>
            <p className="text-gray-500 text-xs mt-2 italic">PwC</p>
          </div>
          <div className="text-center">
            <div className="text-7xl font-bold mb-4">45%</div>
            <p className="text-gray-400 text-sm">higher conversion rate</p>
            <p className="text-gray-500 text-xs mt-2 italic">Hubspot</p>
          </div>
          <div className="text-center">
            <div className="text-7xl font-bold mb-4">62%</div>
            <p className="text-gray-400 text-sm">more likely to purchase</p>
            <p className="text-gray-500 text-xs mt-2 italic">Medium</p>
          </div>
        </div>
      </div>
    </section>
  )
}