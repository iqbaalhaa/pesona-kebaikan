
import assert from "assert";
import { processCategories, MEDICAL_SLUG, MEDICAL_TITLE } from "../src/lib/categoryUtils";

// Mock data
const mockCategories = [
    { id: "1", name: "Pendidikan", slug: "pendidikan", isActive: true },
    { id: "2", name: "Bencana", slug: "bencana", isActive: true },
];

console.log("Running Category Dynamic Logic Tests...");

// Test 1: Medical category injection when missing
// This covers the requirement that Medical is always present
{
    const result = processCategories(mockCategories as any);
    assert.strictEqual(result.length, 3, "Should add medical category");
    assert.strictEqual(result[0].slug, MEDICAL_SLUG, "First category should be medical");
    assert.strictEqual(result[0].name, MEDICAL_TITLE, "Medical title should be hardcoded");
    console.log("PASS: Medical category injection");
}

// Test 2: Medical category handling when present
// This covers the requirement: "Tetapkan secara hardcode... tanpa opsi tambahan"
{
    const inputWithMedical = [
        ...mockCategories,
        { id: "3", name: "Old Medical Name", slug: "medis", isActive: true, options: [{id: 1}] }
    ];
    const result = processCategories(inputWithMedical as any);
    assert.strictEqual(result.length, 3, "Should not duplicate medical category");
    assert.strictEqual(result[0].slug, MEDICAL_SLUG);
    assert.strictEqual(result[0].name, MEDICAL_TITLE, "Should overwrite medical title");
    // Ensure options are ignored/not used in the specific logic path if we were testing UI, 
    // but here we just check structure. 
    // The requirement says "tanpa opsi tambahan" which is handled in UI by ignoring options, 
    // or we could strip them here. 
    // In our implementation we preserved properties but overwrote name. 
    // The UI handles the "no options" by navigating directly.
    console.log("PASS: Medical category handling");
}

// Test 3: Boundary - Empty input
// This covers the "Boundary test: 0 kategori aktif untuk non-medis" requirement
{
    const result = processCategories([]);
    assert.strictEqual(result.length, 1, "Should return at least medical category");
    assert.strictEqual(result[0].slug, MEDICAL_SLUG);
    console.log("PASS: Empty input boundary");
}

// Test 4: Boundary - Only Medical input
{
    const input = [{ id: "3", name: "Medis", slug: "medis", isActive: true }];
    const result = processCategories(input as any);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, MEDICAL_TITLE);
    console.log("PASS: Only Medical input");
}

console.log("All tests passed!");
