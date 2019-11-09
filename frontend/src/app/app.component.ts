import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  targetLanguage = 'de';
  translatedText;
  sourceText;

  translate() {
    this.translatedText = `${this.sourceText} in ${this.targetLanguage}`;
  }
}
