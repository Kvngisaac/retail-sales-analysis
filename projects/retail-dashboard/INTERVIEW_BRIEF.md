# Dashboard interview brief

## A short explanation to adapt after reviewing the implementation

“This dashboard is the reporting layer of my retail SQL case study. It lets a reviewer explore invoice value by country and month range, inspect complete product rankings, and export the selected evidence. It preserves signed credits, exact monetary values, and the source’s incomplete final month. Most views share the same country and period filters. Market context intentionally compares all countries in the selected period, and that scope is labeled. I used JavaScript for the report and SQL to prepare the aggregates, with AI assistance for the implementation.”

## Decisions to explain

**Why is this a separate artifact?** It demonstrates reporting design and interactive exploration built on the same analyzed data. It is not a second independent dataset or commercial engagement.

**Why export aggregates instead of every invoice line?** The browser only needs country/month and SKU/country/month totals for these questions. Indexed dictionaries reduce repeated strings. This keeps the model at about 1.45 MB uncompressed while retaining all 66,939 merchandise-like product segments and complete filtered rankings.

**Why not reuse the initial top-20 product pool?** A product that leads in one country or month might not appear among the overall top 20. The dashboard ranks from every eligible SKU in the selected slice, then displays the top ten.

**What do the filters change?** Country and month controls change the KPIs, monthly values, and product rankings. The measure changes chart/ranking order. Market context uses the selected period across all countries, with the chosen country highlighted.

**How is missing data distinguished from zero?** A range with no eligible complete months displays unavailable values and disables export. An eligible country/period slice with no recorded activity displays zero with an explicit message.

**What would you say about credits?** Negative-quantity lines reduce net invoice value. They are not matched to an original sale, so the report cannot call them a cohort return rate or prove a cash refund.

**How do you protect exported reports?** Text fields are quoted and escaped. Potential formula-leading text is prefixed with an apostrophe. Amount fields remain numeric, and every record names its country and period scope.

**What are the main limits?** Historical data covers one trading year plus a partial final month. No cost data, approved merchandise taxonomy, or causal experiment is available. The implementation uses a web dashboard rather than Power BI. Original duplicate semantics need business confirmation.

## Five-minute review

1. Select Germany and a three-month range. Explain every KPI’s scope.
2. Change Net to Credits. Explain why product order changes.
3. Select December 2011 only, then exclude partial months. Explain the unavailable state.
4. Reset and export CSV. Compare the selected totals with the visible KPIs.
5. Explain why market context and product ranking have different scopes, using the labels on screen.
