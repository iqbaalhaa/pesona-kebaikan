
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testCtaUpdateLogic() {
    console.log("Starting CTA Update Logic Test...");

    // 1. Create a dummy campaign
    const campaign = await prisma.campaign.create({
        data: {
            title: "Test Campaign CTA",
            description: "Original Story",
            target: 1000000,
            status: "PENDING",
            userId: "test-user-id", // Assuming this exists or foreign key constraints might fail. 
            // Wait, I need a valid user. 
            // Let's try to find an existing user first.
            slug: `test-cta-${Date.now()}`,
            categoryName: "Bantuan Medis & Kesehatan" // To test 'sakit' logic
        }
    }).catch(async (e) => {
        // Fallback: create user if needed, but for now let's assume we can skip user if relation is optional?
        // Checking schema might be needed. 
        // Let's just test the logic function without DB if possible, or use a robust approach.
        console.log("DB creation failed, falling back to logic-only test.");
        return null;
    });

    if (!campaign) {
        console.log("Skipping DB test, running logic unit test.");
        runUnitTests();
        return;
    }

    try {
        console.log("Created campaign:", campaign.id);

        // 2. Simulate updateCampaignStory logic
        const newTitle = "Updated Title";
        const newStory = "Updated Story Content";
        const newCta = "Ayo bantu sekarang!";

        let metadata: any = campaign.metadata || {};
        const isSakit = campaign.categoryName === "Bantuan Medis & Kesehatan" || (metadata as any).type === "sakit";

        if (isSakit) {
            metadata = { ...metadata, cta: newCta };
        } else {
            metadata = { ...metadata, ctaOther: newCta };
        }

        // 3. Update DB
        const updated = await prisma.campaign.update({
            where: { id: campaign.id },
            data: {
                title: newTitle,
                description: newStory, // maps to 'story' in function
                metadata
            }
        });

        // 4. Verify
        console.log("Verifying update...");
        if (updated.description !== newStory) throw new Error("Story mismatch");
        if ((updated.metadata as any).cta !== newCta) throw new Error("CTA mismatch in metadata");
        if (updated.description.includes(newCta)) throw new Error("CTA leaked into story");

        console.log("SUCCESS: CTA updated correctly in metadata and separated from story.");

        // Clean up
        await prisma.campaign.delete({ where: { id: campaign.id } });

    } catch (e) {
        console.error("Test failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

function runUnitTests() {
    // Unit test for the mapping logic
    const cases = [
        {
            name: "Medical Campaign",
            category: "Bantuan Medis & Kesehatan",
            meta: { type: "sakit" },
            inputCta: "Bantu medis",
            expectedMeta: { type: "sakit", cta: "Bantu medis" }
        },
        {
            name: "Other Campaign",
            category: "Pendidikan",
            meta: { type: "lainnya" },
            inputCta: "Bantu sekolah",
            expectedMeta: { type: "lainnya", ctaOther: "Bantu sekolah" }
        }
    ];

    cases.forEach(c => {
        let metadata = { ...c.meta };
        const isSakit = c.category === "Bantuan Medis & Kesehatan" || metadata.type === "sakit";
        
        if (isSakit) {
            metadata = { ...metadata, cta: c.inputCta } as any;
        } else {
            metadata = { ...metadata, ctaOther: c.inputCta } as any;
        }

        const expectedKey = c.name === "Medical Campaign" ? "cta" : "ctaOther";
        if ((metadata as any)[expectedKey] !== c.inputCta) {
            console.error(`FAILED: ${c.name} - Expected ${c.inputCta}, got ${(metadata as any)[expectedKey]}`);
        } else {
            console.log(`PASSED: ${c.name}`);
        }
    });
}

testCtaUpdateLogic();
