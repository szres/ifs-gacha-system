<script lang="ts">
	import { onMount } from "svelte";
	import {
		fallbackLocale,
		getLocaleFromLanguage,
		isLocale,
		messages,
		type Locale
	} from "../i18n";

	const MAX_USERS = 1000;
	const GITHUB_REPO_URL = "https://github.com/szres/ifs-gacha-system";
	const LOCALE_STORAGE_KEY = "ifs-gacha-system-locale";

	type DrawResult = {
		imageHash: string;
		passcodeHash: string;
		seed: string;
		winners: number[];
	};

	let imageFile: File | null = null;
	let imageFileName = "";
	let passcode = "";
	let totalUsers = "";
	let winnerCount = "";
	let imageHash = "";
	let passcodeHash = "";
	let seed = "";
	let winners: number[] = [];
	let errorMessage = "";
	let isHashing = false;
	let locale: Locale = fallbackLocale;
	let localeInitialized = false;

	onMount(() => {
		const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
		if (storedLocale && isLocale(storedLocale)) {
			locale = storedLocale;
		} else {
			locale = getLocaleFromLanguage(navigator.language);
		}
		document.documentElement.lang = messages[locale].metaLocale;
		localeInitialized = true;
	});

	async function sha256Hex(input: ArrayBuffer | string): Promise<string> {
		const data =
			typeof input === "string" ? new TextEncoder().encode(input) : input;
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		return Array.from(new Uint8Array(hashBuffer))
			.map((byte) => byte.toString(16).padStart(2, "0"))
			.join("");
	}

	function hashToUint32(hash: string): number {
		let value = 0;
		for (let i = 0; i < hash.length; i += 8) {
			const chunk = hash.slice(i, i + 8);
			value = (value ^ Number.parseInt(chunk, 16)) >>> 0;
		}
		return value >>> 0;
	}

	function mulberry32(seedValue: number): () => number {
		let state = seedValue >>> 0;
		return () => {
			state = (state + 0x6d2b79f5) >>> 0;
			let t = Math.imul(state ^ (state >>> 15), 1 | state);
			t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function drawWinners(total: number, count: number, seedText: string): number[] {
		if (count === 0) {
			return [];
		}

		if (count === total) {
			return Array.from({ length: total }, (_, index) => index + 1);
		}

		const numbers = Array.from({ length: total }, (_, index) => index + 1);
		const random = mulberry32(hashToUint32(seedText));

		for (let i = numbers.length - 1; i > 0; i -= 1) {
			const j = Math.floor(random() * (i + 1));
			[numbers[i], numbers[j]] = [numbers[j], numbers[i]];
		}

		return numbers.slice(0, count).sort((a, b) => a - b);
	}

	function validateInputs(totalValue: string, winnerValue: string): {
		valid: boolean;
		total: number;
		count: number;
		error: string;
	} {
		const total = Number(totalValue);
		const count = Number(winnerValue);

		if (!imageFile) {
			return { valid: false, total: 0, count: 0, error: t.errors.uploadImageFirst };
		}

		if (!passcode.trim()) {
			return { valid: false, total: 0, count: 0, error: t.errors.inputPasscode };
		}

		if (!Number.isInteger(total) || total < 1 || total > MAX_USERS) {
			return {
				valid: false,
				total: 0,
				count: 0,
				error: t.errors.totalUsers(MAX_USERS)
			};
		}

		if (!Number.isInteger(count) || count < 0) {
			return { valid: false, total: 0, count: 0, error: t.errors.winnerCount };
		}

		if (count > total) {
			return { valid: false, total: 0, count: 0, error: t.errors.winnerExceedsTotal };
		}

		return { valid: true, total, count, error: "" };
	}

	async function handleImageChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0] ?? null;

		imageFile = file;
		imageFileName = file?.name ?? "";
		imageHash = "";
		seed = "";
		winners = [];
		errorMessage = "";

		if (!file) {
			return;
		}

		isHashing = true;
		try {
			const buffer = await file.arrayBuffer();
			imageHash = await sha256Hex(buffer);
		} catch {
			errorMessage = t.errors.imageHashFailed;
		} finally {
			isHashing = false;
		}
	}

	async function handleDraw() {
		errorMessage = "";
		winners = [];

		const validation = validateInputs(totalUsers, winnerCount);
		if (!validation.valid) {
			errorMessage = validation.error;
			return;
		}

		if (!imageHash) {
			errorMessage = isHashing ? t.errors.hashInProgress : t.errors.missingImageHash;
			return;
		}

		try {
			passcodeHash = await sha256Hex(passcode.trim());
			seed = `${imageHash}:${passcodeHash}`;
			winners = drawWinners(validation.total, validation.count, seed);
		} catch {
			errorMessage = t.errors.drawFailed;
		}
	}

	function changeLocale(nextLocale: Locale) {
		locale = nextLocale;
		if (typeof window !== "undefined") {
			window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
		}
	}

	function handleLocaleChange(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		changeLocale(select.value as Locale);
	}

	$: canDraw =
		Boolean(imageFile) && Boolean(passcode.trim()) && Boolean(totalUsers) && Boolean(winnerCount) && !isHashing;

	$: t = messages[locale];
	$: selectedFileText = t.hints.selectedFile.replace("{name}", imageFileName);
	$: validationText = t.hints.validation.replace("{maxUsers}", String(MAX_USERS));
	$: if (typeof document !== "undefined") {
		document.documentElement.lang = t.metaLocale;
	}

	$: result =
		imageHash && passcodeHash && seed
			? ({ imageHash, passcodeHash, seed, winners } satisfies DrawResult)
			: null;
</script>

<svelte:head>
	<title>{t.pageTitle}</title>
	<meta name="description" content={t.pageDescription} />
</svelte:head>

<section class="min-h-screen bg-base-200 px-4 py-6 text-base-content">
	<div class="mx-auto flex w-full max-w-md flex-col gap-4">
		<div class="flex flex-col gap-3 text-center">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<a class="btn btn-outline btn-sm" href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">
					{t.githubStar}
				</a>

				<label class="form-control flex mx-auto w-full max-w-[140px] sm:mx-0">
					<div class="label py-0 px-2">
						<span class="label-text text-base-content/70" aria-hidden="true">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								class="h-4 w-4"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Z" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.5 2.46 4 5.6 4 9s-1.5 6.54-4 9c-2.5-2.46-4-5.6-4-9s1.5-6.54 4-9Z" />
							</svg>
						</span>
					</div>
					<select
						class="select select-bordered select-sm w-full"
						bind:value={locale}
						on:change={handleLocaleChange}
						aria-label={t.language}
						disabled={!localeInitialized}
					>
						<option value="zh">中文</option>
						<option value="en">English</option>
						<option value="ja">日本語</option>
					</select>
				</label>
			</div>

			<h1 class="text-3xl font-bold text-primary">{t.title}</h1>
			<p class="mt-2 text-sm leading-6 text-base-content/75">
				{t.subtitle}
			</p>
		</div>

		<div class="card border border-base-300 bg-base-100 shadow-sm">
			<div class="card-body gap-4">
				<div>
					<label class="label" for="image-upload">
						<span class="label-text font-medium">{t.steps.uploadImage}</span>
					</label>
					<input
						id="image-upload"
						type="file"
						accept="image/*"
						class="file-input file-input-bordered w-full"
						on:change={handleImageChange}
					/>
					{#if imageFileName}
						<p class="mt-2 break-all text-xs text-base-content/70">{selectedFileText}</p>
					{/if}
				</div>

				<div>
					<label class="label" for="passcode">
						<span class="label-text font-medium">{t.steps.inputPasscode}</span>
					</label>
					<input
						id="passcode"
						type="text"
						bind:value={passcode}
						placeholder={t.placeholders.passcode}
						class="input input-bordered w-full"
					/>
				</div>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div>
						<label class="label" for="total-users">
							<span class="label-text font-medium">{t.steps.totalUsers}</span>
						</label>
						<input
							id="total-users"
							type="number"
							min="1"
							max={MAX_USERS}
							step="1"
							inputmode="numeric"
							bind:value={totalUsers}
							placeholder={t.placeholders.totalUsers}
							class="input input-bordered w-full"
						/>
					</div>

					<div>
						<label class="label" for="winner-count">
							<span class="label-text font-medium">{t.steps.winnerCount}</span>
						</label>
						<input
							id="winner-count"
							type="number"
							min="0"
							max={MAX_USERS}
							step="1"
							inputmode="numeric"
							bind:value={winnerCount}
							placeholder={t.placeholders.winnerCount}
							class="input input-bordered w-full"
						/>
					</div>
				</div>

				<p class="text-xs leading-5 text-base-content/70">
					{validationText}
				</p>

				{#if errorMessage}
					<div class="alert alert-error text-sm">{errorMessage}</div>
				{/if}

				<button class="btn btn-primary btn-block" on:click={handleDraw} disabled={!canDraw}>
					{#if isHashing}
						{t.buttons.drawing}
					{:else}
						{t.buttons.draw}
					{/if}
				</button>
			</div>
		</div>

		<div class="card border border-base-300 bg-base-100 shadow-sm">
			<div class="card-body gap-3">
				<h2 class="card-title text-lg">{t.results.title}</h2>

				<div>
					<p class="text-sm font-medium">{t.results.imageHash}</p>
					<p class="mt-1 break-all rounded-box bg-base-200 p-3 text-xs">{imageHash || t.hints.waitingUpload}</p>
				</div>

				<div>
					<p class="text-sm font-medium">{t.results.passcodeHash}</p>
					<p class="mt-1 break-all rounded-box bg-base-200 p-3 text-xs">{passcodeHash || t.hints.waitingDraw}</p>
				</div>

				<div>
					<p class="text-sm font-medium">{t.results.seed}</p>
					<p class="mt-1 break-all rounded-box bg-base-200 p-3 text-xs">{seed || t.hints.waitingDraw}</p>
				</div>

				<div>
					<p class="text-sm font-medium">{t.results.winners}</p>
					{#if result}
						{#if winners.length > 0}
							<div class="mt-2 flex flex-wrap gap-2">
								{#each winners as winner}
									<span class="badge badge-primary badge-lg">#{winner}</span>
								{/each}
							</div>
						{:else}
							<p class="mt-1 rounded-box bg-base-200 p-3 text-sm">{t.hints.zeroWinners}</p>
						{/if}
					{:else}
						<p class="mt-1 rounded-box bg-base-200 p-3 text-sm">{t.hints.waitingDraw}</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>
