import EntityListPage from "@/components/EntityListPage";

export default function SafeBetsPage() {
  return (
    <EntityListPage
      entity="Slip"
      title="SafeBets"
      description="Multi-selection tips carry combined risk: every leg must be correct for the full selection to succeed. Nothing here is risk-free."
      status="Pending"
    />
  );
}
