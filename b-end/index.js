import puppeteer from "puppeteer";
import keys from "./config/keys.js";

const scrapeData = async (data) => {
	const NODE_ENV = keys.NODE_ENV;

	let browser;
	let userInfo;
	try {
		//Create browser instance
		if (NODE_ENV != "production") {
			browser = await puppeteer.connect({
				browserWSEndpoint:
					"ws://127.0.0.1:9222/devtools/browser/60766b51-7556-43e1-8f96-cea47e6ff6a9",
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
			"#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > span > img"
		);

		if (isProfile) {
			await page.click(
				"#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.ctQZg > div > div:nth-child(5) > span > img"
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
		userInfo = await page.evaluate((selector) => {
			let user = null;
			user.followersCount = await document.querySelector(`${selector} > li:nth-child(2) > a`).innerText;
			user.followersCount = await document.querySelector(`${selector} > li:nth-child(3) > a > span`).innerText;

			return user;
		})

		console.log(
			"Followers: " + userInfo.followersCount + "\n" + "Following: " + userInfo.followingCount
		);

		// await page.click(
		// 	"#react-root > section > main > div > header > section > ul > li:nth-child(2) > a"
		// );

		//Get followers list
		// await page.waitForSelector(
		// 	"body > div.RnEpo.Yx5HN > div > div > div:nth-child(2) > ul > div > li"
		// );

		const arr = await scrapeFollowers(page, extItems, 238, 10);

		console.log(arr);

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

const scrapeFollowers = async (
	page,
	extItems,
	itemCount,
	scrollDelay = 800
) => {
	let items = [];
	try {
		let prevHeight;
		while (items.length < itemCount) {
			items = await page.evaluate(extItems);
			prevHeight = await page.evaluate("document.body.scrollHeight");
			await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
			await page.waitForFunction(`document.body.scrollHeight > ${prevHeight}`);
			await page.waitForTimeout(scrollDelay);
		}
	} catch (error) {}
	return items;
};

const extItems = () => {
	const followersArr = [];
	const extEl = document.querySelectorAll(
		"body > div.RnEpo.Yx5HN > div > div > div:nth-child(2) > ul > div > li"
	);
	for (let el of extEl) {
		followersArr.push(el.innerText.split("\n")[0]);
	}
	return followersArr;
};

const handlePopup = async (page, selector) => {
	try {
		await page.waitForSelector(selector);
		await page.evaluate(() => {
			return document.querySelector(selector) ? true : false;
		});
	} catch (error) {
		return false;
	}
};

// const wait = (duration) => {
//   console.log('waiting', duration);
//   return new Promise(resolve => setTimeout(resolve, duration));
// };
