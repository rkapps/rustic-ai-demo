import { Component, signal } from '@angular/core';
import { UsageTableComponent } from '../../components/common/usage-table/usage-table.component';
import { TwangDatepickerComponent } from '../../components/ui/twang-datepicker/twang-datepicker';

@Component({
    selector: 'app-usage',
    imports: [UsageTableComponent, TwangDatepickerComponent],
    templateUrl: './usage.component.html',
})
export default class UsageComponent {

    convType = signal<'all' | 'chat' | 'agent'>('all');
    llm = signal('all');
    startDate = signal('');
    endDate = signal('');
}
