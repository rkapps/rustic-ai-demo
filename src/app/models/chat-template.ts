export interface ChatTemplate {
    id: string;
    category: string;
    title: string;
    description: string;
    system_prompt: string | null;
    suggested_prompts: string[];
    recommended_llm: string;
    icon: string;
}
