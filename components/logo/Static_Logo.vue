<template>
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <!-- Soft rounded background -->
  <rect x="0" y="0" width="120" height="120" rx="28" fill="#EEF5FF"/>

  <!-- Abstract calendar outline -->
  <rect x="28" y="32" width="64" height="52" rx="10" stroke="#3b82f6" stroke-width="5" fill="none"/>

  <!-- Rings -->
  <line x1="45" y1="32" x2="45" y2="22" stroke="#3b82f6" stroke-width="5" stroke-linecap="round"/>
  <line x1="75" y1="32" x2="75" y2="22" stroke="#3b82f6" stroke-width="5" stroke-linecap="round"/>

  <!-- Checkmark -->
  <path d="M45 62 L58 74 L78 50" stroke="#3b82f6" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Planning flow curve -->
  <path d="M25 95 Q60 108 95 85" stroke="#60a5fa" stroke-width="4" fill="none" opacity="0.5"/>
</svg>

</template>