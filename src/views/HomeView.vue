<script setup>
import { ref, computed } from "vue";
import HeroSection from "../components/home/HeroSection.vue";
import ShowcaseSection from "../components/home/ShowcaseSection.vue";
import StatsSection from "../components/home/StatsSection.vue";
import AboutSection from "../components/home/AboutSection.vue";
import EducationSection from "../components/home/EducationSection.vue";
import { allSpots, apiError, loading, filters, resetFilters } from "../composables/useSpots";
import { go } from "../composables/useRoute";
import { summarizeSpots, showcaseSpots } from "../utils/spotStats";
import "../styles/home.css";

// Halaman ini hanya merakit section dan menyambungkannya ke data bersama.
const showcaseEl = ref(null);
const summary = computed(() => summarizeSpots(allSpots.value));
const showcase = computed(() => showcaseSpots(allSpots.value));

const scrollToShowcase = () => showcaseEl.value?.scrollIntoView({ behavior: "smooth", block: "start" });

// Tiap kolom edukasi membuka daftar/peta dengan filter yang relevan.
function openWithFilters(patch, path) {
  resetFilters();
  Object.assign(filters, patch);
  go(path);
}
</script>

<template>
  <div>
    <HeroSection @explore="scrollToShowcase" />
    <div ref="showcaseEl">
      <ShowcaseSection :spots="showcase" :loading="loading" :has-error="!!apiError" />
    </div>
    <StatsSection :summary="summary" />
    <AboutSection />
    <EducationSection @open="openWithFilters" />
  </div>
</template>
