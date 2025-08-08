import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt?: Timestamp;
  isActive: boolean;
}

const fetchCategories = async (): Promise<Category[]> => {
  const categoriesCollection = collection(db, 'categories');
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Category));
};

export const useCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const addCategoryMutation = useMutation({
    mutationFn: async ({ categoryData, imageFile }: { categoryData: Omit<Category, 'id' | 'imageUrl' | 'createdAt'>, imageFile?: File }) => {
      let imageUrl = '';
      
      if (imageFile) {
        const imageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      return addDoc(collection(db, 'categories'), {
        ...categoryData,
        imageUrl,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add category');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ categoryId, categoryData, imageFile }: { categoryId: string, categoryData: Partial<Category>, imageFile?: File }) => {
      const updateData = { ...categoryData };
      
      if (imageFile) {
        const imageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        updateData.imageUrl = await getDownloadURL(imageRef);
      }

      const categoryRef = doc(db, 'categories', categoryId);
      return updateDoc(categoryRef, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update category');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const categoryRef = doc(db, 'categories', categoryId);
      return deleteDoc(categoryRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });

  return {
    categories: categories.filter(cat => cat.isActive),
    allCategories: categories,
    isLoading,
    error,
    addCategory: addCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    isAddingCategory: addCategoryMutation.isPending,
    isUpdatingCategory: updateCategoryMutation.isPending,
    isDeletingCategory: deleteCategoryMutation.isPending,
  };
};