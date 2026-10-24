<script setup>
import FilterBar from "../components/FilterBar.vue";
import SpotCard from "../components/SpotCard.vue";
import MapView from "../components/MapView.vue";
import {
  filters, spots, sortedSpots, sortBy, loading, apiError, kabupatenList, filtersActive, resetFilters,
} from "../composables/useSpots";
import { go } from "../composables/useRoute";

defineProps({ mode: { type: String, default: "list" } }); // list | map

// Menerapkan perubahan filter ke state bersama; watcher di useSpots akan memuat ulang data.
const updateFilters = (value) => Object.assign(filters, value);
const openDetail = (id) => go(`/pantai/${id}`);
const setSort = (v) => { sortBy.value = v; };
</script>

<template>
  <section>
    <h1>{{ mode === "map" ? "Peta Status Pantai" : "Daftar Pantai" }}</h1>
    <p class="muted">
      {{ mode === "map"
        ? "Warna penanda menunjukkan status kelayakan berenang tiap pantai."
        : "Informasi kondisi pesisir yang diperbarui petugas lapangan." }}
    </p>

    <FilterBar :model-value="filters" :kabupaten-list="kabupatenList"
               :sort="mode === 'list' ? sortBy : undefined"
               @update:model-value="updateFilters" @update:sort="setSort" />

    <p class="count muted">
      <template v-if="loading">Memuat…</template>
      <template v-else>Menampilkan {{ spots.length }} pantai</template>
      <button v-if="filtersActive" type="button" class="reset" @click="resetFilters">Reset filter</button>
    </p>

    <MapView v-if="mode === 'map'" :spots="spots" @select="openDetail" />
    <template v-else>
      <div v-if="loading && !spots.length" class="grid" aria-busy="true">
        <div v-for="n in 6" :key="n" class="card skeleton"></div>
      </div>
      <div v-else-if="!spots.length" class="empty card">
        <template v-if="apiError">
          <strong>Data pantai belum dapat dimuat.</strong>
          <span class="muted">Gunakan tombol “Coba lagi” pada pesan di bawah layar.</span>
        </template>
        <template v-else>
          <strong>Tidak ada pantai yang cocok.</strong>
          <span class="muted">Ubah kata kunci atau longgarkan filter.</span>
          <button v-if="filtersActive" type="button" @click="resetFilters">Reset filter</button>
        </template>
      </div>
      <div v-else class="grid">
        <SpotCard v-for="s in sortedSpots" :key="s.id" :spot="s" @select="openDetail" />
      </div>
    </template>
  </section>
</template>

<style scoped>
.count { display: flex; align-items: center; gap: 12px; margin: 0 0 12px; }
.reset { background: transparent; color: var(--accent); border: 1px solid var(--accent); padding: 4px 14px; font-size: .8rem; }
.empty { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; padding: 28px; }
.skeleton { height: 210px; }
</style>
