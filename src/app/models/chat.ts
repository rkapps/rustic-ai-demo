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
    system: string;
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

export interface ChatChunkReponse {
    content: string;
    though: string;
    response_id: string;
    is_final : boolean;
}
