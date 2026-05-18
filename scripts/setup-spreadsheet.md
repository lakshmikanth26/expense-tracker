# Manual Spreadsheet Setup

If you want to manually set up your Google Spreadsheet, follow these steps:

## Sheet 1: Expenses
Create a sheet named "Expenses" with these columns:
| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Date | Amount | Category | Subcategory | Member | Payment Mode | Note | Is EMI | Month | Year |

## Sheet 2: Income  
Create a sheet named "Income" with these columns:
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Date | Amount | Source | Member | Note | Month | Year |

## Sheet 3: Summary
Create a sheet named "Summary" with these formulas:
| A | B |
|---|---|
| **MONTHLY SUMMARY** | |
| | |
| Total Income | `=SUMIF(Income!F:F,TEXT(TODAY(),"YYYY-MM"),Income!B:B)` |
| Total Expenses | `=SUMIF(Expenses!I:I,TEXT(TODAY(),"YYYY-MM"),Expenses!B:B)` |
| Net Savings | `=B3-B4` |
| Savings Rate | `=IF(B3>0,B5/B3*100,0)&"%"` |

## Your Spreadsheet ID
`1pQPuGQvL0UPXtj1rfinaIXDa2MRc64M--9MP8f0LF5U`

## Quick Setup
The app can automatically set up these sheets for you when you connect!