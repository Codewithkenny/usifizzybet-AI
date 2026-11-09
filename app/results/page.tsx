import EntityListPage from "@/components/EntityListPage";

export default function ResultsPage() {
  return (
    <EntityListPage
      entity="Pick"
      title="Results"
      description="Review settled predictions. Past results do not guarantee future outcomes."
      status={{ $in: ["Won", "Lost"] }}
    />
  );
}
