// ==UserScript==
// @name         NotSoSharp
// @namespace    https://github.com/gui-ying233/NotSoSharp
// @version      1.5.1
// @description  尝试还原萌娘百科部分一方通行所屏蔽的内容
// @author       鬼影233
// @license      MIT
// @match        zh.moegirl.org.cn/*
// @match        mzh.moegirl.org.cn/*
// @match        mobile.moegirl.org.cn/*
// @match        commons.moegirl.org.cn/*
// @icon         https://img.moegirl.org.cn/common/b/b7/%E5%A4%A7%E8%90%8C%E5%AD%97.svg
// @supportURL   https://github.com/gui-ying233/NotSoSharp/issues
// ==/UserScript==

(async () => {
	"use strict";
	if (
		new URLSearchParams(window.location.search).get("safemode") ||
		document.currentScript ||
		!document.documentElement.innerText.includes("\u266F")
	)
		return;
	let pageName = "";
	await new Promise(resolve => {
		const intervId = setInterval(() => {
			window.onload = (() => {
				if ([typeof mw, typeof wgULS].includes("undefined")) return;
				clearInterval(intervId);
				resolve();
			})();
		}, 50);
	});
	switch (mw.config.get("wgNamespaceNumber")) {
		case 2:
		case 3:
			pageName = wgULS("用户", "用戶");
			break;
		case 10:
		case 11:
			pageName = "模板";
			break;
		case 14:
		case 15:
			pageName = wgULS("分类", "分類");
			break;
		default:
			break;
	}
	switch (mw.config.get("wgNamespaceNumber")) {
		case 1:
		case 3:
		case 5:
		case 9:
		case 11:
		case 13:
		case 15:
			pageName += wgULS("讨论", "討論");
			break;
		default:
			break;
	}
	pageName += `${pageName ? ":" : ""}${mw.config.get("wgTitle")}`;
	const r = (a, b, c = pageName) => {
		if (a[b].includes("\u266F") && a[b] !== "幻影异闻录♯FE") a[b] = c;
	};
	r(document.getElementById("firstHeading"), "innerText");
	r(document, "title", `${pageName} - 萌娘百科_万物皆可萌的百科全书`);
	switch (mw.config.get("skin")) {
		case "vector":
			document.body
				.querySelectorAll(".toctext")
				.forEach(e =>
					r(e, "innerText", decodeURI(e.parentElement.hash.slice(1)))
				);
			break;
		case "moeskin":
		default:
			document.body
				.querySelectorAll(".moe-toc-tree.root a.anchor-link")
				.forEach(e =>
					r(e, "title", decodeURI(e.hash.replaceAll(".", "%")))
				);
			document.body
				.querySelectorAll(".moe-toc-tree.root a.anchor-link > .text")
				.forEach(e =>
					r(
						e,
						"innerText",
						decodeURI(
							e.parentElement.hash.replaceAll(".", "%")
						).slice(1)
					)
				);
			break;
	}
	document.body
		.querySelectorAll(".mw-headline")
		.forEach(e => r(e, "innerText", decodeURI(e.id)));
	document.body.querySelectorAll("a:not(#catlinks a)").forEach(e => {
		if (
			e.innerText.includes("\u266F") &&
			(new Set(e.innerHTML).size === 1 ||
				e.classList.contains("mw-changeslist-title") ||
				e.classList.contains("mw-userlink"))
		)
			e.innerText =
				new URL(e).searchParams.get("title") ||
				e.getAttribute("data-username") ||
				decodeURI(e.pathname).slice(1);
	});
	document.body.querySelectorAll(".mw-selflink").forEach(e => {
		switch (e.innerHTML.length) {
			case pageName.length:
				r(e, "innerText");
				break;
			case mw.config.get("wgPageName").length:
				r(e, "innerText", mw.config.get("wgPageName"));
				break;
		}
	});
	document.body.querySelectorAll("#catlinks a").forEach(e => {
		if (e.innerText.includes("\u266F") && new Set(e.innerHTML).size === 1)
			e.innerText = decodeURI(e.pathname).slice(10);
	});
	document.body.getElementsByTagName("a").forEach(e => {
		if (!e.innerHTML.includes("\u266F") || e.innerHTML !== e.innerText)
			return;
		let url;
		switch (e.className) {
			case "new":
				url = new URL(e).searchParams.get("title");
				break;
			case "external":
			case "external free":
			case "external text":
				url = e.href;
				break;
			default:
				url = e.pathname.slice(1);
				break;
		}
		url = decodeURI(url);
		if (e.classList.contains("external")) url = url.replace(/\/$/, "");
		if (url.length !== e.innerText.length) return;
		const regexp = `${e.innerText
			.replaceAll(".", "\\.")
			.replaceAll("\u266F", ".")}`;
		if (url.match(regexp)) e.innerText = url.match(regexp)[0];
	});
})();
