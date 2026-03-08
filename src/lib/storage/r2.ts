import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;

  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 storage credentials not configured");
  }

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return _client;
}

function getBucket(): string {
  const bucket = env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME not configured");
  return bucket;
}

export async function r2Upload(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function r2GetSignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const client = getClient();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    }),
    { expiresIn }
  );
}

export async function r2Delete(key: string): Promise<void> {
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
}

/**
 * Delete all objects with a given prefix (e.g., "{orgId}/").
 * Uses ListObjectsV2 + DeleteObjects in batches of 1000.
 * Returns the total number of objects deleted.
 */
export async function r2DeleteByPrefix(prefix: string): Promise<number> {
  const client = getClient();
  const bucket = getBucket();
  let totalDeleted = 0;
  let continuationToken: string | undefined;

  do {
    const listResponse = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    const objects = listResponse.Contents ?? [];
    if (objects.length > 0) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: objects.map((obj) => ({ Key: obj.Key! })),
            Quiet: true,
          },
        })
      );
      totalDeleted += objects.length;
    }

    continuationToken = listResponse.NextContinuationToken;
  } while (continuationToken);

  return totalDeleted;
}

export async function r2GetPrefixSize(prefix: string): Promise<number> {
  const client = getClient();
  let totalSize = 0;
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: getBucket(),
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    for (const obj of response.Contents ?? []) {
      totalSize += obj.Size ?? 0;
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return totalSize;
}
