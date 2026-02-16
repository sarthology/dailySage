"use client";

import { useId, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { useDashboard } from "@/contexts/DashboardContext";
import { SortableWidgetCard } from "./WidgetCard";
import { AddWidgetModal } from "./AddWidgetModal";

export function DashboardWidgetGrid() {
  const dndId = useId();
  const { layout, reorderWidgets } = useDashboard();
  const [modalOpen, setModalOpen] = useState(false);

  const sorted = [...layout.widgets].sort((a, b) => a.position - b.position);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderWidgets(active.id as string, over.id as string);
    }
  }

  return (
    <div>
      {sorted.length === 0 ? (
        <motion.div
          className="py-20 text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <p className="font-display text-xl italic text-muted">
            &ldquo;The impediment to action advances action. What stands in the way becomes the way.&rdquo;
          </p>
          <p className="text-caption mt-3 text-muted">— Marcus Aurelius</p>
          <p className="text-body-sm mt-8 text-muted">
            Your dashboard is ready to be shaped. Chat with your Daily Sage or add a widget below.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 rounded-md border border-accent bg-accent/5 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-paper-light"
          >
            + Add Widget
          </button>
        </motion.div>
      ) : (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sorted.map((w) => w.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {sorted.map((widget) => (
                  <SortableWidgetCard
                    key={widget.id}
                    widget={widget}
                  />
                ))}
              </AnimatePresence>

              {/* Add widget tile */}
              <div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex w-full min-h-[100px] items-center justify-center rounded-xl border-2 border-dashed border-muted-light/60 text-muted transition-all hover:border-accent/40 hover:text-accent hover:shadow-sm"
                >
                  <div className="text-center">
                    <span className="block text-2xl leading-none">+</span>
                    <span className="mt-1 block font-mono text-[0.65rem] uppercase tracking-wider">
                      Add Widget
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AddWidgetModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
