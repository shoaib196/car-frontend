import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { type Car, type ImageSlider } from '@/types';
import { Pencil, Trash2, Plus, Upload, X, Image as ImageIcon } from 'lucide-react';
import { createCar, updateCar, deleteCar, uploadImage, uploadImageToCar, deleteImage, getFullImageUrl } from '../services/cars';
import { createImageSlider, updateImageSlider, deleteImageSlider } from '../services/image_slider';

interface AdminDashboardProps {
  cars: Car[];
  onCarsUpdate: (cars: Car[]) => void;
  imageSliders: ImageSlider[];
  onImageSlidersUpdate: (imageSliders: ImageSlider[]) => void;
}

export function AdminDashboard({ cars, onCarsUpdate, imageSliders, onImageSlidersUpdate }: AdminDashboardProps) {
  const navigate = useNavigate();
  const { logout, isAdminLoggedIn, accessToken } = useAuth();

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
    }
  }, [isAdminLoggedIn, navigate]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalImages, setOriginalImages] = useState<{ id: string; url: string }[]>([]);
  const [pendingUploads, setPendingUploads] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Image Slider states
  const [isSliderDialogOpen, setIsSliderDialogOpen] = useState(false);
  const [editingImageSlider, setEditingImageSlider] = useState<ImageSlider | null>(null);
  const [sliderImagePreview, setSliderImagePreview] = useState<string>('');
  const [isSliderDragOver, setIsSliderDragOver] = useState(false);
  const sliderFileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    color: '',
    location: '',
    description: '',
    features: '',
    images: [] as { id: string; url: string }[]
  });

  const [sliderFormData, setSliderFormData] = useState({
    url: '',
    alt: '',
    title: '',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      year: '',
      price: '',
      mileage: '',
      fuelType: '',
      transmission: '',
      bodyType: '',
      color: '',
      location: '',
      description: '',
      features: '',
      images: []
    });
    setImagePreviews([]);
    setEditingCar(null);
    setOriginalImages([]);
    setPendingUploads([]);
    setImagesToDelete([]);
  };

  const resetSliderForm = () => {
    setSliderFormData({
      url: '',
      alt: '',
      title: '',
      description: ''
    });
    setSliderImagePreview('');
    setEditingImageSlider(null);
  };

  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const handleMultipleImageUpload = async (files: File[]) => {
    const validImageFiles = files.filter(f => f && f.type.startsWith('image/'));
    if (validImageFiles.length === 0) return;

    if (editingCar) {
      setIsUploadingImages(true);
      try {
        const newUploadedImages: { id: string; url: string }[] = [];
        for (const file of validImageFiles) {
          try {
            const uploadResult = await uploadImageToCar(editingCar.id, file, accessToken!);
            newUploadedImages.push(uploadResult);
          } catch (err) {
            console.error('Failed to upload image:', err);
            alert(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }
        if (newUploadedImages.length > 0) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newUploadedImages]
          }));
          setImagePreviews(prev => [
            ...prev,
            ...newUploadedImages.map(img => getFullImageUrl(img.url))
          ]);
        }
      } catch (error) {
        console.error('Failed to upload images:', error);
      } finally {
        setIsUploadingImages(false);
      }
    } else {
      const newItems = validImageFiles.map((file, idx) => {
        const previewUrl = URL.createObjectURL(file);
        return {
          file,
          previewUrl,
          tempItem: { id: `temp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`, url: previewUrl }
        };
      });

      setPendingUploads(prev => [...prev, ...newItems.map(item => item.file)]);
      setImagePreviews(prev => [...prev, ...newItems.map(item => item.previewUrl)]);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newItems.map(item => item.tempItem)]
      }));
    }
  };

  const [isUploadingSliderImage, setIsUploadingSliderImage] = useState(false);

  const handleSliderImageUpload = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsUploadingSliderImage(true);
      try {
        const uploadResult = await uploadImage(file, accessToken!);
        const fullUrl = getFullImageUrl(uploadResult.url);
        setSliderFormData(prev => ({ ...prev, url: uploadResult.url }));
        setSliderImagePreview(fullUrl);
      } catch (error) {
        console.error('Failed to upload slider image:', error);
        alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Please try again.'}`);
      } finally {
        setIsUploadingSliderImage(false);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleMultipleImageUpload(Array.from(files));
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSliderFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSliderImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleMultipleImageUpload(Array.from(files));
    }
  };

  const handleSliderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsSliderDragOver(true);
  };

  const handleSliderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsSliderDragOver(false);
  };

  const handleSliderDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsSliderDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleSliderImageUpload(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
      if (files.length > 0) {
        handleMultipleImageUpload(files);
      }
    }
  };

  const handleSliderPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleSliderImageUpload(file);
          }
          break;
        }
      }
    }
  };

  const removeImage = async (index: number) => {
    const image = formData.images[index];
    if (editingCar && image.id && !String(image.id).startsWith('temp')) {
      try {
        await deleteImage(String(image.id), accessToken!);
      } catch (error) {
        console.error('Failed to delete image:', error);
        alert(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    } else if (!editingCar) {
      setPendingUploads(prev => prev.filter((_, i) => i !== index));
    }
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeSliderImage = () => {
    setSliderFormData(prev => ({ ...prev, url: '' }));
    setSliderImagePreview('');
    if (sliderFileInputRef.current) {
      sliderFileInputRef.current.value = '';
    }
  };

  // Add paste event listener to the dialog
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (isDialogOpen) {
        const items = e.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                handleImageUpload(file);
              }
              break;
            }
          }
        }
      }
    };

    if (isDialogOpen) {
      document.addEventListener('paste', handleGlobalPaste);
    }

    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [isDialogOpen]);

  // Add paste event listener to the slider dialog
  useEffect(() => {
    const handleGlobalSliderPaste = (e: ClipboardEvent) => {
      if (isSliderDialogOpen) {
        const items = e.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                handleSliderImageUpload(file);
              }
              break;
            }
          }
        }
      }
    };

    if (isSliderDialogOpen) {
      document.addEventListener('paste', handleGlobalSliderPaste);
    }

    return () => {
      document.removeEventListener('paste', handleGlobalSliderPaste);
    };
  }, [isSliderDialogOpen]);

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setOriginalImages(car.images || []);
    setFormData({
      brand: car.brand || '',
      model: car.model || '',
      year: (car.year || '').toString(),
      price: (car.price || '').toString(),
      mileage: (car.mileage || '').toString(),
      fuelType: car.fuelType,
      transmission: car.transmission,
      bodyType: car.bodyType,
      color: car.color || '',
      location: car.location || '',
      description: car.description || '',
      features: Array.isArray(car.features) ? car.features.join(', ') : '',
      images: car.images || []
    });
    setImagePreviews((car.images || []).map(img => getFullImageUrl(img.url)));
    setPendingUploads([]);
    setImagesToDelete([]);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSliderEdit = (slider: ImageSlider) => {
    setEditingImageSlider(slider);
    setSliderFormData({
      url: slider.url,
      alt: slider.alt,
      title: slider.title,
      description: slider.description
    });
    setSliderImagePreview(getFullImageUrl(slider.url));
    setIsSliderDialogOpen(true);
  };

  const handleSliderAdd = () => {
    resetSliderForm();
    setIsSliderDialogOpen(true);
  };

  const handleDelete = async (carId: string) => {
    console.log('handleDelete called with carId:', carId);
    if (confirm('Are you sure you want to delete this car?')) {
      console.log('User confirmed deletion for carId:', carId);

      if (!accessToken) {
        alert('Your session has expired. Please log in again.');
        logout();
        navigate('/admin/login');
        return;
      }

      try {
        await deleteCar(carId, accessToken);
        const updatedCars = cars.filter(car => car.id !== carId);
        onCarsUpdate(updatedCars);
      } catch (error) {
        console.error('Failed to delete car:', error);
        alert(`Failed to delete car: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.log('User cancelled deletion for carId:', carId);
    }
  };

  const handleSliderDelete = async (sliderId: string) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      if (!accessToken) {
        alert('Your session has expired. Please log in again.');
        logout();
        navigate('/admin/login');
        return;
      }

      try {
        await deleteImageSlider(sliderId, accessToken);
        const updatedSliders = imageSliders.filter(slider => slider.id !== sliderId);
        onImageSlidersUpdate(updatedSliders);
      } catch (error) {
        console.error('Failed to delete slide:', error);
        alert(`Failed to delete slide: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Access token at submit:', accessToken);

    if (!accessToken) {
      alert('Your session has expired. Please log in again.');
      logout();
      navigate('/admin/login');
      return;
    }

    const baseCarData = {
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year),
      price: parseInt(formData.price),
      mileage: parseInt(formData.mileage),
      fuelType: formData.fuelType as Car['fuelType'],
      transmission: formData.transmission as Car['transmission'],
      bodyType: formData.bodyType as Car['bodyType'],
      color: formData.color,
      location: formData.location,
      description: formData.description,
      features: formData.features.split(',').map(f => f.trim()).filter(f => f)
    };

    if (editingCar) {
      const finalImages = formData.images.filter(img => img.id && !String(img.id).startsWith('temp'));
      const fullCarData: Car = { ...baseCarData, id: editingCar.id, images: finalImages };
      try {
        const updatedCar = await updateCar(fullCarData, accessToken!);
        const updatedCars = cars.map(car => car.id === editingCar.id ? updatedCar : car);
        onCarsUpdate(updatedCars);
      } catch (error) {
        console.error('Failed to update car:', error);
        console.error('Error details:', error);
        alert(`Failed to update car: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    } else {
      const createCarData = { ...baseCarData, images: [] };
      try {
        const newCar = await createCar(createCarData, accessToken!);
        const uploadedImages: { id: string; url: string }[] = [];
        for (const file of pendingUploads) {
          try {
            const uploadResult = await uploadImageToCar(newCar.id, file, accessToken!);
            uploadedImages.push(uploadResult);
          } catch (error) {
            console.error('Failed to upload image for new car:', error);
          }
        }
        const carWithImages = { ...newCar, images: uploadedImages };
        onCarsUpdate([...cars, carWithImages]);
      } catch (error) {
        console.error('Failed to create car:', error);
        console.error('Error details:', error);
        alert(`Failed to add car: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleSliderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      alert('Your session has expired. Please log in again.');
      logout();
      navigate('/admin/login');
      return;
    }

    const baseSliderData = {
      url: sliderFormData.url,
      alt: sliderFormData.alt,
      title: sliderFormData.title,
      description: sliderFormData.description
    };

    if (editingImageSlider) {
      const fullSliderData: ImageSlider = { ...baseSliderData, id: editingImageSlider.id };
      try {
        const updatedSlider = await updateImageSlider(fullSliderData, accessToken!);
        const updatedSliders = imageSliders.map(slider => slider.id === editingImageSlider.id ? updatedSlider : slider);
        onImageSlidersUpdate(updatedSliders);
      } catch (error) {
        console.error('Failed to update slide:', error);
        alert(`Failed to update slide: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    } else {
      try {
        const newSlider = await createImageSlider(baseSliderData, accessToken!);
        onImageSlidersUpdate([...imageSliders, newSlider]);
      } catch (error) {
        console.error('Failed to create slide:', error);
        alert(`Failed to add slide: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }

    setIsSliderDialogOpen(false);
    resetSliderForm();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1>Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              logout();
              navigate('/');
            }}>
              Logout
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2>Car Management</h2>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Car
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead>Transmission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>{car.brand}</TableCell>
                    <TableCell>{car.model}</TableCell>
                    <TableCell>{car.year}</TableCell>
                    <TableCell>¥{car.price.toLocaleString()}</TableCell>
                    <TableCell>{car.fuelType}</TableCell>
                    <TableCell>{car.transmission}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(car)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(car.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2>Image Slider Management</h2>
            <Button onClick={handleSliderAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Slide
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Alt Text</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imageSliders.map((slider) => (
                  <TableRow key={slider.id}>
                    <TableCell>
                      {slider.url ? (
                        <img
                          src={getFullImageUrl(slider.url)}
                          alt={slider.alt || slider.title}
                          className="w-16 h-10 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-16 h-10 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">
                          No img
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{slider.title}</TableCell>
                    <TableCell>{slider.alt}</TableCell>
                    <TableCell>{slider.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSliderEdit(slider)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleSliderDelete(slider.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCar ? 'Edit Car' : 'Add New Car'}
              </DialogTitle>
              <DialogDescription>
                {editingCar
                  ? 'Make changes to the car details below.'
                  : 'Fill in the details below to add a new car to the inventory.'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Brand</label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Model</label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Year</label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Price (¥)</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Mileage</label>
                  <Input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Fuel Type</label>
                  <Select value={formData.fuelType} onValueChange={(value: Car['fuelType']) => setFormData(prev => ({ ...prev, fuelType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block mb-2">Transmission</label>
                  <Select value={formData.transmission} onValueChange={(value: Car['transmission']) => setFormData(prev => ({ ...prev, transmission: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block mb-2">Body Type</label>
                  <Select value={formData.bodyType} onValueChange={(value: Car['bodyType']) => setFormData(prev => ({ ...prev, bodyType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Hatchback">Hatchback</SelectItem>
                      <SelectItem value="Coupe">Coupe</SelectItem>
                      <SelectItem value="Convertible">Convertible</SelectItem>
                      <SelectItem value="Pickup">Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block mb-2">Color</label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium">Car Images</label>

                  {/* Images Display */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {formData.images.map((image, index) => (
                        <div key={image.id || index} className="relative group border rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                          <img
                            src={imagePreviews[index] || getFullImageUrl(image.url)}
                            alt={`Car preview ${index + 1}`}
                            className="w-full h-28 object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${isDragOver
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                      }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onPaste={handlePaste}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-700 font-medium text-sm mb-1">
                        Click or drag & drop multiple images here
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        PNG, JPG, WEBP accepted • Select multiple files together
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingImages}
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploadingImages ? 'Uploading...' : 'Choose Multiple Files'}
                      </Button>
                      {formData.images.length > 0 && (
                        <p className="text-xs text-emerald-600 font-medium mt-2">
                          ✓ {formData.images.length} {formData.images.length === 1 ? 'image' : 'images'} ready
                        </p>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2">Features (comma-separated)</label>
                  <Input
                    value={formData.features}
                    onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                    placeholder="Air Conditioning, Navigation System, Leather Seats"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2">Description</label>
                  <textarea
                    className="w-full p-2 border rounded-md min-h-[100px] resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCar ? 'Update' : 'Add'} Car
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isSliderDialogOpen} onOpenChange={setIsSliderDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingImageSlider ? 'Edit Slide' : 'Add New Slide'}
              </DialogTitle>
              <DialogDescription>
                {editingImageSlider
                  ? 'Make changes to the slide details below.'
                  : 'Fill in the details below to add a new slide to the slider.'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSliderSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block mb-2">Title</label>
                  <Input
                    value={sliderFormData.title}
                    onChange={(e) => setSliderFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Alt Text</label>
                  <Input
                    value={sliderFormData.alt}
                    onChange={(e) => setSliderFormData(prev => ({ ...prev, alt: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Image URL (or select below)</label>
                  <Input
                    value={sliderFormData.url}
                    onChange={(e) => {
                      setSliderFormData(prev => ({ ...prev, url: e.target.value }));
                      setSliderImagePreview(e.target.value);
                    }}
                    placeholder="https://example.com/car-image.jpg"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Slide Image</label>

                  {/* Image Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${isSliderDragOver
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                      }`}
                    onDragOver={handleSliderDragOver}
                    onDragLeave={handleSliderDragLeave}
                    onDrop={handleSliderDrop}
                    onPaste={handleSliderPaste}
                    onClick={() => sliderFileInputRef.current?.click()}
                  >
                    {sliderImagePreview || sliderFormData.url ? (
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <img
                          src={sliderImagePreview || getFullImageUrl(sliderFormData.url)}
                          alt="Slide preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full"
                          onClick={removeSliderImage}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-700 font-medium text-sm mb-1">
                          Click or drag & drop an image here
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          PNG, JPG, WEBP accepted • Paste from clipboard (Ctrl+V)
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploadingSliderImage}
                          onClick={(e) => {
                            e.stopPropagation();
                            sliderFileInputRef.current?.click();
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploadingSliderImage ? 'Uploading...' : 'Choose Image File'}
                        </Button>
                      </div>
                    )}

                    <input
                      ref={sliderFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSliderFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Description</label>
                  <textarea
                    className="w-full p-2 border rounded-md min-h-[100px] resize-none"
                    value={sliderFormData.description}
                    onChange={(e) => setSliderFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsSliderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingImageSlider ? 'Update' : 'Add'} Slide
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}