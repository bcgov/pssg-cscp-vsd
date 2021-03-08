import { BehaviorSubject } from "rxjs";

export class HeaderTitleService {
    title = new BehaviorSubject('Crime Victim Assistance Program');
  
    setTitle(title: string) {
      this.title.next(title);
    }
  }