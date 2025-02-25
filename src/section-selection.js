import { Component, l, update } from "./arf.js"
import iconButton, { grabIcon, crossIcon } from "./icons.js"
import { Styling } from "./styling.js"
import { callOrReturn } from "./util.js"

export class SectionSelection extends Component {
	constructor(main) {
		super()
		this.main = main
		this.content = null
		this.top = 0
		this.grabbing = false
		window.addEventListener("touchmove", (event) => {
			if (this.grabbing) {
				this.top = -(window.innerHeight - event.targetTouches[0].clientY) - 10
				if (this.top < -window.innerHeight)
					this.top = -window.innerHeight
				if (this.top > -24)
					this.top = -24
				update()
			}
		})
		window.addEventListener("touchend", () => {
			this.grabbing = false
		})
		window.addEventListener("mousemove", (event) => {
			if (this.grabbing) {
				this.top = -(window.innerHeight - event.clientY) - 10
				if (this.top < -window.innerHeight)
					this.top = -window.innerHeight
				if (this.top > -24)
					this.top = -24
				update()
			}
		})
		window.addEventListener("mouseup", () => {
			this.grabbing = false
		})
	}

	getTop() {
		return this.content ? (this.top ? this.top + "px" : "-50vh") : "0"
	}

	renderThis() {
		const topPixels = this.content && this.content.header ? 24 + 16 * 3 : 24
		return l("section",
			l("div.position-box",
				{
					style: {
						top: this.getTop()
					}
				},
				l("div.selection-box" + (this.content ? ".show" : ""),
					this.grabBar(),
					...[this.content && this.content.header ? this.content.header() : undefined].filter(e => e),
					l("div.content",
						{
							style: {
								height: this.top ? -this.top - topPixels + "px" : "calc(50vh - " + topPixels + "px)"
							}
						}, this.content ? callOrReturn(this.content) : "")
				)
			)
		)
	}

	static styleThis() {
		return {
			section: {
				position: "relative",
				color: Styling.styling.mainText
			},
			"div.position-box": {
				position: "absolute",
				width: "100%",
				minHeight: "100vh"
			},
			"div.selection-box": {
				position: "absolute",
				top: "100%",
				width: "100%",
				height: "100%",
				backgroundColor: Styling.styling.mainBackground,
				borderTop: "1px solid rgba(130,130,130,0.5)",
				transition: "0.3s"
			},
			"div.selection-box.show": {
				top: "0",
				transition: "0.3s"
			},
			header: {
				fontSize: "1.5rem",
				fontWeight: "bold",
				height: "3rem",
				lineHeight: "3rem",
				display: "flex"
			},
			"header button": {
				height: "2.5rem",
				width: "2.5rem",
				padding: "0.5rem",
				margin: "0.25rem"
			},
			".header-area": {
				flexGrow: "1"
			},
			".button-area": {
				height: "3rem",
				minWidth: "fit-content"
			},
			"div.content": {
				position: "absolute",
				overflowY: "auto",
				width: "100%",
				height: "100%",
			},
			"div.grab": {
				width: "100%",
				height: "1.5rem",
				cursor: "n-resize"
			},
			".close-button": {
				position: "absolute",
				fontSize: "0.75rem",
				width: "2rem",
				right: "0",
				opacity: "0.5",
				transition: "0.3s ease"
			},
			".close-button:hover": {
				opacity: "1",
				transition: "0.3s ease"
			}
		}
	}

	grabBar() {
		return l("div.grab",
			{
				onmousedown: () => {
					this.grabbing = true
				},
				ontouchstart: () => {
					this.grabbing = true
				}
			},
			grabIcon({ filter: Styling.styling.mainIconFilter }),
			iconButton(crossIcon({ filter: Styling.styling.mainIconFilter }), () => this.clearSelection(), ".close-button"))
	}

	clearSelection() {
		this.content = null
		if (this.clear)
			this.clear()
		update()
	}
}
