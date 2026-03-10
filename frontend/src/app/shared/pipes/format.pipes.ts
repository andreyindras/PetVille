import { Pipe, PipeTransform, Directive, HostListener, ElementRef } from '@angular/core';

function digits(v: string): string { return v.replace(/\D/g, ''); }

function applyMaskCpf(d: string): string {
  d = d.slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}`;
}

function applyMaskPhone(d: string): string {
  d = d.slice(0, 11);
  if (d.length === 0)  return '';
  if (d.length <= 2)   return `(${d}`;
  if (d.length <= 7)   return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

@Pipe({ name: 'cpf', standalone: true })
export class CpfPipe implements PipeTransform {
  transform(v: string | null | undefined): string {
    if (!v) return '—';
    const d = digits(v);
    return d.length === 11 ? applyMaskCpf(d) : v;
  }
}

@Pipe({ name: 'telefone', standalone: true })
export class TelefonePipe implements PipeTransform {
  transform(v: string | null | undefined): string {
    if (!v) return '—';
    const d = digits(v);
    if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    return v;
  }
}

@Directive({ selector: 'input[cpfMask]', standalone: true })
export class CpfMaskDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    const inp = this.el.nativeElement;
    const masked = applyMaskCpf(digits(inp.value));
    if (inp.value !== masked) {
      inp.value = masked;
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

@Directive({ selector: 'input[phoneMask]', standalone: true })
export class PhoneMaskDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    const inp = this.el.nativeElement;
    const masked = applyMaskPhone(digits(inp.value));
    if (inp.value !== masked) {
      inp.value = masked;
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}