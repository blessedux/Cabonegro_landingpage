"use client";
import { WorldMap } from "@/components/ui/world-map";
import { motion } from "framer-motion";

export function RoadmapEs() {
  return (
    <div className="py-20 dark:bg-black bg-white w-full">
      <div className="max-w-7xl mx-auto px-6">
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
                  label: "Tokio, Japón"
                },
                end: {
                  lat: -54.8019,
                  lng: -68.3030,
                  label: "Tierra del Fuego, Chile"
                },
              },
              {
                start: { 
                  lat: 1.3521, 
                  lng: 103.8198,
                  label: "Singapur"
                },
                end: { 
                  lat: -54.8019, 
                  lng: -68.3030,
                  label: "Tierra del Fuego, Chile"
                },
              },
              {
                start: { 
                  lat: 22.3193, 
                  lng: 114.1694,
                  label: "Hong Kong"
                },
                end: { 
                  lat: -54.8019, 
                  lng: -68.3030,
                  label: "Tierra del Fuego, Chile"
                },
              },
              {
                start: { 
                  lat: -33.8688, 
                  lng: 151.2093,
                  label: "Sídney, Australia"
                },
                end: { 
                  lat: -54.8019, 
                  lng: -68.3030,
                  label: "Tierra del Fuego, Chile"
                },
              },
              {
                start: { 
                  lat: -54.8019, 
                  lng: -68.3030,
                  label: "Tierra del Fuego, Chile"
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
                  label: "Antártida"
                },
              },
              {
                start: { 
                  lat: -52.9184, 
                  lng: -70.8294,
                  label: "Cabo Negro, Chile"
                },
                end: { 
                  lat: -33.4489, 
                  lng: -70.6693,
                  label: "Santiago, Chile"
                },
              },
              {
                start: { 
                  lat: -52.9184, 
                  lng: -70.8294,
                  label: "Cabo Negro, Chile"
                },
                end: { 
                  lat: -12.0464, 
                  lng: -77.0428,
                  label: "Lima, Perú"
                },
              },
            ]}
            lineColor="#3b82f6"
          />
        </motion.div>
      </div>
    </div>
  );
}
