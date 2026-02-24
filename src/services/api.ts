import { compressImage } from '../utils/imageCompression'
import { storeService } from '../features/store/services/storeService'
import { productService } from '../features/products/services/productService'
import { orderService } from '../features/orders/services/orderService'
import { authService } from '../features/auth/services/authService'
import { blogService } from '../features/blog/services/blogService'
import { reviewService } from '../features/products/services/reviewService'
import { wishlistService } from '../features/wishlist/services/wishlistService'

export const api = {
    products: productService.products,
    categories: productService.categories,
    orders: orderService.orders,
    settings: storeService.settings,
    blog: blogService,
    waitingList: storeService.waitingList,
    usuarios: authService.usuarios,
    reviews: reviewService,
    wishlist: wishlistService,
    coupons: orderService.coupons,
    newsletter: storeService.newsletter,
    storage: {
        upload: async (file: File, _path?: string): Promise<string> => {
            try {
                return await compressImage(file);
            } catch (error) {
                console.error("Erro na compressão:", error);
                throw error;
            }
        }
    }
};
