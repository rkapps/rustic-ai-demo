import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, computed, signal } from '@angular/core';

import type { TwangTableFooterCell, TwangTableSplitCell } from '../twang-table/twang-table';
import type { TwangTreeTableColumn, TwangTreeTableNode } from './twang-tree-table.models';

/** Internal flat row fed to `@for` in the template. */
export interface TwangTreeFlatRow<T> {
  node: TwangTreeTableNode<T>;
  /** `node.data` for leaf rows; `node.summary` for summary rows. */
  rowData: T;
  isLeaf: boolean;
  hasChildren: boolean;
}

@Component({
  selector: 'twang-tree-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './twang-tree-table.html',
  styleUrl: './twang-tree-table.css',
})
export class TwangTreeTableComponent<T extends object> implements OnChanges {
  private readonly nodesInput = signal<TwangTreeTableNode<T>[]>([]);
  private readonly collapsedIds = signal(new Set<string>());

  @Input({ required: true })
  set nodes(value: TwangTreeTableNode<T>[]) {
    this.nodesInput.set(value ?? []);
  }

  @Input({ required: true }) columns: TwangTreeTableColumn<T>[] = [];
  @Input() footer: TwangTableFooterCell[] | null = null;
  @Input() emptyMessage = 'No data.';
  @Input() tableMinWidthClass = 'min-w-[980px]';
  @Input() fillContainerWidth = false;
  @Input() scrollPanelMaxHeight = '';
  @Input() scrollPanelMinHeight = '';
  /**
   * Nodes at depth ≤ this value start expanded; deeper nodes start collapsed.
   * Default `0` = only root-level (depth-0) nodes are expanded on first render.
   * Pass `Infinity` to expand everything.
   */
  @Input() initialExpandedDepth = 0;
  /** When true, the first root node is always expanded on init regardless of initialExpandedDepth. */
  @Input() initialExpandedFirstNode = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes'] || changes['initialExpandedDepth'] || changes['initialExpandedFirstNode']) {
      this.initCollapsedState(this.nodesInput());
    }
  }

  private initCollapsedState(nodes: TwangTreeTableNode<T>[]): void {
    const collapsed = new Set<string>();
    const walk = (list: TwangTreeTableNode<T>[]) => {
      for (const node of list) {
        if (node.children?.length) {
          if (node.depth > this.initialExpandedDepth) {
            collapsed.add(node.id);
          }
          walk(node.children);
        }
      }
    };
    walk(nodes);
    if (this.initialExpandedFirstNode) {
      for (const node of nodes) {
        collapsed.delete(node.id);
      }
    }
    this.collapsedIds.set(collapsed);
  }

  // ---------------------------------------------------------------------------
  // Visible rows (recomputed when tree or collapsed set changes)
  // ---------------------------------------------------------------------------

  protected readonly visibleRows = computed<TwangTreeFlatRow<T>[]>(() => {
    const collapsed = this.collapsedIds();
    const result: TwangTreeFlatRow<T>[] = [];

    const visit = (list: TwangTreeTableNode<T>[]) => {
      for (const node of list) {
        const isLeaf = !node.children?.length;
        const rowData = (isLeaf ? node.data : node.summary) as T;
        if (rowData == null) continue;
        result.push({ node, rowData, isLeaf, hasChildren: !isLeaf });
        if (!isLeaf && !collapsed.has(node.id)) {
          visit(node.children!);
        }
      }
    };

    visit(this.nodesInput());
    return result;
  });

  // ---------------------------------------------------------------------------
  // Expand / collapse
  // ---------------------------------------------------------------------------

  protected isExpanded(nodeId: string): boolean {
    return !this.collapsedIds().has(nodeId);
  }

  expandAll(): void {
    this.collapsedIds.set(new Set());
  }

  collapseAll(): void {
    this.initCollapsedState(this.nodesInput());
  }

  protected toggle(nodeId: string): void {
    const next = new Set(this.collapsedIds());
    if (next.has(nodeId)) {
      next.delete(nodeId);
    } else {
      next.add(nodeId);
    }
    this.collapsedIds.set(next);
  }

  // ---------------------------------------------------------------------------
  // Column helpers (mirror TwangTableComponent)
  // ---------------------------------------------------------------------------

  protected getCellClass(col: TwangTreeTableColumn<T>, row: T): string {
    const c = col.cellClass;
    return typeof c === 'function' ? c(row) : (c ?? '');
  }

  protected isActionCell(col: TwangTreeTableColumn<T>, row: T): boolean {
    if (typeof col.isAction === 'function') return col.isAction(row);
    return Boolean(col.isAction);
  }

  protected getActionClass(col: TwangTreeTableColumn<T>, row: T): string {
    const c = col.actionClass;
    return typeof c === 'function' ? c(row) : (c ?? '');
  }

  protected displayValue(col: TwangTreeTableColumn<T>, row: T): string {
    const v = col.value(row);
    if (col.format) return col.format(v, row);
    if (col.emptyAsBlank && (v == null || String(v).trim() === '')) return '';
    return String(v ?? '');
  }

  protected splitCellValue(col: TwangTreeTableColumn<T>, row: T): TwangTableSplitCell | null {
    return col.splitCell ? col.splitCell(row) : null;
  }

  // ---------------------------------------------------------------------------
  // Row / depth styling
  // ---------------------------------------------------------------------------

  /**
   * Returns a static CSS class for summary-row depth backgrounds.
   * d0 = darkest (group), d1 = medium (category), d2+ = lightest (parent account).
   */
  protected summaryDepthClass(depth: number): string {
    if (depth === 0) return 'twang-tree-row-d0';
    if (depth === 1) return 'twang-tree-row-d1';
    return 'twang-tree-row-d2';
  }

  protected effectiveScrollPanelMinHeight(): string | null {
    const explicit = this.scrollPanelMinHeight?.trim();
    if (explicit) return explicit;
    return this.scrollPanelMaxHeight?.trim() ? '14rem' : null;
  }
}
