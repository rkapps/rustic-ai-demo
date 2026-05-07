import { Component, signal } from '@angular/core';
import { UsageTableComponent } from '../../components/common/usage-table/usage-table.component';
import { TwangDatepickerComponent } from '../../components/ui/twang-datepicker/twang-datepicker';
import { TwangButtonComponent } from '../../components/ui/twang-button/twang-button';

@Component({
    selector: 'app-usage',
    imports: [UsageTableComponent, TwangDatepickerComponent, TwangButtonComponent],
    templateUrl: './usage.component.html',
})
export default class UsageComponent {

    panelOpen = signal(true);
    showTable = signal(true);
    convType = signal<'all' | 'chat' | 'agent'>('all');
    llm = signal('all');
    startDate = signal((() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    })());
    endDate = signal('');
}
