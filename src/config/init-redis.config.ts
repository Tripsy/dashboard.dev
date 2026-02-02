import Redis from 'ioredis';
import { Configuration } from '@/config/settings.config';

let redisInstance: Redis | null = null;

export const getRedisClient = (): Redis => {
	if (!redisInstance) {
		redisInstance = new Redis({
			host: Configuration.get('redis.host') as string,
			port: Configuration.get('redis.port') as number,
			password: Configuration.get('redis.password') as string,
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
