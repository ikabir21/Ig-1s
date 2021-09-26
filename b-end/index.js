import puppeteer from "puppeteer";
import keys from "./config/keys.js";

const scrapeFollowers = async (page, scrapeItem, itemCount, child) => {
	let items = [];
	try {
		await click(
			page,
			`#react-root > section > main > div > header > section > ul > li:nth-child(${child}) > a > span`
		);

		const followersDiv = "body > div.RnEpo.Yx5HN > div > div > div.isgrP";
		await page.waitForSelector(followersDiv);

		while (items.length < itemCount) {
			items = await page.evaluate(scrapeItem);

			await page.evaluate((selector) => {
				const element = document.querySelector(selector);
				if (element) {
					element.scrollTop += element.offsetHeight;
					console.error(`Scrolled to selector ${selector}`);
				} else {
					console.error(`cannot find selector ${selector}`);
				}
			}, followersDiv);
		}
	} catch (error) {
		console.log(error);
	}
	return items;
};

const scrapeItem = () => {
	const items = [];

	const extEl = document.querySelectorAll(
		"body > div.RnEpo.Yx5HN > div > div > div.isgrP > ul > div > li"
	);

	for (let el of extEl) {
		items.push({
			username: el.innerText.split("\n")[0],
			name: el.innerText.split("\n")[1],
		});
	}
	return items;
};

const handlePopup = async (page, selector) => {
	try {
		await page.waitForSelector(selector);
		const res = await page.evaluate(async (selector) => {
			const res = await document.querySelector(selector).innerHTML;
			return res ? true : false;
		}, selector);
		return res;
	} catch (error) {
		return error;
	}
};

const click = async (page, selector) => {
	await page.waitForSelector(selector);
	await page.click(selector);
};

const scrapeData = async () => {
	const NODE_ENV = keys.NODE_ENV;
	let browser;
	let userInfo;
	try {
		//Create browser instance
		if (NODE_ENV != "production") {
			browser = await puppeteer.connect({
				browserWSEndpoint:
					"ws://127.0.0.1:9222/devtools/browser/7145beec-a65e-4cf8-8d97-29833aedcc3d",
				defaultViewport: null,
				args: ["--start-maximized", "-incognito"],
			});
		} else {
			browser = await puppeteer.launch({
				headless: false,
				defaultViewport: null,
				args: ["--start-maximized"],
			});
		}

		// Create a new page
		const page = await browser.newPage();
		await page.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36"
		);
		page.once("domcontentloaded", () => console.info("✅ DOM is ready"));
		page.once("load", () => console.info("✅ Page is loaded"));
		await page.goto("https://www.instagram.com");
		await page.setDefaultTimeout(0);

		//Signin
		if (NODE_ENV === "production") {
			await page.waitForSelector("#loginForm");
			await page.type(
				"#loginForm > div > div:nth-child(1) > div > label > input",
				keys.ig.username
			);
			await page.type(
				"#loginForm > div > div:nth-child(2) > div > label > input",
				keys.ig.password
			);
			await page.click("#loginForm > div > div:nth-child(3) > button > div");
			await page.waitForNavigation();

			const savePopupSelector =
				"#react-root > section > main > div > div > div > div > button";
			const isSave = await handlePopup(page, savePopupSelector);
			if (isSave) {
				await click(savePopupSelector);
				await page.waitForNavigation();
			}

			const otherPopupSelector =
				"body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm";
			const isPopup = await handlePopup(page, otherPopupSelector);
			isPopup && click(otherPopupSelector);
		}

		const isProfile = await handlePopup(
			page,
			"#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5)"
		);

		console.log(isProfile, "Profile");

		if (isProfile) {
			await page.click(
				"#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5)"
			);
			const profileSelector =
				"#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > div.poA5q > div.uo5MA._2ciX.tWgj8.XWrBI > div._01UL2 > a:nth-child(1)";
			await click(page, profileSelector);
		}

		const selector =
			"#react-root > section > main > div > header > section > ul";
		await page.waitForSelector(selector);
		userInfo = await page.evaluate(async (selector) => {
			let user = {};
			user.followersCount = await document.querySelector(
				`${selector} > li:nth-child(2) > a > span`
			).innerText;
			user.followingsCount = await document.querySelector(
				`${selector} > li:nth-child(3) > a > span`
			).innerText;
			user.noOfPosts = await document.querySelector(
				`${selector} > li:nth-child(1) > span > span`
			).innerText;
			return user;
		}, selector);

		userInfo.followersArr = await scrapeFollowers(
			page,
			scrapeItem,
			userInfo.followersCount,
			2
		);

		const cancelButton =
			"body > div.RnEpo.Yx5HN > div > div > div:nth-child(1) > div > div:nth-child(3) > button";
		await click(page, cancelButton);

		userInfo.followingsArr = await scrapeFollowers(
			page,
			scrapeItem,
			userInfo.followingsCount,
			3
		);

		await click(page, cancelButton);

		// await page.waitForSelector("#f3e4fbe0cb5191c > div > div > span > a");

		// const selector = await page.$eval(
		// 	"#f3e4fbe0cb5191c > div > div > span > a",
		// 	(el) => {
		// 		return el.innerHTML;
		// 	}
		// );

		// console.log("Username: " + selector)

		//close logout and close

		// await page.waitForSelector(
		// 	"body > div.RnEpo.Yx5HN > div > div > div:nth-child(1) > div > div:nth-child(3) > button"
		// );

		// await page.click(
		// 	"body > div.RnEpo.Yx5HN > div > div > div:nth-child(1) > div > div:nth-child(3) > button"
		// );

		// //Logout
		// if (isProfile) {
		// 	await page.click(
		// 		"#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > span > img"
		// 	);

		// 	await page.waitForSelector(
		// 		"#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > div.poA5q > div.uo5MA._2ciX.tWgj8.XWrBI > div._01UL2 > div:nth-child(6) > div"
		// 	);

		// 	await page.click(
		// 		"#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > div.poA5q > div.uo5MA._2ciX.tWgj8.XWrBI > div._01UL2 > div:nth-child(6) > div"
		// 	);
		// }

		// await page.close();
		// await browser.close();
	} catch (e) {
		console.error("Error!", e.message);
	}
	return userInfo;
};

const userInfo = await scrapeData();

console.log(userInfo);

async function autoScroll(page) {
	await page.evaluate(async () => {
		await new Promise((resolve, reject) => {
			var totalHeight = 0;
			var distance = 100;
			var timer = setInterval(() => {
				var scrollHeight = document.body.scrollHeight;
				window.scrollBy(0, distance);
				totalHeight += distance;
				if (totalHeight >= scrollHeight) {
					clearInterval(timer);
					resolve();
				}
			}, 300);
		});
	});
}

// const wait = (duration) => {
//   console.log('waiting', duration);
//   return new Promise(resolve => setTimeout(resolve, duration));
// };
