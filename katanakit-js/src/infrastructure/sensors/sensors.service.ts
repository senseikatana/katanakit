import { useLogger } from "../../core/services/logger.service.js";
import type { BatteryManager, GeoPosition } from "../../types/index.js";

// ============================================================
// Internal helpers
// ============================================================

/**
 * Checks whether the code is running in a browser environment with `navigator`.
 *
 * @returns `true` if both `window` and `navigator` are defined.
 */
function isBrowser(): boolean {
	return typeof window !== "undefined" && typeof navigator !== "undefined";
}

// ============================================================
// Media (camera / microphone)
// ============================================================

/**
 * Requests a media stream (camera, microphone, or both).
 *
 * @param constraints - MediaStream constraints (default: video + audio).
 * @returns A `MediaStream` or `null` if the API is unavailable or permission is denied.
 *
 * @example
 * ```ts
 * const stream = await useGetMediaStream({ video: true, audio: false });
 * if (stream) {
 *   videoElement.srcObject = stream;
 * }
 * ```
 */
export async function useGetMediaStream(
	constraints: MediaStreamConstraints = { video: true, audio: true },
): Promise<MediaStream | null> {
	if (!isBrowser() || !navigator.mediaDevices?.getUserMedia) {
		useLogger("[getMediaStream] API not supported in this environment.", undefined, "warn");
		return null;
	}

	try {
		return await navigator.mediaDevices.getUserMedia(constraints);
	} catch (error) {
		useLogger("[getMediaStream] Permission denied or error:", error, "error");
		return null;
	}
}

/**
 * Stops all tracks in a media stream (releases camera/microphone).
 *
 * @param stream - The MediaStream to stop, or `null`.
 *
 * @example
 * ```ts
 * const stream = await useGetMediaStream();
 * // ... use stream ...
 * useStopMediaStream(stream);
 * ```
 */
export function useStopMediaStream(stream: MediaStream | null): void {
	if (stream) {
		for (const track of stream.getTracks()) {
			track.stop();
		}
	}
}

/**
 * Opens the front-facing (user) camera.
 *
 * @returns A video-only `MediaStream` or `null`.
 *
 * @example
 * ```ts
 * const selfieStream = await useGetFrontCamera();
 * ```
 */
export async function useGetFrontCamera(): Promise<MediaStream | null> {
	return useGetMediaStream({ video: { facingMode: "user" }, audio: false });
}

/**
 * Opens the back-facing (environment) camera.
 *
 * @returns A video-only `MediaStream` or `null`.
 *
 * @example
 * ```ts
 * const rearStream = await useGetBackCamera();
 * ```
 */
export async function useGetBackCamera(): Promise<MediaStream | null> {
	return useGetMediaStream({ video: { facingMode: "environment" }, audio: false });
}

// ============================================================
// Geolocation
// ============================================================

/**
 * Gets the device's current geographic position once.
 *
 * @param options - Optional PositionOptions to override defaults.
 * @returns A {@link GeoPosition} object or `null` on error / unavailability.
 *
 * @example
 * ```ts
 * const pos = await useGetGeolocation({ enableHighAccuracy: true });
 * if (pos) console.log(`${pos.lat}, ${pos.lng}`);
 * ```
 */
export async function useGetGeolocation(options?: PositionOptions): Promise<GeoPosition | null> {
	if (!isBrowser() || !navigator.geolocation) return null;

	return new Promise((resolve) => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				resolve({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
					accuracy: position.coords.accuracy,
				});
			},
			(error) => {
				useLogger("[getGeolocation] Error:", error.message, "error");
				resolve(null);
			},
			{ enableHighAccuracy: true, timeout: 10000, ...options },
		);
	});
}

/**
 * Continuously watches the device's geographic position.
 *
 * @param callback - Called with a {@link GeoPosition} on each position update.
 * @param options - Optional PositionOptions to override defaults.
 * @returns A cleanup function that stops watching, or `null` if unavailable.
 *
 * @example
 * ```ts
 * const stop = useWatchGeolocation((pos) => {
 *   console.log("Moved to", pos.lat, pos.lng);
 * });
 * // later:
 * stop?.();
 * ```
 */
export function useWatchGeolocation(
	callback: (position: GeoPosition) => void,
	options?: PositionOptions,
): (() => void) | null {
	if (!isBrowser() || !navigator.geolocation) return null;

	const watchId = navigator.geolocation.watchPosition(
		(position) => {
			callback({
				lat: position.coords.latitude,
				lng: position.coords.longitude,
				accuracy: position.coords.accuracy,
			});
		},
		(error) => {
			useLogger("[watchGeolocation] Error:", error.message, "error");
		},
		{ enableHighAccuracy: true, ...options },
	);

	return () => navigator.geolocation.clearWatch(watchId);
}

// ============================================================
// Device motion / orientation
// ============================================================

/**
 * Requests permission to access device orientation/motion sensors (required on iOS 13+).
 *
 * @returns `true` if permission is granted or already available, `false` otherwise.
 *
 * @example
 * ```ts
 * const granted = await useRequestMotionPermission();
 * if (granted) {
 *   useOnDeviceOrientation((e) => console.log(e.alpha, e.beta));
 * }
 * ```
 */
export async function useRequestMotionPermission(): Promise<boolean> {
	if (!isBrowser()) return false;

	if (typeof DeviceOrientationEvent === "undefined") {
		return false;
	}

	const DeviceOrientationEventExtended = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
		requestPermission?: () => Promise<string>;
	};

	if (typeof DeviceOrientationEventExtended.requestPermission === "function") {
		try {
			const response = await DeviceOrientationEventExtended.requestPermission();
			return response === "granted";
		} catch (error) {
			useLogger("[requestMotionPermission] Error:", error, "error");
			return false;
		}
	}

	return true;
}

/**
 * Listens for device orientation events (compass heading, tilt).
 *
 * @param callback - Called with each `DeviceOrientationEvent`.
 * @returns A cleanup function that removes the listener, or `null` if unavailable.
 *
 * @example
 * ```ts
 * const off = useOnDeviceOrientation((e) => {
 *   console.log("Alpha:", e.alpha);
 * });
 * ```
 */
export function useOnDeviceOrientation(
	callback: (event: DeviceOrientationEvent) => void,
): (() => void) | null {
	if (!isBrowser() || typeof DeviceOrientationEvent === "undefined") return null;

	window.addEventListener("deviceorientation", callback);

	return () => {
		window.removeEventListener("deviceorientation", callback);
	};
}

/**
 * Listens for device motion events (acceleration, rotation rate).
 *
 * @param callback - Called with each `DeviceMotionEvent`.
 * @returns A cleanup function that removes the listener, or `null` if unavailable.
 *
 * @example
 * ```ts
 * const off = useOnDeviceMotion((e) => {
 *   console.log("Acceleration:", e.acceleration);
 * });
 * ```
 */
export function useOnDeviceMotion(
	callback: (event: DeviceMotionEvent) => void,
): (() => void) | null {
	if (!isBrowser()) return null;

	window.addEventListener("devicemotion", callback);

	return () => {
		window.removeEventListener("devicemotion", callback);
	};
}

// ============================================================
// Vibration
// ============================================================

/**
 * Triggers the device vibration motor with a given pattern.
 *
 * @param pattern - A single duration (ms) or an array of vibrate/pause durations.
 * @returns `true` if vibration was triggered, `false` otherwise.
 *
 * @example
 * ```ts
 * useVibrate(200);           // vibrate 200 ms
 * useVibrate([100, 50, 100]); // vibrate, pause, vibrate
 * ```
 */
export function useVibrate(pattern: number | number[]): boolean {
	if (isBrowser() && "vibrate" in navigator) {
		return navigator.vibrate(pattern);
	}
	return false;
}

/**
 * Stops any ongoing vibration.
 *
 * @returns `true` if the call succeeded.
 */
export function useStopVibration(): boolean {
	return useVibrate(0);
}

// ============================================================
// Battery
// ============================================================

/**
 * Gets the device battery status.
 *
 * @returns A `BatteryManager` object or `null` if the API is unavailable.
 *
 * @example
 * ```ts
 * const battery = await useGetBattery();
 * if (battery) {
 *   console.log(`${Math.round(battery.level * 100)}%`);
 * }
 * ```
 */
export async function useGetBattery(): Promise<BatteryManager | null> {
	if (!isBrowser()) return null;

	const nav = navigator as Navigator & {
		getBattery?: () => Promise<BatteryManager>;
	};

	if (!nav.getBattery) return null;

	try {
		return await nav.getBattery();
	} catch (error) {
		useLogger("[getBattery] Error:", error, "error");
		return null;
	}
}
