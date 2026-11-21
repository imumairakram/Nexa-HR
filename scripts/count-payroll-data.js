/**
 * scripts/count-payroll-data.js
 *
 * Read-only telemetry script to report row counts and financial totals:
 * 1. Legacy Payslips: row count, SUM(gross), SUM(net), SUM(tax) per month.
 * 2. Salary Structures: active records, SUM(basicSalary), SUM(allowances), SUM(taxDeductions).
 * 3. Account Transactions: total records, SUM(amount), breakdown by type (EXPENSE/INCOME) and source.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countPayrollData() {
  try {
    console.log('='.repeat(75));
    console.log('  NEXAHR - COMPREHENSIVE PAYROLL & FINANCIAL DATA TELEMETRY (READ-ONLY)');
    console.log('='.repeat(75));

    // =================================================================
    // 1. LEGACY PAYSLIPS
    // =================================================================
    console.log('\n--- [1] LEGACY PAYSLIPS ("payslips" table) ---');
    const totalCountRaw = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int as count FROM "payslips";`
    );
    const totalPayslips = totalCountRaw[0]?.count || 0;
    console.log(`Total Legacy Payslip Records: ${totalPayslips}`);

    if (totalPayslips > 0) {
      const monthlyAggregates = await prisma.$queryRawUnsafe(`
        SELECT
          "year",
          "month",
          COUNT(*)::int as record_count,
          COALESCE(SUM("basicSalary"), 0)::numeric(14,2) as sum_basic,
          COALESCE(SUM("totalAllowances"), 0)::numeric(14,2) as sum_allowances,
          COALESCE(SUM("taxDeductions"), 0)::numeric(14,2) as sum_tax,
          COALESCE(SUM("grossSalary"), 0)::numeric(14,2) as sum_gross,
          COALESCE(SUM("netSalary"), 0)::numeric(14,2) as sum_net,
          COUNT(CASE WHEN "status"::text = 'PAID' THEN 1 END)::int as paid_count,
          COUNT(CASE WHEN "status"::text = 'GENERATED' THEN 1 END)::int as generated_count,
          COUNT(CASE WHEN "status"::text = 'DRAFT' THEN 1 END)::int as draft_count
        FROM "payslips"
        GROUP BY "year", "month"
        ORDER BY "year" ASC, "month" ASC;
      `);

      console.log('-'.repeat(75));
      console.log('Period'.padEnd(10) + 'Count'.padEnd(8) + 'SUM(Gross)'.padEnd(16) + 'SUM(Tax)'.padEnd(14) + 'SUM(Net)'.padEnd(16) + 'Status (P/G/D)');
      console.log('-'.repeat(75));

      let grandGross = 0, grandTax = 0, grandNet = 0;
      for (const row of monthlyAggregates) {
        const periodLabel = `${row.year}-${String(row.month).padStart(2, '0')}`;
        const grossNum = Number(row.sum_gross);
        const taxNum = Number(row.sum_tax);
        const netNum = Number(row.sum_net);
        grandGross += grossNum; grandTax += taxNum; grandNet += netNum;

        console.log(
          periodLabel.padEnd(10) +
          String(row.record_count).padEnd(8) +
          grossNum.toFixed(2).padEnd(16) +
          taxNum.toFixed(2).padEnd(14) +
          netNum.toFixed(2).padEnd(16) +
          `${row.paid_count}/${row.generated_count}/${row.draft_count}`
        );
      }
      console.log('-'.repeat(75));
      console.log('TOTAL'.padEnd(10) + String(totalPayslips).padEnd(8) + grandGross.toFixed(2).padEnd(16) + grandTax.toFixed(2).padEnd(14) + grandNet.toFixed(2).padEnd(16));
    } else {
      console.log('  No legacy payslip records found in database (count: 0).');
    }

    // =================================================================
    // 2. SALARY STRUCTURES
    // =================================================================
    console.log('\n--- [2] SALARY STRUCTURES ("salary_structures" table) ---');
    const salaryStatsRaw = await prisma.$queryRawUnsafe(`
      SELECT
        COUNT(*)::int as count,
        COALESCE(SUM("basicSalary"), 0)::numeric(14,2) as sum_basic,
        COALESCE(SUM("housingAllowance"), 0)::numeric(14,2) as sum_housing,
        COALESCE(SUM("transportAllowance"), 0)::numeric(14,2) as sum_transport,
        COALESCE(SUM("otherAllowances"), 0)::numeric(14,2) as sum_other_allowances,
        COALESCE(SUM("taxDeductions"), 0)::numeric(14,2) as sum_tax,
        COALESCE(SUM("otherDeductions"), 0)::numeric(14,2) as sum_other_deductions
      FROM "salary_structures";
    `);

    const salStats = salaryStatsRaw[0] || {};
    const salCount = salStats.count || 0;
    console.log(`Total Salary Structure Records: ${salCount}`);

    if (salCount > 0) {
      const basicNum = Number(salStats.sum_basic);
      const allowNum = Number(salStats.sum_housing) + Number(salStats.sum_transport) + Number(salStats.sum_other_allowances);
      const taxNum = Number(salStats.sum_tax);
      const dedNum = Number(salStats.sum_other_deductions);
      const estGross = basicNum + allowNum;
      const estNet = estGross - taxNum - dedNum;

      console.log(`  SUM(Basic Salary):       ${basicNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      console.log(`  SUM(Total Allowances):   ${allowNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      console.log(`  SUM(Tax Deductions):     ${taxNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      console.log(`  SUM(Other Deductions):   ${dedNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      console.log(`  ESTIMATED GROSS/MONTH:   ${estGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      console.log(`  ESTIMATED NET/MONTH:     ${estNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    } else {
      console.log('  No salary structures currently configured in database.');
    }

    // =================================================================
    // 3. ACCOUNT TRANSACTIONS
    // =================================================================
    console.log('\n--- [3] ACCOUNT TRANSACTIONS ("account_transactions" table) ---');
    const txnStatsRaw = await prisma.$queryRawUnsafe(`
      SELECT
        COUNT(*)::int as count,
        COALESCE(SUM("amount"), 0)::numeric(14,2) as sum_total,
        COALESCE(SUM(CASE WHEN "type" = 'EXPENSE' THEN "amount" ELSE 0 END), 0)::numeric(14,2) as sum_expense,
        COALESCE(SUM(CASE WHEN "type" = 'INCOME' THEN "amount" ELSE 0 END), 0)::numeric(14,2) as sum_income,
        COUNT(CASE WHEN "source" = 'PAYROLL' THEN 1 END)::int as count_payroll_source,
        COUNT(CASE WHEN "source" = 'MANUAL' THEN 1 END)::int as count_manual_source
      FROM "account_transactions";
    `);

    const txnStats = txnStatsRaw[0] || {};
    const txnCount = txnStats.count || 0;
    console.log(`Total Account Transactions: ${txnCount}`);

    if (txnCount > 0) {
      console.log(`  SUM(Total Volume):       ${Number(txnStats.sum_total).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      console.log(`  SUM(Expenses):           ${Number(txnStats.sum_expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      console.log(`  SUM(Income):             ${Number(txnStats.sum_income).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      console.log(`  Source Breakdown:        PAYROLL: ${txnStats.count_payroll_source} | MANUAL: ${txnStats.count_manual_source}`);
    } else {
      console.log('  No account transactions currently in database.');
    }

    console.log('\n' + '='.repeat(75));
    console.log('  TELEMETRY AUDIT COMPLETE');
    console.log('='.repeat(75));
  } catch (error) {
    console.error('Error executing count-payroll-data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

countPayrollData();
