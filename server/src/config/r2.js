import { S3Client } from "@aws-sdk/client-s3";

let r2Client = null;

const getR2Config = () => {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Cloudflare R2 configuration is incomplete");
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
  };
};

const getR2Client = () => {
  if (r2Client) {
    return r2Client;
  }

  const { accountId, accessKeyId, secretAccessKey } = getR2Config();

  r2Client = new S3Client({
    region: "auto",

    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,

    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return r2Client;
};

const getR2BucketName = () => {
  return getR2Config().bucketName;
};

export { getR2Client, getR2BucketName };
