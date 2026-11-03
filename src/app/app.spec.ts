import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { AuthTokenService } from './core/auth/auth-token.service';

function demoToken(): string {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '');
  return `${encode({ alg: 'HS256' })}.${encode({ sub: 3, demo: true })}.signature`;
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the app title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Job Application Tracker');
  });

  it('does not show the demo banner to a regular session', () => {
    TestBed.inject(AuthTokenService).setAccessToken('header.eyJzdWIiOjN9.signature');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain("You're in the demo");
  });

  it('shows the demo banner during a demo session', () => {
    TestBed.inject(AuthTokenService).setAccessToken(demoToken());
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain("You're in the demo");
  });

  it('logs the guest out and opens registration from the banner', () => {
    TestBed.inject(AuthTokenService).setAccessToken(demoToken());
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const button = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === 'Create an account',
    );
    button!.click();
    http.expectOne((request) => request.url.endsWith('/auth/logout')).flush(null);

    expect(TestBed.inject(AuthTokenService).accessToken()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });
});
