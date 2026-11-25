"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bi } from "@/components/Bi";
import { Check, MoneyField } from "@/components/Fields";
import { hraExemption, hraForStay } from "@/lib/hra";
import { formatINR, formatPercent } from "@/lib/money";

export function HraCalculator() {
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
    { en: `${formatPercent(result.percent)} of salary`, hi: `वेतन का ${formatPercent(result.percent)}`, amount: result.percentOfSalary },
  ];

  return (
    <section className="calculator">
      <div className="split">
        <form onSubmit={(event) => { event.preventDefault(); document.getElementById("hra-result")?.focus(); }}>
          <fieldset>
            <legend><Bi en="How are you entering the amounts?" hi="राशि कैसे भर रहे हैं?" /></legend>
            <div className="choices">
              <label className="choice">
                <input type="radio" name="unit" checked={monthly} onChange={() => setMonthly(true)} />
                <span><Bi en="Monthly" hi="मासिक" /></span>
              </label>
              <label className="choice">
                <input type="radio" name="unit" checked={!monthly} onChange={() => setMonthly(false)} />
                <span><Bi en="For the whole period" hi="पूरी अवधि का" /></span>
              </label>
            </div>
          </fieldset>
          <MoneyField id="hra-basic" label={<Bi en="Basic salary" hi="बेसिक वेतन" />} value={basic} onChange={setBasic} />
          <MoneyField id="hra-da" label={<Bi en="Dearness allowance" hi="महंगाई भत्ता" />} value={da} onChange={setDa} />
          <Check id="da-counts" checked={daCounts} onChange={setDaCounts} label={<Bi en="DA forms part of retirement benefits" hi="DA रिटायरमेंट बेनिफिट का हिस्सा है" />} hint={<Bi en="Only then does Rule 2A count it in salary." hi="तभी नियम 2A इसे वेतन में गिनता है।" />} />
          <MoneyField id="hra-got" label={<Bi en="HRA received" hi="मिला HRA" />} value={hra} onChange={setHra} />
          <MoneyField id="hra-rent" label={<Bi en={monthly ? "Rent paid per month" : "Rent paid for the period"} hi={monthly ? "महीने का किराया" : "अवधि का किराया"} />} value={rent} onChange={setRent} />
          {monthly ? (
            <MoneyField id="hra-months" label={<Bi en="Months" hi="महीने" />} value={months} onChange={(value) => setMonths(Math.min(12, value))} />
          ) : null}
          <Check id="hra-metro" checked={metro} onChange={setMetro} label={<Bi en="Metro: Delhi, Mumbai, Kolkata or Chennai" hi="मेट्रो: दिल्ली, मुंबई, कोलकाता या चेन्नई" />} hint={<Bi en="Everywhere else, including Bengaluru, uses 40% of salary." hi="बाकी जगह, बेंगलुरु सहित, वेतन का 40% लगता है।" />} />
          <button className="btn btn-primary" type="submit"><Bi en="Show the exemption" hi="छूट देखें" /></button>
        </form>
        <div id="hra-result" tabIndex={-1} className="result-col result-first">
          <div className="verdict new">
            <p className="eyebrow"><Bi en="Exempt HRA" hi="छूट वाला HRA" /></p>
            <strong className="num">{formatINR(result.exemption)}</strong>
            <p>
              <Bi
                en={`Taxable HRA is ${formatINR(result.taxableHra)}. Salary counted for the test is ${formatINR(result.salary)}.`}
                hi={`कर योग्य HRA ${formatINR(result.taxableHra)} है। जाँच में वेतन ${formatINR(result.salary)} गिना गया।`}
              />
            </p>
          </div>
          <div className="card" style={{ padding: "0.4rem 1rem", marginTop: "0.8rem" }}>
            <table>
              <caption className="sr-only"><Bi en="The three HRA limits" hi="HRA की तीन सीमाएँ" /></caption>
              <thead>
                <tr>
                  <th scope="col"><Bi en="Limit" hi="सीमा" /></th>
                  <th scope="col" className="num-col"><Bi en="Amount" hi="राशि" /></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.en}>
                    <th scope="row"><Bi en={row.en} hi={row.hi} /></th>
                    <td className="num num-col">{formatINR(row.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row"><Bi en="Exemption, the lowest of the three" hi="छूट, तीनों में सबसे कम" /></th>
                  <td className="num num-col">{formatINR(result.exemption)}</td>
                </tr>
              </tbody>
            </table>
            <p className="hint">
              <Bi
                en="This exemption is available only in the old regime. The new regime taxes HRA as salary."
                hi="यह छूट सिर्फ पुरानी रेजिम में है। नई रेजिम में HRA वेतन की तरह कर योग्य है।"
              />
            </p>
            <p>
              <Link href={`/income-tax-calculator/?${query.toString()}`}>
                <Bi en="Use this exemption in the income tax calculator" hi="इस छूट को इनकम टैक्स कैलकुलेटर में खोलें" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
