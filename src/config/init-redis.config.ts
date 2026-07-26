import Redis from 'ioredis';
import { Configuration } from '@/config/settings.config';

let redisInstance: Redis | null = null;

export const getRedisClient = (): Redis => {
	if (!redisInstance) {
		redisInstance = new Redis({
			host: Configuration.get('redis.host'),
			port: Configuration.get('redis.port'),
			password: Configuration.get('redis.password'),
		});

		redisInstance.on('error', (error) => {
			console.error('Redis connection error', error);
		});

		redisInstance.on('connect', () => {
			console.debug('Connected to Redis');
		});
	}

	return redisInstance;
};

export const redisClose = async (): Promise<void> => {
	if (redisInstance) {
		try {
			await redisInstance.quit();
			console.debug('Redis connection closed gracefully');
		} catch (error) {
			console.error('Error closing Redis connection', error);
			throw error;
		} finally {
			redisInstance = null;
		}
	}
};
