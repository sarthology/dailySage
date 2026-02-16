import type { WidgetType } from "./widget";

export interface DashboardWidgetInstance {
  id: string;
  widgetType: WidgetType;
  title: string;
  description?: string;
  args: Record<string, unknown>;
  position: number;
  size: "small" | "medium" | "large";
  pinned: boolean;
  source: "onboarding" | "chat" | "user";
  createdAt: string;
  tags?: string[];
}

export interface DashboardLayout {
  widgets: DashboardWidgetInstance[];
  lastModifiedBy: "llm" | "user";
  lastModifiedAt: string;
}
