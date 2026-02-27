
export const MEDICAL_SLUG = "medis";
export const MEDICAL_TITLE = "Bantuan Medis & Kesehatan";

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  desc?: string;
  isActive: boolean;
  options?: any[];
  examples?: any[];
}

export function processCategories(categories: CategoryData[]): CategoryData[] {
  // 1. Find medical category (by slug 'medis' or likely candidates)
  // We prioritize 'medis' but also check for variations if needed, 
  // though sticking to 'medis' is safest for the hardcoded logic.
  const medical = categories.find(
    (c) => c.slug === MEDICAL_SLUG || c.slug === "bantuan-medis-kesehatan"
  );

  // 2. Filter out the found medical category from the rest to avoid duplication
  const others = categories.filter(
    (c) => c.slug !== MEDICAL_SLUG && c.slug !== "bantuan-medis-kesehatan"
  );

  // 3. Format or Create the Medical Category
  // User Requirement: "Tetapkan secara hardcode 'Bantuan Medis & Kesehatan' untuk campaign tipe medis"
  const formattedMedical: CategoryData = medical
    ? {
        ...medical,
        name: MEDICAL_TITLE, // Force hardcoded title
        slug: MEDICAL_SLUG,  // Normalize slug to 'medis' for simpler logic downstream
      }
    : {
        id: "medis-hardcoded",
        slug: MEDICAL_SLUG,
        name: MEDICAL_TITLE,
        icon: "medis",
        isActive: true,
        desc: "Bantuan biaya pengobatan, rawat jalan, rawat inap, dan kebutuhan medis lainnya.",
        options: [],
        examples: [],
      };

  // 4. Return [Medical, ...Others]
  // Medical is always first (or distinct) as per typical UI patterns for this app
  return [formattedMedical, ...others];
}
