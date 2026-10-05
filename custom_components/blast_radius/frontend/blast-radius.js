//#region node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, ee = h.trustedTypes, te = ee ? ee.emptyScript : "", ne = h.reactiveElementPolyfillSupport, g = (e, t) => e, _ = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? te : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, re = (e, t) => !l(e, t), ie = {
	attribute: !0,
	type: String,
	converter: _,
	reflect: !1,
	useDefault: !1,
	hasChanged: re
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var v = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = ie) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? ie;
	}
	static _$Ei() {
		if (this.hasOwnProperty(g("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(g("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(g("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? _ : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? _ : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? re)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[g("elementProperties")] = /* @__PURE__ */ new Map(), v[g("finalized")] = /* @__PURE__ */ new Map(), ne?.({ ReactiveElement: v }), (h.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/lit-html/lit-html.js
var y = globalThis, ae = (e) => e, b = y.trustedTypes, oe = b ? b.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, x = "$lit$", S = `lit$${Math.random().toFixed(9).slice(2)}$`, C = "?" + S, se = `<${C}>`, w = document, T = () => w.createComment(""), E = (e) => e === null || typeof e != "object" && typeof e != "function", ce = Array.isArray, le = (e) => ce(e) || typeof e?.[Symbol.iterator] == "function", ue = "[ 	\n\f\r]", D = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, de = /-->/g, fe = />/g, O = RegExp(`>|${ue}(?:([^\\s"'>=/]+)(${ue}*=${ue}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), pe = /'/g, me = /"/g, he = /^(?:script|style|textarea|title)$/i, ge = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), k = ge(1), _e = ge(2), A = Symbol.for("lit-noChange"), j = Symbol.for("lit-nothing"), ve = /* @__PURE__ */ new WeakMap(), M = w.createTreeWalker(w, 129);
function ye(e, t) {
	if (!ce(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return oe === void 0 ? t : oe.createHTML(t);
}
var be = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = D;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === D ? c[1] === "!--" ? o = de : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = O) : (he.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = O) : o = fe : o === O ? c[0] === ">" ? (o = i ?? D, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? O : c[3] === "\"" ? me : pe) : o === me || o === pe ? o = O : o === de || o === fe ? o = D : (o = O, i = void 0);
		let d = o === O && e[t + 1].startsWith("/>") ? " " : "";
		a += o === D ? n + se : l >= 0 ? (r.push(s), n.slice(0, l) + x + n.slice(l) + S + d) : n + S + (l === -2 ? t : d);
	}
	return [ye(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, N = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = be(t, n);
		if (this.el = e.createElement(l, r), M.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = M.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(x)) {
					let t = u[o++], n = i.getAttribute(e).split(S), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Se : r[1] === "?" ? Ce : r[1] === "@" ? we : I
					}), i.removeAttribute(e);
				} else e.startsWith(S) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (he.test(i.tagName)) {
					let e = i.textContent.split(S), t = e.length - 1;
					if (t > 0) {
						i.textContent = b ? b.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], T()), M.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], T());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === C) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(S, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += S.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = w.createElement("template");
		return n.innerHTML = e, n;
	}
};
function P(e, t, n = e, r) {
	if (t === A) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = E(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = P(e, i._$AS(e, t.values), i, r)), t;
}
var xe = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? w).importNode(t, !0);
		M.currentNode = r;
		let i = M.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new F(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Te(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = M.nextNode(), a++);
		}
		return M.currentNode = w, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, F = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = j, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = P(this, e, t), E(e) ? e === j || e == null || e === "" ? (this._$AH !== j && this._$AR(), this._$AH = j) : e !== this._$AH && e !== A && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? le(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== j && E(this._$AH) ? this._$AA.nextSibling.data = e : this.T(w.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = N.createElement(ye(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new xe(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = ve.get(e.strings);
		return t === void 0 && ve.set(e.strings, t = new N(e)), t;
	}
	k(t) {
		ce(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(T()), this.O(T()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ae(e).nextSibling;
			ae(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, I = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = j, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = j;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = P(this, e, t, 0), a = !E(e) || e !== this._$AH && e !== A, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = P(this, r[n + o], t, o), s === A && (s = this._$AH[o]), a ||= !E(s) || s !== this._$AH[o], s === j ? e = j : e !== j && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === j ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Se = class extends I {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === j ? void 0 : e;
	}
}, Ce = class extends I {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== j);
	}
}, we = class extends I {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = P(this, e, t, 0) ?? j) === A) return;
		let n = this._$AH, r = e === j && n !== j || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== j && (n === j || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Te = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		P(this, e);
	}
}, Ee = {
	M: x,
	P: S,
	A: C,
	C: 1,
	L: be,
	R: xe,
	D: le,
	V: P,
	I: F,
	H: I,
	N: Ce,
	U: we,
	B: Se,
	F: Te
}, De = y.litHtmlPolyfillSupport;
De?.(N, F), (y.litHtmlVersions ??= []).push("3.3.3");
var Oe = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new F(t.insertBefore(T(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, L = globalThis, R = class extends v {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Oe(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return A;
	}
};
R._$litElement$ = !0, R.finalized = !0, L.litElementHydrateSupport?.({ LitElement: R });
var ke = L.litElementPolyfillSupport;
ke?.({ LitElement: R }), (L.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/lit-html/directive.js
var Ae = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, je = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Me = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, { I: Ne } = Ee, Pe = (e) => e, Fe = () => document.createComment(""), z = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new Ne(r.insertBefore(Fe(), i), r.insertBefore(Fe(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = Pe(e).nextSibling;
				Pe(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, B = (e, t, n = e) => (e._$AI(t, n), e), Ie = {}, Le = (e, t = Ie) => e._$AH = t, Re = (e) => e._$AH, V = (e) => {
	e._$AR(), e._$AA.remove();
}, ze = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, Be = je(class extends Me {
	constructor(e) {
		if (super(e), e.type !== Ae.CHILD) throw Error("repeat() can only be used in text expressions");
	}
	dt(e, t, n) {
		let r;
		n === void 0 ? n = t : t !== void 0 && (r = t);
		let i = [], a = [], o = 0;
		for (let t of e) i[o] = r ? r(t, o) : o, a[o] = n(t, o), o++;
		return {
			values: a,
			keys: i
		};
	}
	render(e, t, n) {
		return this.dt(e, t, n).values;
	}
	update(e, [t, n, r]) {
		let i = Re(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = B(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = B(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = B(i[d], a[m]), z(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = B(i[f], a[p]), z(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = ze(o, p, m), u = ze(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = z(e, i[d]);
					B(t, a[p]), c[p] = t;
				} else c[p] = B(n, a[p]), z(e, i[d], n), i[t] = null;
				p++;
			} else V(i[f]), f--;
		} else V(i[d]), d++;
		for (; p <= m;) {
			let t = z(e, c[m + 1]);
			B(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && V(e);
		}
		return this.ut = o, Le(e, c), A;
	}
}), Ve = o`
  :host {
    display: block;
    height: 100%;
    overflow: auto;
    color: var(--primary-text-color, #212121);
    background: var(--primary-background-color, #fafafa);
    font-family:
      var(--ha-font-family-body, Roboto),
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Arial,
      sans-serif;
    font-size: 16px;
    line-height: 1.55;
    --br-card: var(--card-background-color, #fff);
    --br-border: color-mix(
      in srgb,
      var(--primary-text-color, #212121) 22%,
      var(--br-card)
    );
    --br-muted: color-mix(
      in srgb,
      var(--primary-text-color, #212121) 82%,
      var(--br-card)
    );
    --br-accent: var(--primary-color, #03a9f4);
  }
  * {
    box-sizing: border-box;
  }
  header {
    height: 64px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 24px;
    border-bottom: 1px solid var(--br-border);
    background: var(--br-card);
    position: sticky;
    top: 0;
    z-index: 2;
  }
  header strong {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.4px;
    white-space: nowrap;
  }
  .brand-lockup {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-mark {
    display: block;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    color: var(--primary-text-color, #25313b);
  }
  .brand-mark .radius {
    fill: var(--br-accent);
  }
  header .badge {
    margin-left: auto;
  }
  .menu {
    border: 0;
    padding: 8px;
    font-size: 22px;
    background: transparent;
  }
  main {
    max-width: 1380px;
    margin: auto;
    padding: 30px 32px 50px;
  }
  h1 {
    font-size: 28px;
    font-weight: 500;
    margin: 10px 0;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  h2 {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 16px;
  }
  h3 {
    font-size: 16px;
    margin: 0 0 8px;
  }
  p {
    line-height: 1.55;
  }
  .muted {
    color: var(--br-muted);
  }
  .intro {
    margin: 0 0 25px;
  }
  .search {
    display: flex;
    align-items: end;
    gap: 12px;
    margin: 20px 0 8px;
  }
  .search label {
    flex: 1;
  }
  .analysis-options {
    width: fit-content;
    margin: 0 0 18px;
    color: var(--br-muted);
  }
  .analysis-options > summary {
    padding: 7px 0;
    font-size: 13px;
  }
  .analysis-options-body {
    display: flex;
    align-items: end;
    gap: 14px;
    padding: 8px 0 4px;
  }
  .analysis-options-body p {
    margin: 0 0 9px;
    max-width: 540px;
    font-size: 13px;
  }
  .recent-searches {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: -6px 0 22px;
    min-width: 0;
  }
  .recent-label {
    color: var(--br-muted);
    font-size: 13px;
  }
  .recent-list {
    display: flex;
    gap: 8px;
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    padding: 4px;
  }
  .recent-search {
    font-size: 13px;
    padding: 8px 12px;
    white-space: nowrap;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }
  .recent-search[aria-pressed="true"] {
    border-color: var(--br-accent);
  }
  .clear-recent {
    font-size: 13px;
    border-color: transparent;
    padding: 8px;
    background: transparent;
  }
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
  }
  input,
  select,
  textarea {
    display: block;
    width: 100%;
    font: inherit;
    color: inherit;
    background: var(--br-card);
    border: 1px solid var(--br-border);
    border-radius: 8px;
    padding: 12px;
    margin-top: 7px;
    min-height: 46px;
  }
  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    padding: 12px 16px;
    background: var(--br-card);
    min-height: 44px;
    font-weight: 500;
  }
  button.primary {
    background: color-mix(in srgb, var(--br-card) 85%, var(--br-accent));
    color: var(--primary-text-color, #212121);
    border-color: var(--br-accent);
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  button:hover:not(:disabled) {
    filter: brightness(0.94);
  }
  :focus-visible {
    outline: 3px solid var(--br-accent);
    outline-offset: 3px;
  }
  code {
    font:
      13px/1.65 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    overflow-wrap: anywhere;
  }
  .badge {
    display: inline-block;
    font-size: 12px;
    letter-spacing: 0.25px;
    border: 1px solid var(--br-border);
    border-radius: 5px;
    padding: 4px 7px;
    white-space: nowrap;
    color: var(--br-muted);
  }
  .explicit {
    --br-confidence-accent: var(--success-color, #288048);
  }
  .template_literal,
  .dynamic,
  .unknown {
    --br-confidence-accent: var(--warning-color, #9b6600);
  }
  .badge.explicit,
  .badge.template_literal,
  .badge.dynamic,
  .badge.unknown {
    color: var(--primary-text-color, #212121);
    background: color-mix(
      in srgb,
      var(--br-card) 92%,
      var(--br-confidence-accent)
    );
    border-color: color-mix(
      in srgb,
      var(--br-border) 65%,
      var(--br-confidence-accent)
    );
    font-size: 12px;
    font-weight: 500;
  }
  .badge.explicit::before,
  .badge.template_literal::before,
  .badge.dynamic::before,
  .badge.unknown::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: 1px;
    background: var(--br-confidence-accent);
  }
  .impact-summary {
    display: grid;
    grid-template-columns: minmax(250px, 0.78fr) minmax(0, 1.22fr);
    gap: 0;
    margin: 18px 0 22px;
    border: 1px solid var(--br-border);
    border-radius: 12px;
    background: var(--br-card);
    overflow: hidden;
  }
  .impact-verdict {
    padding: 20px 22px;
    border-right: 1px solid var(--br-border);
  }
  .impact-verdict .eyebrow {
    display: block;
    margin-bottom: 5px;
    color: var(--br-muted);
    font-size: 12px;
    font-weight: 650;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .impact-verdict > strong {
    display: block;
    font-size: 25px;
    font-weight: 650;
    line-height: 1.25;
  }
  .impact-verdict p {
    margin: 8px 0 0;
    color: var(--br-muted);
    font-size: 13px;
    line-height: 1.6;
  }
  .direction-metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .direction-metric {
    min-width: 0;
    padding: 15px 17px;
    border-right: 1px solid var(--br-border);
    border-bottom: 1px solid var(--br-border);
  }
  .direction-metric:nth-child(2n) {
    border-right: 0;
  }
  .direction-metric:nth-last-child(-n + 2) {
    border-bottom: 0;
  }
  .direction-metric strong {
    display: block;
    margin: 2px 0 0;
    font-size: 23px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .metric-direction,
  .direction-label {
    display: block;
    color: var(--br-muted);
    font-size: 11px;
    font-weight: 650;
    letter-spacing: 0.035em;
    text-transform: uppercase;
  }
  .metric-label {
    display: block;
    margin-top: 1px;
    font-size: 13px;
    font-weight: 600;
  }
  .direction-metric small {
    display: block;
    margin-top: 3px;
    color: var(--br-muted);
    font-size: 11px;
    line-height: 1.4;
  }
  .direction-metric.action {
    box-shadow: inset 3px 0 0
      color-mix(in srgb, var(--warning-color, #9b6600) 70%, transparent);
  }
  .direction-metric.observe {
    box-shadow: inset 3px 0 0
      color-mix(in srgb, var(--br-accent) 70%, transparent);
  }
  .direction-metric.context {
    box-shadow: inset 3px 0 0
      color-mix(in srgb, var(--primary-text-color, #212121) 38%, transparent);
  }
  .direction-metric.effects {
    box-shadow: inset 3px 0 0
      color-mix(in srgb, var(--success-color, #288048) 65%, transparent);
  }

  .columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
    align-items: start;
  }
  .card {
    border: 1px solid var(--br-border);
    border-radius: 12px;
    background: var(--br-card);
    padding: 22px;
    min-width: 0;
  }
  nav {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--br-border);
    margin: -8px -8px 20px;
    overflow-x: auto;
    scrollbar-width: thin;
  }
  nav button {
    flex: 0 0 auto;
    border: 0;
    border-bottom: 3px solid transparent;
    border-radius: 0;
    background: transparent;
    font-size: 14px;
    padding: 13px 12px;
    white-space: nowrap;
  }
  nav button[aria-selected="true"] {
    color: var(--primary-text-color, #212121);
    border-bottom-color: var(--br-accent);
  }
  .reference {
    padding: 12px 13px;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    min-width: 0;
  }
  .source-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    align-items: start;
  }
  .reference-use-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 9px;
  }
  .use-tag {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 3px 7px;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #212121) 8%,
      var(--br-card)
    );
    color: var(--br-muted);
    font-size: 11px;
    font-weight: 600;
  }
  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .overview-panel {
    display: flex;
    min-width: 0;
    flex-direction: column;
    border: 1px solid var(--br-border);
    border-radius: 10px;
    padding: 16px;
    background: color-mix(
      in srgb,
      var(--br-card) 98%,
      var(--primary-text-color, #212121)
    );
  }
  .overview-panel .section-heading {
    margin-bottom: 14px;
  }
  .relationship-list {
    display: grid;
    gap: 7px;
  }
  .relationship-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 10px 11px;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    background: var(--br-card);
  }
  .relationship-row.action {
    border-left: 3px solid
      color-mix(in srgb, var(--warning-color, #9b6600) 70%, var(--br-border));
  }
  .relationship-row.observe {
    border-left: 3px solid
      color-mix(in srgb, var(--br-accent) 70%, var(--br-border));
  }
  .relationship-row.context {
    border-left: 3px solid
      color-mix(
        in srgb,
        var(--primary-text-color, #212121) 45%,
        var(--br-border)
      );
  }
  .relationship-row-main {
    min-width: 0;
  }
  .relationship-row-main strong,
  .relationship-row-main span {
    display: block;
  }
  .relationship-row-main strong {
    font-size: 13px;
  }
  .relationship-row-main span {
    margin-top: 2px;
    overflow: hidden;
    color: var(--br-muted);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .relationship-row-count {
    min-width: 58px;
    text-align: right;
  }
  .relationship-row-count strong,
  .relationship-row-count span {
    display: block;
  }
  .relationship-row-count strong {
    font-size: 19px;
    font-variant-numeric: tabular-nums;
  }
  .relationship-row-count span {
    color: var(--br-muted);
    font-size: 11px;
  }
  .section-action {
    align-self: flex-start;
    min-height: 36px;
    margin-top: auto;
    padding: 7px 10px;
    border-color: transparent;
    background: transparent;
    color: var(--primary-text-color, #212121);
    font-size: 12px;
  }
  .section-action:hover {
    border-color: var(--br-border);
  }
  .effects-overview > strong {
    display: block;
    margin-bottom: 10px;
    font-size: 14px;
  }
  .flow-summary-list {
    display: grid;
    gap: 6px;
  }
  .flow-summary-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 0;
    border-bottom: 1px solid var(--br-border);
    font-size: 12px;
  }
  .flow-summary-row:last-child {
    border-bottom: 0;
  }
  .flow-summary-row span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .causality-note {
    margin: 11px 0 0;
    color: var(--br-muted);
    font-size: 12px;
    line-height: 1.55;
  }
  .review-strip,
  .diagnostics-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-top: 14px;
    padding: 11px 12px;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    background: color-mix(
      in srgb,
      var(--br-card) 96%,
      var(--warning-color, #9b6600)
    );
  }
  .review-strip > div {
    min-width: 0;
  }
  .review-strip strong,
  .review-strip span {
    display: block;
  }
  .review-strip strong {
    font-size: 13px;
  }
  .review-strip span {
    margin-top: 2px;
    color: var(--br-muted);
    font-size: 12px;
  }
  .review-strip button,
  .diagnostics-link button {
    flex: 0 0 auto;
    min-height: 36px;
    padding: 6px 10px;
    font-size: 12px;
  }
  .usage-sections {
    display: grid;
    gap: 14px;
  }
  .usage-section {
    border: 1px solid var(--br-border);
    border-radius: 10px;
    padding: 14px;
  }
  .usage-section.usage-action {
    border-left: 3px solid
      color-mix(in srgb, var(--warning-color, #9b6600) 70%, var(--br-border));
  }
  .usage-section.usage-observe {
    border-left: 3px solid
      color-mix(in srgb, var(--br-accent) 70%, var(--br-border));
  }
  .usage-section.usage-context {
    border-left: 3px solid
      color-mix(
        in srgb,
        var(--primary-text-color, #212121) 45%,
        var(--br-border)
      );
  }
  .usage-section-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 11px;
  }
  .usage-section-heading h3 {
    margin: 3px 0 2px;
    font-size: 16px;
  }
  .usage-section-heading p {
    max-width: 760px;
    margin: 0;
    color: var(--br-muted);
    font-size: 12px;
  }
  .semantic-empty {
    padding: 16px;
    border: 1px dashed var(--br-border);
    border-radius: 8px;
    color: var(--br-muted);
    font-size: 13px;
  }
  .causality-banner {
    margin: 0 0 14px;
    padding: 11px 13px;
    border-left: 3px solid var(--br-accent);
    background: color-mix(in srgb, var(--br-card) 96%, var(--br-accent));
    color: var(--br-muted);
    font-size: 12px;
    line-height: 1.55;
  }
  .causality-banner strong {
    color: var(--primary-text-color, #212121);
  }
  .effect-flows {
    display: grid;
    gap: 12px;
  }
  .effect-flow {
    border: 1px solid var(--br-border);
    border-radius: 10px;
    padding: 14px;
    background: var(--br-card);
  }
  .effect-flow-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }
  .effect-flow-heading h3 {
    margin: 2px 0 0;
  }
  .flow-relationship {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;
    margin: 12px 0 8px;
  }
  .relation-chip {
    display: inline-flex;
    align-items: center;
    min-height: 27px;
    padding: 4px 8px;
    border: 1px solid var(--br-border);
    border-radius: 999px;
    font-size: 11px;
    font-weight: 650;
  }
  .relation-chip.incoming {
    background: color-mix(in srgb, var(--br-card) 94%, var(--br-accent));
  }
  .relation-chip.outgoing {
    background: color-mix(
      in srgb,
      var(--br-card) 94%,
      var(--success-color, #288048)
    );
  }
  .flow-arrow {
    color: var(--br-muted);
    font-size: 11px;
    font-weight: 600;
  }
  .effect-flow-summary {
    margin: 0 0 10px;
    color: var(--br-muted);
    font-size: 12px;
  }
  .effect-list {
    display: grid;
    gap: 6px;
  }
  .effect-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 9px 10px;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    background: color-mix(
      in srgb,
      var(--br-card) 98%,
      var(--primary-text-color, #212121)
    );
  }
  .effect-row-main {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .effect-row-main > div {
    min-width: 0;
  }
  .effect-row h3 {
    margin: 0;
    font-size: 14px;
  }
  .effect-row .source-icon {
    width: 22px;
    height: 22px;
    flex-basis: 22px;
  }
  .effect-details {
    grid-column: 1 / -1;
    margin: 0;
  }
  .effect-details > summary {
    padding: 5px 0;
    font-size: 12px;
  }
  .chained-effects {
    margin-top: 10px;
    border-top: 1px solid var(--br-border);
  }
  .chained-effects > summary {
    font-weight: 600;
  }
  .direction-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin: 10px 0 16px;
    padding: 9px 11px;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    color: var(--br-muted);
    font-size: 12px;
  }
  .direction-legend strong {
    color: var(--primary-text-color, #212121);
  }
  .reference-title {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    align-items: center;
  }
  .reference-title code {
    font-size: 13px;
    color: var(--br-muted);
  }
  .reference-title h3 {
    margin: 0;
    font-size: 17px;
  }
  .path {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 0 0;
  }
  .path > span:first-child {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .notice {
    border-left: 3px solid var(--warning-color, #9b6600);
    padding: 10px 14px;
    margin: 16px 0;
    font-size: 13px;
    background: var(--secondary-background-color, #f5f5f5);
    line-height: 1.6;
  }
  .error {
    border-color: var(--error-color, #db4437);
  }
  .incomplete {
    font-size: 14px;
    background: var(--br-card);
    border: 1px solid var(--br-border);
    border-left: 3px solid var(--warning-color, #9b6600);
    border-radius: 8px;
    padding: 14px 16px;
  }
  .incomplete p {
    margin: 6px 0;
  }
  .incomplete .controls {
    margin-top: 10px;
  }
  .coverage-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin: 14px 0;
    padding: 12px 14px;
    border: 1px solid var(--br-border);
    border-radius: 9px;
    background: color-mix(
      in srgb,
      var(--br-card) 96%,
      var(--warning-color, #9b6600)
    );
  }
  .coverage-status strong {
    font-size: 14px;
  }
  .coverage-status p {
    margin: 3px 0 0;
    color: var(--br-muted);
    font-size: 13px;
  }
  .coverage-status button {
    flex: 0 0 auto;
    min-height: 38px;
    padding: 8px 11px;
    font-size: 13px;
  }
  #coverage {
    scroll-margin-top: 80px;
  }
  .empty {
    padding: 36px 12px;
    text-align: center;
  }
  .empty .symbol {
    font-size: 36px;
    color: var(--br-accent);
  }
  .empty .brand-mark {
    width: 48px;
    height: 48px;
    margin: 0 auto 12px;
  }
  .controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 18px;
  }
  .controls button {
    font-size: 13px;
  }
  .preview-form label {
    margin: 18px 0;
  }
  .preview-form > button {
    margin: 0 8px 8px 0;
  }
  .preview-form p {
    font-size: 14px;
  }
  .preview {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--br-border);
  }
  .preview code {
    display: block;
    margin: 8px 0;
  }
  .preview ul {
    padding-left: 18px;
    line-height: 1.7;
    font-size: 13px;
  }
  details {
    margin: 16px 0 0;
    font-size: 14px;
  }
  summary {
    cursor: pointer;
    line-height: 1.5;
    padding: 10px 0;
  }
  details ul {
    padding-left: 20px;
    line-height: 1.6;
    color: var(--br-muted);
  }
  .edge code {
    display: block;
    margin: 8px 0;
  }
  .foot {
    display: flex;
    gap: 14px;
    justify-content: space-between;
    font-size: 12px;
    color: var(--br-muted);
    margin-top: 20px;
    line-height: 1.6;
  }
  .status {
    min-height: 20px;
    font-size: 12px;
    color: var(--br-muted);
  }
  progress {
    width: 100%;
    accent-color: var(--br-accent);
  }
  .depth {
    width: 82px;
    flex: 0 0 82px !important;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 14px;
  }
  th,
  td {
    padding: 12px 8px;
    text-align: left;
    border-bottom: 1px solid var(--br-border);
  }
  .table-wrap {
    overflow: auto;
  }
  textarea {
    height: 200px;
    font-size: 12px;
  }
  .result-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin: 28px 0 12px;
  }
  .result-heading h2 {
    margin-bottom: 3px;
    font-size: 22px;
  }
  .result-heading code {
    color: var(--br-muted);
  }
  .result-badges {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .summary-pill {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 4px 9px;
    border: 1px solid var(--br-border);
    border-radius: 999px;
    background: var(--br-card);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }
  button.summary-pill {
    min-height: 28px;
    cursor: pointer;
  }
  .summary-action {
    color: var(--br-muted);
    background: color-mix(
      in srgb,
      var(--br-card) 95%,
      var(--warning-color, #9b6600)
    );
  }
  .technical {
    margin-top: 8px;
    color: var(--br-muted);
  }
  .technical > summary {
    font-size: 14px;
  }
  .technical-row {
    display: grid;
    gap: 8px;
    padding: 10px 0;
    border-top: 1px solid var(--br-border);
  }
  .technical-row code {
    min-width: 0;
  }
  .technical-row .path {
    padding-top: 0;
    color: var(--primary-text-color, #212121);
  }
  .source-id {
    display: block;
    margin: 8px 0 12px;
  }
  .section-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin: 0 0 12px;
  }
  .section-heading h2 {
    margin: 0;
  }
  .section-heading p {
    margin: 4px 0 0;
    color: var(--br-muted);
    font-size: 13px;
  }
  .impact-heading {
    margin-bottom: 14px;
  }
  .impact-heading .count {
    flex: 0 0 auto;
    margin-top: 1px;
  }
  .uncertainty {
    border-top: 1px solid var(--br-border);
    margin-top: 18px;
    padding-top: 20px;
  }
  .uncertainty h2 {
    margin-bottom: 4px;
  }
  .uncertainty p {
    font-size: 13px;
    color: var(--br-muted);
    margin: 5px 0 12px;
  }
  .secondary-context,
  .dashboard-context {
    background: color-mix(
      in srgb,
      var(--br-card) 97%,
      var(--primary-text-color, #212121)
    );
  }
  .diagnostics-link {
    color: var(--br-muted);
    font-size: 13px;
    background: color-mix(
      in srgb,
      var(--br-card) 98%,
      var(--primary-text-color, #212121)
    );
  }
  .coverage-diagnostics {
    margin-top: 18px;
    padding-top: 4px;
    border-top: 1px solid var(--br-border);
  }
  .confidence-help {
    margin-top: 12px;
  }
  .uncertainty-scope {
    border: 1px solid var(--br-border);
    border-radius: 8px;
    padding: 4px 14px;
    margin-top: 12px;
  }
  .uncertainty-scope > summary {
    font-weight: 600;
  }
  .count {
    display: inline-block;
    font-variant-numeric: tabular-nums;
    font-size: 13px;
    border-radius: 5px;
    padding: 1px 7px;
    margin-left: 6px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #212121) 9%,
      var(--br-card)
    );
  }
  .reason-group {
    margin: 8px 0;
  }
  .reason-group > summary {
    overflow-wrap: anywhere;
    line-height: 1.7;
  }
  .registry-status {
    display: inline-block;
    margin-left: 8px;
    font-size: 12px;
    color: var(--br-muted);
  }
  .unresolved-row {
    display: grid;
    gap: 8px;
    justify-items: start;
    padding: 14px 0;
    border-top: 1px solid var(--br-border);
    overflow-wrap: anywhere;
  }
  .unresolved-row code {
    color: var(--br-muted);
  }
  .edge {
    padding: 16px 0;
    border-top: 1px solid var(--br-border);
    overflow-wrap: anywhere;
  }
  .source-heading {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .source-heading > div {
    min-width: 0;
  }
  .source-icon {
    width: 26px;
    height: 26px;
    flex: 0 0 26px;
    color: var(--br-muted);
  }
  .source-meta {
    font-size: 13px;
    color: var(--br-muted);
  }
  .source-name {
    color: inherit;
    font: inherit;
    font-weight: 600;
    overflow-wrap: anywhere;
    text-decoration: none;
  }
  button.source-name {
    border: 0;
    border-radius: 3px;
    padding: 0;
    min-height: 0;
    background: none;
    text-align: left;
  }
  a.source-name:hover,
  button.source-name:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  a.open-source,
  button.open-source {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    border: 1px solid var(--br-border);
    border-radius: 7px;
    padding: 7px 12px;
    background: var(--br-card);
    color: var(--primary-text-color, #212121);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }
  a.open-source:hover,
  button.open-source:hover {
    border-color: var(--br-accent);
  }
  .purpose {
    margin: 7px 0 0;
    font-size: 14px;
  }
  .review-hint {
    display: block;
    color: var(--br-muted);
    font-size: 13px;
    margin-top: 4px;
  }
  .dependency-map {
    margin: 20px 0;
  }
  .map-selected {
    max-width: 600px;
    margin: 0 auto 24px;
    padding: 12px 16px 0;
    border: 1px solid var(--br-accent);
    border-radius: 10px;
  }
  .map-selected .graph-node {
    border: 0;
    margin-bottom: 0;
    padding: 10px 0 0;
  }
  .map-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--br-muted);
  }
  .map-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
  .map-group {
    min-width: 0;
    border-top: 2px solid var(--br-border);
    padding-top: 18px;
  }
  .map-group > h3 {
    font-size: 18px;
  }
  .map-group > p {
    font-size: 14px;
    margin: 8px 0 18px;
  }
  .graph-node {
    border: 1px solid var(--br-border);
    border-radius: 8px;
    padding: 14px 16px 4px;
    margin-bottom: 12px;
  }
  .via {
    font-size: 14px;
    margin: 10px 0 0;
    color: var(--br-muted);
  }
  .via .source-name {
    font-weight: 500;
  }
  .change-preview {
    margin-top: 0;
    padding: 6px 22px;
  }
  .change-preview > summary {
    font-weight: 600;
    padding: 14px 0;
  }
  .preview-form {
    max-width: 680px;
    padding: 12px 0;
  }
  .preview-form h2 {
    display: none;
  }
  td code {
    display: block;
    margin-top: 6px;
  }
  .uncertainty .reference {
    margin: 12px 0;
  }
  .result-filters {
    margin: 14px 0 20px;
  }
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 8px;
  }
  .filter-label {
    font-size: 12px;
    font-weight: 600;
    margin-right: 4px;
  }
  .filter-row button {
    padding: 6px 10px;
    font-size: 12px;
    border-radius: 16px;
  }
  .filter-row button[aria-pressed="true"] {
    background: var(--primary-text-color, #212121);
    color: var(--br-card);
    border-color: var(--primary-text-color, #212121);
  }
  .filter-note,
  .totals-label {
    font-size: 12px;
    line-height: 1.5;
  }
  .node-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }
  .analyze-node {
    padding: 6px 8px;
    font-size: 12px;
  }
  .graph-node .reference-title {
    flex-wrap: wrap;
  }
  .selector-detail {
    font-size: 12px;
    line-height: 1.5;
  }
  .issue-link {
    color: var(--br-muted);
    display: inline-block;
    margin-top: 12px;
    font-size: 12px;
  }
  @media (max-width: 850px) {
    .columns {
      grid-template-columns: 1fr;
    }
    main {
      padding: 22px 18px;
    }
  }
  @media (max-width: 1000px) {
    .source-grid,
    .map-columns,
    .overview-grid {
      grid-template-columns: 1fr;
    }
    .reference {
      padding: 13px 14px;
    }
  }
  @media (max-width: 760px) {
    .impact-summary {
      grid-template-columns: 1fr;
    }
    .impact-verdict {
      border-right: 0;
      border-bottom: 1px solid var(--br-border);
    }
  }
  @media (max-width: 500px) {
    header {
      padding: 0 12px;
      gap: 8px;
    }
    header .brand-mark {
      width: 28px;
      height: 28px;
    }
    header .release-label {
      display: none;
    }
    header strong {
      font-size: 17px;
    }
    h1 {
      font-size: 23px;
    }
    .impact-summary {
      grid-template-columns: 1fr;
    }
    .impact-verdict {
      border-right: 0;
      border-bottom: 1px solid var(--br-border);
    }
    .result-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
    }
    .result-badges {
      justify-content: flex-start;
    }
    .coverage-status {
      align-items: flex-start;
      flex-direction: column;
    }
    .coverage-status button {
      width: 100%;
    }
    .section-heading,
    .usage-section-heading,
    .effect-flow-heading,
    .diagnostics-link,
    .review-strip {
      align-items: stretch;
      flex-direction: column;
    }
    .diagnostics-link button,
    .review-strip button {
      width: 100%;
    }
    .effect-row {
      grid-template-columns: 1fr;
      align-items: stretch;
    }
    .effect-row .node-actions {
      justify-content: flex-start;
    }
    .relationship-row {
      grid-template-columns: minmax(0, 1fr) auto;
    }
    .direction-metric {
      padding: 12px 13px;
    }
    .analysis-options {
      width: 100%;
    }
    .analysis-options-body {
      align-items: stretch;
      flex-direction: column;
      gap: 4px;
    }
    .search {
      flex-wrap: wrap;
    }
    .search label {
      flex-basis: 70%;
    }
    .search button {
      width: 100%;
    }
    .card {
      padding: 16px;
    }
    nav button {
      padding: 12px 9px;
    }
    .path {
      align-items: start;
      flex-direction: column;
    }
    .reference-title {
      gap: 8px;
    }
    .technical-row {
      gap: 6px;
    }
    .source-heading {
      gap: 8px;
    }
    .source-icon {
      width: 22px;
      height: 22px;
      flex-basis: 22px;
    }
    .reference-title h3 {
      font-size: 16px;
    }
    .reference,
    .graph-node {
      padding-left: 12px;
      padding-right: 12px;
    }
    a.open-source,
    button.open-source {
      padding: 6px 8px;
    }
    .foot {
      flex-direction: column;
    }
  }
`, H = {
	viewBox: "0 0 32 32",
	rings: "M 28.943 12.532 A 13.399999999999999 13.399999999999999 0 1 1 19.468 3.057 A 1.2 1.2 0 0 1 18.847 5.375 A 11.0 11.0 0 1 0 26.625 13.153 A 1.2 1.2 0 0 1 28.943 12.532 Z M 23.921 13.878 A 8.2 8.2 0 1 1 18.122 8.079 A 1.2 1.2 0 0 1 17.501 10.398 A 5.8 5.8 0 1 0 21.602 14.499 A 1.2 1.2 0 0 1 23.921 13.878 Z",
	radius: "M 15.222 15.222 L 23.849 6.595 L 25.405 8.151 L 16.778 16.778 Z M 13.600 16.000 a 2.4 2.4 0 1 1 4.8 0 a 2.4 2.4 0 1 1 -4.8 0 Z M 22.227 7.373 a 2.4 2.4 0 1 1 4.8 0 a 2.4 2.4 0 1 1 -4.8 0 Z"
}, U = () => _e`
  <svg class="brand-mark" viewBox=${H.viewBox} aria-hidden="true" focusable="false">
    <path fill="currentColor" d=${H.rings}></path>
    <path class="radius" d=${H.radius}></path>
  </svg>
`, W = {
	automation: "Automation",
	script: "Script",
	scene: "Scene",
	dashboard: "Dashboard",
	group: "Group"
};
function He(e) {
	if (e.kind === "entity") return;
	let { path: t } = e;
	if (e.kind === "dashboard") return /^\/[a-z0-9_-]+$/.test(t) ? t : void 0;
	if (e.kind === "automation" || e.kind === "script") {
		let n = `/config/${e.kind}/show/${e.kind}.`;
		return t.startsWith(n) && /^[a-z0-9_]+$/.test(t.slice(n.length)) ? t : void 0;
	}
	let n = `/config/${e.kind}/edit/`;
	return e.kind === "scene" && t.startsWith(n) && /^[a-zA-Z0-9_%.-]+$/.test(t.slice(n.length)) && ![
		".",
		"..",
		"new"
	].includes(t.slice(n.length)) ? t : void 0;
}
var Ue = {
	views: "View",
	sections: "Section",
	cards: "Card",
	card: "Content",
	triggers: "Trigger",
	trigger: "Trigger",
	actions: "Action",
	action: "Action",
	sequence: "Step",
	conditions: "Condition",
	condition: "Condition",
	choose: "Branch",
	default: "Default",
	target: "Target",
	entity_id: "Entity ID",
	entities: "Entity",
	entity: "Entity",
	value_template: "Template"
};
function G(e) {
	return e.split(".").map((e) => {
		let t = /^(.*?)(?:\[(\d+)\])?$/.exec(e), n = t[1];
		return `${Ue[n] || n.replaceAll("_", " ").replace(/^./, (e) => e.toUpperCase())}${t[2] === void 0 ? "" : ` ${Number(t[2]) + 1}`}`;
	}).join(" › ");
}
var We = {
	"Computed entity lookup": "The entity ID is calculated at runtime.",
	"External template variable": "A variable comes from runtime context or the card. Its value is not available here.",
	"Template helper or macro": "A helper or macro may read additional entities that are not visible in this expression.",
	"Unsupported template filter or test": "This filter or test may hide entity dependencies and is not resolved by the analyzer.",
	"State collection or computed lookup": "The expression reads a collection of states or selects a state dynamically.",
	"Computed value lookup": "A value is selected dynamically from a collection.",
	"Template import": "Imported template content is not inspected.",
	"Unsupported template syntax": "The expression could not be parsed. Visible entity IDs are still retained.",
	"Templated target": "The final action or entity target is produced by a template that is not executed here.",
	"Entity pattern": "A wildcard or pattern can match multiple entities; matches are not expanded.",
	"Non-literal entity target": "This field does not contain a fixed entity ID.",
	"Entity registry ID not found": "A device automation names an internal entity ID that is absent from the current registry. Its entity target remains unknown.",
	"Entity registry lookup unavailable": "A device automation uses an internal entity ID, but this snapshot has no entity registry to resolve it.",
	"Device identity reference": "This is a device ID used by a trigger, event filter, condition or device action. It does not select every entity on the device or establish a dependency on the entity being analyzed.",
	"Entity registry ID resolved": "Home Assistant's entity registry maps this internal ID to the displayed entity. Conditional execution is not evaluated."
};
function K(e) {
	return e.startsWith("Unexpanded ") ? "This configuration names a device, area, floor or label. Its entity membership and runtime eligibility are not expanded." : e.split("; ").map((e) => We[e] || e || "The target cannot be determined from the loaded configuration.").join(" ");
}
//#endregion
//#region src/icons.ts
function q(e) {
	return k`<svg class="source-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d=${{
		automation: "M6 8v8m0-4h12M18 8v8M3 5h6v4H3zm12 10h6v4h-6zM15 5h6v4h-6z",
		script: "M7 3h7l4 4v14H7zM14 3v5h4M10 12h5m-5 4h5",
		scene: "M4 17l5-6 4 4 3-3 4 5M3 4h18v16H3zM15 8h.01",
		dashboard: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
		group: "M4 4h6v6H4zm10 0h6v6h-6zM9 15h6v6H9zM7 10v3h10v-3m-5 3v2"
	}[e] || "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M8 12h8m-4-4v8"}
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>`;
}
//#endregion
//#region src/semantics.ts
var Ge = (e) => new Set(e.map((e) => e.source_id)).size, Ke = (e) => /(?:^|\.)(?:triggers?|wait_for_trigger)(?:\[|\.|$)/.test(e), qe = (e) => /(?:^|\.)(?:conditions?|condition|if|while|until|wait_template)(?:\[|\.|$)/.test(e);
function Je(e) {
	return Ke(e.path) ? "trigger" : qe(e.path) ? "check" : "read";
}
function Ye(e) {
	return e.role === "write" || e.role === "call" ? "action" : e.role === "display" || e.role === "member" ? "context" : "observe";
}
var Xe = {
	action: {
		title: "Can change or invoke this entity",
		shortLabel: "Acts on it",
		description: "Action targets and script calls. These references can directly change the selected entity or invoke it when it is callable."
	},
	observe: {
		title: "Reads, checks or reacts to this entity",
		shortLabel: "Reads / reacts",
		description: "Triggers, conditions, templates and other reads. These references depend on the selected entity without directly changing it."
	},
	context: {
		title: "Displays or contains this entity",
		shortLabel: "Displays / contains",
		description: "Dashboard displays and group membership. These references expose or organize the entity rather than driving its state."
	}
};
function J(e) {
	return Object.keys(Xe).map((t) => {
		let n = e.filter((e) => Ye(e) === t);
		return {
			category: t,
			...Xe[t],
			refs: n,
			sources: Ge(n)
		};
	});
}
function Ze(e) {
	let t = J(e), n = Object.fromEntries(t.map((e) => [e.category, e]));
	return {
		totalSources: Ge(e),
		actionSources: n.action.sources,
		observeSources: n.observe.sources,
		contextSources: n.context.sources,
		actionReferences: n.action.refs.length,
		observeReferences: n.observe.refs.length,
		contextReferences: n.context.refs.length
	};
}
function Y(e) {
	return e.role === "write" ? "Changes / targets this entity" : e.role === "call" ? "Calls this script" : e.role === "display" ? "Displays this entity" : e.role === "member" ? "Contains this entity as a member" : Je(e) === "trigger" ? "Triggers from this entity" : Je(e) === "check" ? "Checks this entity" : e.confidence === "template_literal" ? "Reads this entity in a template" : "Reads this entity";
}
function Qe(e) {
	if (!e.length) return "0 references";
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Y(n);
		t.set(e, (t.get(e) || 0) + 1);
	}
	if (t.size === 1) {
		let [e, n] = [...t][0];
		return `${n} ${e === "Changes / targets this entity" ? "action target" : e === "Calls this script" ? "call" : e === "Displays this entity" ? "display" : e === "Contains this entity as a member" ? "membership" : e === "Triggers from this entity" ? "trigger" : e === "Checks this entity" ? "check" : "read"}${n === 1 ? "" : "s"}`;
	}
	return `${e.length} references · ${t.size} kinds`;
}
function $e(e) {
	return e === "write" ? "changes / targets" : e === "call" ? "calls" : e === "member" ? "contains" : e || "references";
}
function et(e, t) {
	return `${t} ${e === "write" ? "target" : e === "call" ? "call" : e === "member" ? "membership" : "reference"}${t === 1 ? "" : "s"}`;
}
function tt(e, t, n) {
	let r = e.via, i = t, a = 0;
	for (; r && r !== t && a++ < 64;) i = r, r = n.get(r)?.via;
	return i;
}
function nt(e, t) {
	if (t.via) return e.graph.edges.find((e) => e.source_id === t.via && e.target === t.id);
}
function rt(e) {
	let t = new Map(e.graph.nodes.map((e) => [e.id, e])), n = /* @__PURE__ */ new Map();
	for (let r of e.graph.nodes) {
		if (r.relationship !== "downstream") continue;
		let i = tt(r, e.entity_id, t), a = {
			node: r,
			edge: nt(e, r),
			chained: r.via !== i
		};
		n.set(i, [...n.get(i) || [], a]);
	}
	return [...n.entries()].map(([t, n]) => {
		let r = e.references.find((e) => e.source_id === t) || e.graph.edges.find((e) => e.source_id === t), i = [...n].sort((e, t) => e.node.depth - t.node.depth || e.node.id.localeCompare(t.node.id));
		return {
			sourceId: t,
			sourceType: r?.source_type || t.split(".")[0],
			directReferences: e.references.filter((n) => n.source_id === t && n.target === e.entity_id),
			items: i,
			directItems: i.filter((e) => !e.chained),
			chainedItems: i.filter((e) => e.chained)
		};
	}).sort((t, n) => t.sourceId === e.entity_id ? -1 : n.sourceId === e.entity_id ? 1 : t.sourceId.localeCompare(n.sourceId));
}
function X(e) {
	return e.graph.nodes.filter((e) => e.relationship === "downstream").length;
}
//#endregion
//#region src/session.ts
var Z = /* @__PURE__ */ new Map(), it = [
	1,
	2,
	3,
	4,
	6,
	8,
	12
], at = (e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.entityId == "string" && t.entityId.length <= 512 && /^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(t.entityId) && it.includes(t.depth);
};
function ot(e) {
	return e ? `blast-radius:session:v1:${e}` : void 0;
}
function st(e, t) {
	return [t, ...e.filter((e) => e.entityId !== t.entityId)].slice(0, 6);
}
function ct(e) {
	if (!e) return { recent: [] };
	if (Z.has(e)) return Z.get(e);
	let t;
	try {
		t = sessionStorage.getItem(e);
	} catch {
		return Z.get(e) || { recent: [] };
	}
	try {
		if (!t || t.length > 16384) return { recent: [] };
		let e = JSON.parse(t), n = [];
		if (Array.isArray(e?.recent)) {
			for (let t of e.recent) if (at(t) && !n.some((e) => e.entityId === t.entityId) && (n.push({
				entityId: t.entityId,
				depth: t.depth
			}), n.length === 6)) break;
		}
		let r = e?.last, i = r?.tab === "impact" ? "overview" : r?.tab && [
			"overview",
			"usage",
			"effects",
			"graph",
			"raw"
		].includes(r.tab) ? r.tab : void 0;
		return {
			recent: n,
			...at(r) && i && Number.isFinite(r.scrollTop) && r.scrollTop >= 0 && r.scrollTop <= 1e7 ? { last: {
				entityId: r.entityId,
				depth: r.depth,
				tab: i,
				scrollTop: r.scrollTop
			} } : {}
		};
	} catch {
		return { recent: [] };
	}
}
function lt(e, t) {
	if (e) {
		Z.set(e, t);
		try {
			!t.last && !t.recent.length ? sessionStorage.removeItem(e) : sessionStorage.setItem(e, JSON.stringify(t));
		} catch {}
	}
}
//#endregion
//#region src/filters.ts
var ut = [
	"automation",
	"script",
	"dashboard",
	"scene",
	"group"
];
function dt(e, t, n) {
	let r = e.confidence === "dynamic" || e.confidence === "unknown" ? "review" : e.confidence;
	return (!t.length || t.includes(e.source_type)) && (!n.length || n.includes(r));
}
function ft(e, t) {
	let n = e.graph.edges.filter(t), r = new Map(e.graph.nodes.map((e) => [e.id, e]));
	return e.graph.nodes.flatMap((e) => {
		if (e.relationship === "selected") return [e];
		let t = n.filter((t) => {
			let n = e.relationship === "dependent";
			if (n ? t.source_id !== e.id : t.target !== e.id) return !1;
			let i = r.get(n ? t.target : t.source_id);
			return i?.depth === e.depth - 1 && (n ? i.relationship !== "downstream" : [
				"write",
				"call",
				"member"
			].includes(t.role));
		}), i = t.find((t) => t.path === e.path && t.confidence === e.confidence && (e.relationship === "dependent" ? t.target : t.source_id) === e.via) || t[0];
		return i ? [{
			...e,
			via: e.relationship === "dependent" ? i.target : i.source_id,
			path: i.path,
			confidence: i.confidence
		}] : [];
	});
}
//#endregion
//#region package.json
var pt = "0.2.4";
//#endregion
//#region src/review.ts
function Q(e) {
	return e.resolution || (e.target === null ? e.selector ? "selector" : "unresolved" : "entity");
}
function mt(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = JSON.stringify([
			n.source_id,
			n.source_type,
			n.role,
			n.confidence,
			n.reason,
			Q(n),
			n.selector?.kind,
			n.selector?.value,
			n.selector?.exists
		]), r = t.get(e);
		r ? r.paths.push(n.path) : t.set(e, {
			reference: n,
			paths: [n.path]
		});
	}
	return [...t.values()];
}
function ht(e) {
	return Q(e) === "device" ? "Device reference" : Q(e) === "selector" ? "Entity set not expanded" : e.reason || "Dynamic or unrecognized target";
}
function gt(e) {
	return {
		read: "Read or trigger",
		write: "Action",
		display: "Display",
		call: "Call",
		member: "Membership"
	}[e.role] || e.role;
}
function $(e) {
	let t = mt(e).length;
	return `${t} ${t === 1 ? "group" : "groups"} · ${e.length} ${e.length === 1 ? "location" : "locations"}`;
}
//#endregion
//#region src/panel.ts
var _t = {
	explicit: "Explicit",
	template_literal: "Template literal",
	dynamic: "Dynamic",
	unknown: "Unclassified"
}, vt = class extends R {
	constructor(...e) {
		super(...e), this.narrow = !1, this.entities = [], this.query = "", this.loading = !1, this.error = "", this.tab = "overview", this.recentSearches = [], this.replacement = "", this.depth = 6, this.status = "", this.copyFallback = !1, this.sourceFilters = [], this.reviewFilters = [], this.analyzedRoot = "", this.initialized = !1, this.requestId = 0, this.saveSession = () => {
			lt(this.storageKey, {
				recent: this.recentSearches,
				last: this.lastView
			});
		}, this.onScroll = () => {
			this.report && this.lastView && (this.lastView = {
				...this.lastView,
				scrollTop: this.scrollTop
			}, clearTimeout(this.scrollTimer), this.scrollTimer = setTimeout(this.saveSession, 150));
		}, this.matchesFilter = (e) => dt(e, this.sourceFilters, this.reviewFilters);
	}
	static {
		this.styles = Ve;
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			narrow: { type: Boolean },
			entities: { state: !0 },
			query: { state: !0 },
			report: { state: !0 },
			loading: { state: !0 },
			error: { state: !0 },
			tab: { state: !0 },
			replacement: { state: !0 },
			depth: { state: !0 },
			status: { state: !0 },
			copyFallback: { state: !0 },
			recentSearches: { state: !0 },
			sourceFilters: { state: !0 },
			reviewFilters: { state: !0 }
		};
	}
	connectedCallback() {
		super.connectedCallback(), this.addEventListener("scroll", this.onScroll), window.addEventListener("pagehide", this.saveSession), this.requestUpdate();
	}
	disconnectedCallback() {
		clearTimeout(this.scrollTimer), this.saveSession(), this.requestId++, this.initialized = !1, this.removeEventListener("scroll", this.onScroll), window.removeEventListener("pagehide", this.saveSession), super.disconnectedCallback();
	}
	rememberView(e = this.scrollTop) {
		this.report && (this.lastView = {
			entityId: this.report.entity_id,
			depth: this.report.graph.max_depth,
			tab: this.tab,
			scrollTop: e
		}, this.saveSession());
	}
	reopenSearch(e) {
		this.query = e.entityId, this.depth = e.depth, this.replacement = "", this.run();
	}
	async analyzeNode(e) {
		this.query = e, this.replacement = "", await this.run(void 0, 0), this.report?.entity_id === e && this.isConnected && (await this.updateComplete, this.renderRoot.querySelector(".result-heading h2")?.focus({ preventScroll: !0 }));
	}
	clearRecentSearches() {
		this.recentSearches = [], this.lastView = void 0, clearTimeout(this.scrollTimer), this.saveSession();
	}
	updated(e) {
		let t = ot(this.hass?.user?.id);
		if (this.hass && (!this.initialized || t !== this.storageKey)) {
			this.initialized = !0, this.storageKey = t;
			let e = ct(t);
			this.recentSearches = e.recent, this.lastView = e.last, this.query = e.last?.entityId || "", this.depth = e.last?.depth || 6, this.tab = e.last?.tab || "overview", this.report = void 0, this.sourceFilters = [], this.reviewFilters = [], this.analyzedRoot = "", this.entities = [], this.replacement = "", this.status = "", this.copyFallback = !1, this.loadEntities();
		} else e.has("tab") && this.lastView && this.rememberView();
	}
	async loadEntities() {
		let e = ++this.requestId;
		this.loading = !0, this.error = "";
		try {
			let t = await this.hass.callWS({ type: "blast_radius/entities" });
			if (e !== this.requestId) return;
			this.entities = t.entities, this.lastView && this.query === this.lastView.entityId && await this.run(void 0, this.lastView.scrollTop);
		} catch (t) {
			e === this.requestId && (this.error = this.message(t));
		} finally {
			e === this.requestId && (this.loading = !1);
		}
	}
	message(e) {
		return e && typeof e == "object" && "message" in e ? String(e.message) : "Connection failed. Try again.";
	}
	changeQuery(e) {
		this.query = e.target.value, this.requestId++, this.loading = !1, this.report = void 0, this.error = "", this.status = "", this.copyFallback = !1;
	}
	async run(e, t) {
		let n = this.query.trim();
		if (!/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(n)) {
			this.error = "Enter an entity ID such as light.office.";
			return;
		}
		n !== this.analyzedRoot && (this.sourceFilters = [], this.reviewFilters = [], this.replacement = ""), this.analyzedRoot = n;
		let r = ++this.requestId;
		this.loading = !0, this.error = "", this.status = "", this.copyFallback = !1;
		try {
			this.report = void 0;
			let i = {
				type: e ? "blast_radius/preview" : "blast_radius/analyze",
				entity_id: n,
				max_depth: this.depth
			};
			e && (i.operation = e), e === "rename" && (i.new_entity_id = this.replacement.trim());
			let a = await this.hass.callWS(i);
			r === this.requestId && (this.report = a, this.recentSearches = st(this.recentSearches, {
				entityId: a.entity_id,
				depth: a.graph.max_depth
			}), this.rememberView(t ?? this.scrollTop));
		} catch (e) {
			r === this.requestId && (this.error = this.message(e));
		} finally {
			r === this.requestId && (this.loading = !1);
		}
		t !== void 0 && r === this.requestId && this.report && (await this.updateComplete, requestAnimationFrame(() => {
			r === this.requestId && this.isConnected && (this.scrollTop = t);
		}));
	}
	async copy() {
		if (this.report) try {
			await navigator.clipboard.writeText(this.report.markdown), this.status = "Markdown report copied.";
		} catch {
			this.copyFallback = !0, this.status = "Clipboard unavailable. Select and copy the report below.";
		}
	}
	download() {
		if (!this.report) return;
		let { markdown: e, ...t } = this.report, n = URL.createObjectURL(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" })), r = document.createElement("a");
		r.href = n, r.download = `blast-radius-${t.entity_id}.json`, r.click(), setTimeout(() => URL.revokeObjectURL(n), 1e3), this.status = "JSON report downloaded.";
	}
	badge(e) {
		return k`<span class="badge ${e}">${_t[e]}</span>`;
	}
	tabKeydown(e) {
		let t = [
			"overview",
			"usage",
			"effects",
			"graph",
			"raw"
		], n = t.indexOf(this.tab);
		if (e.key === "ArrowRight") n = (n + 1) % t.length;
		else if (e.key === "ArrowLeft") n = (n + t.length - 1) % t.length;
		else if (e.key === "Home") n = 0;
		else if (e.key === "End") n = t.length - 1;
		else return;
		e.preventDefault(), this.tab = t[n], this.renderRoot.querySelector(`#tab-${this.tab}`)?.focus();
	}
	selectTab(e) {
		this.tab = e, this.rememberView();
	}
	sourceName(e) {
		return this.report?.source_names?.[e] || this.entities.find((t) => t.entity_id === e)?.name || e;
	}
	navigationTarget(e) {
		return this.report?.navigation ? this.report.navigation[e] : this.entities.some((t) => t.entity_id === e && t.exists) ? {
			kind: "entity",
			entity_id: e
		} : void 0;
	}
	openEntity(e) {
		this.dispatchEvent(new CustomEvent("hass-more-info", {
			detail: { entityId: e },
			bubbles: !0,
			composed: !0
		}));
	}
	navigate(e, t) {
		this.rememberView(), !(e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) && (e.preventDefault(), history.pushState({ from: location.pathname + location.search + location.hash }, "", t), window.dispatchEvent(new CustomEvent("location-changed", {
			detail: { replace: !1 },
			bubbles: !0,
			composed: !0
		})));
	}
	sourceControl(e, t = !1) {
		let n = this.navigationTarget(e), r = t ? "Open →" : this.sourceName(e), i = t ? "open-source" : "source-name";
		if (!n) return t ? j : k`<span class=${i}>${r}</span>`;
		if (n.kind === "entity") return k`<button
        class=${i}
        aria-label=${`Open entity details: ${this.sourceName(e)}`}
        @click=${() => this.openEntity(e)}
      >
        ${r}
      </button>`;
		let a = He(n);
		return a ? k`<a
      class=${i}
      href=${a}
      aria-label=${`Open ${n.kind}: ${this.sourceName(e)}`}
      @click=${(e) => this.navigate(e, a)}
      >${r}</a
    >` : t ? j : k`<span class=${i}>${r}</span>`;
	}
	references(e, t = !1, n = !0) {
		let r = /* @__PURE__ */ new Map();
		return (n ? e.filter(this.matchesFilter) : e).forEach((e) => r.set(e.source_id, [...r.get(e.source_id) || [], e])), [...r].map(([e, n]) => k`<article class="reference source-row" data-source=${e}>
          <div class="reference-title">
            <div class="source-heading">
              ${q(n[0].source_type)}
              <div>
                <h3>${this.sourceControl(e)}</h3>
                <span class="source-meta"
                  >${W[n[0].source_type] || n[0].source_type}
                  ·
                  ${t ? $(n) : this.referenceRoleSummary(n)}</span
                >
              </div>
            </div>
            ${this.sourceControl(e, !0)}
          </div>
          ${t ? this.unresolvedGroups(n) : k`${this.referenceUseTags(n)}
                  ${n.some((e) => e.confidence !== "explicit") ? k`<span class="review-hint">Includes references to review</span>` : j}
                  <details class="technical">
                    <summary>Where found (${n.length})</summary>
                    <code class="source-id">${e}</code>
                    ${n.map((e) => k`<div class="technical-row">
                          <div class="path">
                            <span>${G(e.path)}</span
                            >${this.badge(e.confidence)}
                          </div>
                          <code>${e.path}</code>
                          ${e.reason ? k`<p>${K(e.reason)}</p>` : j}
                        </div>`)}
                  </details>`}
        </article>`);
	}
	referenceRoleSummary(e) {
		return Qe(e);
	}
	referenceUseTags(e) {
		let t = /* @__PURE__ */ new Map();
		for (let n of e) {
			let e = Y(n);
			t.set(e, (t.get(e) || 0) + 1);
		}
		return k`<div class="reference-use-tags">
      ${[...t].map(([e, t]) => k`<span class="use-tag"
            >${e}${t > 1 ? ` ×${t}` : ""}</span
          >`)}
    </div>`;
	}
	directConfidence(e) {
		return e.references.some((e) => e.confidence === "unknown") ? "Needs review" : e.references.some((e) => e.confidence !== "explicit") ? "Mixed confidence" : e.references.length ? "High confidence" : "No direct matches";
	}
	unresolvedGroups(e) {
		return mt(e).map(({ reference: e, paths: t }) => k` <details
          class="reason-group"
          data-resolution=${Q(e)}
        >
          <summary>
            ${ht(e)} · ${gt(e)}
            <span class="count"
              >${t.length}
              ${t.length === 1 ? "location" : "locations"}</span
            >
            ${e.selector ? k`<span class="registry-status">${e.selector.exists === !0 ? "Identity found" : e.selector.exists === !1 ? "Identity not found" : "Identity not checked"}</span>` : j}
          </summary>
          <p>${K(e.reason)}</p>
          ${this.selectorDetail(e)}
          ${e.selector ? j : k`<p>
                    Locations share a reason, not necessarily the same
                    expression or target.
                  </p>
                  ${this.badge(e.confidence)}`}
          ${t.map((e) => k`<div class="unresolved-row"><span>${G(e)}</span><code>${e}</code></div>`)}
        </details>`);
	}
	uncertainty(e) {
		let t = e.uncertain_references.filter(this.matchesFilter).filter((e) => Q(e) === "unresolved"), n = e.uncertain_references.filter((e) => Q(e) !== "unresolved"), r = e.other_dashboard_references || [];
		return !t.length && !n.length && !r.length ? j : k`<section class="uncertainty" aria-label="Potential blind spots">
      ${t.length ? k`<div class="section-heading">
                <div>
                  <h2>Potential blind spots</h2>
                  <p>
                    These unresolved expressions are inside configurations that
                    also reference this entity. They are not confirmed
                    dependencies.
                  </p>
                </div>
              </div>
              <details class="uncertainty-scope">
                <summary>
                  Unresolved in related configurations
                  <span class="count">${$(t)}</span>
                </summary>
                ${this.references(t, !0)}
              </details>` : j}
      ${n.length || r.length ? k`<div class="diagnostics-link">
              <span>
                Additional scanner diagnostics are available in Coverage.
              </span>
              <button @click=${this.showCoverage}>View coverage</button>
            </div>` : j}
    </section>`;
	}
	coverageDiagnostics(e) {
		let t = e.uncertain_references.filter((e) => Q(e) !== "unresolved"), n = e.other_dashboard_references || [];
		return !t.length && !n.length ? j : k`<div class="coverage-diagnostics">
      ${t.length ? k`<details class="uncertainty-scope secondary-context">
              <summary>
                Device and selector context
                <span class="count">${$(t)}</span>
              </summary>
              <p>
                Device identities and unexpanded selectors from configurations
                linked to the selected entity. They do not establish an entity
                dependency.
              </p>
              ${this.references(t, !0, !1)}
            </details>` : j}
      ${n.length ? k`<details class="uncertainty-scope dashboard-context">
              <summary>
                System-wide dashboard diagnostics
                <span class="count">${$(n)}</span>
              </summary>
              <p>
                Unresolved dashboard expressions elsewhere in Home Assistant.
                They are scanner context and are not attributed to the selected
                entity.
              </p>
              ${this.references(n, !0, !1)}
            </details>` : j}
    </div>`;
	}
	get filtersActive() {
		return !!(this.sourceFilters.length || this.reviewFilters.length);
	}
	filters(e) {
		let t = {
			explicit: "Explicit",
			template_literal: "Template literal",
			review: "Needs review"
		}, n = e.references.filter(this.matchesFilter).length;
		return k`<section class="result-filters" aria-label="Result filters">
      <div role="group" aria-label="Source types" class="filter-row">
        <span class="filter-label">Sources</span>
        <button
          aria-pressed=${!this.sourceFilters.length}
          @click=${() => this.sourceFilters = []}
        >
          All sources
        </button>
        ${ut.map((e) => k`<button aria-pressed=${this.sourceFilters.includes(e)} @click=${() => this.sourceFilters = this.sourceFilters.includes(e) ? this.sourceFilters.filter((t) => t !== e) : [...this.sourceFilters, e]}>${W[e]}</button>`)}
      </div>
      <div role="group" aria-label="Reference confidence" class="filter-row">
        <span class="filter-label">Confidence</span>
        <button
          aria-pressed=${!this.reviewFilters.length}
          @click=${() => this.reviewFilters = []}
        >
          All confidence
        </button>
        ${Object.keys(t).map((e) => k`<button aria-pressed=${this.reviewFilters.includes(e)} @click=${() => this.reviewFilters = this.reviewFilters.includes(e) ? this.reviewFilters.filter((t) => t !== e) : [...this.reviewFilters, e]}>${t[e]}</button>`)}
      </div>
      ${this.filtersActive ? k`<p class="filter-note" role="status">
              ${n} of ${e.references.length} direct references visible.
              Exported reports still include the full analysis.
            </p>` : j}
    </section>`;
	}
	selectorDetail(e) {
		if (!e.selector) return j;
		let t = e.selector;
		return k`<p class="selector-detail">
      <strong
        >${t.kind.replace("_id", "")}
        ${Q(e) === "device" ? "reference" : "selector"}</strong
      >
      <code>${t.value}</code>
      ${t.exists === !0 ? "Identity found in HA registry." : t.exists === !1 ? "Identity not found in HA registry; this does not establish a broken target." : "Registry identity not checked."}
      ${Q(e) === "device" ? "Device identity does not establish an entity dependency or prove an action will run." : "Entity membership and runtime eligibility are not expanded."}
    </p>`;
	}
	quickRead(e) {
		let t = Ze(e.references), n = X(e);
		if (!t.totalSources) return n ? `No other configuration directly uses this entity. The selected configuration still reaches ${n} ${n === 1 ? "effect node" : "effect nodes"}.` : "No direct users were found in the inspected sources.";
		let r = [
			t.actionSources ? `${t.actionSources} ${t.actionSources === 1 ? "acts" : "act"} on it` : "",
			t.observeSources ? `${t.observeSources} read or react to it` : "",
			t.contextSources ? `${t.contextSources} ${t.contextSources === 1 ? "displays or contains" : "display or contain"} it` : ""
		].filter(Boolean);
		return `${t.totalSources} ${t.totalSources === 1 ? "configuration directly uses" : "configurations directly use"} this entity: ${r.join("; ")}. ${n ? `Those related flows also reach ${n} other ${n === 1 ? "node" : "nodes"}.` : "No other action targets were reached through those flows."}`;
	}
	relationshipSummary(e) {
		let t = Ze(e.references), n = X(e), r = [
			{
				className: "action",
				direction: "configuration → entity",
				value: t.actionSources,
				label: "acts on it",
				detail: `${t.actionReferences} direct ${t.actionReferences === 1 ? "reference" : "references"}`
			},
			{
				className: "observe",
				direction: "entity state → configuration",
				value: t.observeSources,
				label: "reads / reacts",
				detail: `${t.observeReferences} direct ${t.observeReferences === 1 ? "reference" : "references"}`
			},
			{
				className: "context",
				direction: "entity → UI / group",
				value: t.contextSources,
				label: "displays / contains",
				detail: `${t.contextReferences} direct ${t.contextReferences === 1 ? "reference" : "references"}`
			},
			{
				className: "effects",
				direction: "same flow → other nodes",
				value: n,
				label: "related effects",
				detail: "not necessarily caused by this entity"
			}
		];
		return k`<section
      class="impact-summary relationship-summary"
      aria-label="Relationship summary"
    >
      <div class="impact-verdict">
        <span class="eyebrow">Quick read</span>
        <strong>
          ${t.totalSources ? `${t.totalSources} direct ${t.totalSources === 1 ? "user" : "users"}` : "No direct users"}
        </strong>
        <p>${this.quickRead(e)}</p>
      </div>
      <div class="direction-metrics">
        ${r.map((e) => k`<div class="direction-metric ${e.className}">
              <span class="metric-direction">${e.direction}</span>
              <strong>${e.value}</strong>
              <span class="metric-label">${e.label}</span>
              <small>${e.detail}</small>
            </div>`)}
      </div>
    </section>`;
	}
	sourcePreview(e) {
		let t = [...new Set(e.map((e) => e.source_id))];
		if (!t.length) return "None found";
		let n = t.slice(0, 3).map((e) => this.sourceName(e));
		return `${n.join(", ")}${t.length > n.length ? ` +${t.length - n.length} more` : ""}`;
	}
	bucketDirection(e) {
		return e.category === "action" ? "Configuration → selected entity" : e.category === "observe" ? "Selected entity → configuration logic" : "Selected entity → dashboard / group";
	}
	usageBucketSection(e) {
		return k`<section class="usage-section usage-${e.category}">
      <div class="usage-section-heading">
        <div>
          <span class="direction-label">${this.bucketDirection(e)}</span>
          <h3>${e.title}</h3>
          <p>${e.description}</p>
        </div>
        <span class="count"
          >${e.sources} ${e.sources === 1 ? "source" : "sources"} ·
          ${e.refs.length}
          ${e.refs.length === 1 ? "reference" : "references"}</span
        >
      </div>
      ${e.refs.length ? k`<div class="source-grid">
              ${this.references(e.refs, !1, !1)}
            </div>` : k`<div class="semantic-empty">
              No direct references in this category.
            </div>`}
    </section>`;
	}
	overviewReviewNotice(e) {
		let t = e.uncertain_references.filter((e) => Q(e) === "unresolved");
		return t.length ? k`<div class="review-strip">
      <div>
        <strong>Some linked logic still needs review</strong>
        <span
          >${$(t)} could not be resolved statically inside
          configurations that use this entity.</span
        >
      </div>
      <button @click=${() => this.selectTab("usage")}>
        Review blind spots
      </button>
    </div>` : j;
	}
	overview(e) {
		let t = J(e.references), n = rt(e), r = X(e);
		return k`<div class="overview-grid">
        <section class="overview-panel">
          <div class="section-heading">
            <div>
              <span class="direction-label">Incoming relationships</span>
              <h2>What uses this entity?</h2>
              <p>
                Direct references grouped by what the source actually does with
                the selected entity.
              </p>
            </div>
          </div>
          <div class="relationship-list">
            ${t.map((e) => k`<div class="relationship-row ${e.category}">
                  <div class="relationship-row-main">
                    <strong>${e.shortLabel}</strong>
                    <span>${this.sourcePreview(e.refs)}</span>
                  </div>
                  <div class="relationship-row-count">
                    <strong>${e.sources}</strong>
                    <span>${e.sources === 1 ? "source" : "sources"}</span>
                  </div>
                </div>`)}
          </div>
          <button
            class="section-action"
            @click=${() => this.selectTab("usage")}
          >
            Inspect direct usage →
          </button>
        </section>

        <section class="overview-panel">
          <div class="section-heading">
            <div>
              <span class="direction-label">Related flow effects</span>
              <h2>What else can those flows affect?</h2>
              <p>
                Other action targets, calls or memberships reachable from the
                same configurations.
              </p>
            </div>
          </div>
          ${r ? k`<div class="effects-overview">
                  <strong
                    >${r} other ${r === 1 ? "node" : "nodes"} across
                    ${n.length}
                    ${n.length === 1 ? "flow" : "flows"}</strong
                  >
                  <div class="flow-summary-list">
                    ${n.slice(0, 4).map((e) => k`<div class="flow-summary-row">
                          <span>${this.sourceName(e.sourceId)}</span>
                          <strong>${e.items.length}</strong>
                        </div>`)}
                    ${n.length > 4 ? k`<div class="flow-summary-row muted">
                            <span>More related flows</span>
                            <strong>+${n.length - 4}</strong>
                          </div>` : j}
                  </div>
                  <p class="causality-note">
                    These are <strong>co-effects of the same flows</strong>. For
                    a normal entity, they are not effects caused by the selected
                    entity.
                  </p>
                </div>` : k`<div class="semantic-empty">
                  No other action targets or calls were reached through the
                  related flows.
                </div>`}
          <button
            class="section-action"
            @click=${() => this.selectTab("effects")}
          >
            Explore related effects →
          </button>
        </section>
      </div>
      ${this.overviewReviewNotice(e)}`;
	}
	directUsage(e) {
		let t = e.references.filter(this.matchesFilter), n = J(t);
		return k`<div class="section-heading">
        <div>
          <span class="direction-label">Source → selected entity</span>
          <h2>Direct usage</h2>
          <p>
            Every confirmed reference to the selected entity, separated by
            direction and intent. A source can appear in more than one section
            when it both reads and acts on the entity.
          </p>
        </div>
        <span class="count"
          >${new Set(t.map((e) => e.source_id)).size} visible
          ${new Set(t.map((e) => e.source_id)).size === 1 ? "source" : "sources"}</span
        >
      </div>
      <div class="usage-sections">
        ${t.length ? n.map((e) => this.usageBucketSection(e)) : k`<div class="semantic-empty">
                ${this.filtersActive ? "No direct references match the current filters. Try All sources or All confidence." : "No direct users were found in the inspected sources."}
              </div>`}
      </div>
      ${this.uncertainty(e)}`;
	}
	effectGroupSummary(e) {
		let t = /* @__PURE__ */ new Map();
		for (let n of e.items) {
			let e = n.edge?.role;
			t.set(e, (t.get(e) || 0) + 1);
		}
		return [...t].map(([e, t]) => et(e, t)).join(" · ");
	}
	effectItem(e) {
		let t = e.node, n = t.id.split(".")[0];
		return k`<div class="effect-row" data-source=${t.id}>
      <div class="effect-row-main">
        ${q(n)}
        <div>
          <h3>${this.sourceControl(t.id)}</h3>
          <span class="source-meta">
            ${W[n] || n.replaceAll("_", " ")} ·
            ${$e(e.edge?.role)}
            ${e.chained && t.via ? k` · via ${this.sourceName(t.via)}` : j}
          </span>
        </div>
      </div>
      <div class="node-actions">
        ${this.sourceControl(t.id, !0)}
        ${/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(t.id) ? k`<button
                class="analyze-node"
                aria-label=${`Analyze this: ${t.id}`}
                @click=${() => this.analyzeNode(t.id)}
              >
                Analyze
              </button>` : j}
      </div>
      ${t.path ? k`<details class="technical effect-details">
              <summary>Connection</summary>
              <div class="technical-row">
                <div class="path">
                  <span>${G(t.path)}</span>
                  ${t.confidence ? this.badge(t.confidence) : j}
                </div>
                <code>${t.path}</code>
              </div>
            </details>` : j}
    </div>`;
	}
	effectFlow(e, t) {
		let n = e.sourceId === t.entity_id;
		return k`<article class="effect-flow" data-flow=${e.sourceId}>
      <div class="effect-flow-heading">
        <div class="source-heading">
          ${q(e.sourceType)}
          <div>
            <span class="direction-label">
              ${n ? "Selected configuration → targets" : "Shared flow"}
            </span>
            <h3>${this.sourceControl(e.sourceId)}</h3>
            <span class="source-meta">
              ${n ? "These are direct effects from the selected configuration." : `${Qe(e.directReferences)} to the selected entity.`}
            </span>
          </div>
        </div>
        <span class="count"
          >${e.items.length}
          ${e.items.length === 1 ? "effect" : "effects"}</span
        >
      </div>
      <div class="flow-relationship">
        ${n ? k`<span class="relation-chip outgoing">
                selected configuration → ${e.items.length}
                ${e.items.length === 1 ? "effect node" : "effect nodes"}
              </span>` : k`<span class="relation-chip incoming">
                  this flow → selected entity
                </span>
                <span class="flow-arrow">and</span>
                <span class="relation-chip outgoing">
                  this flow → ${e.items.length} other
                  ${e.items.length === 1 ? "node" : "nodes"}
                </span>`}
      </div>
      <p class="effect-flow-summary">${this.effectGroupSummary(e)}</p>
      ${e.directItems.length ? k`<div class="effect-list">
              ${e.directItems.map((e) => this.effectItem(e))}
            </div>` : j}
      ${e.chainedItems.length ? k`<details class="chained-effects">
              <summary>
                Chained effects through called / linked configurations
                <span class="count">${e.chainedItems.length}</span>
              </summary>
              <div class="effect-list">
                ${e.chainedItems.map((e) => this.effectItem(e))}
              </div>
            </details>` : j}
    </article>`;
	}
	relatedEffects(e) {
		let t = rt(e), n = X(e);
		return k`<div class="section-heading">
        <div>
          <span class="direction-label"
            >Related configuration → other target</span
          >
          <h2>Related effects</h2>
          <p>
            Action targets, script calls and memberships reached from the same
            flows that use the selected entity.
          </p>
        </div>
        <span class="count"
          >${n} ${n === 1 ? "node" : "nodes"}</span
        >
      </div>
      <div class="causality-banner">
        <strong>Do not read this as entity → target causality.</strong>
        For ordinary entities, these are other effects of the same automation or
        script. When the selected entity is itself a configuration, its own
        direct targets are identified separately.
      </div>
      ${t.length ? k`<div class="effect-flows">
              ${t.map((t) => this.effectFlow(t, e))}
            </div>` : k`<div class="empty">
              <div class="symbol">${U()}</div>
              <h3>No related effects found</h3>
              <p class="muted">
                The inspected flows do not expose additional action targets,
                calls or memberships at this traversal depth.
              </p>
            </div>`}`;
	}
	showCoverage() {
		let e = this.renderRoot.querySelector("#coverage");
		e && (e.open = !0, e.querySelector("summary")?.focus(), e.scrollIntoView({ block: "start" }));
	}
	completeness(e) {
		let t = e.graph.limits_reached || [], n = t.includes("nodes") || t.includes("edges"), r = [
			1,
			2,
			3,
			4,
			6,
			8,
			12
		].find((t) => t > e.graph.max_depth);
		return e.graph.truncated ? k`<section
        class="notice incomplete"
        role="status"
        aria-label="Analysis limits reached"
      >
        <h3>Analysis limits reached</h3>
        ${t.includes("depth") ? k`<p>The dependency map reached depth ${e.graph.max_depth}. More related nodes may exist beyond this depth.</p>` : j}
        ${n ? k`<p>The dependency map reached its ${t.includes("nodes") ? "node" : "edge"} limit. Increasing depth will not remove this cap.</p>` : j}
        ${t.length ? j : k`<p>The dependency map reached a depth or size limit. More related nodes may exist.</p>`}
        <div class="controls">
          ${t.includes("depth") && !n && r ? k`<button
                  ?disabled=${this.loading}
                  @click=${() => {
			this.depth = r, this.run();
		}}
                >
                  Inspect to depth ${r}
                </button>` : j}
          <button @click=${this.showCoverage}>Coverage details</button>
        </div>
      </section>` : j;
	}
	graphConnection(e) {
		let t = this.report;
		if (!t || !e.via) return "";
		let n = e.relationship === "dependent" ? t.graph.edges.find((t) => t.source_id === e.id && t.target === e.via) : t.graph.edges.find((t) => t.source_id === e.via && t.target === e.id);
		return n ? e.relationship === "dependent" ? Y(n) : `${$e(n.role)} from ${this.sourceName(e.via)}` : e.relationship === "dependent" ? "Uses the upstream node" : "Related effect";
	}
	graph(e) {
		let t = this.filtersActive ? ft(e, this.matchesFilter) : e.graph.nodes, n = e.graph.edges.filter(this.matchesFilter), r = t.find((e) => e.relationship === "selected"), i = t.filter((e) => e.relationship === "dependent"), a = t.filter((e) => e.relationship === "downstream");
		return k`<h2>Relationship map</h2>
      <p class="muted">
        Left: configurations that use the selected entity. Right: other effects
        reached from those same flows. This is a structural map, not proof that
        changing the selected entity causes the right-hand targets.
      </p>
      <div class="direction-legend" aria-label="Relationship directions">
        <span
          ><strong>Incoming use</strong> configuration → selected entity</span
        >
        <span
          ><strong>Related effect</strong> configuration → other target</span
        >
      </div>
      ${this.filtersActive ? k`<p class="filter-note">Showing ${t.length - 1} of ${e.graph.nodes.length - 1} linked nodes. Paths may pass through hidden configurations; filtering does not recalculate the graph.</p>` : j}
      <div class="tree dependency-map">
        <div class="map-selected">
          <span class="map-label">Selected entity</span
          >${this.graphNode(r)}
        </div>
        <div class="map-columns">
          <section class="map-group">
            <h3>
              Configurations using this entity
              <span class="count">${i.length}</span>
            </h3>
            <p class="muted">
              These configurations depend on, target, display or contain the
              selected entity.
            </p>
            ${i.length ? i.map((e) => this.graphNode(e)) : k`<p>${this.filtersActive ? "No matching linked configurations. Try All sources or All confidence." : "No linked configurations found."}</p>`}
          </section>
          <section class="map-group">
            <h3>
              Other effects in the same flows
              <span class="count">${a.length}</span>
            </h3>
            <p class="muted">
              Action targets, calls and memberships from the related
              configurations. They are not necessarily caused by the selected
              entity.
            </p>
            ${a.length ? a.map((e) => this.graphNode(e)) : k`<p>${this.filtersActive ? "No matching related effects. Try All sources or All confidence." : "No related effect nodes found."}</p>`}
          </section>
        </div>
      </div>
      ${e.graph.cycles.length ? k`<div class="notice">Cycles detected. Nodes are shown once.${e.graph.cycles.map((e) => k`<p><code>${e.join(" → ")}</code></p>`)}</div>` : j}
      <details>
        <summary>
          ${n.length} visible graph edges / ${e.graph.edges.length}
          total
        </summary>
        ${n.map((e) => k`<div class="edge"><strong>${this.sourceName(e.source_id)} → ${this.sourceName(e.target)}</strong><code>${e.source_id} → ${e.target}</code><code>${e.path}</code><span class="badge">${e.role}</span> ${this.badge(e.confidence)}</div>`)}
      </details>`;
	}
	graphNode(e) {
		let t = e.id.split(".")[0];
		return k`<article
      class="graph-node ${e.relationship}"
      data-source=${e.id}
    >
      <div class="reference-title">
        <div class="source-heading">
          ${q(t)}
          <div>
            <h3>${this.sourceControl(e.id)}</h3>
            <span class="source-meta"
              >${W[t] || t.replaceAll("_", " ")}${e.depth ? ` · ${e.depth} ${e.depth === 1 ? "step" : "steps"} away` : ""}</span
            >
          </div>
        </div>
        <div class="node-actions">
          ${this.sourceControl(e.id, !0)}
          ${/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(e.id) ? k`<button class="analyze-node" aria-label=${`Analyze this: ${e.id}`} @click=${() => this.analyzeNode(e.id)}>Analyze this</button>` : j}
        </div>
      </div>
      ${e.via ? k`<p class="via">
              <strong>${this.graphConnection(e)}</strong>
              ${e.relationship === "dependent" ? k` · via ${this.sourceControl(e.via)}` : j}
            </p>` : j}
      <details class="technical">
        <summary>${e.path ? "Connection details" : "Entity ID"}</summary>
        <code class="source-id">${e.id}</code>
        ${e.path ? k`<div class="technical-row">
                <div class="path">
                  <span>${G(e.path)}</span
                  >${e.confidence ? this.badge(e.confidence) : j}
                </div>
                <code>${e.path}</code>
              </div>` : j}
      </details>
    </article>`;
	}
	raw(e) {
		let t = [
			...e.references,
			...e.uncertain_references,
			...e.other_dashboard_references || []
		].filter(this.matchesFilter);
		return k`<h2>Raw references</h2>
      ${t.length ? j : k`<p>No matching references. Try All sources or All confidence.</p>`}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Source / path</th>
              <th>Role</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            ${t.map((e) => k`<tr>
                  <td>
                    ${this.sourceControl(e.source_id)}<code
                      >${e.source_id}<br />${e.path}</code
                    >
                  </td>
                  <td>${e.role}</td>
                  <td>
                    ${e.selector ? k`<span class="badge">${ht(e)}</span>` : this.badge(e.confidence)}${e.reason ? k`<p>${K(e.reason)}</p>` : j}${this.selectorDetail(e)}
                  </td>
                </tr>`)}
          </tbody>
        </table>
      </div>`;
	}
	render() {
		let e = this.report, t = this.entities.filter((e) => `${e.entity_id} ${e.name}`.toLowerCase().includes(this.query.toLowerCase())).slice(0, 80);
		return k`<header>
        <button
          class="menu"
          aria-label="Open sidebar"
          @click=${() => this.dispatchEvent(new CustomEvent("hass-toggle-menu", {
			bubbles: !0,
			composed: !0
		}))}
        >
          ☰
        </button>
        <div class="brand-lockup">
          ${U()}<strong>HA Blast Radius</strong>
        </div>
        <span class="badge"
          >READ ONLY<span class="release-label"> · α ${pt}</span></span
        >
      </header>
      <main>
        <h1>Dependency impact</h1>
        <p class="muted intro">
          See who uses an entity, how they use it, and what else those flows can
          affect before you rename or remove it.
        </p>
        <form
          class="search"
          @submit=${(e) => {
			e.preventDefault(), this.run();
		}}
        >
          <label
            >Entity<input
              aria-label="Entity"
              placeholder="Search or enter an entity ID…"
              list="entities"
              .value=${this.query}
              @input=${this.changeQuery}
              autocomplete="off"
              spellcheck="false"
          /></label>
          <datalist id="entities">
            ${t.map((e) => k`<option value=${e.entity_id}>${e.name}${e.exists ? "" : " · missing"}</option>`)}
          </datalist>
          <button
            class="primary"
            ?disabled=${this.loading || !this.query.trim()}
          >
            ${this.loading ? "Inspecting…" : "Analyze"}
          </button>
        </form>
        <details class="analysis-options">
          <summary>Analysis options</summary>
          <div class="analysis-options-body">
            <label class="depth"
              >Traversal depth<select
                aria-label="Traversal depth"
                .value=${String(this.depth)}
                @change=${(e) => {
			this.depth = Number(e.target.value), this.report && this.run();
		}}
              >
                ${[
			1,
			2,
			3,
			4,
			6,
			8,
			12
		].map((e) => k`<option value=${e} ?selected=${e === this.depth}>${e}</option>`)}
              </select></label
            >
            <p class="muted">
              Higher depth expands the surrounding dependency graph. Direct
              references do not depend on traversal depth.
            </p>
          </div>
        </details>
        ${this.recentSearches.length ? k`<section
                class="recent-searches"
                aria-label="Recent searches"
              >
                <span class="recent-label">Recent</span>
                <div class="recent-list">
                  ${Be(this.recentSearches, (e) => e.entityId, (e) => k`<button
                        class="recent-search"
                        title=${`${e.entityId} · depth ${e.depth}`}
                        aria-label=${`Analyze again: ${e.entityId}`}
                        aria-pressed=${this.report?.entity_id === e.entityId}
                        @click=${() => this.reopenSearch(e)}
                      >
                        ${this.sourceName(e.entityId)}
                      </button>`)}
                </div>
                <button
                  class="clear-recent"
                  aria-label="Clear recent searches"
                  @click=${this.clearRecentSearches}
                >
                  Clear
                </button>
              </section>` : j}
        ${this.loading ? k`<progress aria-label="Inspecting configuration"></progress>` : j}
        ${this.error ? k`<div role="alert" class="notice error">
                ${this.error}
                <div class="controls">
                  <button
                    @click=${() => this.query ? this.run() : this.loadEntities()}
                  >
                    Retry
                  </button>
                </div>
              </div>` : j}
        ${e ? k`
                <div class="result-heading">
                  <div>
                    <h2 tabindex="-1">${this.sourceName(e.entity_id)}</h2>
                    <code>${e.entity_id}</code>
                  </div>
                  <div class="result-badges" aria-label="Analysis summary">
                    <span class="summary-pill"
                      >${this.directConfidence(e)}</span
                    >
                    ${(e.coverage.warnings || []).length ? k`<button
                            class="summary-pill summary-action"
                            @click=${this.showCoverage}
                          >
                            Coverage partial
                          </button>` : j}
                  </div>
                </div>
                ${e.exists ? j : k`<div class="notice">This entity is missing. References to its old ID can still be inspected.</div>`}
                ${e.graph.truncated ? this.completeness(e) : j}
                ${this.relationshipSummary(e)}
                ${e.graph.truncated ? j : this.completeness(e)}
                <div class="columns">
                  <section class="card">
                    <nav role="tablist" aria-label="Analysis views">
                      ${[
			["overview", "Overview"],
			["usage", "Uses this entity"],
			["effects", "Related effects"],
			["graph", "Graph"],
			["raw", "Technical"]
		].map(([e, t]) => k`<button
                            role="tab"
                            id=${`tab-${e}`}
                            aria-controls="analysis-view"
                            aria-selected=${this.tab === e}
                            tabindex=${this.tab === e ? 0 : -1}
                            @keydown=${this.tabKeydown}
                            @click=${() => this.selectTab(e)}
                          >
                            ${t}
                          </button>`)}
                    </nav>
                    ${this.tab === "usage" || this.tab === "graph" || this.tab === "raw" ? this.filters(e) : j}
                    <div
                      role="tabpanel"
                      id="analysis-view"
                      aria-labelledby=${`tab-${this.tab}`}
                    >
                      ${this.tab === "overview" ? this.overview(e) : this.tab === "usage" ? this.directUsage(e) : this.tab === "effects" ? this.relatedEffects(e) : this.tab === "graph" ? this.graph(e) : this.raw(e)}
                    </div>
                    <div class="controls">
                      <button @click=${this.copy}>Copy Markdown</button
                      ><button @click=${this.download}>Export JSON</button
                      ><button
                        ?disabled=${this.loading}
                        @click=${() => this.run()}
                      >
                        Refresh snapshot
                      </button>
                    </div>
                    <a
                      class="issue-link"
                      href="https://github.com/artur-panek/ha-blast-radius/issues/new?template=bug.yml"
                      target="_blank"
                      rel="noopener noreferrer"
                      >Report issue ↗</a
                    >
                    <p class="status" role="status">${this.status}</p>
                    ${this.copyFallback ? k`<textarea aria-label="Markdown report" readonly .value=${e.markdown}></textarea>` : j}
                  </section>
                  <details
                    class="card change-preview"
                    .open=${!!e.preview}
                  >
                    <summary>Preview a change</summary>
                    <div class="preview-form">
                      <h2>Change preview</h2>
                      <p class="muted">
                        See which references need attention before making a
                        change.
                      </p>
                      <label
                        >New entity ID<input
                          aria-label="New entity ID"
                          .value=${this.replacement}
                          placeholder=${e.entity_id}
                          @input=${(e) => this.replacement = e.target.value}
                          spellcheck="false"
                      /></label>
                      <button
                        ?disabled=${this.loading || !this.replacement.trim()}
                        @click=${() => this.run("rename")}
                      >
                        Preview rename</button
                      ><button
                        ?disabled=${this.loading}
                        @click=${() => this.run("delete")}
                      >
                        Preview removal
                      </button>
                      ${e.preview ? k`<div class="preview" role="status">
                              <h3>
                                ${e.preview.operation === "rename" ? "Rename preview" : "Removal preview"}
                              </h3>
                              <code>${e.entity_id}</code
                              >${e.preview.new_entity_id ? k`<code>→ ${e.preview.new_entity_id}</code>` : j}
                              <ul>
                                ${Object.entries(e.preview.affected_sources).map(([e, t]) => k`<li>${t} ${e} source${t === 1 ? "" : "s"}</li>`)}
                              </ul>
                              <p>${e.preview.note}</p>
                              <strong>No changes have been made.</strong>
                            </div>` : j}
                      <p class="muted">
                        Analysis only. No configuration is written.
                      </p>
                    </div>
                  </details>
                </div>
                <details class="card" id="coverage">
                  <summary>
                    Coverage & diagnostics · ${e.coverage.sources} sources
                    inspected
                  </summary>
                  <p class="muted">
                    ${Object.entries(e.coverage.source_types).map(([e, t]) => `${t} ${e}`).join(" · ")}
                  </p>
                  <ul>
                    ${e.warnings.map((e) => k`<li>${e}</li>`)}
                    <li>
                      ${e.unresolved_total} locations without an entity
                      target across the full snapshot. These include device IDs,
                      selectors and expressions; they cannot be attributed to
                      this entity.
                    </li>
                    <li>
                      ${$(e.uncertain_references)} in linked
                      configurations or cards;
                      ${$(e.other_dashboard_references || [])}
                      elsewhere in linked dashboards. Groups summarize repeated
                      reasons and selector identities, not a count of affected
                      entities.
                    </li>
                    ${e.review_summary?.snapshot.locations === e.unresolved_total ? k`<li>Full snapshot: ${e.review_summary.snapshot.device_locations} device-reference locations · ${e.review_summary.snapshot.selector_locations} unexpanded-selector locations · ${e.review_summary.snapshot.unresolved_locations} dynamic or unrecognized locations.</li>` : j}
                    <li>
                      Conditional branches are not evaluated. A reference does
                      not prove an action will run.
                    </li>
                  </ul>
                  ${this.coverageDiagnostics(e)}
                  <details class="confidence-help">
                    <summary>Reference confidence</summary>
                    <ul>
                      <li>
                        <strong>Explicit:</strong> an entity ID in a recognized
                        configuration field.
                      </li>
                      <li>
                        <strong>Template literal:</strong> visible in Jinja, but
                        execution is not guaranteed.
                      </li>
                      <li>
                        <strong>Dynamic:</strong> a target that cannot be
                        resolved statically.
                      </li>
                      <li>
                        <strong>Unclassified:</strong> a candidate in a field
                        with unknown semantics, or HA-native metadata without a
                        verified location and role.
                      </li>
                    </ul>
                  </details>
                </details>
                <div class="foot">
                  <span
                    >Fresh snapshot:
                    ${new Date(e.snapshot_at).toLocaleString()}</span
                  ><span
                    >Static configuration analysis · No changes applied</span
                  >
                </div>
              ` : !this.loading && !this.error ? k`<section class="card empty">
                  <div class="symbol">${U()}</div>
                  <h2>Start with one entity</h2>
                  <p class="muted">
                    A button, a helper, an old light.<br />See what acts on it,
                    what reads it, and what else those same flows can affect.
                  </p>
                  <p class="muted">
                    ${this.entities.length} entity IDs available · Missing IDs
                    can be entered manually
                  </p>
                </section>` : j}
      </main>`;
	}
};
customElements.get("blast-radius-panel") || customElements.define("blast-radius-panel", vt);
//#endregion
export { vt as BlastRadiusPanel };
