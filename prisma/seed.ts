import { PrismaClient, ClientStatus, InvoiceStatus, InvoiceType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const firm = await prisma.firm.upsert({
    where: { email: "admin@talosledger.demo" },
    update: {
      name: "Talos Ledger Demo CA",
      ownerName: "Aarav Sharma",
      phone: "+919876543210",
      address: "Bandra Kurla Complex, Mumbai",
      gstNumber: "27AAAAA0000A1Z5",
      panNumber: "AAAAA0000A",
      lowConfidenceThreshold: 0.5
    },
    create: {
      name: "Talos Ledger Demo CA",
      ownerName: "Aarav Sharma",
      email: "admin@talosledger.demo",
      phone: "+919876543210",
      address: "Bandra Kurla Complex, Mumbai",
      gstNumber: "27AAAAA0000A1Z5",
      panNumber: "AAAAA0000A",
      lowConfidenceThreshold: 0.5
    }
  });

  await prisma.firmUser.upsert({
    where: {
      firmId_email: {
        firmId: firm.id,
        email: "admin@talosledger.demo"
      }
    },
    update: {
      fullName: "Aarav Sharma",
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true
    },
    create: {
      firmId: firm.id,
      fullName: "Aarav Sharma",
      email: "admin@talosledger.demo",
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  await prisma.firmUser.upsert({
    where: {
      firmId_email: {
        firmId: firm.id,
        email: "staff@talosledger.demo"
      }
    },
    update: {
      fullName: "Neha Jain",
      passwordHash,
      role: UserRole.STAFF,
      isActive: true
    },
    create: {
      firmId: firm.id,
      fullName: "Neha Jain",
      email: "staff@talosledger.demo",
      passwordHash,
      role: UserRole.STAFF
    }
  });

  const clientA = await prisma.client.upsert({
    where: { id: "client-demo-a" },
    update: {
      firmId: firm.id,
      businessName: "ABC Traders Pvt Ltd",
      contactPersonName: "Rohan Mehta",
      email: "accounts@abctraders.in",
      phone: "+919900001111",
      gstNumber: "27AABCT1234A1ZV",
      panNumber: "AABCT1234A",
      city: "Mumbai",
      state: "Maharashtra",
      status: ClientStatus.ACTIVE
    },
    create: {
      id: "client-demo-a",
      firmId: firm.id,
      businessName: "ABC Traders Pvt Ltd",
      contactPersonName: "Rohan Mehta",
      email: "accounts@abctraders.in",
      phone: "+919900001111",
      gstNumber: "27AABCT1234A1ZV",
      panNumber: "AABCT1234A",
      city: "Mumbai",
      state: "Maharashtra",
      status: ClientStatus.ACTIVE
    }
  });

  await prisma.invoice.deleteMany({
    where: {
      firmId: firm.id,
      fileName: {
        in: ["invoice_sample_001.pdf", "logistics_bill_feb.pdf", "office_supplies_march.pdf"]
      }
    }
  });

  await prisma.invoice.createMany({
    data: [
      {
        firmId: firm.id,
        clientId: clientA.id,
        fileName: "invoice_sample_001.pdf",
        fileUrl: "/uploads/demo/invoice_sample_001.pdf",
        invoiceType: InvoiceType.PURCHASE,
        status: InvoiceStatus.COMPLETED,
        vendorName: "Tech Solutions India",
        buyerName: "ABC Traders Pvt Ltd",
        supplierGstNumber: "27AABCT1234A1ZV",
        invoiceNumber: "INV-2024-0451",
        invoiceDate: new Date("2024-03-15"),
        taxableAmount: 250000,
        cgst: 22500,
        sgst: 22500,
        totalGst: 45000,
        grandTotal: 295000,
        confidenceJson: {
          vendor_name: 0.96,
          invoice_number: 0.93,
          taxable_amount: 0.98
        }
      },
      {
        firmId: firm.id,
        clientId: clientA.id,
        fileName: "logistics_bill_feb.pdf",
        fileUrl: "/uploads/demo/logistics_bill_feb.pdf",
        invoiceType: InvoiceType.EXPENSE,
        status: InvoiceStatus.PENDING_REVIEW,
        vendorName: "Speedway Logistics",
        buyerName: "ABC Traders Pvt Ltd",
        supplierGstNumber: "07AADCB2345F1Z2",
        invoiceNumber: "SL-2024-789",
        invoiceDate: new Date("2024-02-28"),
        taxableAmount: 45000,
        cgst: 4050,
        sgst: 4050,
        totalGst: 8100,
        grandTotal: 53100,
        confidenceJson: {
          vendor_name: 0.89,
          invoice_number: 0.79,
          supplier_gst_number: 0.66
        }
      },
      {
        firmId: firm.id,
        clientId: clientA.id,
        fileName: "office_supplies_march.pdf",
        fileUrl: "/uploads/demo/office_supplies_march.pdf",
        invoiceType: InvoiceType.OTHER,
        status: InvoiceStatus.FAILED,
        extractionError: "Low quality scan. Retry with OCR fallback."
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
