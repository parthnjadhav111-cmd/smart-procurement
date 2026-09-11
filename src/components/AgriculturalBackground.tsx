import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';

export interface BackgroundSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge: string;
}

export const GRAIN_SLIDES: BackgroundSlide[] = [
  {
    id: 'paddy-1',
    title: 'Lush Emerald Paddy Terraces',
    subtitle: 'Kharif Rice Harvest & Minimum Support Price (MSP) Assurance',
    badge: '🌾 Paddy (Dhan) Harvest',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 'wheat-1',
    title: 'Golden Ripe Wheat in Sunlit Breeze',
    subtitle: 'Direct DBT Bank Transfer for Certified FAQ Quality Grains',
    badge: '🌾 Golden Wheat (Gehu)',
    imageUrl: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 'grains-mix',
    title: 'Abundant Agricultural Harvest',
    subtitle: 'Soybean, Mustard, Maize & Pulses Digital Weighbridge Booking',
    badge: '🌱 Oilseeds & Pulses',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 'green-fields',
    title: 'Flourishing Green Farmlands',
    subtitle: 'Automated Token Queues & Fair APMC Mandi Procurement',
    badge: '🚜 Smart Kisan Setu',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 'farmer-hands',
    title: 'Pure Golden Grain Verification',
    subtitle: 'Transparent Moisture Testing & Instant Payment Slips',
    badge: '⚖️ APMC Quality Scale',
    imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1920&q=85',
  },
];

interface AgriculturalBackgroundProps {
  children?: React.ReactNode;
  overlayClassName?: string;
  showControls?: boolean;
}

export const AgriculturalBackground: React.FC<AgriculturalBackgroundProps> = ({
  children,
  overlayClassName = 'bg-stone-950/60 backdrop-blur-[2px]',
  showControls = true,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance slideshow every 6.5 seconds
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % GRAIN_SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % GRAIN_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + GRAIN_SLIDES.length) % GRAIN_SLIDES.length);
  };

  const currentSlide = GRAIN_SLIDES[currentSlideIndex];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-stone-950 flex flex-col justify-between">
      {/* Background Slideshow Layers with Pan & Zoom (Ken Burns) */}
      {GRAIN_SLIDES.map((slide, index) => {
        const isActive = index === currentSlideIndex;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-0 pointer-events-none' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            <div
              className={`w-full h-full bg-cover bg-center transition-transform duration-[7000ms] ease-out ${
                isActive ? 'scale-105 translate-x-1 translate-y-0.5' : 'scale-100'
              }`}
              style={{
                backgroundImage: `url(${slide.imageUrl})`,
              }}
            />
          </div>
        );
      })}

      {/* Ambient Gradient Overlays for High Contrast & Readability */}
      <div className={`absolute inset-0 z-1 pointer-events-none ${overlayClassName}`} />
      <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/60" />
      <div className="absolute inset-0 z-1 pointer-events-none bg-radial from-transparent via-transparent to-black/70" />

      {/* Subtle Floating Sun Motes / Chaff Effect */}
      <div className="absolute inset-0 z-2 pointer-events-none opacity-25 overflow-hidden">
        <div className="absolute w-2 h-2 rounded-full bg-amber-200 blur-[1px] top-1/4 left-1/5 animate-pulse" />
        <div className="absolute w-3 h-3 rounded-full bg-amber-300 blur-[1px] top-3/5 left-4/5 animate-ping duration-[3000ms]" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-200 blur-[1px] top-2/3 left-1/3 animate-pulse" />
        <div className="absolute w-2.5 h-2.5 rounded-full bg-yellow-100 blur-[1px] top-1/6 left-2/3 animate-bounce duration-[4000ms]" />
      </div>

      {/* Main Content (Amazon Login Popup or Other Overlay) */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center p-3 sm:p-6">
        {children}
      </div>

      {/* Bottom Floating Slideshow Info Bar & Controls */}
      {showControls && (
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between text-white/90 text-xs select-none">
          {/* Current Slide Info Badge */}
          <div className="hidden sm:flex items-center gap-2.5 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
            <span className="inline-flex items-center gap-1 font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {currentSlide.badge}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span className="text-white/80 font-medium truncate max-w-xs">{currentSlide.title}</span>
          </div>

          {/* Dots Indicator & Controls */}
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 ml-auto sm:ml-0">
            <button
              onClick={handlePrev}
              className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Previous Background Image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Slide Dots */}
            <div className="flex items-center gap-1.5">
              {GRAIN_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlideIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Next Background Image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded-full hover:bg-white/20 text-amber-300 hover:text-amber-200 transition-colors ml-1"
              title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
