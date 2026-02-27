
import assert from "assert";
import { validateCampaignType } from "../src/lib/campaignValidation";
import { MEDICAL_SLUG } from "../src/lib/categoryUtils";

console.log("Running Campaign Validation Logic Tests...");

// Test 1: Medical Type + Medical Category -> Valid
{
    const result = validateCampaignType('sakit', MEDICAL_SLUG);
    assert.strictEqual(result.valid, true, "Medical type + Medical category should be valid");
    console.log("PASS: Medical type + Medical category");
}

// Test 2: Medical Type + Non-Medical Category -> Invalid
{
    const result = validateCampaignType('sakit', 'pendidikan');
    assert.strictEqual(result.valid, false, "Medical type + Non-medical category should be invalid");
    console.log("PASS: Medical type + Non-medical category");
}

// Test 3: Non-Medical Type + Non-Medical Category -> Valid
{
    const result = validateCampaignType('lainnya', 'pendidikan');
    assert.strictEqual(result.valid, true, "Non-medical type + Non-medical category should be valid");
    console.log("PASS: Non-medical type + Non-medical category");
}

// Test 4: Non-Medical Type + Medical Category -> Invalid
{
    const result = validateCampaignType('lainnya', MEDICAL_SLUG);
    assert.strictEqual(result.valid, false, "Non-medical type + Medical category should be invalid");
    console.log("PASS: Non-medical type + Medical category");
}

console.log("All tests passed!");
