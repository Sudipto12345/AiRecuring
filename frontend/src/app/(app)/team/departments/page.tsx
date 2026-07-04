"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function DepartmentsPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Departments"
        subtitle="Organize hiring by department and team."
        columns={[
          { key: "dept", header: "Department" },
          { key: "openings", header: "Open roles", align: "right" },
          { key: "owner", header: "Owner" },
        ]}
        rows={[
          { dept: "Engineering", openings: "5", owner: "Sadia Islam" },
          { dept: "Design", openings: "2", owner: "Rakib Ahmed" },
          { dept: "Product", openings: "1", owner: "Tasnim Jahan" },
          { dept: "Operations", openings: "1", owner: "Imtiaz Ahmed" },
        ]}
        note="Preview module. Departments will let you scope jobs, recruiters and reports by org unit."
      />
    </div>
  );
}
