import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp, query, where } from 'firebase/firestore';
import { db, storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  petType: string;
  imageUrl?: string;
  galleryImages?: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isVaccine: boolean;
  serviceCharge?: number;
  createdAt?: Timestamp;
  isActive: boolean;
  stock?: number;
  sku?: string;
}

const fetchShopProducts = async (categoryId?: string, petType?: string): Promise<ShopProduct[]> => {
  const productsCollection = collection(db, 'shopProducts');
  let productsQuery = query(productsCollection, where('isActive', '==', true));
  
  if (categoryId) {
    productsQuery = query(productsQuery, where('categoryId', '==', categoryId));
  }
  
  if (petType && petType !== 'Both') {
    productsQuery = query(productsQuery, where('petType', 'in', [petType, 'Both']));
  }
  
  const snapshot = await getDocs(productsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ShopProduct));
};

export const useShopProducts = (categoryId?: string, petType?: string) => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['shopProducts', categoryId, petType],
    queryFn: () => fetchShopProducts(categoryId, petType),
  });

  const addProductMutation = useMutation({
    mutationFn: async ({ 
      productData, 
      imageFile, 
      galleryFiles 
    }: { 
      productData: Omit<ShopProduct, 'id' | 'imageUrl' | 'galleryImages' | 'createdAt'>, 
      imageFile?: File,
      galleryFiles?: File[]
    }) => {
      let imageUrl = '';
      let galleryImages: string[] = [];
      
      // Upload main image
      if (imageFile) {
        const imageRef = ref(storage, `shopProducts/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Upload gallery images
      if (galleryFiles && galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(async (file, index) => {
          const galleryRef = ref(storage, `shopProducts/gallery/${Date.now()}_${index}_${file.name}`);
          await uploadBytes(galleryRef, file);
          return getDownloadURL(galleryRef);
        });
        galleryImages = await Promise.all(uploadPromises);
      }

      return addDoc(collection(db, 'shopProducts'), {
        ...productData,
        imageUrl,
        galleryImages,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopProducts'] });
      toast.success('Product added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add product');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ 
      productId, 
      productData, 
      imageFile, 
      galleryFiles 
    }: { 
      productId: string, 
      productData: Partial<ShopProduct>, 
      imageFile?: File,
      galleryFiles?: File[]
    }) => {
      const updateData = { ...productData };
      
      // Upload new main image if provided
      if (imageFile) {
        const imageRef = ref(storage, `shopProducts/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        updateData.imageUrl = await getDownloadURL(imageRef);
      }

      // Upload new gallery images if provided
      if (galleryFiles && galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(async (file, index) => {
          const galleryRef = ref(storage, `shopProducts/gallery/${Date.now()}_${index}_${file.name}`);
          await uploadBytes(galleryRef, file);
          return getDownloadURL(galleryRef);
        });
        updateData.galleryImages = await Promise.all(uploadPromises);
      }

      const productRef = doc(db, 'shopProducts', productId);
      return updateDoc(productRef, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopProducts'] });
      toast.success('Product updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const productRef = doc(db, 'shopProducts', productId);
      return updateDoc(productRef, { isActive: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopProducts'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });

  return {
    products,
    featuredProducts: products.filter(p => p.isFeatured),
    bestSellerProducts: products.filter(p => p.isBestSeller),
    vaccineProducts: products.filter(p => p.isVaccine),
    isLoading,
    error,
    addProduct: addProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    isAddingProduct: addProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
    isDeletingProduct: deleteProductMutation.isPending,
  };
};