import "dotenv/config";

import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import {
  buildUnsplashUrl,
  localRootVehicleCount,
  seedVehicles,
  type UploadedAssetManifest,
  type UploadedAssetRecord,
} from "./vehicle_seed_shared.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apiRoot = resolve(__dirname, "..");
const repoRoot = resolve(__dirname, "../../..");
const workspaceRoot = resolve(repoRoot, "..");
const tempAssetsDir = resolve(apiRoot, "temp_assets");
const manifestPath = resolve(tempAssetsDir, "uploaded-assets-manifest.json");

const frappeUrl = process.env.FRAPPE_URL;
const frappeApiKey = process.env.FRAPPE_API_KEY;
const frappeApiSecret = process.env.FRAPPE_API_SECRET;

if (!frappeUrl || !frappeApiKey || !frappeApiSecret) {
  throw new Error("FRAPPE_URL, FRAPPE_API_KEY, and FRAPPE_API_SECRET must be set before uploading assets.");
}

const authHeader = `token ${frappeApiKey}:${frappeApiSecret}`;

const getMimeType = (fileName: string): string => {
  const extension = extname(fileName).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
};

const ensureTempDirectory = async (): Promise<void> => {
  await mkdir(tempAssetsDir, { recursive: true });
};

const getRepoRootImages = async (): Promise<string[]> => {
  const entries = await readdir(workspaceRoot, { withFileTypes: true });

  return entries
    .filter(entry => entry.isFile() && /\.jpe?g$/i.test(entry.name))
    .map(entry => join(workspaceRoot, entry.name))
    .sort((left, right) => left.localeCompare(right));
};

const downloadToFile = async (url: string, destinationPath: string): Promise<void> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destinationPath, buffer);
};

const copyLocalRootImages = async (
  rootImages: string[],
): Promise<Array<{ vehicleIndex: number; tempFilePath: string; tempFileName: string; source: "repo-root-jpg" }>> => {
  if (rootImages.length < localRootVehicleCount) {
    throw new Error(
      `Expected at least ${localRootVehicleCount} JPG files in ${workspaceRoot}, found ${rootImages.length}.`,
    );
  }

  return Promise.all(
    seedVehicles.slice(0, localRootVehicleCount).map(async (vehicle, index) => {
      const sourcePath = rootImages[index];
      const fileExtension = extname(sourcePath) || ".jpg";
      const tempFileName = `${vehicle.slug}${fileExtension.toLowerCase()}`;
      const tempFilePath = resolve(tempAssetsDir, tempFileName);

      await copyFile(sourcePath, tempFilePath);

      return {
        vehicleIndex: index,
        tempFilePath,
        tempFileName,
        source: "repo-root-jpg",
      };
    }),
  );
};

const downloadUnsplashImages = async (
  rootImages: string[],
): Promise<
  Array<{
    vehicleIndex: number;
    tempFilePath: string;
    tempFileName: string;
    source: "unsplash" | "fallback-copy";
  }>
> => {
  const downloadedAssets: Array<{
    vehicleIndex: number;
    tempFilePath: string;
    tempFileName: string;
    source: "unsplash" | "fallback-copy";
  }> = [];

  for (const [index, vehicle] of seedVehicles.slice(localRootVehicleCount).entries()) {
    const vehicleIndex = index + localRootVehicleCount;
    const tempFileName = `${vehicle.slug}.jpg`;
    const tempFilePath = resolve(tempAssetsDir, tempFileName);

    try {
      await downloadToFile(buildUnsplashUrl(vehicle.imgId), tempFilePath);
      downloadedAssets.push({
        vehicleIndex,
        tempFilePath,
        tempFileName,
        source: "unsplash",
      });
    } catch (error) {
      const fallbackSourcePath = rootImages[vehicleIndex % rootImages.length];

      if (!fallbackSourcePath) {
        throw error;
      }

      await copyFile(fallbackSourcePath, tempFilePath);
      console.warn(
        `Fell back to local JPG for ${vehicle.make} ${vehicle.model}: ${error instanceof Error ? error.message : error}`,
      );

      downloadedAssets.push({
        vehicleIndex,
        tempFilePath,
        tempFileName,
        source: "fallback-copy",
      });
    }
  }

  return downloadedAssets;
};

const uploadFileToFrappe = async (
  filePath: string,
  fileName: string,
): Promise<{ fileName: string; fileUrl: string }> => {
  const mimeType = getMimeType(fileName);
  const buffer = await readFile(filePath);
  const formData = new FormData();

  formData.set("file", new Blob([buffer], { type: mimeType }), fileName);
  formData.set("is_private", "0");
  formData.set("folder", "Home/Attachments");

  const response = await fetch(`${frappeUrl}/api/method/upload_file`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Frappe upload failed for ${fileName}: ${response.status} ${response.statusText} ${errorBody}`,
    );
  }

  const json = (await response.json()) as {
    message?: {
      file_name?: string;
      file_url?: string;
    };
  };

  const uploadedFileName = json.message?.file_name || fileName;
  const fileUrl = json.message?.file_url;

  if (!fileUrl) {
    throw new Error(`Frappe upload for ${fileName} did not return a file_url.`);
  }

  return {
    fileName: uploadedFileName,
    fileUrl,
  };
};

const buildManifest = async (): Promise<UploadedAssetManifest> => {
  await ensureTempDirectory();
  const rootImages = await getRepoRootImages();

  const localAssets = await copyLocalRootImages(rootImages);
  const downloadedAssets = await downloadUnsplashImages(rootImages);
  const gatheredAssets = [...localAssets, ...downloadedAssets].sort(
    (left, right) => left.vehicleIndex - right.vehicleIndex,
  );

  const assets: UploadedAssetRecord[] = [];

  for (const asset of gatheredAssets) {
    const vehicle = seedVehicles[asset.vehicleIndex];

    if (!vehicle) {
      throw new Error(`No vehicle found for asset index ${asset.vehicleIndex}.`);
    }

    const uploadResult = await uploadFileToFrappe(asset.tempFilePath, asset.tempFileName);

    assets.push({
      vehicleKey: vehicle.key,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      source: asset.source,
      tempFileName: asset.tempFileName,
      tempFilePath: asset.tempFilePath,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.fileUrl,
    });

    console.log(`Uploaded ${basename(asset.tempFilePath)} -> ${uploadResult.fileUrl}`);
  }

  return {
    generatedAt: new Date().toISOString(),
    assets,
  };
};

const main = async (): Promise<void> => {
  const manifest = await buildManifest();

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`Wrote asset manifest to ${manifestPath}`);
  console.log(`Uploaded ${manifest.assets.length} vehicle images to Frappe.`);
};

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});