/**
 * scripts/seed-payroll-catalogs.js
 *
 * Idempotent Enterprise Payroll Catalog Seeding & Migration Script (Phase 2b):
 * 1. Legal Entity ("NexaHR Pakistan (Pvt) Ltd", PK, PKR, Asia/Karachi)
 * 2. Pay Group ("Pakistan Standard Monthly Staff", PG-PK-MTH, FIXED_30)
 * 3. Standard Pay Components (BASIC, HOUSING, TRANSPORT, UTILITIES, MEDICAL, BONUS, TAX_PAYE, UNPAID_LEAVE, EOBI, PESSI, REIMBURSEMENT)
 * 4. Enterprise Chart of Accounts / Ledger Accounts (Asset, Liability, Expense)
 * 5. Pakistan FBR Tax Rule Set & Progressive Slabs (FY 2026-2027)
 * 6. Statutory Contribution Rules (EOBI Employee & Employer rules)
 * 7. Migration of existing SalaryStructure records into versioned EmployeeCompensation with child components.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPayrollCatalogs() {
  console.log('='.repeat(75));
  console.log('  NEXAHR - ENTERPRISE PAYROLL CATALOG SEED & MIGRATION (PHASE 2B)');
  console.log('='.repeat(75));

  try {
    // -------------------------------------------------------------
    // 1. LEGAL ENTITY
    // -------------------------------------------------------------
    console.log('\n[1/7] Seeding Legal Entity...');
    const legalEntity = await prisma.legalEntity.upsert({
      where: { code: 'LE-PK-001' },
      update: {
        name: 'NexaHR Pakistan (Pvt) Ltd',
        country: 'PK',
        defaultCurrency: 'PKR',
        timezone: 'Asia/Karachi',
      },
      create: {
        code: 'LE-PK-001',
        name: 'NexaHR Pakistan (Pvt) Ltd',
        country: 'PK',
        defaultCurrency: 'PKR',
        timezone: 'Asia/Karachi',
      },
    });
    console.log(`  ✓ Legal Entity: ${legalEntity.name} (${legalEntity.code}) [ID: ${legalEntity.id}]`);

    // -------------------------------------------------------------
    // 2. PAY GROUP
    // -------------------------------------------------------------
    console.log('\n[2/7] Seeding Pay Group...');
    const payGroup = await prisma.payGroup.upsert({
      where: { code: 'PG-PK-MTH' },
      update: {
        name: 'Pakistan Standard Monthly Staff',
        currency: 'PKR',
        prorationBasis: 'FIXED_30',
        legalEntityId: legalEntity.id,
      },
      create: {
        code: 'PG-PK-MTH',
        name: 'Pakistan Standard Monthly Staff',
        currency: 'PKR',
        prorationBasis: 'FIXED_30',
        legalEntityId: legalEntity.id,
      },
    });
    console.log(`  ✓ Pay Group: ${payGroup.name} (${payGroup.code}) [Proration: ${payGroup.prorationBasis}]`);

    // -------------------------------------------------------------
    // 3. STANDARD PAY COMPONENTS
    // -------------------------------------------------------------
    console.log('\n[3/7] Seeding Standard Pay Components...');
    const componentsConfig = [
      {
        code: 'BASIC',
        name: 'Basic Salary',
        type: 'EARNING',
        isTaxable: true,
        isStatutory: true,
      },
      {
        code: 'HOUSING',
        name: 'Housing Allowance',
        type: 'EARNING',
        isTaxable: true,
        isStatutory: false,
      },
      {
        code: 'TRANSPORT',
        name: 'Transport Allowance',
        type: 'EARNING',
        isTaxable: true,
        isStatutory: false,
      },
      {
        code: 'UTILITIES',
        name: 'Utilities & General Allowance',
        type: 'EARNING',
        isTaxable: true,
        isStatutory: false,
      },
      {
        code: 'MEDICAL',
        name: 'Medical Allowance (10% Basic Exempt)',
        type: 'EARNING',
        isTaxable: false,
        isStatutory: false,
      },
      {
        code: 'BONUS',
        name: 'Discretionary / Performance Bonus',
        type: 'EARNING',
        isTaxable: true,
        isStatutory: false,
      },
      {
        code: 'TAX_PAYE',
        name: 'Income Tax (Withholding PAYE)',
        type: 'DEDUCTION',
        isTaxable: false,
        isStatutory: true,
      },
      {
        code: 'UNPAID_LEAVE',
        name: 'Unpaid Leave (LWP) Deduction',
        type: 'DEDUCTION',
        isTaxable: false,
        isStatutory: false,
      },
      {
        code: 'OTHER_DEDUCTIONS',
        name: 'Other Voluntary / Discretionary Deductions',
        type: 'DEDUCTION',
        isTaxable: false,
        isStatutory: false,
      },
      {
        code: 'EOBI_EMPLOYEE',
        name: 'EOBI Employee Pension Contribution',
        type: 'DEDUCTION',
        isTaxable: false,
        isStatutory: true,
      },
      {
        code: 'EOBI_EMPLOYER',
        name: 'EOBI Employer Statutory Pension Contribution',
        type: 'EMPLOYER_CONTRIBUTION',
        isTaxable: false,
        isStatutory: true,
      },
      {
        code: 'PESSI_EMPLOYER',
        name: 'PESSI Social Security Employer Contribution',
        type: 'EMPLOYER_CONTRIBUTION',
        isTaxable: false,
        isStatutory: true,
      },
      {
        code: 'REIMBURSEMENT',
        name: 'Business Expense Reimbursement',
        type: 'REIMBURSEMENT',
        isTaxable: false,
        isStatutory: false,
      },
    ];

    const seededComponents = {};
    for (const c of componentsConfig) {
      const comp = await prisma.payComponent.upsert({
        where: { code: c.code },
        update: {
          name: c.name,
          type: c.type,
          isTaxable: c.isTaxable,
          isStatutory: c.isStatutory,
          isActive: true,
        },
        create: {
          code: c.code,
          name: c.name,
          type: c.type,
          isTaxable: c.isTaxable,
          isStatutory: c.isStatutory,
          isActive: true,
        },
      });
      seededComponents[c.code] = comp;
      console.log(`  ✓ Pay Component: [${comp.type.padEnd(21)}] ${comp.code.padEnd(16)} -> ${comp.name}`);
    }

    // -------------------------------------------------------------
    // 4. CHART OF ACCOUNTS (LEDGER ACCOUNTS)
    // -------------------------------------------------------------
    console.log('\n[4/7] Seeding Double-Entry General Ledger Accounts...');
    const ledgerConfig = [
      {
        code: '1010-CASH-BANK',
        name: 'Cash at Bank - Corporate Payroll Clearing Account',
        type: 'ASSET',
        currency: 'PKR',
      },
      {
        code: '2010-SALARY-PAYABLE',
        name: 'Salaries & Wages Net Payout Payable',
        type: 'LIABILITY',
        currency: 'PKR',
      },
      {
        code: '2020-TAX-PAYABLE',
        name: 'Income Tax (FBR PAYE) Withheld Payable',
        type: 'LIABILITY',
        currency: 'PKR',
      },
      {
        code: '2030-EOBI-PAYABLE',
        name: 'EOBI Pension Contributions Payable (Employee & Employer)',
        type: 'LIABILITY',
        currency: 'PKR',
      },
      {
        code: '2040-PESSI-PAYABLE',
        name: 'PESSI Social Security Statutory Contribution Payable',
        type: 'LIABILITY',
        currency: 'PKR',
      },
      {
        code: '5010-SALARY-EXPENSE',
        name: 'Gross Salaries, Wages & Allowances Expense',
        type: 'EXPENSE',
        currency: 'PKR',
      },
      {
        code: '5020-EMPLOYER-PENSION-EXPENSE',
        name: 'Employer Statutory Pension & Social Security Expense',
        type: 'EXPENSE',
        currency: 'PKR',
      },
      {
        code: '5030-REIMBURSEMENT-EXPENSE',
        name: 'Corporate Employee Expense Reimbursements',
        type: 'EXPENSE',
        currency: 'PKR',
      },
    ];

    for (const la of ledgerConfig) {
      const acct = await prisma.ledgerAccount.upsert({
        where: { code: la.code },
        update: {
          name: la.name,
          type: la.type,
          currency: la.currency,
          legalEntityId: legalEntity.id,
          isActive: true,
        },
        create: {
          code: la.code,
          name: la.name,
          type: la.type,
          currency: la.currency,
          legalEntityId: legalEntity.id,
          isActive: true,
        },
      });
      console.log(`  ✓ Ledger Account: [${acct.type.padEnd(9)}] ${acct.code.padEnd(28)} -> ${acct.name}`);
    }

    // -------------------------------------------------------------
    // 5. TAX RULE SET & PROGRESSIVE TAX SLABS (PAKISTAN FBR 2026-2027)
    // -------------------------------------------------------------
    console.log('\n[5/7] Seeding Pakistan FBR Income Tax Rule Set & Slabs (FY 2026-2027)...');
    let taxRuleSet = await prisma.taxRuleSet.findFirst({
      where: {
        legalEntityId: legalEntity.id,
        country: 'PK',
        name: 'Pakistan FBR Salaried Individuals Income Tax FY2026-27',
      },
    });

    if (!taxRuleSet) {
      taxRuleSet = await prisma.taxRuleSet.create({
        data: {
          legalEntityId: legalEntity.id,
          country: 'PK',
          name: 'Pakistan FBR Salaried Individuals Income Tax FY2026-27',
          effectiveFrom: new Date('2026-07-01T00:00:00Z'),
          effectiveTo: new Date('2027-06-30T23:59:59Z'),
          version: 1,
          isDefault: true,
        },
      });
    }

    // Slabs per Pakistan Finance Act for Salaried Individuals
    const fbrSlabs = [
      { slabOrder: 1, minAmount: 0, maxAmount: 600000, baseTax: 0, ratePercentage: 0.0000 },
      { slabOrder: 2, minAmount: 600000, maxAmount: 1200000, baseTax: 0, ratePercentage: 0.0250 },
      { slabOrder: 3, minAmount: 1200000, maxAmount: 2200000, baseTax: 15000, ratePercentage: 0.1250 },
      { slabOrder: 4, minAmount: 2200000, maxAmount: 3200000, baseTax: 140000, ratePercentage: 0.2250 },
      { slabOrder: 5, minAmount: 3200000, maxAmount: 4100000, baseTax: 365000, ratePercentage: 0.2750 },
      { slabOrder: 6, minAmount: 4100000, maxAmount: null, baseTax: 612500, ratePercentage: 0.3500 },
    ];

    for (const slab of fbrSlabs) {
      const existingSlab = await prisma.taxSlab.findFirst({
        where: { taxRuleSetId: taxRuleSet.id, slabOrder: slab.slabOrder },
      });

      if (!existingSlab) {
        await prisma.taxSlab.create({
          data: {
            taxRuleSetId: taxRuleSet.id,
            slabOrder: slab.slabOrder,
            minAmount: slab.minAmount,
            maxAmount: slab.maxAmount,
            baseTax: slab.baseTax,
            ratePercentage: slab.ratePercentage,
          },
        });
      }
    }
    console.log(`  ✓ Tax Rule Set: ${taxRuleSet.name} with ${fbrSlabs.length} progressive tax brackets configured.`);

    // -------------------------------------------------------------
    // 6. STATUTORY CONTRIBUTION RULES (EOBI)
    // -------------------------------------------------------------
    console.log('\n[6/7] Seeding Statutory Contribution Rules...');
    const eobiRules = [
      {
        code: 'PK_EOBI_EMPLOYEE',
        name: 'EOBI Employee Pension Contribution (1% of Minimum Wage)',
        componentCode: 'EOBI_EMPLOYEE',
        calculationBasis: 'PERCENTAGE_OF_BASIC',
        employeeRate: 0.0100, // 1%
        employerRate: 0.0000,
        maxCap: 320.00,
      },
      {
        code: 'PK_EOBI_EMPLOYER',
        name: 'EOBI Employer Pension Contribution (5% of Minimum Wage)',
        componentCode: 'EOBI_EMPLOYER',
        calculationBasis: 'PERCENTAGE_OF_BASIC',
        employeeRate: 0.0000,
        employerRate: 0.0500, // 5%
        maxCap: 1600.00,
      },
    ];

    for (const r of eobiRules) {
      const comp = seededComponents[r.componentCode];
      if (comp) {
        await prisma.contributionRule.upsert({
          where: { code: r.code },
          update: {
            legalEntityId: legalEntity.id,
            componentId: comp.id,
            country: 'PK',
            name: r.name,
            calculationBasis: r.calculationBasis,
            employeeRate: r.employeeRate,
            employerRate: r.employerRate,
            maxCap: r.maxCap,
            effectiveFrom: new Date('2026-01-01T00:00:00Z'),
            isActive: true,
          },
          create: {
            legalEntityId: legalEntity.id,
            componentId: comp.id,
            country: 'PK',
            code: r.code,
            name: r.name,
            calculationBasis: r.calculationBasis,
            employeeRate: r.employeeRate,
            employerRate: r.employerRate,
            maxCap: r.maxCap,
            effectiveFrom: new Date('2026-01-01T00:00:00Z'),
            isActive: true,
          },
        });
        console.log(`  ✓ Contribution Rule: ${r.code} -> ${r.name}`);
      }
    }

    // -------------------------------------------------------------
    // 7. MIGRATE EXISTING SALARY STRUCTURES INTO EMPLOYEE COMPENSATION
    // -------------------------------------------------------------
    console.log('\n[7/7] Migrating Existing SalaryStructure Records into EmployeeCompensation...');

    // Find any existing active admin for createdById attribution
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN', isActive: true },
    });
    const fallbackCreatorId = adminUser?.id || (await prisma.user.findFirst({ select: { id: true } }))?.id;

    if (!fallbackCreatorId) {
      console.log('  Notice: No user accounts found in database. Skipping compensation backfill.');
    } else {
      const salaryStructures = await prisma.salaryStructure.findMany({
        include: { user: true },
      });

      console.log(`  Found ${salaryStructures.length} SalaryStructure record(s) to evaluate.`);

      let migratedCount = 0;
      let skippedCount = 0;

      for (const struct of salaryStructures) {
        // Check if an active EmployeeCompensation already exists for this user
        const existingComp = await prisma.employeeCompensation.findFirst({
          where: { userId: struct.userId, isActive: true },
        });

        if (existingComp) {
          skippedCount++;
          continue;
        }

        const effectiveFrom = struct.effectiveDate ? new Date(struct.effectiveDate) : new Date();

        await prisma.$transaction(async (tx) => {
          // 1. Create Parent EmployeeCompensation (baseSalary is Single Source of Truth for base pay)
          const newComp = await tx.employeeCompensation.create({
            data: {
              userId: struct.userId,
              payGroupId: payGroup.id,
              currency: 'PKR',
              baseSalary: struct.basicSalary,
              effectiveFrom,
              effectiveTo: null, // Open-ended interval [effectiveFrom, infinity)
              version: 1,
              isActive: true,
              createdById: fallbackCreatorId,
            },
          });

          // 2. Insert Child Components
          const childComponents = [];

          // Basic
          if (seededComponents['BASIC']) {
            childComponents.push({
              employeeCompensationId: newComp.id,
              componentId: seededComponents['BASIC'].id,
              amount: struct.basicSalary,
              isDeduction: false,
            });
          }

          // Housing Allowance
          if (struct.housingAllowance > 0 && seededComponents['HOUSING']) {
            childComponents.push({
              employeeCompensationId: newComp.id,
              componentId: seededComponents['HOUSING'].id,
              amount: struct.housingAllowance,
              isDeduction: false,
            });
          }

          // Transport Allowance
          if (struct.transportAllowance > 0 && seededComponents['TRANSPORT']) {
            childComponents.push({
              employeeCompensationId: newComp.id,
              componentId: seededComponents['TRANSPORT'].id,
              amount: struct.transportAllowance,
              isDeduction: false,
            });
          }

          // Other Allowances
          if (struct.otherAllowances > 0 && seededComponents['UTILITIES']) {
            childComponents.push({
              employeeCompensationId: newComp.id,
              componentId: seededComponents['UTILITIES'].id,
              amount: struct.otherAllowances,
              isDeduction: false,
            });
          }

          // Tax Deductions
          if (struct.taxDeductions > 0 && seededComponents['TAX_PAYE']) {
            childComponents.push({
              employeeCompensationId: newComp.id,
              componentId: seededComponents['TAX_PAYE'].id,
              amount: struct.taxDeductions,
              isDeduction: true,
            });
          }

          // Other Deductions
          if (struct.otherDeductions > 0 && seededComponents['OTHER_DEDUCTIONS']) {
            childComponents.push({
              employeeCompensationId: newComp.id,
              componentId: seededComponents['OTHER_DEDUCTIONS'].id,
              amount: struct.otherDeductions,
              isDeduction: true,
            });
          }

          if (childComponents.length > 0) {
            await tx.employeeCompensationComponent.createMany({
              data: childComponents,
            });
          }
        });

        migratedCount++;
        console.log(`  ✓ Migrated SalaryStructure for user ${struct.userId} (Base: PKR ${struct.basicSalary})`);
      }

      console.log(`  Summary: ${migratedCount} migrated, ${skippedCount} already had active compensations.`);
    }

    console.log('\n' + '='.repeat(75));
    console.log('  PAYROLL CATALOG SEED & MIGRATION COMPLETE (100% IDEMPOTENT)');
    console.log('='.repeat(75));
  } catch (error) {
    console.error('\n[FATAL ERROR IN SEED CATALOGS]:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedPayrollCatalogs();
