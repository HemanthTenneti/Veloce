import { translate } from "@vitalets/google-translate-api";
import type { Vehicle } from "@domain/vehicle";
import { logger } from "@utils/logger";

// Flat in-memory cache — key: `{lang}:{source_text}` → translated text.
// Prevents redundant network calls for repeated color/description values.
const translationCache = new Map<string, string>();

async function translateText(text: string, targetLang: string): Promise<string> {
  const cacheKey = `${targetLang}:${text}`;
  const cached = translationCache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const { text: translated } = await translate(text, { to: targetLang });
    translationCache.set(cacheKey, translated);
    return translated;
  } catch (error) {
    logger.warn("Translation failed, returning original text", {
      targetLang,
      error: error instanceof Error ? error.message : String(error),
    });
    return text;
  }
}

export async function localizeVehicle(vehicle: Vehicle, locale: string): Promise<Vehicle> {
  if (locale === "en") return vehicle;

  const translatedColor = await translateText(vehicle.color, locale);
  const translatedDescription =
    vehicle.description !== null && vehicle.description !== undefined
      ? await translateText(vehicle.description, locale)
      : vehicle.description;

  return { ...vehicle, color: translatedColor, description: translatedDescription };
}

export async function localizeVehicles(vehicles: Vehicle[], locale: string): Promise<Vehicle[]> {
  if (locale === "en") return vehicles;
  return Promise.all(vehicles.map((v) => localizeVehicle(v, locale)));
}
