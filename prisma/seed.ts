import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ────────────────────────────────────────────────────
// Realistic Indian Furniture Manufacturing Data
// Based on 2024-2025 industry pricing & market trends
// Source: IndiaMART, TradeIndia, Mrs Woodcraft, CSIL
// ────────────────────────────────────────────────────

async function main() {
    console.log("🌱 Seeding database with realistic industry data...\n");

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
            name: "Shaurya Furniture Works",
            industry: "furniture",
            address: "Plot 45, MIDC Industrial Area, Pune, MH 411026",
        },
    });
    console.log(`✅ Created company: ${company.name}`);

    // ─── Create users with different roles ────────────
    const adminHash = await bcrypt.hash("admin123", 12);
    const auditorHash = await bcrypt.hash("audit123", 12);
    const viewerHash = await bcrypt.hash("view123", 12);

    const admin = await prisma.user.create({
        data: {
            name: "Shaurya Admin",
            email: "admin",
            passwordHash: adminHash,
            role: "ADMIN",
            companyId: company.id,
        },
    });

    const auditor = await prisma.user.create({
        data: {
            name: "Priya Sharma",
            email: "auditor",
            passwordHash: auditorHash,
            role: "AUDITOR",
            companyId: company.id,
        },
    });

    const viewer = await prisma.user.create({
        data: {
            name: "Rahul Verma",
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

    // ─── Raw Materials (realistic Indian pricing 2024-2025) ──────
    const materials = await Promise.all([
        prisma.rawMaterial.create({
            data: {
                name: "Teak Wood (Sagwan)",
                unit: "kg",
                quantityInStock: 1250,
                minimumStockLevel: 200,
                costPerUnit: 450,
                supplierName: "Singla Timber Depot, Pune",
                companyId: company.id,
            },
        }),
        prisma.rawMaterial.create({
            data: {
                name: "BWR Plywood Sheet (8x4 ft, 18mm)",
                unit: "piece",
                quantityInStock: 380,
                minimumStockLevel: 60,
                costPerUnit: 1850,
                supplierName: "Greenply Industries",
                companyId: company.id,
            },
        }),
        prisma.rawMaterial.create({
            data: {
                name: "Melamine Wood Polish",
                unit: "litre",
                quantityInStock: 85,
                minimumStockLevel: 20,
                costPerUnit: 320,
                supplierName: "Asian Paints Woodtech",
                companyId: company.id,
            },
        }),
        prisma.rawMaterial.create({
            data: {
                name: "Chenille Upholstery Fabric",
                unit: "metre",
                quantityInStock: 420,
                minimumStockLevel: 80,
                costPerUnit: 275,
                supplierName: "Jaipur Fabric Store",
                companyId: company.id,
            },
        }),
        prisma.rawMaterial.create({
            data: {
                name: "SS Screws & Nails Assorted",
                unit: "box",
                quantityInStock: 150,
                minimumStockLevel: 30,
                costPerUnit: 145,
                supplierName: "Fastener World, Mumbai",
                companyId: company.id,
            },
        }),
        prisma.rawMaterial.create({
            data: {
                name: "Fevicol Marine Glue",
                unit: "litre",
                quantityInStock: 12,
                minimumStockLevel: 15,
                costPerUnit: 210,
                supplierName: "Pidilite Industries",
                companyId: company.id,
            },
        }),
        prisma.rawMaterial.create({
            data: {
                name: "SS L-Brackets & Hinges",
                unit: "piece",
                quantityInStock: 650,
                minimumStockLevel: 100,
                costPerUnit: 42,
                supplierName: "Hettich India",
                companyId: company.id,
            },
        }),
        prisma.rawMaterial.create({
            data: {
                name: "40D Foam Padding",
                unit: "kg",
                quantityInStock: 95,
                minimumStockLevel: 25,
                costPerUnit: 480,
                supplierName: "Sheela Foam Ltd",
                companyId: company.id,
            },
        }),
        prisma.rawMaterial.create({
            data: {
                name: "MDF Board (8x4 ft, 12mm)",
                unit: "piece",
                quantityInStock: 200,
                minimumStockLevel: 40,
                costPerUnit: 1200,
                supplierName: "Action TESA",
                companyId: company.id,
            },
        }),
        prisma.rawMaterial.create({
            data: {
                name: "Glass Sheet (Tempered, 6mm)",
                unit: "sqft",
                quantityInStock: 180,
                minimumStockLevel: 30,
                costPerUnit: 95,
                supplierName: "Saint-Gobain India",
                companyId: company.id,
            },
        }),
    ]);
    console.log(`\n✅ Created ${materials.length} raw materials with realistic pricing`);

    // ─── Finished Products (realistic Indian MRP) ──────
    const products = await Promise.all([
        prisma.finishedProduct.create({
            data: {
                name: "Royal Dining Chair",
                sku: "SFW-DNCH-001",
                description: "Classic teak dining chair with Chenille upholstered seat, hand-polished finish",
                sellingPrice: 5200,
                quantityInStock: 35,
                category: "Dining",
                companyId: company.id,
            },
        }),
        prisma.finishedProduct.create({
            data: {
                name: "Executive Office Desk",
                sku: "SFW-OFDK-002",
                description: "L-shaped office desk with 3 drawers, cable management, and teak veneer top",
                sellingPrice: 14500,
                quantityInStock: 12,
                category: "Office",
                companyId: company.id,
            },
        }),
        prisma.finishedProduct.create({
            data: {
                name: "5-Tier Heritage Bookshelf",
                sku: "SFW-BKSH-003",
                description: "Solid teak bookshelf with glass panel doors, adjustable shelves",
                sellingPrice: 9800,
                quantityInStock: 18,
                category: "Living Room",
                companyId: company.id,
            },
        }),
        prisma.finishedProduct.create({
            data: {
                name: "Premium 3-Seater Sofa",
                sku: "SFW-SOFA-004",
                description: "3-seater sofa with 40D foam, Chenille fabric, and teak wood frame",
                sellingPrice: 32000,
                quantityInStock: 6,
                category: "Living Room",
                companyId: company.id,
            },
        }),
        prisma.finishedProduct.create({
            data: {
                name: "King Size Bed Frame",
                sku: "SFW-KBED-005",
                description: "King size (78x72) solid teak bed with headboard storage and side tables",
                sellingPrice: 42000,
                quantityInStock: 4,
                category: "Bedroom",
                companyId: company.id,
            },
        }),
        prisma.finishedProduct.create({
            data: {
                name: "6-Seater Dining Table",
                sku: "SFW-DNTB-006",
                description: "Solid teak 6-seater dining table with tempered glass inlay",
                sellingPrice: 18500,
                quantityInStock: 8,
                category: "Dining",
                companyId: company.id,
            },
        }),
        prisma.finishedProduct.create({
            data: {
                name: "Modular TV Unit",
                sku: "SFW-TVUT-007",
                description: "Wall-mounted TV unit with storage cabinets, LED strip provision",
                sellingPrice: 11200,
                quantityInStock: 10,
                category: "Living Room",
                companyId: company.id,
            },
        }),
        prisma.finishedProduct.create({
            data: {
                name: "3-Door Wardrobe",
                sku: "SFW-WARD-008",
                description: "3-door wardrobe with mirror, drawer unit, and hanging rods",
                sellingPrice: 28000,
                quantityInStock: 5,
                category: "Bedroom",
                companyId: company.id,
            },
        }),
    ]);
    console.log(`✅ Created ${products.length} finished products`);

    // ─── BOMs (Bill of Materials) ──────────────────────
    // [0]=Teak, [1]=Plywood, [2]=Polish, [3]=Fabric, [4]=Screws, [5]=Glue, [6]=Brackets, [7]=Foam, [8]=MDF, [9]=Glass

    // Dining Chair BOM
    await prisma.billOfMaterials.createMany({
        data: [
            { finishedProductId: products[0].id, rawMaterialId: materials[0].id, quantityRequired: 3.5, companyId: company.id },
            { finishedProductId: products[0].id, rawMaterialId: materials[3].id, quantityRequired: 1.2, companyId: company.id },
            { finishedProductId: products[0].id, rawMaterialId: materials[4].id, quantityRequired: 0.3, companyId: company.id },
            { finishedProductId: products[0].id, rawMaterialId: materials[2].id, quantityRequired: 0.15, companyId: company.id },
            { finishedProductId: products[0].id, rawMaterialId: materials[5].id, quantityRequired: 0.08, companyId: company.id },
        ],
    });

    // Office Desk BOM
    await prisma.billOfMaterials.createMany({
        data: [
            { finishedProductId: products[1].id, rawMaterialId: materials[0].id, quantityRequired: 10, companyId: company.id },
            { finishedProductId: products[1].id, rawMaterialId: materials[1].id, quantityRequired: 2, companyId: company.id },
            { finishedProductId: products[1].id, rawMaterialId: materials[4].id, quantityRequired: 1.5, companyId: company.id },
            { finishedProductId: products[1].id, rawMaterialId: materials[2].id, quantityRequired: 0.5, companyId: company.id },
            { finishedProductId: products[1].id, rawMaterialId: materials[6].id, quantityRequired: 8, companyId: company.id },
            { finishedProductId: products[1].id, rawMaterialId: materials[8].id, quantityRequired: 1, companyId: company.id },
        ],
    });

    // Bookshelf BOM
    await prisma.billOfMaterials.createMany({
        data: [
            { finishedProductId: products[2].id, rawMaterialId: materials[0].id, quantityRequired: 12, companyId: company.id },
            { finishedProductId: products[2].id, rawMaterialId: materials[1].id, quantityRequired: 3, companyId: company.id },
            { finishedProductId: products[2].id, rawMaterialId: materials[4].id, quantityRequired: 2, companyId: company.id },
            { finishedProductId: products[2].id, rawMaterialId: materials[2].id, quantityRequired: 0.4, companyId: company.id },
            { finishedProductId: products[2].id, rawMaterialId: materials[5].id, quantityRequired: 0.3, companyId: company.id },
            { finishedProductId: products[2].id, rawMaterialId: materials[9].id, quantityRequired: 8, companyId: company.id },
        ],
    });

    // Sofa BOM
    await prisma.billOfMaterials.createMany({
        data: [
            { finishedProductId: products[3].id, rawMaterialId: materials[0].id, quantityRequired: 15, companyId: company.id },
            { finishedProductId: products[3].id, rawMaterialId: materials[3].id, quantityRequired: 10, companyId: company.id },
            { finishedProductId: products[3].id, rawMaterialId: materials[7].id, quantityRequired: 6, companyId: company.id },
            { finishedProductId: products[3].id, rawMaterialId: materials[4].id, quantityRequired: 2, companyId: company.id },
            { finishedProductId: products[3].id, rawMaterialId: materials[5].id, quantityRequired: 0.5, companyId: company.id },
        ],
    });

    // King Size Bed BOM
    await prisma.billOfMaterials.createMany({
        data: [
            { finishedProductId: products[4].id, rawMaterialId: materials[0].id, quantityRequired: 25, companyId: company.id },
            { finishedProductId: products[4].id, rawMaterialId: materials[1].id, quantityRequired: 4, companyId: company.id },
            { finishedProductId: products[4].id, rawMaterialId: materials[4].id, quantityRequired: 3, companyId: company.id },
            { finishedProductId: products[4].id, rawMaterialId: materials[2].id, quantityRequired: 1, companyId: company.id },
            { finishedProductId: products[4].id, rawMaterialId: materials[6].id, quantityRequired: 12, companyId: company.id },
            { finishedProductId: products[4].id, rawMaterialId: materials[5].id, quantityRequired: 0.5, companyId: company.id },
        ],
    });

    // 6-Seater Dining Table BOM
    await prisma.billOfMaterials.createMany({
        data: [
            { finishedProductId: products[5].id, rawMaterialId: materials[0].id, quantityRequired: 18, companyId: company.id },
            { finishedProductId: products[5].id, rawMaterialId: materials[9].id, quantityRequired: 12, companyId: company.id },
            { finishedProductId: products[5].id, rawMaterialId: materials[4].id, quantityRequired: 2, companyId: company.id },
            { finishedProductId: products[5].id, rawMaterialId: materials[2].id, quantityRequired: 0.6, companyId: company.id },
            { finishedProductId: products[5].id, rawMaterialId: materials[6].id, quantityRequired: 6, companyId: company.id },
        ],
    });

    // TV Unit BOM
    await prisma.billOfMaterials.createMany({
        data: [
            { finishedProductId: products[6].id, rawMaterialId: materials[0].id, quantityRequired: 6, companyId: company.id },
            { finishedProductId: products[6].id, rawMaterialId: materials[8].id, quantityRequired: 3, companyId: company.id },
            { finishedProductId: products[6].id, rawMaterialId: materials[1].id, quantityRequired: 2, companyId: company.id },
            { finishedProductId: products[6].id, rawMaterialId: materials[4].id, quantityRequired: 1, companyId: company.id },
            { finishedProductId: products[6].id, rawMaterialId: materials[2].id, quantityRequired: 0.3, companyId: company.id },
            { finishedProductId: products[6].id, rawMaterialId: materials[6].id, quantityRequired: 10, companyId: company.id },
        ],
    });

    // 3-Door Wardrobe BOM
    await prisma.billOfMaterials.createMany({
        data: [
            { finishedProductId: products[7].id, rawMaterialId: materials[0].id, quantityRequired: 20, companyId: company.id },
            { finishedProductId: products[7].id, rawMaterialId: materials[1].id, quantityRequired: 5, companyId: company.id },
            { finishedProductId: products[7].id, rawMaterialId: materials[8].id, quantityRequired: 2, companyId: company.id },
            { finishedProductId: products[7].id, rawMaterialId: materials[4].id, quantityRequired: 3, companyId: company.id },
            { finishedProductId: products[7].id, rawMaterialId: materials[2].id, quantityRequired: 0.8, companyId: company.id },
            { finishedProductId: products[7].id, rawMaterialId: materials[6].id, quantityRequired: 14, companyId: company.id },
            { finishedProductId: products[7].id, rawMaterialId: materials[9].id, quantityRequired: 6, companyId: company.id },
        ],
    });
    console.log("✅ Created BOMs for all 8 products");

    // ─── Generate 6 months of production data ─────────
    // Sep 2025 → Feb 2026 (realistic seasonal patterns)
    // Furniture demand peaks: Oct-Nov (Diwali), Jan-Feb (weddings)
    const productionPatterns: Record<number, number[]> = {
        // month index (8=Sep, 9=Oct, ... 1=Feb) → [min, max] units per product per batch
        8: [2, 5],   // Sep: moderate
        9: [4, 8],   // Oct: Diwali rush starts
        10: [5, 10],  // Nov: peak Diwali
        11: [3, 6],   // Dec: post-Diwali slowdown
        0: [4, 7],   // Jan: wedding season
        1: [4, 8],   // Feb: wedding season continues
    };

    let productionCount = 0;
    const productionUsers = [admin.id, auditor.id];

    for (const [monthIdx, [minQty, maxQty]] of Object.entries(productionPatterns)) {
        const month = parseInt(monthIdx);
        const year = month >= 8 ? 2025 : 2026;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 4-6 production batches per month across different products
        const batchesPerMonth = 4 + Math.floor(Math.random() * 3);
        for (let b = 0; b < batchesPerMonth; b++) {
            const day = 1 + Math.floor(Math.random() * (daysInMonth - 1));
            const productIndex = Math.floor(Math.random() * products.length);
            const qty = minQty + Math.floor(Math.random() * (maxQty - minQty + 1));
            const userId = productionUsers[Math.floor(Math.random() * productionUsers.length)];

            const notes = [
                "Regular production batch",
                "Batch for pending orders",
                "Festival season stock",
                "Custom order production",
                "Bulk order batch",
                "Showroom replenishment",
                "Export order batch",
            ][Math.floor(Math.random() * 7)];

            await prisma.productionEntry.create({
                data: {
                    finishedProductId: products[productIndex].id,
                    quantityProduced: qty,
                    productionDate: new Date(year, month, day),
                    notes,
                    companyId: company.id,
                    createdBy: userId,
                },
            });
            productionCount++;
        }
    }
    console.log(`✅ Created ${productionCount} production entries (6 months)`);

    // ─── Generate 6 months of sales data ──────────────
    const customers = [
        "Pepperfry Wholesale",
        "Urban Ladder B2B",
        "Godrej Interio Partner",
        "HomeTown Furniture",
        "Nilkamal Retail Chain",
        "WoodenStreet.com",
        "Furlenco B2B",
        "Durian Furniture",
        "Ikea India Supplier",
        "Royaloak Furniture",
        "Fab India Home",
        "Crate & Barrel India",
        "Studio Pepperfry",
        "Sleepwell Showroom",
        "Damro Furniture",
        "Zuari Furniture Mart",
        "Gautier India",
        "Stanley Lifestyle",
    ];

    const salesPatterns: Record<number, number> = {
        8: 6,   // Sep: moderate
        9: 10,  // Oct: Diwali peak
        10: 12, // Nov: Diwali peak
        11: 5,  // Dec: slowdown
        0: 8,   // Jan: weddings
        1: 9,   // Feb: weddings
    };

    let salesCount = 0;
    for (const [monthIdx, numSales] of Object.entries(salesPatterns)) {
        const month = parseInt(monthIdx);
        const year = month >= 8 ? 2025 : 2026;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let s = 0; s < numSales; s++) {
            const day = 1 + Math.floor(Math.random() * (daysInMonth - 1));
            const productIndex = Math.floor(Math.random() * products.length);
            const product = products[productIndex];
            const qty = 1 + Math.floor(Math.random() * 4);
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const revenue = qty * Number(product.sellingPrice);
            const userId = productionUsers[Math.floor(Math.random() * productionUsers.length)];

            await prisma.salesEntry.create({
                data: {
                    finishedProductId: product.id,
                    quantitySold: qty,
                    saleDate: new Date(year, month, day),
                    customerName: customer,
                    revenueAmount: revenue,
                    companyId: company.id,
                    createdBy: userId,
                },
            });
            salesCount++;
        }
    }
    console.log(`✅ Created ${salesCount} sales entries (6 months)`);

    // ─── Generate purchase history ────────────────────
    const purchaseSchedule = [
        { month: 8, year: 2025 }, // Sep
        { month: 9, year: 2025 }, // Oct (big restocking)
        { month: 10, year: 2025 }, // Nov
        { month: 0, year: 2026 }, // Jan
        { month: 1, year: 2026 }, // Feb
    ];

    let purchaseCount = 0;
    for (const { month, year } of purchaseSchedule) {
        // Purchase 3-5 different materials each month
        const numPurchases = 3 + Math.floor(Math.random() * 3);
        const shuffledMaterials = [...materials].sort(() => Math.random() - 0.5);

        for (let p = 0; p < numPurchases; p++) {
            const material = shuffledMaterials[p % materials.length];
            const day = 1 + Math.floor(Math.random() * 15); // usually purchased early in month
            const qty = 20 + Math.floor(Math.random() * 80);
            const cost = Number(material.costPerUnit) * (0.95 + Math.random() * 0.1); // ±5% price variation
            const supplier = material.supplierName || "General Supplier";

            await prisma.rawMaterialPurchase.create({
                data: {
                    rawMaterialId: material.id,
                    quantityPurchased: qty,
                    costPerUnit: Math.round(cost * 100) / 100,
                    totalCost: Math.round(qty * cost * 100) / 100,
                    purchaseDate: new Date(year, month, day),
                    supplierName: supplier,
                    notes: month === 9 ? "Diwali season bulk order" : "Regular monthly restocking",
                    companyId: company.id,
                    createdBy: admin.id,
                },
            });
            purchaseCount++;
        }
    }
    console.log(`✅ Created ${purchaseCount} purchase entries`);

    // ─── Stock movements (opening stock for all) ──────
    for (const material of materials) {
        await prisma.stockMovement.create({
            data: {
                type: "OPENING_STOCK",
                itemType: "RAW_MATERIAL",
                itemId: material.id,
                quantityChange: Number(material.quantityInStock),
                balanceAfter: Number(material.quantityInStock),
                notes: "Opening stock — Sep 2025",
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
                notes: "Opening stock — Sep 2025",
                companyId: company.id,
            },
        });
    }
    console.log("✅ Created stock movements");

    // ─── Daily Snapshots for chart data (last 60 days) ──────
    const today = new Date();
    for (let d = 60; d >= 0; d--) {
        const snapshotDate = new Date(today);
        snapshotDate.setDate(today.getDate() - d);
        snapshotDate.setHours(0, 0, 0, 0);

        // Simulate realistic trends
        const baseInventoryValue = 450000 + Math.sin(d / 10) * 30000 + (60 - d) * 800;
        const baseRevenue = 15000 + Math.random() * 45000 + (d < 30 ? 10000 : 0);
        const baseProduction = 3 + Math.floor(Math.random() * 8);

        // Weekend dip (less production on weekends)
        const dayOfWeek = snapshotDate.getDay();
        const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.3 : 1;

        await prisma.dailySnapshot.create({
            data: {
                snapshotDate,
                totalInventoryValue: Math.round(baseInventoryValue),
                totalRawMaterialCount: materials.length,
                totalProductCount: products.length,
                dailyRevenue: Math.round(baseRevenue * weekendMultiplier),
                dailyProductionUnits: Math.round(baseProduction * weekendMultiplier),
                companyId: company.id,
            },
        });
    }
    console.log("✅ Created 60 days of daily snapshots (for charts)");

    // ─── Material consumption logs (for heatmap) ──────
    for (let d = 30; d >= 0; d--) {
        const consumptionDate = new Date(today);
        consumptionDate.setDate(today.getDate() - d);
        consumptionDate.setHours(0, 0, 0, 0);

        const dayOfWeek = consumptionDate.getDay();
        if (dayOfWeek === 0) continue; // No consumption on Sundays

        // Log consumption for 3-5 random materials per day
        const numMaterials = 3 + Math.floor(Math.random() * 3);
        const shuffledMats = [...materials].sort(() => Math.random() - 0.5);

        for (let m = 0; m < numMaterials; m++) {
            const material = shuffledMats[m];
            const baseConsumption = Number(material.costPerUnit) > 500 ? 2 + Math.random() * 5 : 5 + Math.random() * 15;
            const weekdayMultiplier = dayOfWeek === 6 ? 0.5 : 1;

            try {
                await prisma.materialConsumptionLog.create({
                    data: {
                        rawMaterialId: material.id,
                        consumptionDate,
                        quantityConsumed: Math.round(baseConsumption * weekdayMultiplier * 100) / 100,
                        companyId: company.id,
                    },
                });
            } catch {
                // Skip if unique constraint conflict (same material+date)
            }
        }
    }
    console.log("✅ Created material consumption logs (for heatmap)");

    // ─── Low stock alerts ─────────────────────────────
    // Wood Glue is below minimum (12 < 15)
    await prisma.lowStockAlert.create({
        data: {
            rawMaterialId: materials[5].id, // Fevicol Marine Glue
            companyId: company.id,
            isRead: false,
        },
    });
    console.log("✅ Created low stock alert for Fevicol Marine Glue");

    // ─── Done! ────────────────────────────────────────
    console.log("\n🎉 Seeding complete with realistic Indian furniture industry data!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  📊 Data Summary:");
    console.log(`     • ${materials.length} raw materials (with real Indian supplier prices)`);
    console.log(`     • ${products.length} finished products (with market-rate MRP)`);
    console.log(`     • ${productionCount} production entries (6 months)`);
    console.log(`     • ${salesCount} sales entries (6 months)`);
    console.log(`     • ${purchaseCount} purchase orders`);
    console.log("     • 60 daily snapshots (for charts)");
    console.log("     • 30 days of consumption data (for heatmap)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Login Credentials:");
    console.log("  ┌──────────┬──────────┬──────────┐");
    console.log("  │ Role     │ Username │ Password │");
    console.log("  ├──────────┼──────────┼──────────┤");
    console.log("  │ Admin    │ admin    │ admin123 │");
    console.log("  │ Auditor  │ auditor  │ audit123 │");
    console.log("  │ Viewer   │ viewer   │ view123  │");
    console.log("  └──────────┴──────────┴──────────┘");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
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
