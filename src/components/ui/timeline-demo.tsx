'use client';
import TimelineRail from '@/components/ui/timeline-rail';

export default function TimelineDemo() {
  return (
    <div className='max-w-5xl mx-auto p-8 bg-black text-white'>
      <h2 className="text-2xl font-bold mb-8 text-center">Timeline Rail Demo</h2>
      <TimelineRail
        items={[
          { label: 'Engineering', caption: '2021-2025', active: true },
          { label: 'Ready-to-Build', caption: '2026', active: true },
          { label: 'Construction', caption: '2027-2030', active: true },
          { label: 'Operations', caption: '2030+', active: false },
        ]}
        size='md'
        labelAngle={45}
        emphasizeActiveTrail
        lineColorClass="bg-gray-600"
        dotClass="bg-gray-500"
        dotActiveClass="bg-cyan-400"
        labelClassName="text-cyan-400 font-semibold"
        captionClassName="text-gray-300 font-medium"
      />
    </div>
  );
}
