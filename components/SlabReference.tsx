import { formatINR, formatPercent } from "@/lib/money";
import { YEARS, type Slab, type TaxYearId } from "@/lib/tax-rules";

function label(slabs: Slab[], index: number): string {
  const slab = slabs[index];
  if (!slab) return "";
  if (index === 0 && slab.upto != null) return `Up to ${formatINR(slab.upto)}`;
  const previous = slabs[index - 1]?.upto;
  if (slab.upto == null) return `Above ${formatINR(previous ?? 0)}`;
  return `${formatINR((previous ?? 0) + 1)} to ${formatINR(slab.upto)}`;
}

export function SlabTable({ slabs, caption }: { slabs: Slab[]; caption: string }) {
  return (
    <table>
      <caption style={{ textAlign: "left", fontWeight: 700, padding: "0.4rem 0" }}>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Total income</th>
          <th scope="col">Rate</th>
        </tr>
      </thead>
      <tbody>
        {slabs.map((slab, index) => (
          <tr key={`${slab.rate}-${slab.upto ?? "top"}`}>
            <td>{label(slabs, index)}</td>
            <td>{slab.rate === 0 ? "Nil" : formatPercent(slab.rate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function YearSlabs({ year }: { year: TaxYearId }) {
  const rules = YEARS[year];
  return (
    <div>
      <SlabTable slabs={rules.newRegime.slabs} caption={`New regime, ${rules.shortLabel}`} />
      <SlabTable slabs={rules.oldRegime.slabsByAge.below60} caption="Old regime, under 60" />
      <SlabTable slabs={rules.oldRegime.slabsByAge.senior} caption="Old regime, 60 to 79" />
      <SlabTable slabs={rules.oldRegime.slabsByAge.superSenior} caption="Old regime, 80 and above" />
    </div>
  );
}
