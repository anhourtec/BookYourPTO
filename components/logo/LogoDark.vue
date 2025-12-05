<template>
  <svg 
    viewBox="0 0 120 120" 
    xmlns="http://www.w3.org/2000/svg"
    class="logo-icon"
  >
    <!-- Dark background -->
    <rect x="0" y="0" width="120" height="120" rx="28" fill="#1e293b"/>

    <!-- Calendar outline -->
    <rect 
      x="28" y="32" width="64" height="52" rx="10" 
      stroke="#60a5fa" stroke-width="5" fill="none"
    />

    <!-- Rings -->
    <line x1="45" y1="32" x2="45" y2="22" stroke="#60a5fa" stroke-width="5" stroke-linecap="round"/>
    <line x1="75" y1="32" x2="75" y2="22" stroke="#60a5fa" stroke-width="5" stroke-linecap="round"/>

    <!-- Checkmark -->
    <path 
      d="M45 62 L58 74 L78 50" 
      stroke="#60a5fa" stroke-width="6" fill="none" 
      stroke-linecap="round" stroke-linejoin="round"
      class="checkmark"
    />

    <!-- Planning flow curve -->
    <path 
      d="M25 95 Q60 108 95 85" 
      stroke="#3b82f6" stroke-width="4" fill="none" opacity="0.5"
      class="flow-curve"
    />
  </svg>
</template>


<style scoped>
.logo-icon {
  transition: transform 0.3s ease;
}

.logo-icon:hover {
  transform: scale(1.05);
}

/* Subtle animations on hover */
.logo-icon:hover .checkmark {
  animation: checkDraw 0.6s ease forwards;
}

.logo-icon:hover .flow-curve {
  animation: flowMove 2s ease infinite;
}

@keyframes checkDraw {
  from {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
  }
  to {
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
  }
}

@keyframes flowMove {
  0%, 100% {
    opacity: 0.3;
    transform: translateX(0);
  }
  50% {
    opacity: 0.6;
    transform: translateX(2px);
  }
}
</style>