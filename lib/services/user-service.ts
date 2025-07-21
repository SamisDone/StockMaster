import type { User } from "../types";
import { BaseService } from "./base-service";

export class UserService extends BaseService {
	private readonly USERS_KEY = "stockmaster_users";

	async getAll(): Promise<User[]> {
		const users = this.getFromStorage<User & { password: string }>(
			this.USERS_KEY
		);
		return users.map(({ password, ...user }) => user);
	}

	getById(id: string): User | null {
		const users = this.getFromStorage<User & { password: string }>(
			this.USERS_KEY
		);
		const user = users.find((u) => u.id === id);
		if (!user) return null;

		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async update(
		id: string,
		userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
	): Promise<User | null> {
		const users = this.getFromStorage<User & { password: string }>(
			this.USERS_KEY
		);
		const index = users.findIndex((u) => u.id === id);

		if (index === -1) return null;

		users[index] = {
			...users[index],
			...userData,
			updatedAt: this.getCurrentTimestamp(),
		};

		this.saveToStorage(this.USERS_KEY, users);
		const { password, ...userWithoutPassword } = users[index];
		return userWithoutPassword;
	}

	async updateWithPassword(
		id: string,
		userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">> & {
			password?: string;
		}
	): Promise<User | null> {
		const users = this.getFromStorage<User & { password: string }>(
			this.USERS_KEY
		);
		const index = users.findIndex((u) => u.id === id);

		if (index === -1) return null;

		const updateData = { ...userData };
		if (updateData.password) {
			users[index].password = updateData.password;
			delete updateData.password;
		}

		users[index] = {
			...users[index],
			...updateData,
			updatedAt: this.getCurrentTimestamp(),
		};

		this.saveToStorage(this.USERS_KEY, users);
		const { password, ...userWithoutPassword } = users[index];
		return userWithoutPassword;
	}

	async delete(id: string): Promise<boolean> {
		const users = this.getFromStorage<User & { password: string }>(
			this.USERS_KEY
		);
		const filteredUsers = users.filter((u) => u.id !== id);

		if (filteredUsers.length === users.length) return false;

		this.saveToStorage(this.USERS_KEY, filteredUsers);
		return true;
	}

	async create(
		userData: Omit<User, "id" | "createdAt" | "updatedAt"> & {
			password: string;
		}
	): Promise<User> {
		const users = this.getFromStorage<User & { password: string }>(
			this.USERS_KEY
		);

		if (users.find((u) => u.email === userData.email)) {
			throw new Error("User already exists");
		}

		const newUser = {
			...userData,
			id: this.generateId(),
			role: "user" as const,
			createdAt: this.getCurrentTimestamp(),
			updatedAt: this.getCurrentTimestamp(),
		};

		users.push(newUser);
		this.saveToStorage(this.USERS_KEY, users);

		const { password, ...userWithoutPassword } = newUser;
		return userWithoutPassword;
	}
}
