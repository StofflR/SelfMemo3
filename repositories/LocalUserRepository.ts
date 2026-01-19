import "server-only";

import { User } from "@prisma/client";
import IUserRepository from "./IUserRepository";
import { CreateUserDto, UpdateUserDto } from "@/lib/validations/user";
import fs from "fs";
import path from "path";

export class LocalUserRepository implements IUserRepository {
    private dataFile: string;
    private users: User[] = [];

    constructor() {
        // Store data in a local data directory
        const dataDir = path.join(process.cwd(), "data");
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        this.dataFile = path.join(dataDir, "users.json");
        this.loadData();
    }

    private loadData(): void {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = fs.readFileSync(this.dataFile, "utf-8");
                this.users = JSON.parse(data);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            this.users = [];
        }
    }

    private saveData(): void {
        try {
            fs.writeFileSync(this.dataFile, JSON.stringify(this.users, null, 2), "utf-8");
        } catch (error) {
            console.error("Error saving user data:", error);
            throw error;
        }
    }

    private generateId(): string {
        // Simple ID generation - timestamp + random string
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    async create(user: CreateUserDto): Promise<User> {
        const newUser: User = {
            id: this.generateId(),
            username: user.username || null,
            email: user.email || null,
            password: user.password,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            role: user.role,
        };
        this.users.push(newUser);
        this.saveData();
        return newUser;
    }

    async update(user: UpdateUserDto): Promise<User> {
        const index = this.users.findIndex((u) => u.id === user.id);
        if (index === -1) {
            throw new Error(`User with id ${user.id} not found`);
        }

        const updatedUser = {
            ...this.users[index],
            ...user,
        };
        this.users[index] = updatedUser;
        this.saveData();
        return updatedUser;
    }

    async delete(id: string): Promise<User> {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1) {
            throw new Error(`User with id ${id} not found`);
        }

        const deletedUser = this.users[index];
        this.users.splice(index, 1);
        this.saveData();
        return deletedUser;
    }

    async getById(id: string): Promise<User | null> {
        return this.users.find((u) => u.id === id) || null;
    }

    async getAll(): Promise<User[]> {
        return [...this.users];
    }

    async getWhere(where: any): Promise<User[]> {
        return this.users.filter((user) => {
            return Object.entries(where).every(([key, value]) => {
                return user[key as keyof User] === value;
            });
        });
    }

    async getByEmail(email: string): Promise<User | null> {
        return this.users.find((u) => u.email === email) || null;
    }

    async getByUsername(username: string): Promise<User | null> {
        return this.users.find((u) => u.username === username) || null;
    }

    async updatePassword(id: string, newPassword: string): Promise<User> {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1) {
            throw new Error(`User with id ${id} not found`);
        }

        this.users[index].password = newPassword;
        this.saveData();
        return this.users[index];
    }

    async searchByUsername(query: string): Promise<User[]> {
        const lowerQuery = query.toLowerCase();
        return this.users.filter((u) => 
            u?.username?.toLowerCase().includes(lowerQuery)
        ).slice(0, 10);
    }
}
