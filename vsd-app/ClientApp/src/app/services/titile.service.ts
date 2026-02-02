import { BehaviorSubject } from 'rxjs';
import { Injectable } from "@angular/core";

@Injectable()
export class HeaderTitleService {
  title = new BehaviorSubject('Crime Victim Assistance Program');

  setTitle(title: string) {
    this.title.next(title);
  }
}
