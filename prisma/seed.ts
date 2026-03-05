import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...\n");

    // Clear existing data (in reverse dependency order)
    console.log("🧹 Clearing existing data...");
    await prisma.materialConsumptionLog.deleteMany();
    await prisma.dailySnapshot.deleteMany();
    await prisma.lowStockAlert.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.rawMaterialPurchase.deleteMany();
    await prisma.salesEntry.deleteMany();
    await prisma.productionEntry.deleteMany();
    await prisma.billOfMaterials.deleteMany();
    await prisma.finishedProduct.deleteMany();
    await prisma.rawMaterial.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
    console.log("✅ Database cleared\n");

    // ─── Create demo company ──────────────────────────
    const company = await prisma.company.create({
        data: {
            name: "Demo Manufacturing Co.",
            industry: "furniture",
            address: "123 Industrial Estate, Mumbai, MH 400001",
        },
    });
    console.log(`✅ Created company: ${company.name}`);

    // ─── Create users with different roles ────────────
    // Role         Username    Password    Permissions
    // Admin        admin       admin123    Full access (all features)
    // Auditor      auditor     audit123    View + Add expenses
    // Viewer       viewer      view123     Read-only access

    const adminHash = await bcrypt.hash("admin123", 12);
    const auditorHash = await bcrypt.hash("audit123", 12);
    const viewerHash = await bcrypt.hash("view123", 12);

    const admin = await prisma.user.create({
        data: {
            name: "Admin User",
            email: "admin",
            passwordHash: adminHash,
            role: "ADMIN",
            companyId: company.id,
        },
    });

    const auditor = await prisma.user.create({
        data: {
            name: "Auditor User",
            email: "auditor",
            passwordHash: auditorHash,
            role: "AUDITOR",
            companyId: company.id,
        },
    });

    const viewer = await prisma.user.create({
        data: {
            name: "Viewer User",
            email: "viewer",
            passwordHash: viewerHash,
            role: "VIEWER",
            companyId: company.id,
        },
    });

    console.log("✅ Created users:");
    console.log("   ┌──────────┬──────────┬──────────┬──────────────────────────┐");
    console.log("   │ Role     │ Username │ Password │ Permissions              │");
    console.log("   ├──────────┼──────────┼──────────┼──────────────────────────┤");
    console.log("   │ Admin    │ admin    │ admin123 │ Full access              │");
    console.log("   │ Auditor  │ auditor  │ audit123 │ View + Add expenses      │");
    console.log("   │ Viewer   │ viewer   │ view123  │ Read-only access         │");
    console.log("   └──────────┴──────────┴──────────┴──────────────────────────┘");

    // ─── Create raw materials ─────────────────────────
    const materials = await Promise.all([
        prisma.rawMaterial.create({
            data: { name: "Teak Wood", unit: "kg", quantityInStock: 500, minimumStockLevel: 100, costPerUnit: 450, companyId: company.id },
        }),
        prisma.rawMaterial.create({
            data: { name: "Plywood Sheet", unit: "piece", quantityInStock: 200, minimumStockLevel: 50, costPerUnit: 850, companyId: company.id },
        }),
        prisma.rawMaterial.create({
            data: { name: "Wood Polish", unit: "litre", quantityInStock: 30, minimumStockLevel: 10, costPerUnit: 320, companyId: company.id },
        }),
        prisma.rawMaterial.create({
            data: { name: "Fabric (Upholstery)", unit: "metre", quantityInStock: 150, minimumStockLevel: 30, costPerUnit: 250, companyId: company.id },
        }),
        prisma.rawMaterial.create({
            data: { name: "Screws & Nails Pack", unit: "box", quantityInStock: 80, minimumStockLevel: 20, costPerUnit: 120, companyId: company.id },
        }),
        prisma.rawMaterial.create({
            data: { name: "Wood Glue", unit: "litre", quantityInStock: 8, minimumStockLevel: 10, costPerUnit: 180, companyId: company.id },
        }),
        prisma.rawMaterial.create({
            data: { name: "Metal Brackets", unit: "piece", quantityInStock: 300, minimumStockLevel: 50, costPerUnit: 35, companyId: company.id },
        }),
        prisma.rawMaterial.create({
            data: { name: "Foam Padding", unit: "kg", quantityInStock: 45, minimumStockLevel: 15, costPerUnit: 420, companyId: company.id },
        }),
    ]);
    console.log(`\n✅ Created ${materials.length} raw materials`);

    // ─── Create finished products ─────────────────────
    const products = await Promise.all([
        prisma.finishedProduct.create({
            data: { name: "Dining Chair", sku: "FP-DNCH-001", description: "Classic teak dining chair with upholstered seat", sellingPrice: 4500, quantityInStock: 20, companyId: company.id },
        }),
        prisma.finishedProduct.create({
            data: { name: "Office Desk", sku: "FP-OFDK-002", description: "Modern office desk with drawer unit", sellingPrice: 12500, quantityInStock: 8, companyId: company.id },
        }),
        prisma.finishedProduct.create({
            data: { name: "Bookshelf", sku: "FP-BKSH-003", description: "5-tier teak bookshelf", sellingPrice: 8500, quantityInStock: 12, companyId: company.id },
        }),
        prisma.finishedProduct.create({
            data: { name: "Sofa Set (3-Seater)", sku: "FP-SOFA-004", description: "Premium 3-seater sofa with foam cushions", sellingPrice: 28000, quantityInStock: 3, companyId: company.id },
        }),
    ]);
    console.log(`✅ Created ${products.length} finished products`);

    // ─── Create BOMs ──────────────────────────────────
    // Dining Chair BOM
    await prisma.billOfMaterials.createMany({
        data: [
            { finishedProductId: products[0].id, rawMaterialId: materials[0].id, quantityRequired: 3, companyId: company.id },
            { finishedProductId: products[0].id, rawMaterialId: materials[3].id, quantityRequired: 1.5, companyId: company.id },
            { finishedProductId: products[0].id, rawMaterialId: materials[4].id, quantityRequired: 0.5, companyId: company.id },
            { finishedProductId: products[0].id, rawMaterialId: materials[2].id, quantityRequired: 0.2, companyId: company.id },
            { finishedProductId: products[0].id, rawMaterialId: materials[5].id, quantityRequired: 0.1, companyId: company.id },
        ],
    });

    // Office Desk BOM
    await prisma.billOfMaterials.createMany({
        data: [
            { finishedProductId: products[1].id, rawMaterialId: materials[0].id, quantityRequired: 8, companyId: company.id },
            { finishedProductId: products[1].id, rawMaterialId: materials[1].id, quantityRequired: 2, companyId: company.id },
            { finishedProductId: products[1].id, rawMaterialId: materials[4].id, quantityRequired: 1, companyId: company.id },
            { finishedProductId: products[1].id, rawMaterialId: materials[2].id, quantityRequired: 0.5, companyId: company.id },
            { finishedProductId: products[1].id, rawMaterialId: materials[6].id, quantityRequired: 6, companyId: company.id },
        ],
    });

    // Bookshelf BOM
    await prisma.billOfMaterials.createMany({
        data: [
            { finishedProductId: products[2].id, rawMaterialId: materials[0].id, quantityRequired: 10, companyId: company.id },
            { finishedProductId: products[2].id, rawMaterialId: materials[1].id, quantityRequired: 3, companyId: company.id },
            { finishedProductId: products[2].id, rawMaterialId: materials[4].id, quantityRequired: 1.5, companyId: company.id },
            { finishedProductId: products[2].id, rawMaterialId: materials[2].id, quantityRequired: 0.3, companyId: company.id },
            { finishedProductId: products[2].id, rawMaterialId: materials[5].id, quantityRequired: 0.3, companyId: company.id },
        ],
    });

    // Sofa Set BOM
    await prisma.billOfMaterials.createMany({
        data: [
            { finishedProductId: products[3].id, rawMaterialId: materials[0].id, quantityRequired: 15, companyId: company.id },
            { finishedProductId: products[3].id, rawMaterialId: materials[3].id, quantityRequired: 8, companyId: company.id },
            { finishedProductId: products[3].id, rawMaterialId: materials[7].id, quantityRequired: 5, companyId: company.id },
            { finishedProductId: products[3].id, rawMaterialId: materials[4].id, quantityRequired: 2, companyId: company.id },
            { finishedProductId: products[3].id, rawMaterialId: materials[5].id, quantityRequired: 0.5, companyId: company.id },
        ],
    });
    console.log("✅ Created BOMs for all products");

    // ─── Create sample production entries ─────────────
    const productionDates = [
        new Date(2025, 1, 1), new Date(2025, 1, 5), new Date(2025, 1, 10),
        new Date(2025, 1, 15), new Date(2025, 1, 20), new Date(2025, 2, 1),
    ];

    for (const date of productionDates) {
        await prisma.productionEntry.create({
            data: {
                finishedProductId: products[Math.floor(Math.random() * 3)].id,
                quantityProduced: Math.floor(Math.random() * 5) + 2,
                productionDate: date,
                notes: "Demo production run",
                companyId: company.id,
                createdBy: admin.id,
            },
        });
    }
    console.log(`✅ Created ${productionDates.length} production entries`);

    // ─── Create sample sales entries ──────────────────
    const saleDates = [
        new Date(2025, 1, 3), new Date(2025, 1, 8), new Date(2025, 1, 12),
        new Date(2025, 1, 18), new Date(2025, 1, 25), new Date(2025, 2, 2),
    ];

    const customers = ["Rahul Furniture Store", "Modern Homes", "Office Plus", "Interior Hub", "Home Design Co."];

    for (const date of saleDates) {
        const product = products[Math.floor(Math.random() * 4)];
        const qty = Math.floor(Math.random() * 3) + 1;
        await prisma.salesEntry.create({
            data: {
                finishedProductId: product.id,
                quantitySold: qty,
                saleDate: date,
                customerName: customers[Math.floor(Math.random() * customers.length)],
                revenueAmount: qty * Number(product.sellingPrice),
                companyId: company.id,
                createdBy: admin.id,
            },
        });
    }
    console.log(`✅ Created ${saleDates.length} sales entries`);

    // ─── Create stock movements ───────────────────────
    for (const material of materials) {
        await prisma.stockMovement.create({
            data: {
                type: "OPENING_STOCK",
                itemType: "RAW_MATERIAL",
                itemId: material.id,
                quantityChange: Number(material.quantityInStock),
                balanceAfter: Number(material.quantityInStock),
                notes: "Opening stock",
                companyId: company.id,
            },
        });
    }

    for (const product of products) {
        await prisma.stockMovement.create({
            data: {
                type: "OPENING_STOCK",
                itemType: "FINISHED_PRODUCT",
                itemId: product.id,
                quantityChange: Number(product.quantityInStock),
                balanceAfter: Number(product.quantityInStock),
                notes: "Opening stock",
                companyId: company.id,
            },
        });
    }
    console.log("✅ Created stock movements");

    // ─── Create low stock alert ───────────────────────
    await prisma.lowStockAlert.create({
        data: {
            rawMaterialId: materials[5].id, // Wood Glue (8 < 10)
            companyId: company.id,
            isRead: false,
        },
    });
    console.log("✅ Created low stock alert for Wood Glue");

    // ─── Done! ────────────────────────────────────────
    console.log("\n🎉 Seeding complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Login Credentials:");
    console.log("  ┌──────────┬──────────┬──────────┐");
    console.log("  │ Role     │ Username │ Password │");
    console.log("  ├──────────┼──────────┼──────────┤");
    console.log("  │ Admin    │ admin    │ admin123 │");
    console.log("  │ Auditor  │ auditor  │ audit123 │");
    console.log("  │ Viewer   │ viewer   │ view123  │");
    console.log("  └──────────┴──────────┴──────────┘");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
