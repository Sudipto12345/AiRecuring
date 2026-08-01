"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function PreferencesPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Preferences"
        subtitle="Localization, timezone, language and currency."
        columns={[
          { key: "setting", header: "Setting" },
          { key: "value", header: "Value" },
        ]}
        rows={[
          { setting: "Timezone", value: "Asia/Dhaka" },
          { setting: "Language", value: "English" },
          { setting: "Currency", value: "USD" },
          { setting: "Date format", value: "DD MMM YYYY" },
        ]}
        note="Preview module. These preferences will become editable per workspace."
      />
    </div>
  );
}
