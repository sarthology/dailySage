// ── Widget Behavioral Type System ──
// Widgets are classified by capabilities (traits), not exclusive categories.
// A widget can save data AND prompt chat (e.g., mood_reframe).

export type WidgetBehavior = "display" | "data_saving" | "prompt_to_chat";

/** Subtypes that define the data schema for storage */
export type DataSubtype =
  | "journal" // free-text reflections → journal_entries
  | "mood_log" // mood vector + label → mood_logs
  | "gratitude" // list of items → widget_data
  | "assessment" // rated values/scales → widget_data
  | "reframe"; // original → reframed thought → widget_data

/** Configuration for a widget that saves data to the database */
export interface DataSavingCapability {
  dataSubtype: DataSubtype;
  targetTable: "journal_entries" | "mood_logs" | "widget_data";
  supportsTags: boolean;
}

/** Configuration for a widget that can inject prompts into chat */
export interface ChatPromptCapability {
  /** static = predefined text buttons, dynamic = built from widget state */
  promptMode: "static" | "dynamic";
}

/** Full behavioral configuration for a widget type */
export interface WidgetBehaviorConfig {
  primaryBehavior: WidgetBehavior;
  dataSaving?: DataSavingCapability;
  chatPrompt?: ChatPromptCapability;
  /** Whether the LLM can refresh this widget's content daily */
  supportsLLMRefresh: boolean;
}
