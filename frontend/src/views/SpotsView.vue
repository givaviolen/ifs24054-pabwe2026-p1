<script setup>
import FilterBar from "../components/FilterBar.vue";
import SpotCard from "../components/SpotCard.vue";
import MapView from "../components/MapView.vue";
import { filters, spots, loading, kabupatenList, filtersActive, resetFilters } from "../composables/useSpots";
import { go } from "../composables/useRoute";

defineProps({ mode: { type: String, default: "list" } }); // list | map

// Menerapkan perubahan filter ke state bersama; watcher di useSpots akan memuat ulang data.
const updateFilters = (value) => Object.assign(filters, value);
const openDetail = (id) => go(`/pantai/${id}`);
</script>

<template>
  <section>
    <h1>{{ mode === "map" ? "Peta Status Pantai" : "Daftar Pantai" }}</h1>
    <p class="muted">
      {{ mode === "map"
        ? "Warna penanda menunjukkan status kelayakan berenang tiap pantai."
        : "Informasi kondisi pesisir yang diperbarui petugas lapangan." }}
    </p>

    <FilterBar :model-value="filters" :kabupaten-list="kabupatenList" @update:model-value="updateFilters" />

    <p class="count muted">
      <template v-if="loading">Memuat…</template>
      <template v-else>Menampilkan {{ spots.length }} pantai</template>
      <button v-if="filtersActive" type="button" class="reset" @click="resetFilters">Reset filter</button>
    </p>

    <MapView v-if="mode === 'map'" :spots="spots" @select="openDetail" />
    <template v-else>
      <p v-if="!loading && !spots.length" class="muted">Tidak ada pantai yang cocok dengan filter.</p>
      <div class="grid">
        <SpotCard v-for="s in spots" :key="s.id" :spot="s" @select="openDetail" />
      </div>
    </template>
  </section>
</template>

<style scoped>
.count { display: flex; align-items: center; gap: 12px; margin: 0 0 12px; }
.reset { background: transparent; color: var(--primary); border: 1px solid var(--primary); padding: 3px 10px; font-size: .85rem; }
</style>
