"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BRA_SIZES = [
  ["65", "32A", "80"],
  ["70", "34B", "85"],
  ["75", "36C", "90"],
  ["80", "38D", "95"],
  ["85", "40DD", "100"],
  ["90", "42DDD", "105"],
];

const LETTER_SIZES = [
  ["XS", "36", "44"],
  ["S", "38", "46"],
  ["M", "40", "48"],
  ["L", "42", "50"],
  ["XL", "44", "52"],
  ["XXL", "46", "54"],
];

/**
 * Size guide dialog — mock reference table for bras and letter sizes
 * (PRD §17). Opened from the PDP size selector.
 */
export function SizeGuideDialog({
  trigger,
}: {
  trigger: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>راهنمای سایزبندی</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          <div>
            <h4 className="mb-2 font-bold text-text">سوتین</h4>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full">
                <thead className="bg-surface-secondary/70">
                  <tr>
                    <th className="px-3 py-2 text-start font-semibold text-text">
                      زیوو (سانتی‌متر)
                    </th>
                    <th className="px-3 py-2 text-start font-semibold text-text">
                      اروپا / آمریکا
                    </th>
                    <th className="px-3 py-2 text-start font-semibold text-text">
                      زیر سینه
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {BRA_SIZES.map(([z, eu, under]) => (
                    <tr key={z} className="text-text-secondary">
                      <td className="px-3 py-1.5 tabular-nums">{z}</td>
                      <td className="px-3 py-1.5">{eu}</td>
                      <td className="px-3 py-1.5 tabular-nums">{under} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-bold text-text">لباس زیر و لباس خواب</h4>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full">
                <thead className="bg-surface-secondary/70">
                  <tr>
                    <th className="px-3 py-2 text-start font-semibold text-text">
                      سایز زیوو
                    </th>
                    <th className="px-3 py-2 text-start font-semibold text-text">
                      اروپا
                    </th>
                    <th className="px-3 py-2 text-start font-semibold text-text">
                      دور سینه
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {LETTER_SIZES.map(([s, eu, bust]) => (
                    <tr key={s} className="text-text-secondary">
                      <td className="px-3 py-1.5">{s}</td>
                      <td className="px-3 py-1.5 tabular-nums">{eu}</td>
                      <td className="px-3 py-1.5 tabular-nums">{bust ? `${Number(bust) - 2}-${bust} mm` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs leading-6 text-text-muted">
            اندازه‌ها جنبه راهنمایی دارند. در صورت تردید، بزرگترین سایز نزدیک را
            انتخاب کنید یا از طریق چت آنلاین با ما مشورت نمایید.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
