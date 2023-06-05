import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class SpinnerComponent implements OnInit {
  loading$!: Observable<boolean>;
  imageNumber: number = 1;//this.getRandomNumber(1, 13);

  constructor(public loader: LoadingService) { 
  }

  async ngOnInit() {
    this.loading$ = this.loader.loading$;
  }

  getRandomNumber(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }
}