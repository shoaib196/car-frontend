import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { type Car } from '@/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ContactButtons } from './contact-buttons';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from './ui/carousel';
import {
  Calendar,
  Fuel,
  Gauge,
  MapPin,
  Palette,
  Settings,
  Car as CarIcon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CarDetailsProps {
  cars: Car[];
}

export function CarDetails({ cars }: CarDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const car = cars.find(c => c.id == id);
  const currentIndex = cars.findIndex(c => c.id == id);
  const prevCar = currentIndex > 0 ? cars[currentIndex - 1] : null;
  const nextCar = currentIndex < cars.length - 1 ? cars[currentIndex + 1] : null;

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => setCurrent(api.selectedScrollSnap() + 1));
  }, [api, id]);


  if (!car) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p>Car not found</p>
        <Button onClick={() => navigate('/')}>
          Back to Listings
        </Button>
      </div>
    );
  }
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Listings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Hidden Carousel for logic */}
          <Carousel setApi={setApi} className="w-full" style={{ height: 0, overflow: 'hidden' }}>
            <CarouselContent>
              {car.images.map((image) => (
                <CarouselItem key={image.id}>
                  <img src={image.url} alt="" style={{ width: '100%', height: 'auto' }} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* New Image Module Here */}
          {car.images.length === 0 && (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg aspect-video mb-6">
              <span className="text-gray-500">No images available</span>
            </div>
          )}
          {car.images.length > 0 && current > 0 ? (
            <div className="mt-4 mb-6" style={{ height: '384px' }}>
              <img
                src={car.images[current - 1].url}
                alt={`Current view: ${car.brand} ${car.model}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}
              />
            </div>
          ) : car.images.length > 0 && (
            <div className="mt-4 mb-6" style={{ height: '384px' }} />
          )}

          {car.images.length > 0 && (
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button onClick={() => api?.scrollPrev()} variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${current - 1 === index ? 'bg-primary' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
              {count > 0 && (
                <div className="text-sm text-muted-foreground">{current} / {count}</div>
              )}
              <Button onClick={() => api?.scrollNext()} variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Car Info */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="mb-2">{car.brand} {car.model}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{car.year}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Palette className="w-4 h-4" />
                    <span>{car.color}</span>
                  </div>
                  <Badge variant="secondary">{car.bodyType}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary text-2xl">{formatPrice(car.price)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Gauge className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Mileage</p>
                  <p>{formatMileage(car.mileage)} miles</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Fuel className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fuel Type</p>
                  <p>{car.fuelType}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Transmission</p>
                  <p>{car.transmission}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location: {car.location}</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="mb-4">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {car.description}
            </p>
          </div>

          {/* Features */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="mb-4">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {car.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CarIcon className="w-4 h-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ContactButtons car={car} />
          </div>
        </div>
      </div>
    </div>
  );
}