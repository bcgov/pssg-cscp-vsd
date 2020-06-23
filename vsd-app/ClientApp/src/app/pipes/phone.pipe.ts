import { Pipe } from "@angular/core";

@Pipe({
    name: "phone"
})
export class PhonePipe {
    transform(rawNum: string) {
        if (rawNum && rawNum.length >= 6)
            return "(" + rawNum.slice(0, 3) + ") " + rawNum.slice(3, 6) + "-" + rawNum.slice(6);
        else
            return rawNum;
    }
}