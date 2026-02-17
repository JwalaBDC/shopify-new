export function lerp(lastValue, thisValue, easingFactor) {
	easingFactor = easingFactor || 0.08;
	return (1 - easingFactor) * lastValue + easingFactor * thisValue;
}
export function mapRange(in_min, in_max, out_min, out_max, value) {
	return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
export function clamp(min, max, value) {
	return Math.min(Math.max(value, min), max);
}
