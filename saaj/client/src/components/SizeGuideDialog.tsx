import { Dialog, DialogContent } from "@/components/ui/dialog";

interface SizeTable {
  title: string;
  rows: { label: string; values: (string | number)[] }[];
}

const SIZES = ["XS", "S", "M", "ML", "L", "XL"];

const TABLES: SizeTable[] = [
  {
    title: "Loose Fit  (Kurta)",
    rows: [
      { label: "Shoulder", values: [13.3, 14, 14.5, 15, 15.5, 16] },
      { label: "Bust", values: [18.5, 19, 20, 21, 23, 24] },
      { label: "Waist", values: [19.5, 20, 21, 22, 23, 24] },
    ],
  },
  {
    title: "Slim Fit  (Straight Shirt)",
    rows: [
      { label: "Shoulder", values: [13.5, 14, 14.5, 15, 15.5, 16] },
      { label: "Bust", values: [17, 18, 20, 21, 22, 22] },
      { label: "Waist", values: [13, 15, 16, 18, 19, 21] },
      { label: "Shirt Hip", values: [19.5, 20, 23, 24, 25, 27] },
    ],
  },
  {
    title: "Kalidaar  (Bodice/choli)",
    rows: [
      { label: "Shoulder", values: [13.5, 14, 14.5, 15, 15.5, 16] },
      { label: "Bust", values: [17, 18, 20, 21, 22, 24] },
      { label: "Waist", values: [14, 15, 16, 18, 19, 21] },
    ],
  },
  {
    title: "Bottoms  (Trouser / Pants)",
    rows: [
      { label: "Waist", values: [28, 30, 32, 34, 36, 38] },
      { label: "Hip", values: [36, 38, 40, 42, 44, 46] },
      { label: "Length", values: [38, 38, 39, 39, 40, 40] },
    ],
  },
];

export default function SizeGuideDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[640px] w-[calc(100vw-32px)] max-h-[88vh] overflow-y-auto bg-white p-0 border border-gray-200 [&>button]:top-4 [&>button]:right-4"
        data-testid="dialog-size-guide"
      >
        <div className="px-6 md:px-10 pt-10 pb-8">
          <div className="text-center mb-6">
            <h2 className="font-serif text-[28px] md:text-[32px] text-gray-900 tracking-wide">
              Standard Ready Size Guide
            </h2>
            <p className="font-sans text-[11px] text-gray-500 mt-2 tracking-wide">
              All measurements are in inches.
            </p>
          </div>

          {TABLES.map((table) => (
            <div key={table.title} className="mt-8 first:mt-4">
              <h3 className="text-center font-serif text-[20px] text-gray-900 mb-3">
                {table.title}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-sans text-[13px]">
                  <thead>
                    <tr className="bg-[#f3e5c1]/60">
                      <th className="text-left py-2.5 px-3 font-semibold text-gray-700 border border-[#e6d4a3]"></th>
                      {SIZES.map((s) => (
                        <th
                          key={s}
                          className="py-2.5 px-3 text-center font-semibold text-gray-700 border border-[#e6d4a3]"
                        >
                          {s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row) => (
                      <tr key={row.label}>
                        <td className="py-2.5 px-3 text-left text-gray-800 border border-[#e6d4a3] bg-[#fbf6e9]/40 font-medium">
                          {row.label}
                        </td>
                        {row.values.map((v, i) => (
                          <td
                            key={i}
                            className="py-2.5 px-3 text-center text-gray-800 border border-[#e6d4a3]"
                          >
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <p className="font-sans text-[11px] text-gray-500 text-center mt-8 leading-relaxed">
            For a tailored fit, please refer to the table above. Sizes may vary slightly based on garment style and design.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
