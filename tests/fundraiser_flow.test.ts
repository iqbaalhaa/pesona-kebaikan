import { prisma } from "@/lib/prisma";
import { createFundraiser } from "@/actions/fundraiser";
import { createDonation } from "@/actions/donation";

async function runTest() {
  console.log("🚀 Starting Fundraiser Flow Test...");

  // 1. Setup Data
  const timestamp = Date.now();
  const testEmail = `testuser_${timestamp}@example.com`;
  const campaignSlug = `campaign-test-${timestamp}`;

  try {
    // Create User
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "Test User",
        role: "USER",
      },
    });
    console.log(`✅ Created user: ${user.id}`);

    // Create Category (needed for Campaign)
    let category = await prisma.campaignCategory.findFirst();
    if (!category) {
      category = await prisma.campaignCategory.create({
        data: { name: "Test Category", slug: `test-cat-${timestamp}` },
      });
    }

    // Create Campaign
    const campaign = await prisma.campaign.create({
      data: {
        title: "Test Campaign",
        slug: campaignSlug,
        story: "Test Story",
        target: 1000000,
        start: new Date(),
        end: new Date(Date.now() + 86400000), // +1 day
        createdById: user.id,
        categoryId: category.id,
        status: "ACTIVE",
      },
    });
    console.log(`✅ Created campaign: ${campaign.id} (${campaign.slug})`);

    // 2. Test createFundraiser
    const frRes = await createFundraiser(
      {
        campaignSlug: campaign.slug!,
        title: "My Fundraiser",
        target: 500000,
      },
      user.id // Inject user ID
    );

    if (!frRes.success || !frRes.data) {
      throw new Error(`Failed to create fundraiser: ${frRes.error}`);
    }

    const fundraiser = frRes.data;
    console.log(`✅ Created fundraiser: ${fundraiser.id} (${fundraiser.slug})`);
    
    // Verify fundraiser linkage
    const frCheck = await prisma.fundraiser.findUnique({
        where: { id: fundraiser.id },
    });
    if (frCheck?.campaignId !== campaign.id) {
        throw new Error("Fundraiser linked to wrong campaign!");
    }
    console.log("✅ Fundraiser linked correctly to campaign.");


    // 3. Test Donation to Fundraiser
    const donationRes = await createDonation(
      {
        campaignId: campaign.id,
        fundraiserId: fundraiser.id,
        amount: 50000,
        donorName: "Donor Test",
        donorPhone: "08123456789",
        paymentMethod: "EWALLET",
      },
      user.id
    );

    if (!donationRes.success || !(donationRes as any).data) {
        throw new Error(`Failed to create donation: ${donationRes.error}`);
    }
    
    const donationId = (donationRes as any).data.id;
    console.log(`✅ Created donation: ${donationId}`);

    // Verify donation linkage
    const donationCheck = await prisma.donation.findUnique({
        where: { id: donationId },
    });
    
    if (donationCheck?.fundraiserId !== fundraiser.id) {
        throw new Error("Donation not linked to fundraiser!");
    }
    if (donationCheck?.campaignId !== campaign.id) {
        throw new Error("Donation not linked to campaign!");
    }
    console.log("✅ Donation correctly attributed to fundraiser and campaign.");

    // 4. Test Invalid Donation (Mismatch)
    // Create another campaign
    const campaign2 = await prisma.campaign.create({
        data: {
            title: "Campaign 2",
            slug: `campaign-2-${timestamp}`,
            story: "Story 2",
            target: 1000000,
            start: new Date(),
            createdById: user.id,
            categoryId: category.id,
            status: "ACTIVE",
        }
    });

    const invalidDonationRes = await createDonation({
        campaignId: campaign2.id, // Wrong campaign
        fundraiserId: fundraiser.id, // Fundraiser belongs to Campaign 1
        amount: 50000,
        donorName: "Invalid Donor",
        donorPhone: "08123456789",
        paymentMethod: "EWALLET",
    }, user.id);

    if (invalidDonationRes.success) {
        throw new Error("Validation failed! Should reject mismatched fundraiser.");
    }
    console.log(`✅ Correctly rejected invalid donation: ${invalidDonationRes.error}`);


    console.log("🎉 All tests passed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    // Cleanup (optional, but good for local dev)
    // await prisma.user.delete({ where: { email: testEmail } });
    await prisma.$disconnect();
  }
}

runTest();
