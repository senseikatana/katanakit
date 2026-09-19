/**
 * Example: IntersectionObserver and lazy-loading utilities.
 *
 * NOTE: IntersectionObserver requires a browser environment, so this example
 * is illustrative only and will not run under Bun/Node.
 */
import {
	useLazyLoaderInit,
	useLazyLoaderStop,
	useLazyLoaderStopAll,
	useObserverCreate,
	useObserverDisconnect,
	useObserverDisconnectAll,
	useObserverObserve,
	useObserverObserveAll,
} from "@/infrastructure/observer/observer.service";

// Create a fade-in observer and observe elements.
useObserverCreate(
	"fade-in",
	(entry) => {
		entry.target.classList.toggle("visible");
	},
	{ threshold: 0.2 },
);

useObserverObserve("fade-in", "#hero");
useObserverObserveAll("fade-in", ".card");

// Create an analytics observer.
useObserverCreate("track-view", (entry) => {
	console.log(`View: ${entry.target.id}`);
});
useObserverObserve("track-view", "#promo-banner");

// Lazy load images for different sections.
useLazyLoaderInit("pokemon-list", ".pokemon-card img", "300px");
useLazyLoaderInit("blog-posts", ".post-cover img");

// Selective cleanup.
useObserverDisconnect("track-view");
useLazyLoaderStop("pokemon-list");

// Full cleanup (e.g., on SPA route change or component unmount).
useObserverDisconnectAll();
useLazyLoaderStopAll();
