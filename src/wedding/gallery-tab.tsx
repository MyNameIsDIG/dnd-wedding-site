
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Import images and video directly from assets
import img1 from '../assets/images/gallery/1.jpg';
import img2 from '../assets/images/gallery/2.jpg';
import img3 from '../assets/images/gallery/3.jpg';
import img4 from '../assets/images/gallery/4.jpg';
import img5 from '../assets/images/gallery/5.jpg';
import img6 from '../assets/images/gallery/6.jpg';
import img7 from '../assets/images/gallery/7.jpg';
import img8 from '../assets/images/gallery/8.jpg';
import img9 from '../assets/images/gallery/9.jpg';
import img10 from '../assets/images/gallery/10.jpg';
import img11 from '../assets/images/gallery/11.jpg';
import img12 from '../assets/images/gallery/12.jpg';
import videoSrc from '../assets/videos/std.mp4';

// Gallery images - arranged to avoid grouping similar outfits
const galleryImages = [
    { id: 1, src: img1, alt: 'Nicole and Dave - Onesies heart pose' },
    { id: 2, src: img2, alt: 'Nicole and Dave - Circular door' },
    { id: 3, src: img3, alt: 'Nicole and Dave - Car trunk' },
    { id: 4, src: img4, alt: 'Nicole and Dave - Garden tender moment' },
    { id: 5, src: img5, alt: 'Nicole and Dave - Sunglasses outdoors' },
    { id: 6, src: img6, alt: 'Nicole and Dave - Window portrait' },
    { id: 7, src: img7, alt: 'Nicole and Dave - Motorcycle garden' },
    { id: 8, src: img8, alt: 'Nicole and Dave - Artistic doorway' },
    { id: 9, src: img9, alt: 'Nicole and Dave - Window frame laughing' },
    { id: 10, src: img10, alt: 'Nicole and Dave - Bubbles fun' },
    { id: 11, src: img11, alt: 'Nicole and Dave - On motorcycle together' },
    { id: 12, src: img12, alt: 'Nicole and Dave - Close up portrait' },
];

export function GalleryTab() {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const openLightbox = (index: number) => setSelectedIndex(index);
    const closeLightbox = () => setSelectedIndex(null);

    const goToPrevious = useCallback(() => {
        if (selectedIndex === null) return;
        setSelectedIndex(selectedIndex === 0 ? galleryImages.length - 1 : selectedIndex - 1);
    }, [selectedIndex]);

    const goToNext = useCallback(() => {
        if (selectedIndex === null) return;
        setSelectedIndex(selectedIndex === galleryImages.length - 1 ? 0 : selectedIndex + 1);
    }, [selectedIndex]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, goToPrevious, goToNext]);

    // Handle touch swipe
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        if (Math.abs(diff) > 50) {
            if (diff > 0) goToNext();
            else goToPrevious();
        }
        setTouchStart(null);
    };

    return (
        <div className="px-4 py-8 pb-24">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                <h2 className="text-[30px] font-serif font-medium text-foreground mb-2">Our Moments</h2>
                <p className="text-muted-foreground text-sm">{'A simple "Hi" that led to forever.'}</p>
            </motion.div>

            {/* Video Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 max-w-sm mx-auto">
                <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-muted shadow-lg">
                    <video className="w-full h-full object-cover" controls playsInline>
                        <source src={videoSrc} />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-3">Save The Date Video</p>
            </motion.div>

            {/* Image Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {galleryImages.map((image, index) => (
                    <motion.button key={image.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + index * 0.05 }} onClick={() => openLightbox(index)} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        <img src={image.src} alt={image.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </motion.button>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedIndex !== null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeLightbox} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                        {/* Close button */}
                        <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors" aria-label="Close lightbox">
                            <X className="w-6 h-6" />
                        </button>

                        {/* Navigation arrows */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrevious();
                            }}
                            className="absolute left-2 sm:left-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                            }}
                            className="absolute right-2 sm:right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Image */}
                        <motion.div key={selectedIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full h-full max-w-4xl max-h-[80vh] m-4" onClick={(e) => e.stopPropagation()}>
                            <img src={galleryImages[selectedIndex].src} alt={galleryImages[selectedIndex].alt} className="w-full h-full object-contain" />{' '}
                        </motion.div>

                        {/* Image counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                            {selectedIndex + 1} / {galleryImages.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
