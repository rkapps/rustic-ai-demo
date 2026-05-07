export interface UsageStats {
    input_tokens: number;
    cached_read_tokens: number;
    cached_write_tokens: number;
    output_tokens: number;
    total_tokens: number;
}

export interface ConversationUsage {
    id: string;
    conversation_type: string;
    title: string;
    llm: string;
    model: string;
    created_at?: string;
    usage: UsageStats;
    input_tokens_cost: number;
    cached_read_tokens_cost: number;
    cached_write_tokens_cost: number;
    output_tokens_cost: number;
    total_tokens_cost: number;
}

export interface TurnUsage {
    id: string;
    conversation_id: string;
    sequence: number;
    user_prompt?: string;
    created_at?: string;
    usage: UsageStats;
    input_tokens_cost: number;
    cached_read_tokens_cost: number;
    cached_write_tokens_cost: number;
    output_tokens_cost: number;
    total_tokens_cost: number;
}
