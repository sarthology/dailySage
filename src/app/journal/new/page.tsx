import { Navbar } from "@/components/layout/Navbar";
import { NewEntryForm } from "@/components/journal/NewEntryForm";

export default function NewJournalEntryPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <NewEntryForm />
    </div>
  );
}
