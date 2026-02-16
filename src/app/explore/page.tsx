import { Navbar } from "@/components/layout/Navbar";
import { WidgetGallery } from "@/components/core/WidgetGallery";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-[1000px] px-4 py-8 md:px-8 md:py-12">
        <WidgetGallery />
      </main>
    </div>
  );
}
