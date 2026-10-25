// Gaya latar untuk foto di public/images/. Bila file tidak ada, ilustrasi bawaan (LakeScene) tetap tampil.
export const publicImageStyle = (name) => ({ backgroundImage: `url(/images/${name})` });
