import { SCENES } from '../constants.js';

import { buildBugScene } from './bug.js';
import { buildBuilderScene } from './builder.js';
import { buildHomeScene } from './home.js';
import { buildLabsScene } from './labs.js';
import { buildNavigationRows } from './navigation.js';
import { buildReleaseScene } from './release.js';
import { buildTourScene } from './tour.js';

export { buildNavigationRows };

const sceneBuilders = Object.freeze({
  [SCENES.home]: buildHomeScene,
  [SCENES.tour]: buildTourScene,
  [SCENES.builder]: buildBuilderScene,
  [SCENES.bug]: buildBugScene,
  [SCENES.release]: buildReleaseScene,
  [SCENES.labs]: buildLabsScene,
});

export function buildSceneComponents(session) {
  return (sceneBuilders[session.scene] ?? buildHomeScene)(session);
}
