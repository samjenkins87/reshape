# FCB NZ Media Agency Transformation Analysis
## FINAL VERSION v2: With Full Financial Assumptions

**Date:** January 2026
**Updated:** 13 January 2026

---

## ⚠️ ASSUMPTIONS NOTICE

This model includes estimated cost loadings. **These assumptions should be validated against actual FCB financial data.**

---

## Part 1: Financial Model Assumptions

### ASSUMPTION SET 1: Staff Cost Loading (21%)

On top of base salaries, we apply a 21% loading for employment-related costs:

| Component | Rate | Rationale |
|-----------|------|-----------|
| ACC Levy (NZ) | 1.5% | NZ workplace accident insurance - statutory |
| KiwiSaver (Employer) | 3.0% | Minimum employer contribution - statutory |
| **Bonuses / Incentives** | **10.0%** | Industry avg for media agencies (can range 5-15%) |
| Leave Loading | 2.0% | Annual leave, sick leave accruals |
| Recruitment / Turnover | 2.0% | Amortized recruitment costs (~15% turnover) |
| Training & Development | 1.5% | L&D investment per employee |
| Other Staff Benefits | 1.0% | Health, wellbeing, minor perks |
| **TOTAL STAFF LOADING** | **21.0%** | Applied to base salary cost |

**Formula:** `Total Staff Cost = Base Salaries × 1.21`

### ASSUMPTION SET 2: Business Overhead (13% of Revenue)

Operational costs as a percentage of revenue:

| Component | Rate | Rationale |
|-----------|------|-----------|
| Rent & Facilities | 4.0% | Auckland CBD office space, utilities, maintenance |
| Technology & Software | 3.0% | Media platforms, licenses, IT infrastructure |
| Professional Services | 1.0% | Legal, accounting, consulting fees |
| Insurance | 0.5% | PI insurance, business insurance |
| Travel & Entertainment | 1.5% | Client entertainment, domestic travel |
| Marketing & Biz Dev | 1.0% | Pitch costs, agency marketing |
| Depreciation & Amort | 1.0% | Equipment, fit-out amortization |
| Other Operating | 1.0% | Miscellaneous operating costs |
| **TOTAL BUSINESS OVERHEAD** | **13.0%** | Applied to revenue |

**Formula:** `Business Overhead = Revenue × 0.13`

---

## Part 2: Key Formulas

```
STAFF COST FORMULA:
Total Staff Cost = Base Salaries × 1.21
Where 21% loading = KiwiSaver (3%) + Bonuses (10%) + ACC (1.5%) + Other (6.5%)

OVERHEAD FORMULA:
Business Overhead = Revenue × 13%
Where 13% = Rent (4%) + Tech (3%) + T&E/Insurance/Other (6%)

MARGIN FORMULAS:
Gross Margin = (Revenue - Total Staff Cost) / Revenue
Operating Margin = (Revenue - Total Staff Cost - Overhead) / Revenue
```

---

## Part 3: P&L Model

### Current State (46 FTE)

| Line Item | Amount | Notes |
|-----------|--------|-------|
| **REVENUE** | | |
| Media Revenue | $11,904,526 | From 2026 plan |
| | | |
| **STAFF COSTS** | | |
| Base Salaries (46 FTE) | $5,455,000 | AOTF salary data |
| + Staff Loading (21%) | $1,145,550 | See assumptions |
| **= Total Staff Cost** | **$6,600,550** | Base × 1.21 |
| | | |
| **GROSS PROFIT** | **$5,303,976** | Revenue - Staff Cost |
| **Gross Margin %** | **44.6%** | |
| | | |
| **BUSINESS OVERHEAD** | | |
| Operating Costs (13%) | $1,547,588 | See assumptions |
| | | |
| **OPERATING PROFIT** | **$3,756,388** | Gross Profit - Overhead |
| **Operating Margin %** | **31.6%** | |

### 40% Reduction Scenario (28 FTE)

| Line Item | Amount | Notes |
|-----------|--------|-------|
| **REVENUE** | $11,904,526 | Held constant |
| | | |
| **STAFF COSTS** | | |
| Base Salaries (28 FTE) | $3,273,000 | Post-reduction |
| + Staff Loading (21%) | $687,330 | |
| **= Total Staff Cost** | **$3,960,330** | |
| | | |
| **GROSS PROFIT** | **$7,944,196** | |
| **Gross Margin %** | **66.7%** | |
| | | |
| **BUSINESS OVERHEAD** | $1,470,209 | Slight reduction |
| | | |
| **OPERATING PROFIT** | **$6,473,987** | |
| **Operating Margin %** | **54.4%** | |

### Improvement Summary

| Metric | Current | 40% Reduction | Change |
|--------|---------|---------------|--------|
| FTE | 46 | 28 | -18 |
| Staff Cost | $6.60M | $3.96M | -$2.64M |
| Operating Profit | $3.76M | $6.47M | +$2.72M |
| Operating Margin | 31.6% | 54.4% | +22.8 pts |
| Revenue/FTE | $258,794 | $425,162 | +64% |

---

## Part 4: Platform vs Reality Comparison

| Metric | Platform (Wrong) | Actual (Corrected) | Issue |
|--------|-----------------|--------------------|----|
| Total FTE | 33 | **46** | Org chart has 46 |
| Base Salary Cost | $4.0M | **$5.455M** | AOTF data |
| Staff Loading | 0% | **21%** | Not applied |
| Total Staff Cost | $4.0M | **$6.6M** | Missing loading |
| Business Overhead | 0% | **13%** | Not applied |
| Overhead $ | $0 | **$1.55M** | Missing |
| Gross Margin | 66.4% | **44.6%** | Overstated |
| Operating Margin | 66.4% | **31.6%** | Overstated |
| 40% Target FTE | 20 | **28** | Wrong base |

---

## Part 5: Data Sources

| Data Point | Source | Status |
|------------|--------|--------|
| 46 FTE positions | Niki's Org Chart (12.01.2026) | ✅ Verified |
| Base salary bands | AOTF Task Summary w Salaries | ✅ Verified |
| 2026 Revenue | Revenue Plan 2025 vs 2026 | ✅ Verified |
| Task automation scores | AOTF Task Summary | ✅ Verified |
| 21% staff loading | **ASSUMPTION** | ⚠️ Needs validation |
| 13% business overhead | **ASSUMPTION** | ⚠️ Needs validation |

---

## Part 6: Complete Roster with Loaded Costs

| # | Name | Title | Base Salary | Loaded Cost |
|---|------|-------|-------------|-------------|
| 1 | Blair Alexander | CEO Media | $250,000 | $302,500 |
| 2 | Terri Collier | Managing Partner | $250,000 | $302,500 |
| 3 | Luz Valenzano | Growth & Perf Director | $150,000 | $181,500 |
| 4 | Christopher Thomas | Head of Product & Strategy | $200,000 | $242,000 |
| 5 | Ashleigh Vreeburg | Comms Design Director | $150,000 | $181,500 |
| 6 | Christine So | Group Digital Planning Dir | $150,000 | $181,500 |
| 7-10 | 4× Group Business Directors | | $175,000 ea | $211,750 ea |
| 11-13 | 3× Business Directors | | $125,000 ea | $151,250 ea |
| 14-17 | 4× Assoc Business Directors | | $110,000 ea | $133,100 ea |
| 18 | Joao Ereeg | Senior Account Manager | $85,000 | $102,850 |
| 19-21 | 3× Account Managers | | $75,000 ea | $90,750 ea |
| 22-26 | 5× Account Executives | | $60,000 ea | $72,600 ea |
| 27 | Agata Ziemkiewicz | GM Digital Consulting | $225,000 | $272,250 |
| 28-30 | Head of Perf + 2× Sr Search Dir | | $125-150K | $151-181K |
| 31-32 | 2× Search Directors | | $105,000 ea | $127,050 ea |
| 33-34 | Perf Mgr + Activation Mgr | | $80,000 ea | $96,800 ea |
| 35 | Jo Tang | Sr Activation Executive | $70,000 | $84,700 |
| 36-37 | 2× Sr Activation Planners | | $95,000 ea | $114,950 ea |
| 38 | Niya Matthew | Activation Executive | $60,000 | $72,600 |
| 39 | David Turner | Chief Investment Officer | $250,000 | $302,500 |
| 40 | Nina Radojkovich | I&P Director | $125,000 | $151,250 |
| 41-42 | 2× Assoc I&P Directors | | $110,000 ea | $133,100 ea |
| 43 | Fergus Ellis | Investment Manager | $80,000 | $96,800 |
| 44 | Joe Taylor | Sr Investment Executive | $70,000 | $84,700 |
| 45-46 | 2× Investment Executives | | $60,000 ea | $72,600 ea |
| **TOTAL** | **46 FTE** | | **$5,455,000** | **$6,600,550** |

---

## Part 7: Automation Risk Scoring

Methodology: Tasks classified as Highly Commoditised (automatable), Semi-Judgemental, or Highly Judgemental

| Role | FTE | % Commoditised | Risk Level |
|------|-----|----------------|------------|
| Account Executive | 5 | 77.3% | 🔴 CRITICAL |
| Activation Executive | 1 | 75.0% | 🔴 CRITICAL |
| Senior Activation Executive | 1 | 65.5% | 🟠 HIGH |
| Account Manager | 3 | 44.1% | 🟠 HIGH |
| Associate Business Director | 4 | 20.0% | 🟡 MEDIUM |
| Group Business Director | 4 | 4.9% | 🟢 PROTECTED |
| Chief Investment Officer | 1 | 2.8% | 🟢 PROTECTED |
| Communications Design Director | 1 | 0.0% | 🟢 PROTECTED |
| Strategy roles | 3 | 0.0% | 🟢 PROTECTED |

---

## Summary

### Key Numbers

| Metric | Value |
|--------|-------|
| Total FTE | 46 |
| Base Salary Cost | $5,455,000 |
| Staff Loading (21%) | $1,145,550 |
| **Total Staff Cost** | **$6,600,550** |
| Business Overhead (13%) | $1,547,588 |
| **Operating Profit** | **$3,756,388** |
| **Operating Margin** | **31.6%** |

### After 40% Reduction (28 FTE)

| Metric | Value |
|--------|-------|
| Staff Cost Savings | $2,640,220 |
| Operating Profit Increase | $2,717,599 |
| New Operating Margin | **54.4%** |

---

*Analysis uses AOTF salary data and Niki's org chart (12 January 2026). Staff loading (21%) and business overhead (13%) are assumptions that should be validated against actual FCB financial data.*
