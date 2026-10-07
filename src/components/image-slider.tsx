import { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ImageSlider as ImageSliderType } from '@/types';
import { getFullImageUrl } from '../services/cars';

const defaultImages: ImageSliderType[] = [
    {
        id: "1",
        url: "https://images.unsplash.com/photo-1705747401901-28363172fe7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjBzaG93cm9vbXxlbnwxfHx8fDE3NTkyNjE4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        alt: "Luxury Car Showroom",
        title: "Premium Collection",
        description: "Discover our carefully curated selection of luxury vehicles"
    },
    {
        id: "2",
        url: "https://images.unsplash.com/photo-1644749700856-a82a92828a1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjYXIlMjBkZWFsZXJzaGlwfGVufDF8fHx8MTc1OTI2MTgxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        alt: "Modern Car Dealership",
        title: "Expert Service",
        description: "Professional guidance from our experienced team"
    },
    {
        id: "3",
        url: "https://images.unsplash.com/photo-1696176559269-c944fb2ec40f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY2FycyUyMGNvbGxlY3Rpb258ZW58MXx8fHwxNzU5MzQ2MDAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        alt: "Premium Cars Collection",
        title: "Quality Assured",
        description: "Every vehicle undergoes thorough inspection and certification"
    },
    {
        id: "4",
        url: "https://images.unsplash.com/photo-1749222152514-b819f229db99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbW90aXZlJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzU5MzQ2MDAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        alt: "Automotive Business",
        title: "Trusted Partner",
        description: "Your reliable partner in finding the perfect vehicle"
    }
];

interface ImageSliderProps {
    images?: ImageSliderType[];
}

export function ImageSlider({ images }: ImageSliderProps) {
    const displayImages = images && images.length > 0 ? images : defaultImages;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [api, setApi] = useState<any>(null);

    useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            setCurrentIndex(api.selectedScrollSnap());
        };

        api.on('select', onSelect);
        return () => api.off('select', onSelect);
    }, [api]);

    useEffect(() => {
        if (api && !isNaN(currentIndex)) {
            api.scrollTo(currentIndex);
        }
    }, [currentIndex, api]);

    useEffect(() => {
        if (displayImages.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [displayImages.length]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', backgroundColor: '#111827' }}>
            <Carousel setApi={setApi} style={{ width: '100%', height: '100%' }}>
                <CarouselContent style={{ display: 'flex' }}>
                    {displayImages.map((image, index) => (
                        <CarouselItem key={image.id || index} style={{ minWidth: '100%' }}>
                            <div style={{ position: 'relative', width: '100%', height: '500px' }}>
                                <ImageWithFallback
                                    src={getFullImageUrl(image.url)}
                                    alt={image.alt || 'Car Showroom'}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />

                                {/* Overlay with gradient */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3), transparent)' }}></div>

                                {/* Content overlay */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
                                    <div style={{ maxWidth: '1280px', margin: 'auto', padding: '0 1.5rem', width: '100%' }}>
                                        <div style={{ maxWidth: '42rem', color: 'white' }}>
                                            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '1rem' }}>{image.title}</h2>
                                            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#E5E7EB' }}>{image.description}</p>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <a
                                                    href="#inventory"
                                                    style={{ backgroundColor: '#030213', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', display: 'inline-block' }}
                                                >
                                                    View Inventory
                                                </a>
                                                <a
                                                    href="#contact"
                                                    style={{ border: '2px solid white', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', display: 'inline-block' }}
                                                >
                                                    Contact Us
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious style={{ left: '1rem', backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
                <CarouselNext style={{ right: '1rem', backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
            </Carousel>

            {/* Slide indicators */}
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
                {displayImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', backgroundColor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)' }}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}