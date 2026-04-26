export interface ChatTemplate {
    id: string;
    category: string;
    label: string;
    description: string;
    system_prompt: string | null;
    suggested_prompts: string[];
    tools: string[];
    template_type: string;
    recommended_llm: string;
    icon: string;
}
