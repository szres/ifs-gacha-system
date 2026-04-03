<script lang="ts">
	const MAX_USERS = 1000;

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
			return { valid: false, total: 0, count: 0, error: "请先上传图片。" };
		}

		if (!passcode.trim()) {
			return { valid: false, total: 0, count: 0, error: "请输入字符串（例如 passcode）。" };
		}

		if (!Number.isInteger(total) || total < 1 || total > MAX_USERS) {
			return {
				valid: false,
				total: 0,
				count: 0,
				error: `抽奖总人数必须是 1 到 ${MAX_USERS} 之间的整数。`
			};
		}

		if (!Number.isInteger(count) || count < 0) {
			return { valid: false, total: 0, count: 0, error: "中奖人数必须是大于等于 0 的整数。" };
		}

		if (count > total) {
			return { valid: false, total: 0, count: 0, error: "中奖人数不能大于抽奖总人数。" };
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
			errorMessage = "图片哈希计算失败，请重试。";
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
			errorMessage = isHashing ? "图片哈希仍在计算中，请稍候。" : "尚未获得图片哈希，请重新上传图片。";
			return;
		}

		try {
			passcodeHash = await sha256Hex(passcode.trim());
			seed = `${imageHash}:${passcodeHash}`;
			winners = drawWinners(validation.total, validation.count, seed);
		} catch {
			errorMessage = "抽奖过程失败，请重试。";
		}
	}

	$: canDraw =
		Boolean(imageFile) && Boolean(passcode.trim()) && Boolean(totalUsers) && Boolean(winnerCount) && !isHashing;

	$: result =
		imageHash && passcodeHash && seed
			? ({ imageHash, passcodeHash, seed, winners } satisfies DrawResult)
			: null;
</script>

<section class="min-h-screen bg-base-200 px-4 py-6 text-base-content">
	<div class="mx-auto flex w-full max-w-md flex-col gap-4">
		<div class="text-center">
			<h1 class="text-3xl font-bold text-primary">IFS 抽奖系统</h1>
			<p class="mt-2 text-sm leading-6 text-base-content/75">
				上传相同图片并输入相同字符串，即可得到完全一致、可重现的抽奖结果。
			</p>
		</div>

		<div class="card border border-base-300 bg-base-100 shadow-sm">
			<div class="card-body gap-4">
				<div>
					<label class="label" for="image-upload">
						<span class="label-text font-medium">1. 上传图片</span>
					</label>
					<input
						id="image-upload"
						type="file"
						accept="image/*"
						class="file-input file-input-bordered w-full"
						on:change={handleImageChange}
					/>
					{#if imageFileName}
						<p class="mt-2 break-all text-xs text-base-content/70">已选择：{imageFileName}</p>
					{/if}
				</div>

				<div>
					<label class="label" for="passcode">
						<span class="label-text font-medium">2. 输入字符串 / Passcode</span>
					</label>
					<input
						id="passcode"
						type="text"
						bind:value={passcode}
						placeholder="请输入当场 IFS passcode"
						class="input input-bordered w-full"
					/>
				</div>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div>
						<label class="label" for="total-users">
							<span class="label-text font-medium">3. 抽奖总人数</span>
						</label>
						<input
							id="total-users"
							type="number"
							min="1"
							max={MAX_USERS}
							step="1"
							inputmode="numeric"
							bind:value={totalUsers}
							placeholder="1 - 1000"
							class="input input-bordered w-full"
						/>
					</div>

					<div>
						<label class="label" for="winner-count">
							<span class="label-text font-medium">4. 中奖人数</span>
						</label>
						<input
							id="winner-count"
							type="number"
							min="0"
							max={MAX_USERS}
							step="1"
							inputmode="numeric"
							bind:value={winnerCount}
							placeholder="0 - N"
							class="input input-bordered w-full"
						/>
					</div>
				</div>

				<p class="text-xs leading-5 text-base-content/70">
					校验规则：总人数 1~{MAX_USERS}，中奖人数 0~N，且都必须是整数。
				</p>

				{#if errorMessage}
					<div class="alert alert-error text-sm">{errorMessage}</div>
				{/if}

				<button class="btn btn-primary btn-block" on:click={handleDraw} disabled={!canDraw}>
					{#if isHashing}
						正在计算图片哈希...
					{:else}
						开始抽奖
					{/if}
				</button>
			</div>
		</div>

		<div class="card border border-base-300 bg-base-100 shadow-sm">
			<div class="card-body gap-3">
				<h2 class="card-title text-lg">结果与复现信息</h2>

				<div>
					<p class="text-sm font-medium">图片 Hash</p>
					<p class="mt-1 break-all rounded-box bg-base-200 p-3 text-xs">{imageHash || "等待上传图片"}</p>
				</div>

				<div>
					<p class="text-sm font-medium">字符串 Hash</p>
					<p class="mt-1 break-all rounded-box bg-base-200 p-3 text-xs">{passcodeHash || "等待执行抽奖"}</p>
				</div>

				<div>
					<p class="text-sm font-medium">随机 Seed</p>
					<p class="mt-1 break-all rounded-box bg-base-200 p-3 text-xs">{seed || "等待执行抽奖"}</p>
				</div>

				<div>
					<p class="text-sm font-medium">中奖序号</p>
					{#if result}
						{#if winners.length > 0}
							<div class="mt-2 flex flex-wrap gap-2">
								{#each winners as winner}
									<span class="badge badge-primary badge-lg">#{winner}</span>
								{/each}
							</div>
						{:else}
							<p class="mt-1 rounded-box bg-base-200 p-3 text-sm">本次中奖人数为 0，没有中奖序号。</p>
						{/if}
					{:else}
						<p class="mt-1 rounded-box bg-base-200 p-3 text-sm">等待执行抽奖</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>
