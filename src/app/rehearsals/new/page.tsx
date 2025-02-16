import CreateRehearsalForm from "@/components/CreateRehearsalForm";

export default async function NewRehearsalPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Start New Rehearsal</h1>
      <CreateRehearsalForm />
    </div>
  );
}
