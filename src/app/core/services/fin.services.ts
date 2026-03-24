import { Injectable, inject } from '@angular/core';
import { BaseHttpService } from './base-http.services';
import { catchError, map, Observable } from 'rxjs';
import { ChatMessage } from '../../../../../libs/ngx-twang-ui-repo/dist/ngx-twang-ui/types/ngx-twang-ui';
import { ChatRequest } from '../../models/chat';
import { environment } from '../../../environments/environment';
import { SseClient } from 'ngx-sse-client';

@Injectable({
    providedIn: 'root'
})
export class FinService extends BaseHttpService {

    private sseClient = inject(SseClient);
    baseUrl = environment.finTrackerUrl;

    runStockAnalysis(request: ChatRequest): Observable<ChatMessage>{
        return this.post('/tickers/analyse', request)
    }


     runStockAnalysisStreaming<T>(request: ChatRequest): Observable<T> {
    
            let url = this.baseUrl + '/tickers/analyse_streaming';
            return this.sseClient.stream(
                url,
                { keepAlive: false },
                { body: request },
                'POST'
            ).pipe(
                // Extract the data from the MessageEvent automatically
                map(event => {
                    // console.log(event);
                    if (event instanceof MessageEvent) {
                        try {
                            return JSON.parse(event.data) as T;
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
}