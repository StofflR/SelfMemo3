import IReminderRepository from "./IReminderRepository";
import IUserRepository from "./IUserRepository";
import { ReminderRepository } from "./ReminderRepository";
import { UserRepository } from "./UserRepository";
import { LocalReminderRepository } from "./LocalReminderRepository";
import { LocalUserRepository } from "./LocalUserRepository";

/**
 * Determines if DATABASE_URL is configured and valid
 */
function isDatabaseConfigured(): boolean {
    const dbUrl = process.env.DATABASE_URL;
    return !!dbUrl && dbUrl.trim() !== "";
}

/**
 * Factory function to create the appropriate UserRepository instance
 * based on whether DATABASE_URL is configured
 */
export function createUserRepository(): IUserRepository {
    if (isDatabaseConfigured()) {
        return new UserRepository();
    } else {
        return new LocalUserRepository();
    }
}

/**
 * Factory function to create the appropriate ReminderRepository instance
 * based on whether DATABASE_URL is configured
 */
export function createReminderRepository(): IReminderRepository {
    if (isDatabaseConfigured()) {
        return new ReminderRepository();
    } else {
        return new LocalReminderRepository();
    }
}

/**
 * Get the current storage mode
 */
export function getStorageMode(): "database" | "local" {
    return isDatabaseConfigured() ? "database" : "local";
}
