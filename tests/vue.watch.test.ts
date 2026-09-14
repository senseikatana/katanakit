import { describe, expect, it, vi } from "vitest";
import { reactive, ref } from "vue";
import { useKatanaWatch, useWatch } from "@/adapters/vue/watch";

describe("Vue adapter — useKatanaWatch", () => {
	it("watches a ref with deep:true by default", async () => {
		const product = ref({ name: "", price: 0 });
		const callback = vi.fn();
		const stop = useKatanaWatch(product, callback);

		product.value.price = 10;

		await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
		expect(callback.mock.calls[0]?.[0]).toEqual({ name: "", price: 10 });
		stop();
	});

	it("accepts a getter function as source", async () => {
		const product = ref({ name: "a", price: 1 });
		const callback = vi.fn();
		const stop = useKatanaWatch(() => product.value.price, callback);

		product.value.price = 2;

		await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
		expect(callback.mock.calls[0]?.[0]).toBe(2);
		stop();
	});

	it("accepts a reactive object as source", async () => {
		const state = reactive({ count: 0 });
		const callback = vi.fn();
		const stop = useKatanaWatch(state, callback);

		state.count = 1;

		await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
		stop();
	});

	it("supports immediate runs and manual stop", async () => {
		const count = ref(0);
		const callback = vi.fn();
		const stop = useKatanaWatch(count, callback, { immediate: true });

		await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));

		stop();
		count.value = 1;

		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it("accepts an array of sources like the native watch", async () => {
		const first = ref(0);
		const second = ref({ nested: 1 });
		const callback = vi.fn();
		const stop = useKatanaWatch([first, second], callback);

		second.value.nested = 2;

		await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
		stop();
	});

	it("accepts any internal function as callback, even with no args", async () => {
		const count = ref(0);
		let calls = 0;
		const stop = useKatanaWatch(count, () => {
			calls += 1;
		});

		count.value = 1;

		await vi.waitFor(() => expect(calls).toBe(1));
		stop();
	});

	it("exposes useWatch as an alias with the same behaviour", async () => {
		expect(useWatch).toBe(useKatanaWatch);

		const count = ref(0);
		const callback = vi.fn();
		const stop = useWatch(count, callback);

		count.value = 5;

		await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
		expect(callback.mock.calls[0]?.[0]).toBe(5);
		stop();
	});

	it("revalidates a schema-agnostic form on nested changes", async () => {
		const newProduct = ref({ name: "", price: -1 });
		const fieldErrors = ref<Record<string, string>>({});
		const fakeSchema = {
			safeParse: (data: { name: string; price: number }) => {
				const issues: { path: (string | number)[]; message: string }[] = [];
				if (!data.name) issues.push({ path: ["name"], message: "Required" });
				if (data.price < 0) issues.push({ path: ["price"], message: "Must be >= 0" });
				return issues.length > 0
					? { success: false as const, error: { issues } }
					: { success: true as const, data };
			},
		};

		const checkValidations = (): boolean => {
			fieldErrors.value = {};
			const result = fakeSchema.safeParse(newProduct.value);
			if (!result.success) {
				for (const issue of result.error.issues) {
					const field = issue.path[0];
					if (typeof field === "string") fieldErrors.value[field] = issue.message;
				}
				return false;
			}
			return true;
		};

		const stop = useKatanaWatch(newProduct, () => checkValidations(), { deep: true });

		newProduct.value.name = "Katana";

		await vi.waitFor(() => expect(fieldErrors.value).toEqual({ price: "Must be >= 0" }));

		newProduct.value.price = 10;

		await vi.waitFor(() => expect(fieldErrors.value).toEqual({}));
		stop();
	});
});
