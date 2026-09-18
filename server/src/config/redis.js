import IORedis from "ioredis";

const getRedisUrl = () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is required");
  }

  return redisUrl;
};

const createQueueRedisConnection = () => {
  return new IORedis(getRedisUrl(), {
    maxRetriesPerRequest: 1,
  });
};

const createWorkerRedisConnection = () => {
  return new IORedis(getRedisUrl(), {
    maxRetriesPerRequest: null,
  });
};

export { createQueueRedisConnection, createWorkerRedisConnection };
