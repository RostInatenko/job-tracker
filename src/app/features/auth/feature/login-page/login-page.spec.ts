import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthTokenService } from '../../../../core/auth/auth-token.service';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  function render() {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const demoButton = root.querySelector<HTMLButtonElement>('button[type="button"]')!;
    return { fixture, root, demoButton };
  }

  it('starts a demo session and opens the board', () => {
    const { demoButton } = render();

    demoButton.click();
    const req = http.expectOne((r) => r.url.endsWith('/auth/demo'));
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ accessToken: 'demo-token' });

    expect(TestBed.inject(AuthTokenService).accessToken()).toBe('demo-token');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('disables the buttons and shows progress while the demo starts', () => {
    const { fixture, root, demoButton } = render();

    demoButton.click();
    fixture.detectChanges();

    expect(demoButton.disabled).toBe(true);
    expect(demoButton.textContent).toContain('Starting demo');
    expect(root.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
    http.expectOne((r) => r.url.endsWith('/auth/demo'));
  });

  it('shows an error and re-enables the buttons when the demo is unavailable', () => {
    const { fixture, root, demoButton } = render();

    demoButton.click();
    http
      .expectOne((r) => r.url.endsWith('/auth/demo'))
      .flush(null, { status: 503, statusText: 'Service Unavailable' });
    fixture.detectChanges();

    expect(root.textContent).toContain('The demo is unavailable right now');
    expect(demoButton.disabled).toBe(false);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
