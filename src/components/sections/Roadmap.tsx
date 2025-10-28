"use client";
import { WorldMap } from "@/components/ui/world-map";
import { motion } from "framer-motion";

export function Roadmap() {
  return (
    <div className="py-20 dark:bg-black bg-white w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            className="font-bold text-3xl md:text-5xl dark:text-white text-black mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Global{" "}
            <span className="text-blue-500">
              {"Connectivity".split("").map((letter, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.04 }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </motion.h2>
          <motion.p
            className="text-sm md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Cabo Negro's strategic position creates a new maritime corridor connecting 
            Asia-Pacific markets with South America, offering an alternative route to 
            the Panama Canal and direct access to Antarctica.
          </motion.p>
        </div>

        <motion.div
          className="mb-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <WorldMap
            dots={[
              {
                start: {
                  lat: 35.6762,
                  lng: 139.6503,
                  label: "Tokyo, Japan"
                },
                end: {
                  lat: -52.9184,
                  lng: -70.8294,
                  label: "Cabo Negro, Chile"
                },
              },
              {
                start: { 
                  lat: 1.3521, 
                  lng: 103.8198,
                  label: "Singapore"
                },
                end: { 
                  lat: -52.9184, 
                  lng: -70.8294,
                  label: "Cabo Negro, Chile"
                },
              },
              {
                start: { 
                  lat: 22.3193, 
                  lng: 114.1694,
                  label: "Hong Kong"
                },
                end: { 
                  lat: -52.9184, 
                  lng: -70.8294,
                  label: "Cabo Negro, Chile"
                },
              },
              {
                start: { 
                  lat: -33.8688, 
                  lng: 151.2093,
                  label: "Sydney, Australia"
                },
                end: { 
                  lat: -52.9184, 
                  lng: -70.8294,
                  label: "Cabo Negro, Chile"
                },
              },
              {
                start: { 
                  lat: -52.9184, 
                  lng: -70.8294,
                  label: "Cabo Negro, Chile"
                },
                end: { 
                  lat: -75.2509, 
                  lng: -0.0713,
                  label: "Antarctica"
                },
              },
              {
                start: { 
                  lat: -52.9184, 
                  lng: -70.8294,
                  label: "Cabo Negro, Chile"
                },
                end: { 
                  lat: 40.7128, 
                  lng: -74.0060,
                  label: "New York, USA"
                },
              },
              {
                start: { 
                  lat: -52.9184, 
                  lng: -70.8294,
                  label: "Cabo Negro, Chile"
                },
                end: { 
                  lat: 51.5074, 
                  lng: -0.1278,
                  label: "London, UK"
                },
              },
              {
                start: { 
                  lat: -52.9184, 
                  lng: -70.8294,
                  label: "Cabo Negro, Chile"
                },
                end: { 
                  lat: 23.1291, 
                  lng: 113.2644,
                  label: "Guangzhou, China"
                },
              },
            ]}
            lineColor="#3b82f6"
          />
        </motion.div>

        {/* Key Routes Information */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            className="p-6 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Asia-Pacific Route</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Direct connection to major Asian ports, reducing transit time by 15-20% compared to Panama Canal.
            </p>
          </motion.div>

          <motion.div
            className="p-6 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Antarctic Gateway</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Strategic access point for Antarctic research, tourism, and future resource exploration.
            </p>
          </motion.div>

          <motion.div
            className="p-6 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Alternative Route</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Provides redundancy and reduces dependency on traditional maritime chokepoints.
            </p>
          </motion.div>

          <motion.div
            className="p-6 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Economic Impact</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Expected to generate $2.5B annually in economic activity and create 15,000+ jobs.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
