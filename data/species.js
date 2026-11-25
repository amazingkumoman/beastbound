// 図鑑・研究ノート・物語で数える「種」（上位・マスター級の個体は元の種に数える）
import { SPECIES_HIGH } from './monsters_high.js';
import { MASTER_SPECIES } from './monsters_master.js';
import { MASTER2_MONSTERS } from './monsters_master2.js';
import { LOW2_MONSTERS } from './monsters_low2.js';
import { HIGH2_MONSTERS } from './monsters_high2.js';
export const SPECIES = [...SPECIES_HIGH.slice(0, 3), ...LOW2_MONSTERS, ...SPECIES_HIGH.slice(3), ...HIGH2_MONSTERS, ...MASTER_SPECIES, ...MASTER2_MONSTERS];
