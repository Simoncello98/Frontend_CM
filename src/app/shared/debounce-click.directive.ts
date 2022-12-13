import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[appDebounceClick]'
})
export class DebounceClickDirective implements OnInit, OnDestroy {
  @Input() debounceTime = 1200;
  @Output() debounceClick = new EventEmitter();
  private clicks = new Subject();
  private subscription: Subscription;
  private canAccept : boolean = true;

  constructor() { }

  ngOnInit() {
    this.subscription = this.clicks.pipe().subscribe(e => {
      if(this.canAccept){
        this.debounceClick.emit(e);
        this.canAccept = false;
        setInterval(() => {
          this.canAccept = true;
        }, this.debounceTime)
      }
    });  
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  clickEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    this.clicks.next(event);
  }
}