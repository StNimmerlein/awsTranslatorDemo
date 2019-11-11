import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  targetLanguage = 'de';
  translatedText: string;
  audioUrl: string;
  sourceText: string;
  supportedLanguages = [
    {code: 'de', name: 'German'},
    {code: 'en', name: 'English'},
    {code: 'fr', name: 'French'},
    {code: 'it', name: 'Italian'},
    {code: 'es', name: 'Spanish'},
    {code: 'da', name: 'Danish'},
    {code: 'nl', name: 'Dutch'},
    {code: 'ja', name: 'Japanese'},
    {code: 'ko', name: 'Korean'},
    {code: 'nb', name: 'Norse'},
    {code: 'pl', name: 'Polish'},
    {code: 'pt', name: 'Portuguese'},
    {code: 'ro', name: 'Romanian'},
    {code: 'sv', name: 'Swedish'},
    {code: 'ru', name: 'Russian'},
    {code: 'tr', name: 'Turkish'},
    {code: 'hi', name: 'Hindu'}
  ];
  audio: HTMLAudioElement;
  audioIsPlaying = false;

  private baseApiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {
    this.audio = new Audio();
    this.audio.onended = () => this.audioIsPlaying = false;
  }

  async translate() {
    try {
      const translation = await this.httpClient.get<any>(`${this.baseApiUrl}/${this.targetLanguage}?text=${this.sourceText}`).toPromise();
      this.translatedText = translation.translatedMessage;
      this.audioUrl = translation.audioUrl;
      this.playAudio();
    } catch (e) {
      this.translatedText = 'An error occurred. Please contact me to find the root of the problem.';
      this.audioUrl = undefined;
    }
  }

  playAudio() {
    if (!this.audioUrl) {
      return;
    }
    this.audioIsPlaying = true;
    this.audio.src = this.audioUrl;
    this.audio.play();
  }
}
