import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Collection, Product } from "@shared/schema";

const sizeChartData = [
  { size: "XS", chest: "32", waist: "26", hips: "34", shoulder: "13.5", length: "38" },
  { size: "S", chest: "34", waist: "28", hips: "36", shoulder: "14", length: "39" },
  { size: "M", chest: "36", waist: "30", hips: "38", shoulder: "14.5", length: "40" },
  { size: "L", chest: "38", waist: "32", hips: "40", shoulder: "15", length: "41" },
  { size: "XL", chest: "40", waist: "34", waist2: "34", hips: "42", shoulder: "15.5", length: "42" },
  { size: "XXL", chest: "42", waist: "36", hips: "44", shoulder: "16", length: "43" },
];

const piecesInfo = [
  { pieces: "1 Piece", desc: "Shirt / Kameez only" },
  { pieces: "2 Piece", desc: "Kameez + Shalwar / Trouser" },
  { pieces: "3 Piece", desc: "Kameez + Shalwar / Trouser + Dupatta / Shawl" },
];

export default function SizeGuide() {
  const { data: settings, isLoading: settingsLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings/public"],
  });

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const content = settings?.page_size_guide;

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-16 md:py-24">
      <h1 className="font-serif text-4xl tracking-wide mb-4">Size Guide</h1>
      <p className="font-sans text-sm text-muted-foreground mb-12">Find your perfect fit. All measurements are in inches.</p>

      {content ? (
        <div
          className="font-sans text-sm leading-relaxed prose prose-sm max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : null}

      <div className="bg-muted/50 rounded-lg p-6 mb-16">
        <h3 className="font-serif text-lg mb-3">How to Measure</h3>
        <ul className="font-sans text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li><strong className="text-foreground">Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
          <li><strong className="text-foreground">Waist:</strong> Measure around your natural waistline, the narrowest part of your torso.</li>
          <li><strong className="text-foreground">Hips:</strong> Measure around the fullest part of your hips, about 8 inches below your waist.</li>
          <li><strong className="text-foreground">Shoulder:</strong> Measure from shoulder point to shoulder point across the back.</li>
          <li><strong className="text-foreground">Length:</strong> Measure from the top of the shoulder to the hemline.</li>
        </ul>
      </div>

      <div className="mb-16">
        <h2 className="font-serif text-2xl tracking-wide mb-6">Standard Size Chart</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="px-4 py-3 text-left text-[10px] tracking-[0.2em] uppercase font-medium">Size</th>
                <th className="px-4 py-3 text-left text-[10px] tracking-[0.2em] uppercase font-medium">Chest (in)</th>
                <th className="px-4 py-3 text-left text-[10px] tracking-[0.2em] uppercase font-medium">Waist (in)</th>
                <th className="px-4 py-3 text-left text-[10px] tracking-[0.2em] uppercase font-medium">Hips (in)</th>
                <th className="px-4 py-3 text-left text-[10px] tracking-[0.2em] uppercase font-medium">Shoulder (in)</th>
                <th className="px-4 py-3 text-left text-[10px] tracking-[0.2em] uppercase font-medium">Length (in)</th>
              </tr>
            </thead>
            <tbody>
              {sizeChartData.map((row, i) => (
                <tr key={row.size} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 font-medium text-primary">{row.size}</td>
                  <td className="px-4 py-3">{row.chest}</td>
                  <td className="px-4 py-3">{row.waist}</td>
                  <td className="px-4 py-3">{row.hips}</td>
                  <td className="px-4 py-3">{row.shoulder}</td>
                  <td className="px-4 py-3">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-sans text-xs text-muted-foreground mt-3">* Measurements may vary slightly by style. When in doubt, size up.</p>
      </div>

      <div className="mb-16">
        <h2 className="font-serif text-2xl tracking-wide mb-6">Pieces Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {piecesInfo.map(p => (
            <div key={p.pieces} className="border border-border rounded-lg p-6">
              <h3 className="font-sans text-xs tracking-[0.2em] uppercase font-semibold text-primary mb-2">{p.pieces}</h3>
              <p className="font-sans text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
