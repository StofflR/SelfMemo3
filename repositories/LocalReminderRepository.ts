import { Reminder } from "@prisma/client";
import IReminderRepository from "./IReminderRepository";
import { CreateReminderDto, UpdateReminderDto } from "@/lib/validations/reminder";
import fs from "fs";
import path from "path";

export class LocalReminderRepository implements IReminderRepository {
    private dataFile: string;
    private reminders: Reminder[] = [];

    constructor() {
        // Store data in a local data directory
        const dataDir = path.join(process.cwd(), "data");
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        this.dataFile = path.join(dataDir, "reminders.json");
        this.loadData();
    }

    private loadData(): void {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = fs.readFileSync(this.dataFile, "utf-8");
                this.reminders = JSON.parse(data);
            }
        } catch (error) {
            console.error("Error loading reminder data:", error);
            this.reminders = [];
        }
    }

    private saveData(): void {
        try {
            fs.writeFileSync(this.dataFile, JSON.stringify(this.reminders, null, 2), "utf-8");
        } catch (error) {
            console.error("Error saving reminder data:", error);
            throw error;
        }
    }

    private generateId(): string {
        // Simple ID generation - timestamp + random string
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    async getAll(): Promise<Reminder[]> {
        return [...this.reminders];
    }

    async getById(reminderId: string): Promise<Reminder | null> {
        return this.reminders.find((r) => r.id === reminderId) || null;
    }

    async create(reminder: CreateReminderDto): Promise<Reminder> {
        const newReminder: Reminder = {
            id: this.generateId(),
            userId: reminder.userId,
            name: reminder.name,
            description: reminder.description ?? "",
            type: reminder.type,
            config: reminder.config,
            isDisabled: reminder.isDisabled,
            lastSent: reminder.lastSent || null,
            hasWarnings: reminder.hasWarnings,
            warningNumber: reminder.warningNumber ?? 0,
            warningInterval: reminder.warningInterval || null,
            warningIntervalNumber: reminder.warningIntervalNumber || null,
            timezone: reminder.timezone ?? "Europe/Vienna",
            emailTemplate: reminder.emailTemplate ?? "default",
            additionalUserIds: reminder.additionalUserIds || null,
        };
        this.reminders.push(newReminder);
        this.saveData();
        return newReminder;
    }

    async update(reminder: UpdateReminderDto): Promise<Reminder> {
        const index = this.reminders.findIndex((r) => r.id === reminder.id);
        if (index === -1) {
            throw new Error(`Reminder with id ${reminder.id} not found`);
        }

        const updatedReminder = {
            ...this.reminders[index],
            ...reminder,
        };
        this.reminders[index] = updatedReminder;
        this.saveData();
        return updatedReminder;
    }

    async delete(id: string): Promise<Reminder> {
        const index = this.reminders.findIndex((r) => r.id === id);
        if (index === -1) {
            throw new Error(`Reminder with id ${id} not found`);
        }

        const deletedReminder = this.reminders[index];
        this.reminders.splice(index, 1);
        this.saveData();
        return deletedReminder;
    }

    async updateLastSent(reminderId: string, timestamp: number): Promise<Reminder> {
        const index = this.reminders.findIndex((r) => r.id === reminderId);
        if (index === -1) {
            throw new Error(`Reminder with id ${reminderId} not found`);
        }

        this.reminders[index].lastSent = timestamp.toString();
        this.saveData();
        return this.reminders[index];
    }

    async getAllByUserId(userId: string): Promise<Reminder[]> {
        if (!userId) {
            return [];
        }

        return this.reminders.filter((r) => r.userId === userId);
    }
}
