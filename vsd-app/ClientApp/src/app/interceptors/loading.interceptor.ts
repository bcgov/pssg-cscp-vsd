import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, finalize } from 'rxjs';

type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE' | 'HEAD';

interface DrrRequest {
  url: RegExp;
  methods?: HttpMethod[];
}

const includedURLs: DrrRequest[] = [
  {
    url: /\/api\/.+/
  }
];

const excludedURLs: DrrRequest[] = [];

const matchRequest =
  (request: HttpRequest<any>) =>
  ({ url: regexp, methods }: DrrRequest) =>
    regexp.test(request.url) && (!methods || methods.some((method) => method === request.method));

let requestsInProgressCount = 0;

export const LoadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const isIncluded = includedURLs.some(matchRequest(req));
  const isExcluded = excludedURLs.some(matchRequest(req));

  if (isExcluded || !isIncluded) {
    return next(req);
  }

  const ngxSpinner = inject(NgxSpinnerService);
  ngxSpinner.show('loadingSpinner');
  requestsInProgressCount++;

  return next(req).pipe(
    finalize(() => {
      requestsInProgressCount--;
      if (requestsInProgressCount <= 0) {
        ngxSpinner.hide('loadingSpinner');
      }
    })
  );
};
