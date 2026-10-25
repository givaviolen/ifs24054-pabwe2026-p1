<script setup>
import { computed, ref } from "vue";
import StatusBadge from "../common/StatusBadge.vue";
import { timeAgo } from "../../utils/date";
import { spotPhoto } from "../../data/spotPhotos";

const props = defineProps({ spot: { type: Object, required: true } });
const emit = defineEmits(["select"]);

const ago = computed(() => timeAgo(props.spot.kondisi_updated_at));
const photo = ref(spotPhoto(props.spot)); // jadi null otomatis bila file foto tidak ditemukan
</script>

<template>
  <article class="card spot" :class="spot.current_status.toLowerCase()">
    <img v-if="photo" :src="photo" :alt="`Foto ${spot.nama_pantai}`" class="thumb" loading="lazy"
         @error="photo = null" />

    <div class="body">
      <div class="top">
        <h3>
          <a class="title-link" :href="`/pantai/${spot.id}`"
             :aria-label="`Lihat detail ${spot.nama_pantai}`"
             @click.prevent="emit('select', spot.id)">{{ spot.nama_pantai }}</a>
        </h3>
        <StatusBadge :status="spot.current_status" />
      </div>
      <p class="muted kab">📍 Kabupaten {{ spot.kabupaten }}</p>

      <div class="chips">
        <span class="chip">🌊 {{ spot.kedalaman_avg ?? "-" }} m</span>
        <span class="chip" :class="spot.is_ramah_anak ? 'ok' : 'warn'">
          {{ spot.is_ramah_anak ? "👶 Ramah anak" : "⚠️ Kurang cocok untuk anak" }}
        </span>
        <span class="chip" :class="spot.ada_pelampung ? 'ok' : ''">
          {{ spot.ada_pelampung ? "🛟 Ada pelampung" : "Tanpa pelampung" }}
        </span>
      </div>

      <p v-if="spot.kondisi_updated_at" class="cond">
        🌿 Eceng gondok: <b>{{ spot.kondisi_eceng_gondok }}</b> · 〰️ Ombak: <b>{{ spot.tinggi_ombak }}</b>
        <span class="ago">Diperbarui {{ ago }}</span>
      </p>
      <p v-else class="muted">Belum ada laporan harian.</p>
    </div>
  </article>
</template>

<style scoped>
.spot {
  cursor: pointer; position: relative; overflow: hidden; padding: 0;
  transition: box-shadow .15s, transform .15s;
}
.spot::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 6px; background: var(--aman); z-index: 1; }
.spot.waspada::before { background: var(--waspada); }
.spot.bahaya::before { background: var(--bahaya); }
.title-link { color: inherit; text-decoration: none; }
.title-link::after { content: ""; position: absolute; inset: 0; z-index: 2; }
.spot:hover, .spot:focus-within { box-shadow: 0 10px 26px rgba(0, 0, 0, .18); transform: translateY(-2px); }

.thumb { display: block; width: 100%; height: 150px; object-fit: cover; }
.body { padding: 16px 18px 16px 24px; }

.top { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; }
h3 { font-size: 1.05rem; }
.kab { margin: 2px 0 10px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.chip { font-size: .76rem; padding: 3px 10px; border-radius: 999px; background: #eef4f7; color: #35505d; }
.chip.ok { background: #dff3e7; color: #17653c; }
.chip.warn { background: #fff1c9; color: #7a5600; }
.cond { margin: 0; font-size: .85rem; line-height: 1.6; }
.ago { display: block; color: var(--muted); font-size: .76rem; }
</style>