export type Theme = 'light' | 'dark';

// Declaración para el widget de Gecko
declare global {
    interface HTMLElementTagNameMap {
        'gecko-coin-ticker-widget': HTMLElement;
    }
}