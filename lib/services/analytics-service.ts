import { BaseService } from "./base-service"
import type { AnalyticsData, Product, Supplier, Order, Stock } from "../types"

export class AnalyticsService extends BaseService {
  private readonly PRODUCTS_KEY = "stockmaster_products"
  private readonly SUPPLIERS_KEY = "stockmaster_suppliers"
  private readonly ORDERS_KEY = "stockmaster_orders"
  private readonly STOCKS_KEY = "stockmaster_stocks"

  async getAnalyticsData(): Promise<AnalyticsData> {
    const products = this.getFromStorage<Product>(this.PRODUCTS_KEY)
    const suppliers = this.getFromStorage<Supplier>(this.SUPPLIERS_KEY)
    const orders = this.getFromStorage<Order>(this.ORDERS_KEY)
    const stocks = this.getFromStorage<Stock>(this.STOCKS_KEY)

    const totalRevenue = orders
      .filter((o) => o.status === "completed" && o.type === "sale")
      .reduce((sum, order) => sum + order.total, 0)

    const lowStockItems = stocks.filter((s) => s.quantity <= s.minQuantity).length

    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    // Calculate top products by quantity sold
    const productSales = new Map<string, number>()
    orders
      .filter((o) => o.type === "sale" && o.status === "completed")
      .forEach((order) => {
        order.items.forEach((item) => {
          const current = productSales.get(item.productId) || 0
          productSales.set(item.productId, current + item.quantity)
        })
      })

    const topProducts = Array.from(productSales.entries())
      .map(([productId, quantity]) => ({ productId, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    // Calculate monthly revenue for the last 6 months
    const monthlyRevenue = this.calculateMonthlyRevenue(orders)

    return {
      totalProducts: products.length,
      totalSuppliers: suppliers.length,
      totalOrders: orders.length,
      totalRevenue,
      lowStockItems,
      recentOrders,
      topProducts,
      monthlyRevenue,
    }
  }

  private calculateMonthlyRevenue(orders: Order[]): { month: string; revenue: number }[] {
    const monthlyData = new Map<string, number>()
    const now = new Date()

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      monthlyData.set(monthKey, 0)
    }

    orders
      .filter((o) => o.type === "sale" && o.status === "completed")
      .forEach((order) => {
        const orderDate = new Date(order.createdAt)
        const monthKey = orderDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })

        if (monthlyData.has(monthKey)) {
          const current = monthlyData.get(monthKey) || 0
          monthlyData.set(monthKey, current + order.total)
        }
      })

    return Array.from(monthlyData.entries()).map(([month, revenue]) => ({
      month,
      revenue,
    }))
  }
}
