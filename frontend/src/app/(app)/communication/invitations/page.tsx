"use client";

import { StubModule } from "@/components/admin/StubModule";

export default function InvitationsPage() {
  return (
    <div className="p-4 lg:p-6">
      <StubModule
        title="Interview Invitations"
        subtitle="Track sent interview and assessment invitations."
        columns={[
          { key: "candidate", header: "Candidate" },
          { key: "kind", header: "Type" },
          { key: "status", header: "Status" },
          { key: "sent", header: "Sent", align: "right" },
        ]}
        rows={[
          { candidate: "Md. Rafiq Hasan", kind: "Interview", status: "Accepted", sent: "Today" },
          { candidate: "Sadia Islam", kind: "Assessment", status: "Pending", sent: "Today" },
          { candidate: "Rakib Ahmed", kind: "Interview", status: "Declined", sent: "Yesterday" },
        ]}
        note="Preview module. Live invitation tracking is available today on the Exam Management and Interview screens."
      />
    </div>
  );
}
