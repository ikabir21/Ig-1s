import puppeteer from "puppeteer";
import keys from "./config/keys.js";

const scrapeFollowers = async (
	page,
	scrapeItem,
	itemCount,
	selectors
) => {
	let items = [];
	try {
		await page.waitForSelector(selectors.selectorToClick);
		await page.click(selectors.selectorToClick);

		const followersDiv = selectors.divToScroll;
		await page.waitForSelector(followersDiv);

		while (items.length < itemCount) {
			items = await page.evaluate(scrapeItem);

			await page.evaluate(selector => {
				const element = document.querySelector(selector);
				if ( element ) {
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
		items.push(el.innerText.split("\n")[0]);
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

const scrapeData = async () => {
	const NODE_ENV = keys.NODE_ENV;
	let browser;
	let userInfo;
	try {
		//Create browser instance
		if (NODE_ENV != "production") {
			browser = await puppeteer.connect({
				browserWSEndpoint:
					"ws://127.0.0.1:9222/devtools/browser/41afd70e-0625-4b02-9f65-0cf8dfe5aec5",
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

			const isSave = await handlePopup(
				page,
				"#react-root > section > main > div > div > div > div > button"
			);

			if (isSave) {
				await page.waitForSelector(
					"#react-root > section > main > div > div > div > div > button"
				);
				await page.click(
					"#react-root > section > main > div > div > div > div > button"
				);
				await page.waitForNavigation();
			}

			const isPopup = await handlePopup(
				page,
				"body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm"
			);

			if (isPopup) {
				await page.waitForSelector(
					"body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm"
				);
				await page.click(
					"body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm"
				);
			}
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
			await page.waitForSelector(
				"#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > div.poA5q > div.uo5MA._2ciX.tWgj8.XWrBI > div._01UL2 > a:nth-child(1)"
			);
			await page.click(
				"#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > div.poA5q > div.uo5MA._2ciX.tWgj8.XWrBI > div._01UL2 > a:nth-child(1)"
			);
		}

		const selector = "#react-root > section > main > div > header > section > ul";
		await page.waitForSelector(selector);
		userInfo = await page.evaluate(async (selector) => {
			let user = {};
			user.followersCount = await document.querySelector(
				`${selector} > li:nth-child(2) > a > span`
			).innerText;
			user.followingsCount = await document.querySelector(
				`${selector} > li:nth-child(3) > a > span`
			).innerText;

			return user;
		}, selector);


		const followersSelector = {
			selectorToClick: "#react-root > section > main > div > header > section > ul > li:nth-child(2) > a > span",
			divToScroll: "body > div.RnEpo.Yx5HN > div > div > div.isgrP"
		}
		userInfo.followersArr = await scrapeFollowers(page, scrapeItem, userInfo.followersCount, followersSelector);

		const cancelButton = "body > div.RnEpo.Yx5HN > div > div > div:nth-child(1) > div > div:nth-child(3) > button";
		await page.waitForSelector(cancelButton);
		await page.click(cancelButton);

		const followingsSelector = {
			selectorToClick: "#react-root > section > main > div > header > section > ul > li:nth-child(3) > a > span",
			divToScroll: "body > div.RnEpo.Yx5HN > div > div > div.isgrP"
		}
		userInfo.followingsArr = await scrapeFollowers(page, scrapeItem, userInfo.followingsCount, followingsSelector);

		await page.waitForSelector(cancelButton);
		await page.click(cancelButton);

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
