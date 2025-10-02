export type GodRaysConfig = {
	sourceXPct: number; // X origin (off-screen)
	sourceYPct: number; // Y origin (off-screen)
	rayFrequency: number; // number of rays
	raySpeed: number; // drift speed
	rayContrast: number; // 1 = normal, >1 harsher
	wobbleStrength: number; // how much rays bend (radians)
	wobbleSpeed: number; // speed of wobble motion
};

export const godRaysVars: GodRaysConfig = {
	sourceXPct: -20,
	sourceYPct: -50,
	rayFrequency: 15,
	raySpeed: 0.8,
	rayContrast: 1.0,
	wobbleStrength: 0.2, // small bend per ray
	wobbleSpeed: 1.0, // how fast rays shimmer
};
