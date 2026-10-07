import { useNavigate } from 'react-router-dom';
import { type Car } from '@/types';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Fuel, Gauge, MapPin, Palette } from 'lucide-react';
import { getFullImageUrl } from '../services/cars';

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  const navigate = useNavigate();
  const formatPrice = (price: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(isNaN(num) ? 0 : num);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage || 0);
  };

  const features = Array.isArray(car.features) ? car.features : [];
  const imageUrl = getFullImageUrl(car.images?.[0]?.url);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video overflow-hidden">
        <img
          src={imageUrl}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3>{car.brand} {car.model}</h3>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Calendar className="w-4 h-4" />
              <span>{car.year}</span>
              <Palette className="w-4 h-4 ml-2" />
              <span>{car.color}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-primary">{formatPrice(car.price)}</p>
            <Badge variant="secondary">{car.bodyType}</Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Gauge className="w-4 h-4" />
            <span>{formatMileage(car.mileage)} miles</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="w-4 h-4" />
            <span>{car.fuelType}</span>
          </div>
        </div>

        {car.location && (
          <div className="flex items-center gap-1 text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span>{car.location}</span>
          </div>
        )}

        {car.description && (
          <p className="text-muted-foreground line-clamp-2 mb-3">
            {car.description}
          </p>
        )}

        {features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{features.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => navigate(`/car/${car.id}`)}
          className="w-full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}