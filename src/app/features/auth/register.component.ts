import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { RegisterRequest } from '../../shared/models/auth';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: [
    ".page-shell { display:flex; min-height:calc(100vh - 72px); align-items:center; justify-content:center; padding:2rem; }",
    ".card { width:100%; max-width:420px; padding:2rem; border-radius:16px; background:white; box-shadow:0 26px 60px rgba(16,24,40,.08); }",
    "h1 { margin:0 0 1.5rem; font-size:1.8rem; }",
    "label { display:block; margin-bottom:1rem; font-size:.95rem; color:#334155; }",
    "input { width:100%; margin-top:.5rem; padding:.9rem 1rem; border:1px solid #cbd5e1; border-radius:12px; font-size:1rem; }",
    ".actions { display:flex; gap:.75rem; align-items:center; margin-top:1rem; }",
    "button { flex:1; padding:.95rem 1.2rem; border:none; border-radius:12px; background:#3b82f6; color:white; font-weight:600; cursor:pointer; }",
    "button:disabled { opacity:.65; cursor:progress; }",
    "a { color:#475569; text-decoration:none; font-weight:600; }",
    ".message { margin-top:1rem; color:#0f766e; }",
    ".error { margin-top:1rem; color:#b91c1c; }"
  ]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  error = '';
  message = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.error = 'Please complete all fields correctly.';
      return;
    }

    this.error = '';
    this.loading = true;

    const payload = this.registerForm.getRawValue() as RegisterRequest;
    this.authService.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/students']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Unable to register. Please try again.';
        this.loading = false;
      }
    });
  }
}
