export const soulslikeAssets = {
    background: "/assets/background/background.png",
    player: {
        standing: "/assets/player/standing.png",
        walking1: "/assets/player/walking-1.png",
        walking2: "/assets/player/walking-2.png",
        jumping: "/assets/player/jumping.png",
        attacking: "/assets/player/attacking.png",
        rolling: "/assets/player/rolling.png",
        parrying: "/assets/player/parrying.png",
        dead: "/assets/player/dead.png"
    },
    boss: {
        standing: "/assets/boss/standing.png",
        walking1: "/assets/boss/walking-1.png",
        walking2: "/assets/boss/walking-2.png",
        jumping: "/assets/boss/jumping.png",
        attacking: "/assets/boss/attacking.png",
        dead: "/assets/boss/dead.png"
    }
};
export const assetReplacementGuide = [
    "Sprites e background ativos em PNG dentro de public/assets.",
    "Player usa standing, walking-1/2, jumping, attacking, rolling, parrying e dead.",
    "Para trocar artes, mantenha os nomes ou ajuste src/game/assets.ts."
];
