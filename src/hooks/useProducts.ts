
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { db } from '@/firebase';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Dog' | 'Cat' | 'Both';
  createdAt?: Timestamp;
}

interface ProductData {
  name?: string;
  price?: number;
  category?: 'Dog' | 'Cat' | 'Both';
  createdAt?: Timestamp;
}

const fetchProducts = async (petType?: string): Promise<Product[]> => {
  console.log('=== STARTING FETCH PRODUCTS ===');
  console.log('Pet type parameter:', petType);
  console.log('Database reference:', db);
  
  const productsCollection = collection(db, 'products');
  console.log('Products collection reference created:', productsCollection);
  
  try {
    // First, let's try to get ALL products to see if any exist
    console.log('Attempting to fetch ALL products first...');
    const allProductsQuery = query(productsCollection);
    const allSnapshot = await getDocs(allProductsQuery);
    console.log('Total products in database:', allSnapshot.docs.length);
    
    // Log all products
    allSnapshot.docs.forEach((doc, index) => {
      console.log(`Product ${index + 1}:`, { id: doc.id, ...doc.data() });
    });
    
    if (allSnapshot.docs.length === 0) {
      console.log('❌ NO PRODUCTS FOUND IN DATABASE - This is the root issue!');
      console.log('Make sure to add products through the Admin -> Products tab');
      return [];
    }
    
    let filteredProducts;
    
    if (petType && petType !== 'Both') {
      const normalizedPetType = petType.charAt(0).toUpperCase() + petType.slice(1).toLowerCase();
      console.log('Filtering for normalized pet type:', normalizedPetType);
      
      // Manual filtering to avoid any query issues
      filteredProducts = allSnapshot.docs
        .map(doc => {
          const docData = doc.data() as ProductData;
          return {
            id: doc.id,
            name: docData.name || '',
            price: docData.price || 0,
            category: docData.category || 'Dog',
            createdAt: docData.createdAt
          } as Product;
        })
        .filter(product => {
          const matches = product.category === normalizedPetType || product.category === 'Both';
          console.log(`Product "${product.name}" (category: ${product.category}) matches ${normalizedPetType}:`, matches);
          return matches;
        });
    } else {
      console.log('No filtering needed, returning all products');
      filteredProducts = allSnapshot.docs.map(doc => {
        const docData = doc.data() as ProductData;
        return {
          id: doc.id,
          name: docData.name || '',
          price: docData.price || 0,
          category: docData.category || 'Dog',
          createdAt: docData.createdAt
        } as Product;
      });
    }
    
    console.log('Final filtered products:', filteredProducts);
    console.log('=== FETCH PRODUCTS COMPLETE ===');
    return filteredProducts;
    
  } catch (error) {
    console.error('❌ Error in fetchProducts:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return [];
  }
};

export const useProducts = (petType?: string) => {
  console.log('useProducts hook called with petType:', petType);
  
  const result = useQuery({
    queryKey: ['products', petType],
    queryFn: () => fetchProducts(petType),
  });
  
  // Log the results using useEffect pattern
  console.log('useProducts result:', result.data);
  if (result.error) {
    console.error('useProducts error:', result.error);
  }
  
  return result;
};
