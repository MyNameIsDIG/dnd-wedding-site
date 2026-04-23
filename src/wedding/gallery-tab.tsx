
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Import images and video directly from assets
import img1 from '../assets/images/gallery/1.webp';
import img2 from '../assets/images/gallery/2.webp';
import img3 from '../assets/images/gallery/3.webp';
import img4 from '../assets/images/gallery/4.webp';
import img5 from '../assets/images/gallery/5.webp';
import img6 from '../assets/images/gallery/6.webp';
import img7 from '../assets/images/gallery/7.webp';
import img8 from '../assets/images/gallery/8.webp';
import img9 from '../assets/images/gallery/9.webp';
import img10 from '../assets/images/gallery/10.webp';
import img11 from '../assets/images/gallery/11.webp';
import img12 from '../assets/images/gallery/12.webp';
import img13 from '../assets/images/gallery/13.webp';
import img14 from '../assets/images/gallery/14.webp';
import img15 from '../assets/images/gallery/15.webp';
import img16 from '../assets/images/gallery/16.webp';
import img17 from '../assets/images/gallery/17.webp';
import img18 from '../assets/images/gallery/18.webp';
import img19 from '../assets/images/gallery/19.webp';
import img20 from '../assets/images/gallery/20.webp';
import img21 from '../assets/images/gallery/21.webp';
import img22 from '../assets/images/gallery/22.webp';
import img23 from '../assets/images/gallery/23.webp';
import img24 from '../assets/images/gallery/24.webp';
import img25 from '../assets/images/gallery/25.webp';
import img26 from '../assets/images/gallery/26.webp';
import img27 from '../assets/images/gallery/27.webp';
import img28 from '../assets/images/gallery/28.webp';
import img29 from '../assets/images/gallery/29.webp';
import img30 from '../assets/images/gallery/30.webp';
import img31 from '../assets/images/gallery/31.webp';
import img32 from '../assets/images/gallery/32.webp';
import img33 from '../assets/images/gallery/33.webp';
import img34 from '../assets/images/gallery/34.webp';
import img35 from '../assets/images/gallery/35.webp';
import img36 from '../assets/images/gallery/36.webp';
import img37 from '../assets/images/gallery/37.webp';
import img38 from '../assets/images/gallery/38.webp';
import img39 from '../assets/images/gallery/39.webp';
import img40 from '../assets/images/gallery/40.webp';
import img41 from '../assets/images/gallery/41.webp';
import img42 from '../assets/images/gallery/42.webp';
import img43 from '../assets/images/gallery/43.webp';
import img44 from '../assets/images/gallery/44.webp';
import img45 from '../assets/images/gallery/45.webp';
import img46 from '../assets/images/gallery/46.webp';
import img47 from '../assets/images/gallery/47.webp';
import img48 from '../assets/images/gallery/48.webp';
import videoFile from '../assets/videos/std.webm';

// Gallery images - arranged to avoid grouping similar outfits
const galleryImages = [
    { id: 1, src: img1, alt: 'Nicole and Dave - 1' },
    { id: 2, src: img2, alt: 'Nicole and Dave - 2' },
    { id: 3, src: img3, alt: 'Nicole and Dave - 3' },
    { id: 4, src: img4, alt: 'Nicole and Dave - 4' },
    { id: 5, src: img5, alt: 'Nicole and Dave - 5' },
    { id: 6, src: img6, alt: 'Nicole and Dave - 6' },
    { id: 7, src: img7, alt: 'Nicole and Dave - 7' },
    { id: 8, src: img8, alt: 'Nicole and Dave - 8' },
    { id: 9, src: img9, alt: 'Nicole and Dave - 9' },
    { id: 10, src: img10, alt: 'Nicole and Dave - 10' },
    { id: 11, src: img11, alt: 'Nicole and Dave - 11' },
    { id: 12, src: img12, alt: 'Nicole and Dave - 12' },
    { id: 13, src: img13, alt: 'Nicole and Dave - 13' },
    { id: 14, src: img14, alt: 'Nicole and Dave - 14' },
    { id: 15, src: img15, alt: 'Nicole and Dave - 15' },
    { id: 16, src: img16, alt: 'Nicole and Dave - 16' },
    { id: 17, src: img17, alt: 'Nicole and Dave - 17' },
    { id: 18, src: img18, alt: 'Nicole and Dave - 18' },
    { id: 19, src: img19, alt: 'Nicole and Dave - 19' },
    { id: 20, src: img20, alt: 'Nicole and Dave - 20' },
    { id: 21, src: img21, alt: 'Nicole and Dave - 21' },
    { id: 22, src: img22, alt: 'Nicole and Dave - 22' },
    { id: 23, src: img23, alt: 'Nicole and Dave - 23' },
    { id: 24, src: img24, alt: 'Nicole and Dave - 24' },
    { id: 25, src: img25, alt: 'Nicole and Dave - 25' },
    { id: 26, src: img26, alt: 'Nicole and Dave - 26' },
    { id: 27, src: img27, alt: 'Nicole and Dave - 27' },
    { id: 28, src: img28, alt: 'Nicole and Dave - 28' },
    { id: 29, src: img29, alt: 'Nicole and Dave - 29' },
    { id: 30, src: img30, alt: 'Nicole and Dave - 30' },
    { id: 31, src: img31, alt: 'Nicole and Dave - 31' },
    { id: 32, src: img32, alt: 'Nicole and Dave - 32' },
    { id: 33, src: img33, alt: 'Nicole and Dave - 33' },
    { id: 34, src: img34, alt: 'Nicole and Dave - 34' },
    { id: 35, src: img35, alt: 'Nicole and Dave - 35' },
    { id: 36, src: img36, alt: 'Nicole and Dave - 36' },
    { id: 37, src: img37, alt: 'Nicole and Dave - 37' },
    { id: 38, src: img38, alt: 'Nicole and Dave - 38' },
    { id: 39, src: img39, alt: 'Nicole and Dave - 39' },
    { id: 40, src: img40, alt: 'Nicole and Dave - 40' },
    { id: 41, src: img41, alt: 'Nicole and Dave - 41' },
    { id: 42, src: img42, alt: 'Nicole and Dave - 42' },
    { id: 43, src: img43, alt: 'Nicole and Dave - 43' },
    { id: 44, src: img44, alt: 'Nicole and Dave - 44' },
    { id: 45, src: img45, alt: 'Nicole and Dave - 45' },
    { id: 46, src: img46, alt: 'Nicole and Dave - 46' },
    { id: 47, src: img47, alt: 'Nicole and Dave - 47' },
    { id: 48, src: img48, alt: 'Nicole and Dave - 48' },
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
                <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-muted shadow-lg mb-4">
                    <video className="w-full h-full object-cover" controls playsInline>
                        <source src={videoFile} type="video/webm" />
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
