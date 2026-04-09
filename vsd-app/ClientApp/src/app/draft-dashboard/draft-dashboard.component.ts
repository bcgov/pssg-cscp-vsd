import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { ApplicationDraftsService } from '../../api/application-drafts/application-drafts.service';
import { LoginService } from '../services/login.service';

/** Maps DraftType int values to human-readable labels. */
const DRAFT_TYPE_LABELS: Record<number, string> = {
  100000000: 'Invoice',
  100000001: 'Victim Application',
  100000002: 'Witness Application',
  100000003: 'Family Member Application'
};

/** Maps DraftType int values to the route used to edit that type. */
const DRAFT_TYPE_ROUTES: Record<number, string> = {
  100000000: '/submit-invoice',
  100000001: '/application/victim',
  100000002: '/application/witness',
  100000003: '/application/ifm'
};

export interface DraftSummary {
  id: string;
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
    private authService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService
      .checkAuth()
      .pipe(first())
      .subscribe((response) => {
        if (!response?.isAuthenticated) {
          this.authService.authorize();
          return;
        }

        this.authService
          .getUserName()
          .pipe(first())
          .subscribe((username) => {
            this.username = username;
          });

        this.loadDrafts();
      });
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
          this.authService.logOff();
          return;
        }
        this.errorMessage = err?.error?.error ?? 'Failed to load drafts.';
      }
    });
  }

  getDraftTypeLabel(type: number): string {
    return DRAFT_TYPE_LABELS[type] ?? `Unknown (${type})`;
  }

  openDraft(draft: DraftSummary): void {
    const route = DRAFT_TYPE_ROUTES[draft.draftType];
    if (route) {
      this.router.navigate([route], { queryParams: { draftId: draft.id } });
    }
  }

  deleteDraft(draft: DraftSummary): void {
    const rawDate = draft.draftedDate ?? draft.createdOn;
    const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('en-CA') : '';
    if (!confirm(`Cancel ${this.getDraftTypeLabel(draft.draftType)} draft from ${formattedDate}?`)) return;

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
