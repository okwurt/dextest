import { CollectionGroup } from "./local-collection.js"
import { objectsFromTable, pokemonFromUnsanitised } from "./porting.js"
import { requestJSON } from "./main.js"

export function loadSheetsFrom(spreadsheet) {
	stuff.collectorInfo.spreadsheetId = spreadsheet.id
	stuff.collectorInfo.Name = "Unknown"
	for (var i in spreadsheet.spreadsheet.feed.entry) {
		var entry = spreadsheet.spreadsheet.feed.entry[i]
		var title = getValue(entry.title).trim()
		if (title.toLowerCase().indexOf("[hide]") > -1 ||
			title.toLowerCase().indexOf("item") > -1 ||
			title.toLowerCase().indexOf("template") > -1 ||
			title.toLowerCase().indexOf("config") > -1 ||
			title.toLowerCase().indexOf("database") > -1 ||
			title.toLowerCase().indexOf("resource") > -1 ||
			title.toLowerCase() == "db"
		) {
			if (i == "0") {
				stuff.data.addExternalSource("config")
				requestJSON(getWorksheetUrl(spreadsheet.id, 1), (r) => { parseConfig(r) })
			}
			continue
		}
		addNewTab(title, i)
	}
	return true
}

function getWorksheetUrl(spreadsheetId, worksheetId) {
	return "https://spreadsheets.google.com/feeds/list/" + spreadsheetId + "/" + worksheetId + "/public/values?alt=json"
}

export function getSpreadsheetUrl(spreadsheetId) {
	return "https://spreadsheets.google.com/feeds/worksheets/" + spreadsheetId + "/public/basic?alt=json"
}

function getValue(field) {
	if (field) return field.$t
	return undefined
}

function tryValues(values, entry) {
	for (var i in values)
		if (entry["gsx$" + values[i]] && entry["gsx$" + values[i]].$t)
			return entry["gsx$" + values[i]].$t.trim()
	return undefined
}

function addNewTab(title, index) {
	const tab = stuff.externalCollectionGroup.addTab(title, [])
	stuff.data.addExternalSource(index)
	requestJSON(getWorksheetUrl(stuff.collectorInfo.spreadsheetId, (+index) + 1), parseSheet(tab, index))
}

function parseSheet(tab, index) {
	return (response) => {
		var table = tablify(response.feed.entry)
		tab.pokemons = objectsFromTable(table).map(e => pokemonFromUnsanitised(e)).filter(e => e)
		stuff.data.external[index] = true
		stuff.tryLoadAgain()
	}
}

function tablify(entries) {
	var headers = {}
	var table = [[]]
	for (var i in entries) {
		var entry = entries[i]
		var newEntry = []
		var keys = Object.keys(entry)
		for (var j in keys) {
			var key = keys[j].substr(4)
			if (!(0 < headers[key]))
				headers[key] = Object.keys(headers).length
			newEntry[headers[key]] = entry[keys[j]].$t
		}
		table.push(newEntry)
	}
	for (var i in headers)
		table[0][headers[i]] = i
	return table
}

function parseConfig(response) {
	var entry = response.feed.entry[0]
	stuff.collectorInfo.name = tryValues(["ingamename"], entry) || "Unknown"
	stuff.collectorInfo.friendCode = tryValues(["friendcode"], entry)
	stuff.collectorInfo.url = tryValues(["contacturl"], entry)
	var showBreedables = tryValues(["showbreedables"], entry)
	stuff.collectorInfo.showBreedables = !!showBreedables && showBreedables.toLowerCase().trim() !== "no" && showBreedables.toLowerCase().trim() !== "false"
	/*var colorScheme = tryValues(["colorscheme"], entry)
	if (colorScheme)
		colorScheme = colorScheme.toLowerCase()
	if (colorScheme == "custom") {
		stuff.collectorInfo.colorScheme = colorScheme
		stuff.headerSection.navGroups.colours.custom = {
			text: "●",
			click: () => { stuff.settings.colorScheme = "custom"; stuff.updateColors() },
			active: () => stuff.settings.colorScheme == "custom",
			style: { fontSize: "1.2rem" }
		}
	}
	if ((colorScheme == "night" || colorScheme == "day") && !(localStorage && localStorage.colorScheme))
		stuff.collectorInfo.colorScheme = colorScheme
	stuff.collectorInfo.colorSchemes.custom[0] = tryValues(["custombackgroundcolor", "backgroundcolor"], entry)
	stuff.collectorInfo.colorSchemes.custom[1] = tryValues(["customtextcolor", "textcolor"], entry)
	stuff.collectorInfo.colorSchemes.custom[2] = tryValues(["customheadercolor", "headercolor"], entry)
	*/
	stuff.data.external["config"] = true
	stuff.tryLoadAgain()
}

