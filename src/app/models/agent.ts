export interface Agent {
    id: string;
    name: string;
    description: string;
    system_prompt?: string | null;
    icon?: string;
    category?: string;
}
