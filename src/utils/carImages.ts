import React from 'react';

/**
 * Static fallback mappings in case dynamic or external images fail or are missing.
 * Every car has its exact photorealistic matched asset.
 */
export const CAR_STATIC_IMAGE_FALLBACKS: Record<string, string> = {
  'nissan-gtr-r34': '/images/car_jdm_skyline_1791565547737.jpg',
  'toyota-supra-mk4': '/images/car_toyota_supra_1791565602913.jpg',
  'mazda-rx7-spirit-r': '/images/mazda_rx7_spirit_1791833224196.jpg',
  'honda-nsx-r': '/images/honda_nsxr_na2_1791833262577.jpg',
  'subaru-impreza-22b': '/images/subaru_22b_sti_1791833277995.jpg',
  'mitsubishi-evo-6': '/images/mitsubishi_evo6_1791833293525.jpg',
  'nissan-gtr-nismo-r35': '/images/nissan_gtr_nismo_1791833311606.jpg',
  'lexus-lfa': '/images/lexus_lfa_nurburg_1791833329326.jpg',
  'honda-s2000-cr': '/images/honda_s2000_cr_1791833345460.jpg',
  'toyota-gr-yaris': '/images/toyota_gr_yaris_1791833363853.jpg',

  'ford-shelby-gt500': '/images/car_american_muscle_1791565558335.jpg',
  'dodge-challenger-hellcat': '/images/car_dodge_hellcat_1791567206238.jpg',
  'chevrolet-corvette-z06': '/images/corvette_z06_c8_1791833386108.jpg',
  'dodge-viper-acr': '/images/dodge_viper_acr_1791833406440.jpg',
  'ford-gt-heritage': '/images/ford_gt_gulf_1791833425740.jpg',
  'chevrolet-camaro-zl1': '/images/camaro_zl1_1le_1791833448448.jpg',
  'shelby-cobra-427': '/images/shelby_cobra_427_1791833471118.jpg',
  'corvette-c2-stingray': '/images/corvette_c2_split_1791833494151.jpg',
  'cadillac-ct5-v-blackwing': '/images/cadillac_ct5v_1791833520887.jpg',

  'porsche-911-turbo-s': '/images/car_european_gt_1791565579842.jpg',
  'porsche-911-gt3-rs': '/images/porsche_gt3_rs_1791833549646.jpg',
  'bmw-m3-e46': '/images/car_bmw_m3_e46_1791565623104.jpg',
  'bmw-m4-csl': '/images/bmw_m4_csl_1791833583795.jpg',
  'bmw-m5-cs': '/images/bmw_m5_cs_1791833612713.jpg',
  'mercedes-amg-gt-black-series': '/images/amg_gt_black_1791833646500.jpg',
  'mercedes-190e-evo2': '/images/mercedes_190e_evo_1791833685217.jpg',
  'audi-r8-v10': '/images/audi_r8_v10_1791833713012.jpg',
  'audi-rs6-avant': '/images/audi_rs6_gt_1791833745421.jpg',
  'aston-martin-dbs': '/images/aston_dbs_770_1791833775218.jpg',
  'jaguar-f-type-r': '/images/jaguar_ftype_r_1791833810082.jpg',
  'lotus-exige-cup-430': '/images/lotus_exige_cup_1791833849705.jpg',

  'ferrari-458-italia': '/images/car_italian_exotic_1791565570599.jpg',
  'ferrari-488-pista': '/images/ferrari_488_pista_1791833884606.jpg',
  'ferrari-812-superfast': '/images/ferrari_812_super_1791833916817.jpg',
  'lamborghini-huracan': '/images/car_lamborghini_huracan_1791565613376.jpg',
  'lamborghini-aventador-svj': '/images/lambo_svj_viola_1791833954826.jpg',
  'alfa-romeo-giulia-quadrifoglio': '/images/car_alfa_giulia_1791567215442.jpg',
  'maserati-granturismo': '/images/car_maserati_mc_1791567224881.jpg',
  'maserati-mc20': '/images/maserati_mc20_1791833989074.jpg',
  'fiat-abarth-595': '/images/car_abarth_tributo_1791567234634.jpg',

  'bugatti-chiron-pur-sport': '/images/bugatti_chiron_1791834025775.jpg',
  'koenigsegg-jesko': '/images/koenigsegg_jesko_1791834062269.jpg',
  'pagani-huayra-bc': '/images/pagani_huayra_bc_1791834104977.jpg',
  'mclaren-720s-spider': '/images/mclaren_720s_spid_1791834155226.jpg',
};

export const DEFAULT_CAR_FALLBACK_IMAGE = '/images/hero_hypercar_showroom_1791565534002.jpg';

export function getCarFallbackImage(carId?: string): string {
  if (carId && CAR_STATIC_IMAGE_FALLBACKS[carId]) {
    return CAR_STATIC_IMAGE_FALLBACKS[carId];
  }
  return DEFAULT_CAR_FALLBACK_IMAGE;
}

/**
 * Robust image error handler that tries secondary public path and prevents broken image icons
 */
export function handleCarImageError(e: React.SyntheticEvent<HTMLImageElement>, carId?: string) {
  const target = e.currentTarget;
  const fallback = getCarFallbackImage(carId);

  // If currently trying primary and it failed, switch to fallback
  if (target.src !== fallback && !target.src.endsWith(fallback)) {
    target.src = fallback;
  } else if (target.src !== DEFAULT_CAR_FALLBACK_IMAGE && !target.src.endsWith(DEFAULT_CAR_FALLBACK_IMAGE)) {
    target.src = DEFAULT_CAR_FALLBACK_IMAGE;
  }
}
