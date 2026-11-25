"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Button, ComparisonTable, ResultPanel } from "@sutra-ui/react";
import { MoneyField, SegmentField, SwitchField } from "@/components/Fields";
import { useT } from "@/components/use-t";
import { hraExemption, hraForStay } from "@/lib/hra";
import { formatINR, formatPercent } from "@/lib/money";

export function HraCalculator() {
  const t = useT();
  const [monthly, setMonthly] = useState(true);
  const [basic, setBasic] = useState(40_000);
  const [da, setDa] = useState(0);
  const [daCounts, setDaCounts] = useState(true);
  const [hra, setHra] = useState(16_000);
  const [rent, setRent] = useState(15_000);
  const [months, setMonths] = useState(12);
  const [metro, setMetro] = useState(false);

  const result = useMemo(() => {
    if (monthly) {
      return hraForStay({
        annualBasic: basic * 12,
        annualDa: da * 12,
        daCountsForRetirement: daCounts,
        annualHra: hra * 12,
        monthlyRent: rent,
        months,
        metro,
      });
    }
    return hraExemption({
      basic,
      da,
      daCountsForRetirement: daCounts,
      hraReceived: hra,
      rentPaid: rent,
      metro,
    });
  }, [monthly, basic, da, daCounts, hra, rent, months, metro]);

  const query = new URLSearchParams({
    basic: String(Math.round(monthly ? basic * 12 : basic)),
    hra: String(Math.round(monthly ? hra * 12 : hra)),
    rent: String(monthly ? rent : Math.round(rent / Math.max(months, 1))),
    months: String(monthly ? months : 12),
    metro: metro ? "1" : "0",
    exempt: String(Math.round(result.exemption)),
  });

  const rows = [
    { en: "Actual HRA", hi: "मिला हुआ HRA", amount: result.actualHra },
    { en: "Rent minus 10% of salary", hi: "किराया घटा वेतन का 10%", amount: result.rentMinusTenPercent },
    {
      en: `${formatPercent(result.percent)} of salary`,
      hi: `वेतन का ${formatPercent(result.percent)}`,
      amount: result.percentOfSalary,
    },
  ];

  return (
    <section className="calc-grid">
      <form
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault();
          document.getElementById("hra-result")?.focus();
        }}
      >
        <SegmentField
          label={t("How are you entering the amounts?", "राशि कैसे भर रहे हैं?")}
          value={monthly ? "monthly" : "period"}
          onChange={(value) => setMonthly(value === "monthly")}
          options={[
            { value: "monthly", label: t("Monthly", "मासिक") },
            { value: "period", label: t("For the whole period", "पूरी अवधि का") },
          ]}
        />
        <MoneyField id="hra-basic" label={t("Basic salary", "बेसिक वेतन")} value={basic} onChange={setBasic} />
        <MoneyField id="hra-da" label={t("Dearness allowance", "महंगाई भत्ता")} value={da} onChange={setDa} />
        <SwitchField
          id="da-counts"
          checked={daCounts}
          onChange={setDaCounts}
          label={t("DA forms part of retirement benefits", "DA रिटायरमेंट बेनिफिट का हिस्सा है")}
          hint={t("Only then does Rule 2A count it in salary.", "तभी नियम 2A इसे वेतन में गिनता है।")}
        />
        <MoneyField id="hra-got" label={t("HRA received", "मिला HRA")} value={hra} onChange={setHra} />
        <MoneyField
          id="hra-rent"
          label={t(monthly ? "Rent paid per month" : "Rent paid for the period", monthly ? "महीने का किराया" : "अवधि का किराया")}
          value={rent}
          onChange={setRent}
        />
        {monthly ? (
          <MoneyField
            id="hra-months"
            label={t("Months", "महीने")}
            value={months}
            onChange={(value) => setMonths(Math.min(12, value))}
          />
        ) : null}
        <SwitchField
          id="hra-metro"
          checked={metro}
          onChange={setMetro}
          label={t("Metro: Delhi, Mumbai, Kolkata or Chennai", "मेट्रो: दिल्ली, मुंबई, कोलकाता या चेन्नई")}
          hint={t(
            "Everywhere else, including Bengaluru, uses 40% of salary.",
            "बाकी जगह, बेंगलुरु सहित, वेतन का 40% लगता है।",
          )}
        />
        <Button type="submit">{t("Show the exemption", "छूट देखें")}</Button>
      </form>
      <div id="hra-result" tabIndex={-1} className="result-col stack">
        <ResultPanel
          label={t("Exempt HRA", "छूट वाला HRA")}
          value={formatINR(result.exemption)}
          tone="success"
          caption={t(
            `Taxable HRA is ${formatINR(result.taxableHra)}. Salary counted for the test is ${formatINR(result.salary)}.`,
            `कर योग्य HRA ${formatINR(result.taxableHra)} है। जाँच में वेतन ${formatINR(result.salary)} गिना गया।`,
          )}
        />
        <ComparisonTable
          caption={t("The three HRA limits", "HRA की तीन सीमाएँ")}
          rowHeader={t("Limit", "सीमा")}
          columns={[{ key: "amount", header: t("Amount", "राशि") }]}
          rows={[
            ...rows.map((row) => ({
              label: t(row.en, row.hi),
              values: { amount: formatINR(row.amount) },
            })),
            {
              label: t("Exemption, the lowest of the three", "छूट, तीनों में सबसे कम"),
              values: { amount: formatINR(result.exemption) },
            },
          ]}
        />
        <Alert tone="info" title={t("Old regime only", "सिर्फ पुरानी रेजिम")}>
          {t(
            "This exemption is available only in the old regime. The new regime taxes HRA as salary.",
            "यह छूट सिर्फ पुरानी रेजिम में है। नई रेजिम में HRA वेतन की तरह कर योग्य है।",
          )}
        </Alert>
        <p>
          <Link href={`/income-tax-calculator/?${query.toString()}`}>
            {t("Use this exemption in the income tax calculator", "इस छूट को इनकम टैक्स कैलकुलेटर में खोलें")}
          </Link>
        </p>
      </div>
    </section>
  );
}
