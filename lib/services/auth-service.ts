import type { User } from "../types";
import { BaseService } from "./base-service";

export class AuthService extends BaseService {
	private readonly USERS_KEY = "stockmaster_users";
	private readonly CURRENT_USER_KEY = "stockmaster_current_user";

	DEFAULT_ADMIN_PROFILE: User & { password: string } = {
		id: this.generateId(),
		email: "admin@stockmaster.com",
		password: "admin123",
		name: "Admin User",
		role: "admin",
		createdAt: this.getCurrentTimestamp(),
		updatedAt: this.getCurrentTimestamp(),
	};

	async login(email: string, password: string): Promise<User | null> {
		const users = this.getFromStorage<User & { password: string }>(
			this.USERS_KEY
		);
		const user = users.find(
			(u) => u.email === email && u.password === password
		);

		if (user) {
			const { password: _, ...userWithoutPassword } = user;
			this.saveCurrentUser(userWithoutPassword);
			return userWithoutPassword;
		}

		return null;
	}

	async register(email: string, password: string, name: string): Promise<User> {
		const users = this.getFromStorage<User & { password: string }>(
			this.USERS_KEY
		);

		if (users.find((u) => u.email === email)) {
			throw new Error("User already exists");
		}

		const newUser = {
			id: this.generateId(),
			email,
			password,
			name,
			role: "user" as const,
			createdAt: this.getCurrentTimestamp(),
			updatedAt: this.getCurrentTimestamp(),
		};

		users.push(newUser);
		this.saveToStorage(this.USERS_KEY, users);

		const { password: _, ...userWithoutPassword } = newUser;
		this.saveCurrentUser(userWithoutPassword);
		return userWithoutPassword;
	}

	async getCurrentUser(): Promise<User | null> {
		if (typeof window === "undefined") return null;
		const userId = localStorage.getItem(this.CURRENT_USER_KEY);

		// If no user is logged in, return null
		if (!userId) return null;

		// search for the user in the storage
		const users = this.getFromStorage<User & { password: string }>(
			this.USERS_KEY
		);
		const user = users.find((u) => u.id === userId);
		return user ? user : null;
	}

	async logout(): Promise<void> {
		if (typeof window === "undefined") return;
		localStorage.removeItem(this.CURRENT_USER_KEY);
	}

	private saveCurrentUser(user: User): void {
		if (typeof window === "undefined") return;
		localStorage.setItem(this.CURRENT_USER_KEY, user.id); // save only the user ID for simplicity
	}

	// Initialize with default admin user
	initializeDefaultUser(): void {
		const users = this.getFromStorage<User & { password: string }>(
			this.USERS_KEY
		);
		if (users.length === 0) {
			this.saveToStorage(this.USERS_KEY, [this.DEFAULT_ADMIN_PROFILE]);
		}
	}
}
