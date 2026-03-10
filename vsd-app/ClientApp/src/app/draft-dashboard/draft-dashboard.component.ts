import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDraftsService } from '../../api/application-drafts/application-drafts.service';
import { LocalAuthService } from '../services/local-auth.service';

/** Maps DraftType int values to human-readable labels. */
const DRAFT_TYPE_LABELS: Record<number, string> = {
  100000000: 'Invoice',
  100000001: 'Victim Application',
  100000002: 'Witness Application',
  100000003: 'Family Member Application'
};

export interface DraftSummary {
  id: string;
  name: string;
  draftType: number;
  draftedDate: string;
  createdOn: string;
  modifiedOn: string;
  stateCode: number;
}

@Component({
  selector: 'app-draft-dashboard',
  templateUrl: './draft-dashboard.component.html',
  styleUrls: ['./draft-dashboard.component.scss'],
  standalone: false
})
export class DraftDashboardComponent implements OnInit {
  drafts: DraftSummary[] = [];
  loading = true;
  errorMessage = '';
  username: string | null = null;

  constructor(
    private draftsService: ApplicationDraftsService,
    private authService: LocalAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.loadDrafts();
  }

  loadDrafts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.draftsService.getApiApplicationDrafts<DraftSummary[]>().subscribe({
      next: (drafts) => {
        this.drafts = drafts ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.authService.logout();
          return;
        }
        this.errorMessage = err?.error?.error ?? 'Failed to load drafts.';
      }
    });
  }

  getDraftTypeLabel(type: number): string {
    return DRAFT_TYPE_LABELS[type] ?? `Unknown (${type})`;
  }

  deleteDraft(draft: DraftSummary): void {
    if (!confirm(`Cancel draft "${draft.name || draft.id}"?`)) return;

    this.draftsService.deleteApiApplicationDraftsDraftId(draft.id).subscribe({
      next: () => {
        this.drafts = this.drafts.filter((d) => d.id !== draft.id);
      },
      error: (err) => {
        this.errorMessage = err?.error?.error ?? 'Failed to cancel draft.';
      }
    });
  }
}
