export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    response_id: string;
}

export interface Chat {
    id: string;
    llm: string;
    model: string;
    title: string;
    system_prompt: string | null;
    prompt: string;
    messages: ChatMessage[],
    stream: boolean;
    // constructor(data: any) {
    //     Object.assign(this, data);
    // }
}


export interface ChatStreamingMessage {
    id: string,
    user_content: string,
    assistant_content: string,
    response_id: string
}


export interface ChatRequest {
    id: string;
    prompt: string;
    previous_response_id: string;
}

export interface Turn {
    id: string;
    uid: string;
    conversation_id: string;
    sequence: number;
    user_prompt: string;
    response_content: string;
    response_id: string | null;
}

export interface ConversationRequest {
    conversation_type: 'chat' | 'agent';
    title?: string;
    template_id?: string;
    system_prompt?: string;
    agent_id?: string;
    llm: string;
    model: string;
    stream: boolean;
}

export interface ChatChunkReponse {
    content: string;
    though: string;
    response_id: string;
    is_final : boolean;
}
