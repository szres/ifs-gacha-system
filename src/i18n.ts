export const supportedLocales = ["zh", "en", "ja"] as const;

export type Locale = (typeof supportedLocales)[number];

export const fallbackLocale: Locale = "en";

export type Messages = {
	title: string;
	subtitle: string;
	githubStar: string;
	language: string;
	steps: {
		uploadImage: string;
		inputPasscode: string;
		totalUsers: string;
		winnerCount: string;
	};
	placeholders: {
		passcode: string;
		totalUsers: string;
		winnerCount: string;
	};
	hints: {
		selectedFile: string;
		validation: string;
		waitingUpload: string;
		waitingDraw: string;
		zeroWinners: string;
	};
	buttons: {
		drawing: string;
		draw: string;
	};
	results: {
		title: string;
		imageHash: string;
		passcodeHash: string;
		seed: string;
		winners: string;
	};
	errors: {
		uploadImageFirst: string;
		inputPasscode: string;
		totalUsers: (maxUsers: number) => string;
		winnerCount: string;
		winnerExceedsTotal: string;
		imageHashFailed: string;
		hashInProgress: string;
		missingImageHash: string;
		drawFailed: string;
	};
	pageTitle: string;
	pageDescription: string;
	manifestName: string;
	manifestShortName: string;
	manifestDescription: string;
	metaLocale: string;
};

export const messages: Record<Locale, Messages> = {
	zh: {
		title: "IFS 抽奖系统",
		subtitle: "上传相同图片并输入相同字符串，即可得到完全一致、可重现的抽奖结果。",
		githubStar: "Star on GitHub",
		language: "语言",
		steps: {
			uploadImage: "1. 上传图片",
			inputPasscode: "2. 输入字符串 / Passcode",
			totalUsers: "3. 抽奖总人数",
			winnerCount: "4. 中奖人数"
		},
		placeholders: {
			passcode: "请输入当场 IFS passcode",
			totalUsers: "1 - 1000",
			winnerCount: "0 - N"
		},
		hints: {
			selectedFile: "已选择：{name}",
			validation: "校验规则：总人数 1~{maxUsers}，中奖人数 0~N，且都必须是整数。",
			waitingUpload: "等待上传图片",
			waitingDraw: "等待执行抽奖",
			zeroWinners: "本次中奖人数为 0，没有中奖序号。"
		},
		buttons: {
			drawing: "正在计算图片哈希...",
			draw: "开始抽奖"
		},
		results: {
			title: "结果与复现信息",
			imageHash: "图片 Hash",
			passcodeHash: "字符串 Hash",
			seed: "随机 Seed",
			winners: "中奖序号"
		},
		errors: {
			uploadImageFirst: "请先上传图片。",
			inputPasscode: "请输入字符串（例如 passcode）。",
			totalUsers: (maxUsers) => `抽奖总人数必须是 1 到 ${maxUsers} 之间的整数。`,
			winnerCount: "中奖人数必须是大于等于 0 的整数。",
			winnerExceedsTotal: "中奖人数不能大于抽奖总人数。",
			imageHashFailed: "图片哈希计算失败，请重试。",
			hashInProgress: "图片哈希仍在计算中，请稍候。",
			missingImageHash: "尚未获得图片哈希，请重新上传图片。",
			drawFailed: "抽奖过程失败，请重试。"
		},
		pageTitle: "IFS 抽奖系统",
		pageDescription: "一个可重现、可校验的 IFS 抽奖系统。",
		manifestName: "IFS 抽奖系统",
		manifestShortName: "IFS Gacha",
		manifestDescription: "可重现的 IFS 抽奖系统",
		metaLocale: "zh-CN"
	},
	en: {
		title: "IFS Gacha System",
		subtitle: "Use the same image and the same passcode to reproduce the exact same draw result every time.",
		githubStar: "Star on GitHub",
		language: "Language",
		steps: {
			uploadImage: "1. Upload image",
			inputPasscode: "2. Enter passcode / text",
			totalUsers: "3. Total participants",
			winnerCount: "4. Number of winners"
		},
		placeholders: {
			passcode: "Enter the IFS passcode announced on site",
			totalUsers: "1 - 1000",
			winnerCount: "0 - N"
		},
		hints: {
			selectedFile: "Selected: {name}",
			validation: "Validation: total participants must be 1~{maxUsers}, winners 0~N, and both must be integers.",
			waitingUpload: "Waiting for image upload",
			waitingDraw: "Waiting to run the draw",
			zeroWinners: "Winner count is 0, so no winning numbers are returned."
		},
		buttons: {
			drawing: "Calculating image hash...",
			draw: "Start draw"
		},
		results: {
			title: "Result and reproduction data",
			imageHash: "Image hash",
			passcodeHash: "Passcode hash",
			seed: "Random seed",
			winners: "Winning numbers"
		},
		errors: {
			uploadImageFirst: "Please upload an image first.",
			inputPasscode: "Please enter a passcode or text.",
			totalUsers: (maxUsers) => `Total participants must be an integer between 1 and ${maxUsers}.`,
			winnerCount: "Winner count must be an integer greater than or equal to 0.",
			winnerExceedsTotal: "Winner count cannot be greater than total participants.",
			imageHashFailed: "Failed to calculate the image hash. Please try again.",
			hashInProgress: "The image hash is still being calculated. Please wait.",
			missingImageHash: "Image hash is not available yet. Please re-upload the image.",
			drawFailed: "The draw failed. Please try again."
		},
		pageTitle: "IFS Gacha System",
		pageDescription: "A reproducible and verifiable gacha system for Ingress First Saturday events.",
		manifestName: "IFS Gacha System",
		manifestShortName: "IFS Gacha",
		manifestDescription: "A reproducible gacha system for IFS events",
		metaLocale: "en"
	},
	ja: {
		title: "IFS 抽選システム",
		subtitle: "同じ画像と同じ文字列を使えば、毎回まったく同じ抽選結果を再現できます。",
		githubStar: "Star on GitHub",
		language: "言語",
		steps: {
			uploadImage: "1. 画像をアップロード",
			inputPasscode: "2. 文字列 / Passcode を入力",
			totalUsers: "3. 参加人数",
			winnerCount: "4. 当選人数"
		},
		placeholders: {
			passcode: "会場で公開された IFS passcode を入力してください",
			totalUsers: "1 - 1000",
			winnerCount: "0 - N"
		},
		hints: {
			selectedFile: "選択済み: {name}",
			validation: "入力条件: 参加人数は 1〜{maxUsers}、当選人数は 0〜N、いずれも整数である必要があります。",
			waitingUpload: "画像のアップロード待ち",
			waitingDraw: "抽選実行待ち",
			zeroWinners: "当選人数が 0 のため、当選番号はありません。"
		},
		buttons: {
			drawing: "画像ハッシュを計算中...",
			draw: "抽選を開始"
		},
		results: {
			title: "結果と再現情報",
			imageHash: "画像ハッシュ",
			passcodeHash: "文字列ハッシュ",
			seed: "ランダム Seed",
			winners: "当選番号"
		},
		errors: {
			uploadImageFirst: "先に画像をアップロードしてください。",
			inputPasscode: "文字列（例: passcode）を入力してください。",
			totalUsers: (maxUsers) => `参加人数は 1〜${maxUsers} の整数で入力してください。`,
			winnerCount: "当選人数は 0 以上の整数で入力してください。",
			winnerExceedsTotal: "当選人数は参加人数を超えることはできません。",
			imageHashFailed: "画像ハッシュの計算に失敗しました。もう一度お試しください。",
			hashInProgress: "画像ハッシュを計算中です。しばらくお待ちください。",
			missingImageHash: "画像ハッシュがまだ取得できていません。画像を再アップロードしてください。",
			drawFailed: "抽選に失敗しました。もう一度お試しください。"
		},
		pageTitle: "IFS 抽選システム",
		pageDescription: "再現可能かつ検証可能な IFS 向け抽選システムです。",
		manifestName: "IFS 抽選システム",
		manifestShortName: "IFS Gacha",
		manifestDescription: "IFS向けの再現可能な抽選システム",
		metaLocale: "ja"
	}
};

export function getLocaleFromLanguage(language?: string | null): Locale {
	const normalized = language?.toLowerCase() ?? "";
	if (normalized.indexOf("zh") === 0) return "zh";
	if (normalized.indexOf("ja") === 0) return "ja";
	return fallbackLocale;
}

export function isLocale(value: string): value is Locale {
	for (const locale of supportedLocales) {
		if (locale === value) {
			return true;
		}
	}
	return false;
}
