import { AnalyticsService } from "./services/analytics-service";
import { AuthService } from "./services/auth-service";
import { OrderService } from "./services/order-service";
import { ProductService } from "./services/product-service";
import { ReviewService } from "./services/review-service";
import { StockService } from "./services/stock-service";
import { SupplierService } from "./services/supplier-service";
import { UserService } from "./services/user-service";

export class API {
	public auth: AuthService;
	public products: ProductService;
	public suppliers: SupplierService;
	public stocks: StockService;
	public orders: OrderService;
	public reviews: ReviewService;
	public users: UserService;
	public analytics: AnalyticsService;

	constructor() {
		this.auth = new AuthService();
		this.products = new ProductService();
		this.suppliers = new SupplierService();
		this.stocks = new StockService();
		this.orders = new OrderService();
		this.reviews = new ReviewService();
		this.users = new UserService();
		this.analytics = new AnalyticsService();

		// Initialize default data
		this.initializeDefaultData();
	}

	private initializeDefaultData(): void {
		// Initialize default admin user
		this.auth.initializeDefaultUser();
	}

	public async doesUserHavePermission(id: string) {
		const currentUser = await this.auth.getCurrentUser();
		if (!currentUser) return false;
		return currentUser.id === id || currentUser.role === "admin";
	}
}

// Export singleton instance
export const api = new API();
