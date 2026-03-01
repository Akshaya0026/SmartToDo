import AsyncStorage from '@react-native-async-storage/async-storage';

const LOG_LIMIT = 200;
const LOG_KEY = 'DEBUG_LOGS';

class DebugLogger {
    private logs: string[] = [];

    constructor() {
        this.loadLogs();
    }

    private async loadLogs() {
        try {
            const saved = await AsyncStorage.getItem(LOG_KEY);
            if (saved) {
                this.logs = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load debug logs');
        }
    }

    async log(message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}`;

        // Console output for development
        console.log(entry);

        this.logs.unshift(entry);
        if (this.logs.length > LOG_LIMIT) {
            this.logs.pop();
        }

        try {
            await AsyncStorage.setItem(LOG_KEY, JSON.stringify(this.logs));
        } catch (e) {
            // Silent fail for logging
        }
    }

    getLogs() {
        return this.logs;
    }

    async clearLogs() {
        this.logs = [];
        await AsyncStorage.removeItem(LOG_KEY);
    }
}

export const logger = new DebugLogger();
