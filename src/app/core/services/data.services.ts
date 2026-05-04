import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Chat, ChatChunkReponse, ChatMessage, ChatStreamingMessage, ConversationRequest, Turn } from "../../models/chat";
import { ChatTemplate } from "../../models/chat-template";
import { catchError, map, Observable, throwError } from "rxjs";
import { LlmProvider } from "../../models/llm_provider";
import { SseClient } from 'ngx-sse-client';
import { BaseHttpService } from "./base-http.services";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class DataService extends BaseHttpService {

    private sseClient = inject(SseClient);
    baseUrl = environment.chatUrl;


    getChats() {
        return this.get<Chat[]>('/conversations');
    }

    getChatDetails(chat_id: string) {
        return this.get<Chat>(`/conversations/${chat_id}`);
    }

    deleteChat(chat_id: string) {
        return this.delete<void>(`/conversations/${chat_id}`);
    }

    getLlmProviders() {
        return this.get<LlmProvider[]>('/llm-providers');
    }

    getChatTemplates() {
        return this.get<ChatTemplate[]>('/chat-templates');
    }

    getTurns(id: string) {
        return this.get<Turn[]>(`/conversations/${id}/turns`);
    }

    createConversation(data: ConversationRequest): Observable<Chat> {
        return this.http.post<Chat>(this.baseUrl + '/conversations', data).pipe(
            catchError(this.handleError)
        );
    }

    chatCompletion(id: string, prompt: string): Observable<ChatMessage> {
        return this.http.post<ChatMessage>(this.baseUrl + `/conversations/${id}/turns`, { prompt }).pipe(
            catchError(this.handleError)
        );
    }

    chatCompletionStream(id: string, prompt: string): Observable<ChatChunkReponse> {
        const url = this.baseUrl + `/conversations/${id}/turns/stream`;
        return this.sseClient.stream(url, { keepAlive: false }, { body: { prompt } }, 'POST').pipe(
            map(event => {
                if (event instanceof MessageEvent) {
                    try {
                        return JSON.parse(event.data) as ChatChunkReponse;
                    } catch (e) {
                        console.error('JSON parse error:', e, event.data);
                        throw new Error(`Invalid JSON: ${event.data}`);
                    }
                } else {
                    throw new Error('Unexpected event type');
                }
            }),
            catchError(this.handleError)
        );
    }

    analyseTickersStreaming(data: { llm: string; model: string; prompt: string; prev_response_id?: string }): Observable<ChatChunkReponse> {
        const url = environment.financeUrl + '/tickers/analyse_streaming';
        return this.sseClient.stream(url, { keepAlive: false }, { body: data }, 'POST').pipe(
            map(event => {
                if (event instanceof MessageEvent) {
                    try {
                        return JSON.parse(event.data) as ChatChunkReponse;
                    } catch (e) {
                        throw new Error(`Invalid JSON: ${event.data}`);
                    }
                } else {
                    throw new Error('Unexpected event type');
                }
            }),
            catchError(this.handleError)
        );
    }

    saveChatStreamingMessage(message: ChatStreamingMessage) {
        let url = this.baseUrl + '/chats/save_streaming_message';
        return this.http.post<any>(url, message).pipe(
            catchError(this.handleError) // Handle error locally          
        );

    }

    // private handleError(error: HttpErrorResponse) {
    //     let message: string = "";
    //     if (error.status === 0) {
    //         message = `Client-side error: ${error.error}`;
    //         // console.error('Client-side error:', error.error); // Network issue
    //     } else {
    //         message = `Backend return code ${error.status} - ${JSON.stringify(error.error)}`;
    //         // console.error(`Backend returned code ${error.status}:`, error.error);
    //     }

    //     // Return an observable with a user-facing error message
    //     return throwError(() => new Error(message));
    // }

}