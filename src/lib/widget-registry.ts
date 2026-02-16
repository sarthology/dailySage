import type { WidgetType } from "@/types/widget";
import type { WidgetBehaviorConfig } from "@/types/widget-behaviors";

/**
 * Central registry mapping every WidgetType to its behavioral configuration.
 * Used by WidgetCard, WidgetInChat, and AddWidgetModal to determine
 * what actions a widget supports (save, history, chat prompt).
 */
export const WIDGET_REGISTRY: Record<WidgetType, WidgetBehaviorConfig> = {
  // ── Type 1: Display (No-action) ──
  daily_maxim: {
    primaryBehavior: "display",
    supportsLLMRefresh: true,
  },
  breathing_exercise: {
    primaryBehavior: "display",
    supportsLLMRefresh: true,
  },
  stoic_meditation: {
    primaryBehavior: "display",
    supportsLLMRefresh: true,
  },
  thought_experiment: {
    primaryBehavior: "display",
    supportsLLMRefresh: true,
  },
  philosophical_dilemma: {
    primaryBehavior: "display",
    supportsLLMRefresh: true,
  },
  quote_challenge: {
    primaryBehavior: "display",
    supportsLLMRefresh: true,
  },
  argument_mapper: {
    primaryBehavior: "display",
    supportsLLMRefresh: true,
  },
  progress_visualization: {
    primaryBehavior: "display",
    supportsLLMRefresh: false,
  },

  // ── Type 2: Data-Saving ──
  reflection_prompt: {
    primaryBehavior: "data_saving",
    dataSaving: {
      dataSubtype: "journal",
      targetTable: "journal_entries",
      supportsTags: true,
    },
    chatPrompt: {
      promptMode: "dynamic",
    },
    supportsLLMRefresh: true,
  },
  gratitude_list: {
    primaryBehavior: "data_saving",
    dataSaving: {
      dataSubtype: "gratitude",
      targetTable: "widget_data",
      supportsTags: true,
    },
    chatPrompt: {
      promptMode: "dynamic",
    },
    supportsLLMRefresh: true,
  },
  weekly_review: {
    primaryBehavior: "data_saving",
    dataSaving: {
      dataSubtype: "journal",
      targetTable: "journal_entries",
      supportsTags: true,
    },
    chatPrompt: {
      promptMode: "dynamic",
    },
    supportsLLMRefresh: true,
  },
  values_wheel: {
    primaryBehavior: "data_saving",
    dataSaving: {
      dataSubtype: "assessment",
      targetTable: "widget_data",
      supportsTags: true,
    },
    chatPrompt: {
      promptMode: "dynamic",
    },
    supportsLLMRefresh: true,
  },
  mood_reframe: {
    primaryBehavior: "data_saving",
    dataSaving: {
      dataSubtype: "reframe",
      targetTable: "widget_data",
      supportsTags: true,
    },
    chatPrompt: {
      promptMode: "dynamic",
    },
    supportsLLMRefresh: true,
  },
  obstacle_reframe: {
    primaryBehavior: "data_saving",
    dataSaving: {
      dataSubtype: "reframe",
      targetTable: "widget_data",
      supportsTags: true,
    },
    chatPrompt: {
      promptMode: "dynamic",
    },
    supportsLLMRefresh: true,
  },
  cognitive_distortion: {
    primaryBehavior: "data_saving",
    dataSaving: {
      dataSubtype: "reframe",
      targetTable: "widget_data",
      supportsTags: true,
    },
    chatPrompt: {
      promptMode: "dynamic",
    },
    supportsLLMRefresh: true,
  },

  // ── Type 3: Prompt-to-Chat ──
  feeling_picker: {
    primaryBehavior: "prompt_to_chat",
    dataSaving: {
      dataSubtype: "mood_log",
      targetTable: "mood_logs",
      supportsTags: true,
    },
    chatPrompt: {
      promptMode: "dynamic",
    },
    supportsLLMRefresh: false,
  },
  quick_prompt: {
    primaryBehavior: "prompt_to_chat",
    chatPrompt: {
      promptMode: "static",
    },
    supportsLLMRefresh: false,
  },
};

/** Helper to check if a widget saves data */
export function widgetSavesData(widgetType: WidgetType): boolean {
  return !!WIDGET_REGISTRY[widgetType]?.dataSaving;
}

/** Helper to check if a widget can prompt chat */
export function widgetPromptsChat(widgetType: WidgetType): boolean {
  return !!WIDGET_REGISTRY[widgetType]?.chatPrompt;
}
