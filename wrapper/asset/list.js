/**
 * route
 * asset listing
 */
// vars
const header = process.env.XML_HEADER;
// stuff
const Asset = require("./main");

async function listAssets(data) {
	var xml, files;
	switch (data.type) {
		case "char": {
			let themeId;
			switch (data.themeId) { // fix theme id
				case "custom": {
					themeId = "family";
					break;
				}
				case "action": {
					themeId = "cc2";
					break;
				}
				default: {
					themeId = data.themeId;
					break;
				}
			}
			files = Asset.list({
				themeId: themeId,
				type: "char",
				subtype: 0,
			});
			xml = `${header}<ugc more="0">${files
				.map(v => `<char id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" cc_theme_id="${v.themeId}" thumbnail_url="/assets/${v.id}.png" copyable="Y"><tags>${v.tags}</tags></char>`)
				.join("")}</ugc>`;
			break;
		} default: {
			files = Asset.list(data);
			xml = `${header}<ugc more="0">${
				files.map(v => Asset.meta2Xml(v)).join("")}</ugc>`;
			break;
		}
	}
	return xml;
}

/**
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = async function (req, res, url) {
	if (req.method != "POST") return;

	switch (url.pathname) {
		case "/api_v2/assets/team":
		case "/api_v2/assets/shared":
		case "/api_v2/assets/imported": {
			if (!req.body.data.type) {
				res.statusCode = 400;
				res.end();
				return true;
			}

			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({
				status: "ok",
				data: { xml: await listAssets(req.body.data) }
			}));
			break;
		} case "/goapi/getUserAssetsXml/": {
			if (!req.body.type) {
				res.statusCode = 400;
				res.end();
				return true;
			}
			
			res.setHeader("Content-Type", "text/html; charset=UTF-8");
			res.end(await listAssets(req.body));
			break;
		} default: return;
	}	
	return true;
}