"use client";

import { Badge } from "@/components/ui/Badge";
import { StubModule } from "@/components/admin/StubModule";

export default function CouponsPage() {
  return (
    <StubModule
      title="Coupons"
      subtitle="Promotional codes and discounts."
      stats={[
        { label: "Active coupons", value: 7 },
        { label: "Redemptions", value: 142 },
        { label: "Revenue impact", value: "-$3,420" },
        { label: "Expiring (30d)", value: 2 },
      ]}
      columns={[
        { key: "code", header: "Code" },
        { key: "discount", header: "Discount" },
        { key: "redeemed", header: "Redeemed", align: "right" },
        { key: "expires", header: "Expires" },
        { key: "status", header: "Status" },
      ]}
      rows={[
        { code: "LAUNCH50", discount: "50% · 3mo", redeemed: 64, expires: "Aug 31", status: <Badge tone="green">active</Badge> },
        { code: "ANNUAL20", discount: "20% · annual", redeemed: 51, expires: "Dec 31", status: <Badge tone="green">active</Badge> },
        { code: "WELCOME10", discount: "$10 off", redeemed: 27, expires: "Jul 15", status: <Badge tone="amber">expiring</Badge> },
      ]}
      note="Coupon management syncs with Stripe Coupons & Promotion Codes."
    />
  );
}
