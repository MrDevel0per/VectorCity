// Minimal event bus for decoupled systems
export const Events={
  listeners:{},
  on(n,f){(this.listeners[n] ||= []).push(f);},
  emit(n,d){(this.listeners[n]||[]).forEach(fn=>fn(d));}
};