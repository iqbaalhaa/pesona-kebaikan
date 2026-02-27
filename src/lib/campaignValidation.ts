
import { MEDICAL_SLUG } from "./categoryUtils";

export function validateCampaignType(type: string, categorySlug: string): { valid: boolean; error?: string } {
    const isMedicalType = type === 'sakit';
    const isMedicalCategory = categorySlug === MEDICAL_SLUG;

    if (isMedicalType) {
        if (!isMedicalCategory) {
            return { valid: false, error: "Modul Medis hanya boleh menggunakan kategori Medis." };
        }
    } else {
        // Non-medical type
        if (isMedicalCategory) {
            return { valid: false, error: "Modul Non-Medis tidak boleh menggunakan kategori Medis." };
        }
    }

    return { valid: true };
}
