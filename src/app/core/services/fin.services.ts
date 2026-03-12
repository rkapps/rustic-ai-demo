import { Injectable, inject } from '@angular/core';
import { BaseHttpService } from './base-http.services';
import { map, Observable } from 'rxjs';
import { ChatMessage } from '../../../../../libs/ngx-twang-ui-repo/dist/ngx-twang-ui/types/ngx-twang-ui';
import { ChatRequest } from '../../models/chat';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FinService extends BaseHttpService {

    baseUrl = environment.finTrackerUrl;

    runStockAnalysis(request: ChatRequest): Observable<ChatMessage>{
        return this.post('/tickers/analyse', request)
    }

}