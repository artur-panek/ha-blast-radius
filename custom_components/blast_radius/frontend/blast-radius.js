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
var y = globalThis, ae = (e) => e, b = y.trustedTypes, oe = b ? b.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, x = "$lit$", S = `lit$${Math.random().toFixed(9).slice(2)}$`, C = "?" + S, se = `<${C}>`, w = document, T = () => w.createComment(""), E = (e) => e === null || typeof e != "object" && typeof e != "function", D = Array.isArray, ce = (e) => D(e) || typeof e?.[Symbol.iterator] == "function", O = "[ 	\n\f\r]", k = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, le = /-->/g, ue = />/g, A = RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), de = /'/g, fe = /"/g, pe = /^(?:script|style|textarea|title)$/i, me = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), j = me(1), he = me(2), M = Symbol.for("lit-noChange"), N = Symbol.for("lit-nothing"), ge = /* @__PURE__ */ new WeakMap(), P = w.createTreeWalker(w, 129);
function _e(e, t) {
	if (!D(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return oe === void 0 ? t : oe.createHTML(t);
}
var ve = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = k;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === k ? c[1] === "!--" ? o = le : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = A) : (pe.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = A) : o = ue : o === A ? c[0] === ">" ? (o = i ?? k, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? A : c[3] === "\"" ? fe : de) : o === fe || o === de ? o = A : o === le || o === ue ? o = k : (o = A, i = void 0);
		let d = o === A && e[t + 1].startsWith("/>") ? " " : "";
		a += o === k ? n + se : l >= 0 ? (r.push(s), n.slice(0, l) + x + n.slice(l) + S + d) : n + S + (l === -2 ? t : d);
	}
	return [_e(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, F = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ve(t, n);
		if (this.el = e.createElement(l, r), P.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = P.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(x)) {
					let t = u[o++], n = i.getAttribute(e).split(S), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ye : r[1] === "?" ? be : r[1] === "@" ? xe : z
					}), i.removeAttribute(e);
				} else e.startsWith(S) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (pe.test(i.tagName)) {
					let e = i.textContent.split(S), t = e.length - 1;
					if (t > 0) {
						i.textContent = b ? b.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], T()), P.nextNode(), c.push({
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
function I(e, t, n = e, r) {
	if (t === M) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = E(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = I(e, i._$AS(e, t.values), i, r)), t;
}
var L = class {
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
		P.currentNode = r;
		let i = P.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new R(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Se(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = P.nextNode(), a++);
		}
		return P.currentNode = w, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, R = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = N, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = I(this, e, t), E(e) ? e === N || e == null || e === "" ? (this._$AH !== N && this._$AR(), this._$AH = N) : e !== this._$AH && e !== M && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ce(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== N && E(this._$AH) ? this._$AA.nextSibling.data = e : this.T(w.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = F.createElement(_e(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new L(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = ge.get(e.strings);
		return t === void 0 && ge.set(e.strings, t = new F(e)), t;
	}
	k(t) {
		D(this._$AH) || (this._$AH = [], this._$AR());
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
}, z = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = N, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = N;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = I(this, e, t, 0), a = !E(e) || e !== this._$AH && e !== M, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = I(this, r[n + o], t, o), s === M && (s = this._$AH[o]), a ||= !E(s) || s !== this._$AH[o], s === N ? e = N : e !== N && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === N ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ye = class extends z {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === N ? void 0 : e;
	}
}, be = class extends z {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== N);
	}
}, xe = class extends z {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = I(this, e, t, 0) ?? N) === M) return;
		let n = this._$AH, r = e === N && n !== N || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== N && (n === N || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Se = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		I(this, e);
	}
}, Ce = {
	M: x,
	P: S,
	A: C,
	C: 1,
	L: ve,
	R: L,
	D: ce,
	V: I,
	I: R,
	H: z,
	N: be,
	U: xe,
	B: ye,
	F: Se
}, we = y.litHtmlPolyfillSupport;
we?.(F, R), (y.litHtmlVersions ??= []).push("3.3.3");
var Te = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new R(t.insertBefore(T(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, B = globalThis, V = class extends v {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Te(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return M;
	}
};
V._$litElement$ = !0, V.finalized = !0, B.litElementHydrateSupport?.({ LitElement: V });
var Ee = B.litElementPolyfillSupport;
Ee?.({ LitElement: V }), (B.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/lit-html/directive.js
var De = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, Oe = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), ke = class {
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
}, { I: Ae } = Ce, je = (e) => e, Me = () => document.createComment(""), H = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new Ae(r.insertBefore(Me(), i), r.insertBefore(Me(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = je(e).nextSibling;
				je(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, U = (e, t, n = e) => (e._$AI(t, n), e), Ne = {}, Pe = (e, t = Ne) => e._$AH = t, Fe = (e) => e._$AH, W = (e) => {
	e._$AR(), e._$AA.remove();
}, Ie = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, Le = Oe(class extends ke {
	constructor(e) {
		if (super(e), e.type !== De.CHILD) throw Error("repeat() can only be used in text expressions");
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
		let i = Fe(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = U(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = U(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = U(i[d], a[m]), H(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = U(i[f], a[p]), H(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = Ie(o, p, m), u = Ie(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = H(e, i[d]);
					U(t, a[p]), c[p] = t;
				} else c[p] = U(n, a[p]), H(e, i[d], n), i[t] = null;
				p++;
			} else W(i[f]), f--;
		} else W(i[d]), d++;
		for (; p <= m;) {
			let t = H(e, c[m + 1]);
			U(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && W(e);
		}
		return this.ut = o, Pe(e, c), M;
	}
}), Re = o`
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
    grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1.28fr);
    gap: 0;
    margin: 18px 0 22px;
    border: 1px solid var(--br-border);
    border-radius: 12px;
    background: var(--br-card);
    overflow: hidden;
  }
  .impact-verdict {
    padding: 18px 20px;
    border-right: 1px solid var(--br-border);
  }
  .impact-verdict .eyebrow {
    display: block;
    margin-bottom: 4px;
    color: var(--br-muted);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .impact-verdict > strong {
    display: block;
    font-size: 25px;
    font-weight: 600;
  }
  .impact-verdict p {
    margin: 7px 0 0;
    color: var(--br-muted);
    font-size: 13px;
  }
  .impact-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .impact-metrics > div {
    padding: 18px 16px;
    border-right: 1px solid var(--br-border);
  }
  .impact-metrics > div:last-child {
    border-right: 0;
  }
  .impact-metrics strong {
    display: block;
    margin-bottom: 4px;
    font-size: 23px;
    font-weight: 500;
  }
  .impact-metrics span {
    color: var(--br-muted);
    font-size: 13px;
  }
  .summary-context-note {
    margin: -10px 2px 18px;
    color: var(--br-muted);
    font-size: 12px;
  }
  .summary-context-note strong {
    color: var(--primary-text-color, #212121);
    font-size: 13px;
    margin-right: 3px;
  }
  .impact-lane {
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid var(--br-border);
  }
  /* The filter toolbar already separates the first section from the tabs. */
  #analysis-view > .impact-lane:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }
  .impact-lane .section-heading {
    margin-bottom: 10px;
  }
  .lane-metadata {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
  }
  .lane-badge {
    flex: 0 0 auto;
    color: var(--br-muted);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }
  .incoming-badge {
    border-color: color-mix(in srgb, var(--br-accent) 55%, var(--br-border));
  }
  .reaction-badge,
  .downstream-badge {
    border-color: color-mix(
      in srgb,
      var(--success-color, #288048) 55%,
      var(--br-border)
    );
  }
  .role-group {
    margin-top: 12px;
  }
  .role-group-compact {
    margin-top: 10px;
  }
  .role-group + .role-group {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed var(--br-border);
  }
  .role-heading {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 8px;
  }
  .role-heading h3 {
    margin: 0;
    font-size: 15px;
  }
  .role-heading p {
    margin: 3px 0 0;
    color: var(--br-muted);
    font-size: 12px;
  }
  .role-count {
    flex: 0 0 auto;
    border: 1px solid var(--br-border);
    border-radius: 999px;
    padding: 4px 8px;
    color: var(--br-muted);
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }
  .role-change .role-count,
  .role-invoke .role-count {
    border-color: color-mix(in srgb, var(--br-accent) 55%, var(--br-border));
  }
  .same-flow-list {
    display: grid;
    gap: 8px;
  }
  .flow-group {
    margin: 0;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    padding: 2px 12px;
  }
  .flow-output,
  .flow-reaction {
    border-left: 3px solid var(--success-color, #288048);
  }
  .flow-mixed {
    border-left: 3px solid var(--warning-color, #9b6600);
  }
  .flow-context {
    background: color-mix(
      in srgb,
      var(--br-card) 98%,
      var(--primary-text-color, #212121)
    );
  }
  .flow-group > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .flow-group > summary > span:first-child {
    min-width: 0;
  }
  .flow-source {
    display: block;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .flow-group summary small {
    display: block;
    margin-top: 2px;
    color: var(--br-muted);
    font-size: 11px;
    font-weight: 400;
  }
  .flow-count {
    flex: 0 0 auto;
    color: var(--br-muted);
    font-size: 12px;
    font-weight: 500;
  }
  .flow-targets {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    padding: 4px 0 10px;
  }
  .flow-target {
    min-width: 0;
    border: 1px solid var(--br-border);
    border-radius: 7px;
    padding: 9px 10px;
  }
  .flow-target .source-name {
    font-size: 13px;
  }
  .flow-target small {
    display: block;
    margin-top: 2px;
    color: var(--br-muted);
    font-size: 11px;
  }
  .shared-context {
    margin-top: 22px;
    border: 1px solid var(--br-border);
    border-radius: 9px;
    padding: 3px 12px;
    background: color-mix(
      in srgb,
      var(--br-card) 98%,
      var(--primary-text-color, #212121)
    );
  }
  .shared-context > summary {
    font-weight: 600;
  }
  .shared-context > p {
    margin: 0 0 12px;
    font-size: 12px;
  }
  .graph-direction {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin: 12px 0 18px;
  }
  .graph-direction span {
    border: 1px solid var(--br-border);
    border-radius: 8px;
    padding: 10px 12px;
    color: var(--br-muted);
    font-size: 12px;
  }
  .graph-direction strong {
    color: var(--primary-text-color, #212121);
  }
  .effect-group {
    border-top-color: color-mix(
      in srgb,
      var(--success-color, #288048) 60%,
      var(--br-border)
    );
  }
  .graph-context {
    margin-top: 22px;
    border-top: 1px solid var(--br-border);
    padding-top: 8px;
  }
  .graph-context > summary {
    font-weight: 600;
  }
  .graph-context-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
  }

  /* One clear result list; graph and scanner internals stay optional. */
  .plain-impact {
    background: var(--br-card);
    border: 1px solid var(--br-border);
    border-radius: 12px;
    padding: 22px 24px;
    margin: 16px 0 14px;
  }
  .plain-lead {
    padding-bottom: 14px;
  }
  .plain-lead h3 {
    font-size: 21px;
    font-weight: 600;
    line-height: 1.3;
    margin: 0 0 4px;
  }
  .plain-lead p {
    font-size: 14px;
    color: var(--br-muted);
    margin: 0;
  }
  .plain-use-group {
    padding-top: 15px;
  }
  .plain-use-group + .plain-use-group {
    border-top: 1px solid var(--br-border);
    margin-top: 10px;
  }
  .plain-use-group h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 3px;
  }
  .plain-use-list {
    display: grid;
    gap: 0;
  }
  .plain-source {
    padding: 12px 0 9px;
    border-bottom: 1px solid var(--br-border);
    min-width: 0;
  }
  .plain-source:last-child {
    border-bottom: 0;
  }
  .plain-source-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    min-width: 0;
  }
  .plain-source .source-heading {
    align-items: center;
  }
  .plain-source h5 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }
  .plain-source .source-heading p {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--br-muted);
  }
  .plain-source .review-hint {
    display: inline;
    font-size: inherit;
  }
  .plain-source-details {
    margin: 3px 0 0 32px;
    color: var(--br-muted);
  }
  .plain-source-details > summary {
    display: list-item;
    width: fit-content;
    padding: 6px 0;
    font-size: 12px;
  }
  .plain-source-paths {
    margin: 6px 0 8px;
    padding-left: 12px;
    border-left: 1px solid var(--br-border);
  }
  .plain-source-path {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px 9px;
    padding: 7px 0;
    font-size: 12px;
  }
  .plain-source-path + .plain-source-path {
    border-top: 1px solid var(--br-border);
  }
  .plain-source-path code {
    display: block;
    flex-basis: 100%;
    color: var(--br-muted);
    overflow-wrap: anywhere;
  }
  .plain-source-path p {
    margin: 0;
  }
  .plain-scan-note {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px 12px;
    margin-top: 10px;
    padding-top: 12px;
    border-top: 1px solid var(--br-border);
    font-size: 12px;
    color: var(--br-muted);
  }
  .plain-scan-note button {
    padding: 5px 8px;
    min-height: 34px;
    font-size: 12px;
    border: 0;
    background: transparent;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .read-only-note {
    color: var(--br-muted);
    font-size: 12px;
  }
  .report-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 12px 0 0;
  }
  .report-actions button {
    font-size: 13px;
  }
  .columns {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }
  .columns > .change-preview {
    order: 0;
  }
  .columns > .advanced-analysis {
    order: 1;
  }
  .advanced-analysis {
    width: 100%;
    margin-top: 0;
    border: 1px solid var(--br-border);
    border-radius: 12px;
    padding: 5px 20px;
    background: var(--br-card);
  }
  .advanced-analysis > summary {
    font-weight: 600;
    padding: 13px 0;
  }
  .advanced-analysis > summary small {
    display: block;
    margin-left: 19px;
    color: var(--br-muted);
    font-size: 12px;
    font-weight: 400;
  }
  .advanced-content {
    margin-top: 8px;
  }
  .advanced-content .impact-summary {
    margin-top: 12px;
  }
  .advanced-analysis > .card {
    margin-top: 12px;
    padding: 18px;
  }
  @media (max-width: 600px) {
    .plain-impact {
      padding: 16px;
    }
    .plain-lead h3 {
      font-size: 19px;
    }
    .plain-source-header {
      gap: 8px;
    }
    .plain-source-details {
      margin-left: 0;
    }
    .plain-source .open-source {
      padding: 6px 9px;
      min-height: 44px;
    }
    .advanced-analysis {
      padding: 5px 14px;
    }
    .advanced-analysis > .card {
      padding: 8px;
    }
    .report-actions > button {
      flex: 1 1 auto;
    }
  }

  .columns {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: stretch;
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
    gap: 6px;
    border-bottom: 1px solid var(--br-border);
    margin: -8px -8px 12px;
  }
  nav button {
    border: 0;
    border-bottom: 3px solid transparent;
    border-radius: 0;
    background: transparent;
    font-size: 15px;
    padding: 14px;
  }
  nav button[aria-selected="true"] {
    color: var(--primary-text-color, #212121);
    border-bottom-color: var(--br-accent);
  }
  .reference {
    padding: 10px 12px;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    min-width: 0;
  }
  .source-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
    align-items: start;
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
    font-size: 16px;
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
  .preview-form .preview-hint {
    margin: -10px 0 12px;
    color: var(--br-muted);
    font-size: 12px;
  }
  .preview-form .preview-error {
    margin: 8px 0 14px;
    font-size: 13px;
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
    font-size: 12px;
    color: var(--br-muted);
  }
  .status[hidden] {
    display: none;
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
    margin: 24px 0 12px;
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
  .coverage-pill {
    color: var(--primary-text-color, #212121);
    background: color-mix(
      in srgb,
      var(--br-card) 94%,
      var(--warning-color, #9b6600)
    );
    border-color: color-mix(
      in srgb,
      var(--br-border) 65%,
      var(--warning-color, #9b6600)
    );
    cursor: pointer;
  }
  .preview-shortcut {
    min-height: 32px;
    padding: 5px 9px;
    border-color: transparent;
    background: transparent;
    font-size: 12px;
  }
  .preview-shortcut:hover {
    border-color: var(--br-border);
  }
  .technical {
    margin-top: 6px;
    color: var(--br-muted);
  }
  .technical > summary {
    font-size: 13px;
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
    margin-top: 20px;
    padding-top: 18px;
  }
  /* Bordered disclosures provide their own boundary; never stack another rule. */
  .shared-context + .uncertainty {
    border-top: 0;
    padding-top: 0;
    margin-top: 22px;
  }
  #analysis-view > .uncertainty:first-child {
    border-top: 0;
    padding-top: 0;
    margin-top: 0;
  }
  .uncertainty.diagnostics-only {
    margin-top: 12px;
    padding-top: 0;
    border-top: 0;
  }
  .uncertainty.diagnostics-only .diagnostics-link {
    margin-top: 0;
    padding: 4px 0;
    border: 0;
    background: transparent;
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 12px;
    padding: 10px 12px;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    color: var(--br-muted);
    font-size: 13px;
  }
  .diagnostics-link button {
    flex: 0 0 auto;
    min-height: 36px;
    padding: 6px 10px;
    font-size: 12px;
  }
  .scan-details > summary {
    font-weight: 600;
  }
  .scan-overview p {
    color: var(--br-muted);
    margin: 6px 0 12px;
    font-size: 13px;
  }
  .scan-overview strong {
    color: var(--primary-text-color, #212121);
  }
  .scan-warnings h3 {
    font-size: 14px;
    margin: 6px 0;
  }
  .scan-warnings ul {
    font-size: 13px;
    margin: 0 0 10px;
  }
  .coverage-breakdown {
    border-top: 1px solid var(--br-border);
    padding-top: 6px;
  }
  .coverage-breakdown > summary {
    font-size: 13px;
    font-weight: 500;
    color: var(--br-muted);
  }
  .coverage-breakdown p,
  .coverage-breakdown li {
    font-size: 12px;
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
    gap: 10px;
    min-width: 0;
  }
  .source-heading > div {
    min-width: 0;
  }
  .source-icon {
    width: 22px;
    height: 22px;
    flex: 0 0 22px;
    color: var(--br-muted);
  }
  .source-meta {
    font-size: 12px;
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
    min-height: 36px;
    border: 1px solid var(--br-border);
    border-radius: 7px;
    padding: 6px 11px;
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
    margin: 0 0 16px;
    border-bottom: 1px solid var(--br-border);
    padding-bottom: 6px;
  }
  .result-filters > summary {
    width: fit-content;
    padding: 10px 0;
    color: var(--br-muted);
    font-size: 13px;
    font-weight: 500;
  }
  .filter-body {
    padding-top: 6px;
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
    .flow-targets,
    .graph-context-grid {
      grid-template-columns: 1fr;
    }
    .reference {
      padding: 12px 13px;
    }
    .impact-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .impact-metrics > div:nth-child(2) {
      border-right: 0;
    }
    .impact-metrics > div:nth-child(-n + 2) {
      border-bottom: 1px solid var(--br-border);
    }
  }
  @media (max-width: 760px) {
    .impact-summary,
    .graph-direction {
      grid-template-columns: 1fr;
    }
    .impact-verdict {
      border-right: 0;
      border-bottom: 1px solid var(--br-border);
    }
    .role-heading,
    .flow-group > summary {
      align-items: flex-start;
      flex-direction: column;
    }
    .role-count,
    .flow-count {
      white-space: normal;
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
    .impact-metrics {
      grid-template-columns: 1fr;
    }
    .impact-metrics > div {
      border-right: 0;
      border-bottom: 1px solid var(--br-border);
      padding: 12px 16px;
    }
    .impact-metrics > div:last-child {
      border-bottom: 0;
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
    .diagnostics-link {
      align-items: stretch;
      flex-direction: column;
    }
    .lane-metadata {
      justify-content: flex-start;
    }
    .diagnostics-link button {
      width: 100%;
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
      min-height: 44px;
      padding: 6px 8px;
    }
    .coverage-pill,
    .preview-shortcut {
      min-height: 40px;
    }
    .foot {
      flex-direction: column;
    }
  }
`, G = {
	viewBox: "0 0 32 32",
	rings: "M 28.943 12.532 A 13.399999999999999 13.399999999999999 0 1 1 19.468 3.057 A 1.2 1.2 0 0 1 18.847 5.375 A 11.0 11.0 0 1 0 26.625 13.153 A 1.2 1.2 0 0 1 28.943 12.532 Z M 23.921 13.878 A 8.2 8.2 0 1 1 18.122 8.079 A 1.2 1.2 0 0 1 17.501 10.398 A 5.8 5.8 0 1 0 21.602 14.499 A 1.2 1.2 0 0 1 23.921 13.878 Z",
	radius: "M 15.222 15.222 L 23.849 6.595 L 25.405 8.151 L 16.778 16.778 Z M 13.600 16.000 a 2.4 2.4 0 1 1 4.8 0 a 2.4 2.4 0 1 1 -4.8 0 Z M 22.227 7.373 a 2.4 2.4 0 1 1 4.8 0 a 2.4 2.4 0 1 1 -4.8 0 Z"
}, K = () => he`
  <svg class="brand-mark" viewBox=${G.viewBox} aria-hidden="true" focusable="false">
    <path fill="currentColor" d=${G.rings}></path>
    <path class="radius" d=${G.radius}></path>
  </svg>
`, q = {
	automation: "Automation",
	script: "Script",
	scene: "Scene",
	dashboard: "Dashboard",
	group: "Group"
};
function ze(e) {
	return [...new Set(e.map((e) => e.source_type === "dashboard" ? "Used on this dashboard" : e.source_type === "scene" ? "Included in this scene" : e.role === "member" ? "Member of this group" : e.role === "call" ? "Called by this configuration" : e.role === "write" ? "Listed as an action target" : /^(triggers?|wait_for_trigger)(\[|\.)/.test(e.path) ? "Used by a trigger" : e.confidence === "template_literal" ? "Referenced in a template" : e.confidence === "unknown" ? "Reference needs review" : "Read by this configuration"))].join(" · ");
}
function Be(e) {
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
var Ve = {
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
function J(e) {
	return e.split(".").map((e) => {
		let t = /^(.*?)(?:\[(\d+)\])?$/.exec(e), n = t[1];
		return `${Ve[n] || n.replaceAll("_", " ").replace(/^./, (e) => e.toUpperCase())}${t[2] === void 0 ? "" : ` ${Number(t[2]) + 1}`}`;
	}).join(" › ");
}
var He = {
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
function Y(e) {
	return e.startsWith("Unexpanded ") ? "This configuration names a device, area, floor or label. Its entity membership and runtime eligibility are not expanded." : e.split("; ").map((e) => He[e] || e || "The target cannot be determined from the loaded configuration.").join(" ");
}
//#endregion
//#region src/icons.ts
function X(e) {
	return j`<svg class="source-icon" viewBox="0 0 24 24" aria-hidden="true">
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
//#region src/session.ts
var Z = /* @__PURE__ */ new Map(), Ue = [
	1,
	2,
	3,
	4,
	6,
	8,
	12
], We = (e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.entityId == "string" && t.entityId.length <= 512 && /^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(t.entityId) && Ue.includes(t.depth);
};
function Ge(e) {
	return e ? `blast-radius:session:v1:${e}` : void 0;
}
function Ke(e, t) {
	return [t, ...e.filter((e) => e.entityId !== t.entityId)].slice(0, 6);
}
function qe(e) {
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
			for (let t of e.recent) if (We(t) && !n.some((e) => e.entityId === t.entityId) && (n.push({
				entityId: t.entityId,
				depth: t.depth
			}), n.length === 6)) break;
		}
		let r = e?.last;
		return {
			recent: n,
			...We(r) && [
				"impact",
				"graph",
				"raw"
			].includes(r.tab) && Number.isFinite(r.scrollTop) && r.scrollTop >= 0 && r.scrollTop <= 1e7 ? { last: {
				entityId: r.entityId,
				depth: r.depth,
				tab: r.tab,
				scrollTop: r.scrollTop
			} } : {}
		};
	} catch {
		return { recent: [] };
	}
}
function Je(e, t) {
	if (e) {
		Z.set(e, t);
		try {
			!t.last && !t.recent.length ? sessionStorage.removeItem(e) : sessionStorage.setItem(e, JSON.stringify(t));
		} catch {}
	}
}
//#endregion
//#region src/filters.ts
var Ye = [
	"automation",
	"script",
	"dashboard",
	"scene",
	"group"
];
function Xe(e, t, n) {
	let r = e.confidence === "dynamic" || e.confidence === "unknown" ? "review" : e.confidence;
	return (!t.length || t.includes(e.source_type)) && (!n.length || n.includes(r));
}
function Ze(e, t) {
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
var Qe = "0.2.7";
//#endregion
//#region src/review.ts
function Q(e) {
	return e.resolution || (e.target === null ? e.selector ? "selector" : "unresolved" : "entity");
}
function $e(e) {
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
function et(e) {
	let t = /* @__PURE__ */ new Set([e.entity_id, ...e.references.map((e) => e.source_id)]), n = [], r = [];
	for (let i of e.uncertain_references) Q(i) === "unresolved" && (t.has(i.source_id) ? n : r).push(i);
	return {
		direct: n,
		related: r
	};
}
function tt(e) {
	return Q(e) === "device" ? "Device reference" : Q(e) === "selector" ? "Entity set not expanded" : e.reason || "Dynamic or unrecognized target";
}
function nt(e) {
	return {
		read: "Read or trigger",
		write: "Action",
		display: "Display",
		call: "Call",
		member: "Membership"
	}[e.role] || e.role;
}
function $(e) {
	let t = $e(e).length;
	return `${t} ${t === 1 ? "group" : "groups"} · ${e.length} ${e.length === 1 ? "location" : "locations"}`;
}
//#endregion
//#region src/panel.ts
var rt = {
	explicit: "Explicit",
	template_literal: "Template literal",
	dynamic: "Dynamic",
	unknown: "Unclassified"
}, it = class extends V {
	constructor(...e) {
		super(...e), this.narrow = !1, this.entities = [], this.query = "", this.loading = !1, this.error = "", this.tab = "impact", this.recentSearches = [], this.replacement = "", this.depth = 6, this.status = "", this.copyFallback = !1, this.sourceFilters = [], this.reviewFilters = [], this.advancedOpen = !1, this.previewError = "", this.analyzedRoot = "", this.initialized = !1, this.requestId = 0, this.saveSession = () => {
			Je(this.storageKey, {
				recent: this.recentSearches,
				last: this.lastView
			});
		}, this.onScroll = () => {
			this.report && this.lastView && (this.lastView = {
				...this.lastView,
				scrollTop: this.scrollTop
			}, clearTimeout(this.scrollTimer), this.scrollTimer = setTimeout(this.saveSession, 150));
		}, this.matchesFilter = (e) => Xe(e, this.sourceFilters, this.reviewFilters);
	}
	static {
		this.styles = Re;
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
			reviewFilters: { state: !0 },
			advancedOpen: { state: !0 },
			previewError: { state: !0 }
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
		let t = Ge(this.hass?.user?.id);
		if (this.hass && (!this.initialized || t !== this.storageKey)) {
			this.initialized = !0, this.storageKey = t;
			let e = qe(t);
			this.recentSearches = e.recent, this.lastView = e.last, this.query = e.last?.entityId || "", this.depth = e.last?.depth || 6, this.tab = e.last?.tab || "impact", this.advancedOpen = this.tab !== "impact", this.report = void 0, this.sourceFilters = [], this.reviewFilters = [], this.analyzedRoot = "", this.entities = [], this.replacement = "", this.status = "", this.copyFallback = !1, this.previewError = "", this.loadEntities();
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
		this.query = e.target.value, this.requestId++, this.loading = !1, this.report = void 0, this.error = "", this.status = "", this.copyFallback = !1, this.previewError = "";
	}
	async run(e, t) {
		let n = this.query.trim();
		if (!/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(n)) {
			this.error = "Enter an entity ID such as light.office.";
			return;
		}
		n !== this.analyzedRoot && (this.sourceFilters = [], this.reviewFilters = [], this.replacement = ""), this.analyzedRoot = n;
		let r = ++this.requestId;
		this.loading = !0, this.error = "", this.status = "", this.copyFallback = !1, this.previewError = "";
		try {
			e || (this.report = void 0);
			let i = {
				type: e ? "blast_radius/preview" : "blast_radius/analyze",
				entity_id: n,
				max_depth: this.depth
			};
			e && (i.operation = e), e === "rename" && (i.new_entity_id = this.replacement.trim());
			let a = await this.hass.callWS(i);
			r === this.requestId && (this.report = a, this.recentSearches = Ke(this.recentSearches, {
				entityId: a.entity_id,
				depth: a.graph.max_depth
			}), this.rememberView(t ?? this.scrollTop));
		} catch (t) {
			r === this.requestId && (e ? this.previewError = this.message(t) : this.error = this.message(t));
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
		return j`<span class="badge ${e}">${rt[e]}</span>`;
	}
	tabKeydown(e) {
		let t = [
			"impact",
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
		if (!n) return t ? N : j`<span class=${i}>${r}</span>`;
		if (n.kind === "entity") return j`<button
        class=${i}
        aria-label=${`Open entity details: ${this.sourceName(e)}`}
        @click=${() => this.openEntity(e)}
      >
        ${r}
      </button>`;
		let a = Be(n);
		return a ? j`<a
      class=${i}
      href=${a}
      aria-label=${`Open ${n.kind}: ${this.sourceName(e)}`}
      @click=${(e) => this.navigate(e, a)}
      >${r}</a
    >` : t ? N : j`<span class=${i}>${r}</span>`;
	}
	references(e, t = !1, n = !0) {
		let r = /* @__PURE__ */ new Map();
		return (n ? e.filter(this.matchesFilter) : e).forEach((e) => r.set(e.source_id, [...r.get(e.source_id) || [], e])), [...r].map(([e, n]) => j`<article class="reference source-row" data-source=${e}>
          <div class="reference-title">
            <div class="source-heading">
              ${X(n[0].source_type)}
              <div>
                <h3>${this.sourceControl(e)}</h3>
                <span class="source-meta"
                  >${q[n[0].source_type] || n[0].source_type}
                  ·
                  ${t ? $(n) : this.referenceRoleSummary(n)}</span
                >
              </div>
            </div>
            ${this.sourceControl(e, !0)}
          </div>
          ${t ? this.unresolvedGroups(n) : j`${this.shouldShowPurpose(n) ? j`<p class="purpose">${ze(n)}</p>` : N}
                  ${n.some((e) => e.confidence !== "explicit") ? j`<span class="review-hint">Includes references to review</span>` : N}
                  <details class="technical">
                    <summary>Reference details (${n.length})</summary>
                    <code class="source-id">${e}</code>
                    ${n.map((e) => j`<div class="technical-row">
                          <div class="path">
                            <span>${J(e.path)}</span
                            >${this.badge(e.confidence)}
                          </div>
                          <code>${e.path}</code>
                          ${e.reason ? j`<p>${Y(e.reason)}</p>` : N}
                        </div>`)}
                  </details>`}
        </article>`);
	}
	referenceRoleSummary(e) {
		let t = [...new Set(e.map((e) => e.role))];
		if (t.length !== 1) return `${e.length} ${e.length === 1 ? "reference" : "references"}`;
		let n = t[0] === "write" ? "target" : t[0];
		return `${e.length} ${n}${e.length === 1 ? "" : "s"}`;
	}
	shouldShowPurpose(e) {
		let t = [...new Set(e.map((e) => e.role))];
		return t.length !== 1 || ![
			"write",
			"call",
			"display"
		].includes(t[0]);
	}
	directConfidence(e) {
		let t = e.references.length;
		return t ? `${e.references.filter((e) => e.confidence === "explicit").length}/${t} direct refs explicit` : "0 direct refs";
	}
	referenceCategory(e) {
		return e.role === "write" ? "change" : e.role === "call" ? "invoke" : e.role === "display" || e.source_type === "dashboard" ? "display" : e.role === "member" ? "structural" : e.role === "read" || /^(triggers?|wait_for_trigger)(\[|\.)/.test(e.path) ? "read" : "other";
	}
	directCategoryMeta(e) {
		let t = {
			change: {
				title: "Can change this entity",
				description: "Actions in these configurations target the selected entity.",
				badge: "changes"
			},
			invoke: {
				title: "Can invoke this entity",
				description: "These configurations call the selected script or actionable entity.",
				badge: "calls"
			},
			read: {
				title: "Reacts to or reads this entity",
				description: "Triggers, conditions or reads use this entity as input without directly changing it.",
				badge: "reads"
			},
			structural: {
				title: "Includes it structurally",
				description: "Groups or structural configuration include this entity without treating it as an action target.",
				badge: "memberships"
			},
			display: {
				title: "Displays it",
				description: "Dashboards or presentation config show the selected entity.",
				badge: "displays"
			},
			other: {
				title: "Other direct references",
				description: "Direct references that do not fit a known action, read or display role.",
				badge: "references"
			}
		};
		return t[e] || t.other;
	}
	directCategories(e) {
		return [
			"change",
			"invoke",
			"read",
			"display",
			"structural",
			"other"
		].map((t) => ({
			category: t,
			refs: e.references.filter(this.matchesFilter).filter((e) => this.referenceCategory(e) === t)
		})).filter(({ refs: e }) => e.length);
	}
	uniqueSources(e) {
		return new Set(e.map((e) => e.source_id)).size;
	}
	directStats(e) {
		let t = e.references, n = (...e) => t.filter((t) => e.includes(this.referenceCategory(t)));
		return {
			action: this.uniqueSources(n("change", "invoke")),
			change: this.uniqueSources(n("change")),
			invoke: this.uniqueSources(n("invoke")),
			observe: this.uniqueSources(n("read", "display")),
			read: this.uniqueSources(n("read")),
			display: this.uniqueSources(n("display"))
		};
	}
	downstreamGroups(e, t = !0) {
		let n = t && this.filtersActive ? Ze(e, this.matchesFilter) : e.graph.nodes, r = new Map(n.map((e) => [e.id, e])), i = /* @__PURE__ */ new Map();
		for (let t of e.references) {
			let e = i.get(t.source_id);
			e ? e.push(t) : i.set(t.source_id, [t]);
		}
		let a = (e) => {
			let t = i.get(e) || [], n = new Set(t.map((e) => this.referenceCategory(e))), r = n.has("read"), a = n.has("change") || n.has("invoke");
			return r && a ? "mixed" : r ? "reaction" : "context";
		}, o = (t) => {
			let n = t, i = /* @__PURE__ */ new Set();
			for (; n?.via && !i.has(n.id);) {
				i.add(n.id);
				let t = r.get(n.via);
				if (!t) return;
				if (t.id === e.entity_id) return {
					origin: e.entity_id,
					kind: "output"
				};
				if (t.relationship === "dependent" && t.via === e.entity_id) return {
					origin: t.id,
					kind: a(t.id)
				};
				n = t;
			}
		}, s = /* @__PURE__ */ new Map();
		for (let e of n.filter((e) => e.relationship === "downstream")) {
			let t = o(e);
			if (!t) continue;
			let n = `${t.kind}:${t.origin}`, r = s.get(n) || {
				...t,
				items: []
			};
			r.items.push(e), s.set(n, r);
		}
		return [...s.values()].sort((e, t) => {
			let n = {
				output: 0,
				reaction: 1,
				mixed: 2,
				context: 3
			};
			return n[e.kind] - n[t.kind] || t.items.length - e.items.length;
		});
	}
	downstreamStats(e) {
		let t = this.downstreamGroups(e, !1), n = (...e) => new Set(t.filter((t) => e.includes(t.kind)).flatMap((e) => e.items.map((e) => e.id))).size;
		return {
			possible: n("output", "reaction", "mixed"),
			context: n("context"),
			mixed: n("mixed")
		};
	}
	impactNarrative(e) {
		let t = this.directStats(e), n = this.downstreamStats(e);
		if (!e.references.length && !n.possible) return "No direct references were found in the inspected configuration.";
		let r = [];
		return t.action && r.push(`${t.action} ${t.action === 1 ? "source can" : "sources can"} change or invoke it`), t.read && r.push(`${t.read} ${t.read === 1 ? "source reads or reacts to it" : "sources read or react to it"}`), t.display && r.push(`${t.display} ${t.display === 1 ? "source displays it" : "sources display it"}`), n.possible && r.push(`${n.possible} possible downstream ${n.possible === 1 ? "node is" : "nodes are"} reachable`), r.length ? `${r.join("; ")}.` : "Direct references are structural or unclassified.";
	}
	unresolvedGroups(e) {
		return $e(e).map(({ reference: e, paths: t }) => j` <details
          class="reason-group"
          data-resolution=${Q(e)}
        >
          <summary>
            ${tt(e)} · ${nt(e)}
            <span class="count"
              >${t.length}
              ${t.length === 1 ? "location" : "locations"}</span
            >
            ${e.selector ? j`<span class="registry-status">${e.selector.exists === !0 ? "Identity found" : e.selector.exists === !1 ? "Identity not found" : "Identity not checked"}</span>` : N}
          </summary>
          <p>${Y(e.reason)}</p>
          ${this.selectorDetail(e)}
          ${e.selector ? N : j`<p>
                    Locations share a reason, not necessarily the same
                    expression or target.
                  </p>
                  ${this.badge(e.confidence)}`}
          ${t.map((e) => j`<div class="unresolved-row"><span>${J(e)}</span><code>${e}</code></div>`)}
        </details>`);
	}
	uncertainty(e) {
		let { direct: t, related: n } = et(e), r = t.filter(this.matchesFilter), i = n.filter(this.matchesFilter), a = e.uncertain_references.filter((e) => Q(e) !== "unresolved"), o = e.other_dashboard_references || [], s = r.length || i.length;
		return !s && !a.length && !o.length ? N : j`<section
      class="uncertainty ${s ? "" : "diagnostics-only"}"
      aria-label="Potential blind spots"
    >
      ${s ? j`<div class="section-heading">
              <div>
                <h2>Potential blind spots</h2>
                <p>
                  These expressions could not be resolved statically. They are
                  not confirmed references to the selected entity.
                </p>
              </div>
            </div>` : N}
      ${r.length ? j`<details class="uncertainty-scope direct-context">
              <summary>
                Unresolved in direct sources
                <span class="count">${$(r)}</span>
              </summary>
              <p>
                These configurations directly reference the selected entity, or
                are the selected configuration itself. Their other dynamic
                expressions have unknown targets.
              </p>
              ${this.references(r, !0)}
            </details>` : N}
      ${i.length ? j`<details
              class="uncertainty-scope wider-context secondary-context"
            >
              <summary>
                Unresolved in wider graph context
                <span class="count">${$(i)}</span>
              </summary>
              <p>
                These expressions belong to configurations reached through the
                dependency graph. They are not known to reference or react to
                the selected entity.
              </p>
              ${this.references(i, !0)}
            </details>` : N}
      ${a.length || o.length ? j`<div class="diagnostics-link">
              <span>
                Additional scanner diagnostics are available in Coverage.
              </span>
              <button @click=${this.showCoverage}>View coverage</button>
            </div>` : N}
    </section>`;
	}
	coverageDiagnostics(e) {
		let t = e.uncertain_references.filter((e) => Q(e) !== "unresolved"), n = e.other_dashboard_references || [];
		return !t.length && !n.length ? N : j`<div class="coverage-diagnostics">
      ${t.length ? j`<details class="uncertainty-scope secondary-context">
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
            </details>` : N}
      ${n.length ? j`<details class="uncertainty-scope dashboard-context">
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
            </details>` : N}
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
		return j`<details
      class="result-filters"
      role="region"
      aria-label="Result filters"
      .open=${this.filtersActive || this.tab !== "impact"}
    >
      <summary>
        Filter results
        ${this.filtersActive ? j`<span class="count">${n} visible</span>` : N}
      </summary>
      <div class="filter-body">
        <div role="group" aria-label="Source types" class="filter-row">
          <span class="filter-label">Sources</span>
          <button
            aria-pressed=${!this.sourceFilters.length}
            @click=${() => this.sourceFilters = []}
          >
            All sources
          </button>
          ${Ye.map((e) => j`<button aria-pressed=${this.sourceFilters.includes(e)} @click=${() => this.sourceFilters = this.sourceFilters.includes(e) ? this.sourceFilters.filter((t) => t !== e) : [...this.sourceFilters, e]}>${q[e]}</button>`)}
        </div>
        <div role="group" aria-label="Reference confidence" class="filter-row">
          <span class="filter-label">Confidence</span>
          <button
            aria-pressed=${!this.reviewFilters.length}
            @click=${() => this.reviewFilters = []}
          >
            All confidence
          </button>
          ${Object.keys(t).map((e) => j`<button aria-pressed=${this.reviewFilters.includes(e)} @click=${() => this.reviewFilters = this.reviewFilters.includes(e) ? this.reviewFilters.filter((t) => t !== e) : [...this.reviewFilters, e]}>${t[e]}</button>`)}
        </div>
        ${this.filtersActive ? j`<p class="filter-note" role="status">${n} of ${e.references.length} direct references visible. Summary figures and exports still cover the full scan.</p>` : N}
      </div>
    </details>`;
	}
	selectorDetail(e) {
		if (!e.selector) return N;
		let t = e.selector;
		return j`<p class="selector-detail">
      <strong
        >${t.kind.replace("_id", "")}
        ${Q(e) === "device" ? "reference" : "selector"}</strong
      >
      <code>${t.value}</code>
      ${t.exists === !0 ? "Identity found in HA registry." : t.exists === !1 ? "Identity not found in HA registry; this does not establish a broken target." : "Registry identity not checked."}
      ${Q(e) === "device" ? "Device identity does not establish an entity dependency or prove an action will run." : "Entity membership and runtime eligibility are not expanded."}
    </p>`;
	}
	roleCount(e, t) {
		if (!t.length) return N;
		let n = this.directCategoryMeta(e), r = this.uniqueSources(t), i = t.length === 1 ? n.badge.slice(0, -1) : n.badge;
		return j`<span class="role-count"
      >${r} ${r === 1 ? "source" : "sources"} · ${t.length}
      ${i}</span
    >`;
	}
	renderDirectRoleGroup(e, t, n = !0) {
		if (!t.length) return N;
		let r = this.directCategoryMeta(e);
		return j`<section
      class="role-group role-${e} ${n ? "" : "role-group-compact"}"
      aria-label=${r.title}
    >
      ${n ? j`<div class="role-heading">
              <div>
                <h3>${r.title}</h3>
                <p>${r.description}</p>
              </div>
              ${this.roleCount(e, t)}
            </div>` : N}
      <div class="source-grid">${this.references(t)}</div>
    </section>`;
	}
	downstreamGroupTitle(e) {
		return e.kind === "output" ? {
			title: "Direct outputs of this configuration",
			description: "Targets reached directly from the selected script, automation or scene."
		} : e.kind === "reaction" ? {
			title: `${this.sourceName(e.origin)} can react downstream`,
			description: "This configuration reads the selected entity and can reach these nodes when its flow runs."
		} : e.kind === "mixed" ? {
			title: `${this.sourceName(e.origin)} is a mixed read/write flow`,
			description: "This configuration both reads and changes the selected entity. Downstream nodes may depend on branch conditions; inspect the connection before assuming causality."
		} : {
			title: `Co-targets in ${this.sourceName(e.origin)}`,
			description: "These nodes share a controller or flow with the selected entity. They are not downstream effects of the selected entity."
		};
	}
	renderDownstreamGroup(e, t = !1) {
		let n = this.downstreamGroupTitle(e);
		return j`<details class="flow-group flow-${e.kind}" .open=${t}>
      <summary>
        <span>
          <strong class="flow-source">${n.title}</strong>
          <small>${n.description}</small>
        </span>
        <span class="flow-count"
          >${e.items.length}
          ${e.items.length === 1 ? "node" : "nodes"}</span
        >
      </summary>
      <div class="flow-targets">
        ${e.items.map((e) => j`<div class="flow-target" data-source=${e.id}>
              <span>${this.sourceControl(e.id)}</span>
              <small
                >${e.depth} ${e.depth === 1 ? "step" : "steps"} away · via
                ${e.via ? this.sourceName(e.via) : "selected entity"}</small
              >
            </div>`)}
      </div>
    </details>`;
	}
	plainUses(e) {
		let t = [
			"change",
			"invoke",
			"read",
			"display",
			"structural",
			"other"
		], n = {
			change: "Can change this entity",
			invoke: "Can call this entity",
			read: "Reads or reacts to this entity",
			display: "Displays this entity",
			structural: "Includes this entity",
			other: "Other references"
		}, r = {
			change: "can change it",
			invoke: "can call it",
			read: "read or react to it",
			display: "display it",
			structural: "include it",
			other: "reference it"
		}, i = /* @__PURE__ */ new Map();
		for (let t of e.references) {
			let e = i.get(t.source_id);
			e ? e.push(t) : i.set(t.source_id, [t]);
		}
		let a = /* @__PURE__ */ new Map();
		for (let [e, n] of i) {
			let r = new Set(n.map((e) => this.referenceCategory(e))), i = t.find((e) => r.has(e)) || "other", o = a.get(i);
			o ? o.push({
				id: e,
				refs: n
			}) : a.set(i, [{
				id: e,
				refs: n
			}]);
		}
		let o = t.flatMap((e) => {
			let t = a.get(e)?.length || 0;
			return t ? [`${t} ${r[e]}`] : [];
		}), s = i.size, c = this.downstreamStats(e).possible > 0;
		return j`<section
      class="plain-impact"
      aria-label="Where this entity is used"
    >
      <div class="plain-lead">
        <h3>
          ${s} ${s === 1 ? "configuration" : "configurations"} found
        </h3>
        <p>
          ${o.length ? o.join(" · ") : c ? "No incoming references found. This configuration has possible outputs; explore relationships below." : "No direct references found in the inspected sources."}
        </p>
      </div>
      ${t.map((e) => {
			let t = a.get(e) || [];
			return t.length ? j`<section
          class="plain-use-group"
          aria-label=${n[e]}
        >
          <h4>${n[e]}</h4>
          <div class="plain-use-list">
            ${t.map(({ id: e, refs: t }) => j`<article class="plain-source" data-source=${e}>
                  <div class="plain-source-header">
                    <div class="source-heading">
                      ${X(t[0].source_type)}
                      <div>
                        <h5>${this.sourceName(e)}</h5>
                        <p>
                          ${q[t[0].source_type] || t[0].source_type}
                          · ${t.length}
                          ${t.length === 1 ? "reference" : "references"}
                          ${t.some((e) => e.confidence !== "explicit") ? j` ·
                                  <span class="review-hint">Needs review</span>` : N}
                        </p>
                      </div>
                    </div>
                    ${this.sourceControl(e, !0)}
                  </div>
                  <details class="plain-source-details">
                    <summary>Show reference locations</summary>
                    <div class="plain-source-paths">
                      ${t.map((e) => j`<div class="plain-source-path">
                            <span>${J(e.path)}</span>
                            ${this.badge(e.confidence)}
                            <code>${e.path}</code>
                            ${e.reason ? j`<p>${Y(e.reason)}</p>` : N}
                          </div>`)}
                    </div>
                  </details>
                </article>`)}
          </div>
        </section>` : N;
		})}
      ${e.coverage.warnings?.length ? j`<div class="plain-scan-note">
              <span
                >Some configuration could not be fully inspected. Results may be
                incomplete.</span
              >
              <button @click=${this.showCoverage}>Scan details →</button>
            </div>` : N}
    </section>`;
	}
	impact(e) {
		let t = new Map(this.directCategories(e).map(({ category: e, refs: t }) => [e, t])), n = t.get("change") || [], r = t.get("invoke") || [], i = [...n, ...r], a = n.length ? r.length ? null : "change" : "invoke", o = t.get("read") || [], s = [
			"display",
			"structural",
			"other"
		].map((e) => ({
			category: e,
			refs: t.get(e) || []
		})).filter(({ refs: e }) => e.length), c = s.length === 1 ? s[0] : null, l = this.downstreamGroups(e), u = l.filter((e) => e.kind !== "context"), d = l.filter((e) => e.kind === "context"), f = this.downstreamStats(e);
		return j`${i.length ? j`<section class="impact-lane incoming-lane">
            <div class="section-heading">
              <div>
                <h2>
                  ${a === "change" ? "What can change this entity" : a === "invoke" ? "What can invoke this entity" : "What can change or invoke this entity"}
                </h2>
                <p>
                  ${a ? this.directCategoryMeta(a).description : "These configurations can control or invoke the selected entity. Review their references before making changes."}
                </p>
              </div>
              <div class="lane-metadata">
                <span class="lane-badge incoming-badge">Incoming</span>
                ${a ? this.roleCount(a, i) : N}
              </div>
            </div>
            ${this.renderDirectRoleGroup("change", n, !a)}
            ${this.renderDirectRoleGroup("invoke", r, !a)}
          </section>` : N}
    ${o.length ? j`<section class="impact-lane reaction-lane">
            <div class="section-heading">
              <div>
                <h2>What reads or reacts to this entity</h2>
                <p>
                  These configurations use the selected entity as input. Their
                  actions may run when triggers and conditions allow it.
                </p>
              </div>
              <div class="lane-metadata">
                <span class="lane-badge reaction-badge">Reaction path</span>
                ${this.roleCount("read", o)}
              </div>
            </div>
            ${this.renderDirectRoleGroup("read", o, !1)}
          </section>` : N}
    ${u.length ? j`<section class="impact-lane downstream-lane">
            <div class="section-heading">
              <div>
                <h2>What may be affected downstream</h2>
                <p>
                  Targets reached from the selected configuration itself or from
                  configurations that read it. This is the closest thing to an
                  outgoing blast radius, but conditions are not executed.
                </p>
              </div>
              <span class="lane-badge downstream-badge"
                >${f.possible} possible</span
              >
            </div>
            <div class="same-flow-list">
              ${u.map((e) => this.renderDownstreamGroup(e, u.length === 1))}
            </div>
          </section>` : N}
    ${s.length ? j`<section class="impact-lane passive-lane">
            <div class="section-heading">
              <div>
                <h2>
                  ${c?.category === "display" ? "Where this entity is displayed" : c ? this.directCategoryMeta(c.category).title : "Other direct uses"}
                </h2>
                <p>
                  ${c ? this.directCategoryMeta(c.category).description : "Display and structural references matter for rename/removal, but do not represent control flow."}
                </p>
              </div>
              ${c ? j`<div class="lane-metadata">
                      ${this.roleCount(c.category, c.refs)}
                    </div>` : N}
            </div>
            ${s.map(({ category: e, refs: t }) => this.renderDirectRoleGroup(e, t, !c))}
          </section>` : N}
    ${d.length ? j`<details class="shared-context">
            <summary>
              Shared-flow context
              <span class="count"
                >${f.context}
                ${f.context === 1 ? "node" : "nodes"}</span
              >
            </summary>
            <p class="muted">
              These are co-targets in configurations that control the selected
              entity. They help explain the surrounding flow, but they are not
              things this entity causes to change.
            </p>
            <div class="same-flow-list">
              ${d.map((e) => this.renderDownstreamGroup(e))}
            </div>
          </details>` : N}
    ${!i.length && !o.length && !s.length && !u.length ? j`<div class="empty">
            <div class="symbol">${K()}</div>
            <h3>
              ${this.filtersActive ? "No matching direct references" : "No direct references found"}
            </h3>
            <p class="muted">
              ${this.filtersActive ? "Clear the filters to show the complete dependency view." : "Nothing in the inspected sources points directly to this entity. Check Coverage & diagnostics before changing it."}
            </p>
          </div>` : N}
    ${this.uncertainty(e)}`;
	}
	showAdvanced() {
		this.advancedOpen = !0, this.tab = "graph", this.updateComplete.then(() => {
			let e = this.renderRoot.querySelector(".advanced-analysis");
			e && (e.open = !0, e.querySelector("summary")?.focus(), e.scrollIntoView({ block: "start" }));
		});
	}
	showCoverage() {
		let e = this.renderRoot.querySelector("#coverage");
		e && (e.open = !0, e.querySelector("summary")?.focus(), e.scrollIntoView({ block: "start" }));
	}
	showChangePreview() {
		let e = this.renderRoot.querySelector(".change-preview");
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
		return e.graph.truncated ? j`<section
        class="notice incomplete"
        role="status"
        aria-label="Analysis limits reached"
      >
        <h3>Analysis limits reached</h3>
        ${t.includes("depth") ? j`<p>The dependency map reached depth ${e.graph.max_depth}. More related nodes may exist beyond this depth.</p>` : N}
        ${n ? j`<p>The dependency map reached its ${t.includes("nodes") ? "node" : "edge"} limit. Increasing depth will not remove this cap.</p>` : N}
        ${t.length ? N : j`<p>The dependency map reached a depth or size limit. More related nodes may exist.</p>`}
        <div class="controls">
          ${t.includes("depth") && !n && r ? j`<button
                  ?disabled=${this.loading}
                  @click=${() => {
			this.depth = r, this.run();
		}}
                >
                  Inspect to depth ${r}
                </button>` : N}
          <button @click=${this.showCoverage}>Coverage details</button>
        </div>
      </section>` : N;
	}
	graph(e) {
		let t = this.filtersActive ? Ze(e, this.matchesFilter) : e.graph.nodes, n = e.graph.edges.filter(this.matchesFilter), r = t.find((e) => e.relationship === "selected"), i = t.filter((e) => e.relationship === "dependent"), a = this.downstreamGroups(e), o = new Set(a.filter((e) => e.kind !== "context").flatMap((e) => e.items.map((e) => e.id))), s = new Set(a.filter((e) => e.kind === "context").flatMap((e) => e.items.map((e) => e.id))), c = t.filter((e) => e.relationship === "downstream" && o.has(e.id)), l = t.filter((e) => e.relationship === "downstream" && s.has(e.id));
		return j`<div class="section-heading">
        <div>
          <h2>Relationship map</h2>
          <p>
            Separate dependency paths from real or possible downstream paths.
            Shared-flow co-targets are kept apart so they cannot be mistaken for
            effects of the selected entity.
          </p>
        </div>
      </div>
      ${this.filtersActive ? j`<p class="filter-note">Showing ${t.length - 1} of ${e.graph.nodes.length - 1} linked nodes. Paths may pass through hidden configurations; filtering does not recalculate the graph.</p>` : N}
      <div class="graph-direction">
        <span
          ><strong>Incoming / dependent:</strong> configurations that directly
          reference this entity or lead to one that does</span
        >
        <span
          ><strong>Possible downstream:</strong> outputs of the selected
          configuration or targets reached through readers/reactors</span
        >
      </div>
      <div class="tree dependency-map">
        <div class="map-selected">
          <span class="map-label">Selected entity</span
          >${this.graphNode(r)}
        </div>
        <div class="map-columns">
          <section class="map-group incoming-group">
            <h3>
              Dependency paths
              <span class="count">${i.length}</span>
            </h3>
            <p class="muted">
              Direct references plus chained callers or dependents that can lead
              to them.
            </p>
            ${i.length ? i.map((e) => this.graphNode(e)) : j`<p>
                    ${this.filtersActive ? "No matching dependency paths. Clear filters to restore the full map." : "No dependency paths found."}
                  </p>`}
          </section>
          <section class="map-group effect-group">
            <h3>
              Possible downstream
              <span class="count">${c.length}</span>
            </h3>
            <p class="muted">
              Nodes reachable from the selected configuration itself or through
              configurations that read it. Conditions are not executed.
            </p>
            ${c.length ? c.map((e) => this.graphNode(e)) : j`<p>
                    No downstream path identified in the inspected
                    configuration.
                  </p>`}
          </section>
        </div>
      </div>
      ${l.length ? j`<details class="graph-context">
              <summary>
                Shared-flow context
                <span class="count">${l.length}</span>
              </summary>
              <p class="muted">
                These nodes are co-targets in configurations that control the
                selected entity. They are shown for context and are not outputs
                of the selected entity.
              </p>
              <div class="graph-context-grid">
                ${l.map((e) => this.graphNode(e))}
              </div>
            </details>` : N}
      ${e.graph.cycles.length ? j`<div class="notice">Cycles detected. Nodes are shown once.${e.graph.cycles.map((e) => j`<p><code>${e.join(" → ")}</code></p>`)}</div>` : N}
      <details>
        <summary>
          ${n.length} visible graph edges / ${e.graph.edges.length}
          total
        </summary>
        ${n.map((e) => j`<div class="edge"><strong>${this.sourceName(e.source_id)} → ${this.sourceName(e.target)}</strong><code>${e.source_id} → ${e.target}</code><code>${e.path}</code><span class="badge">${e.role}</span> ${this.badge(e.confidence)}</div>`)}
      </details>`;
	}
	graphNode(e) {
		let t = e.id.split(".")[0];
		return j`<article
      class="graph-node ${e.relationship}"
      data-source=${e.id}
    >
      <div class="reference-title">
        <div class="source-heading">
          ${X(t)}
          <div>
            <h3>${this.sourceControl(e.id)}</h3>
            <span class="source-meta"
              >${q[t] || t.replaceAll("_", " ")}${e.depth ? ` · ${e.depth} ${e.depth === 1 ? "step" : "steps"} away` : ""}</span
            >
          </div>
        </div>
        <div class="node-actions">
          ${this.sourceControl(e.id, !0)}
          ${/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(e.id) ? j`<button class="analyze-node" aria-label=${`Analyze this: ${e.id}`} @click=${() => this.analyzeNode(e.id)}>Analyze this</button>` : N}
        </div>
      </div>
      ${e.via ? j`<p class="via">${e.relationship === "dependent" ? "Dependency path through" : "Reached through"} ${this.sourceControl(e.via)}</p>` : N}
      <details class="technical">
        <summary>${e.path ? "Connection details" : "Entity ID"}</summary>
        <code class="source-id">${e.id}</code>
        ${e.path ? j`<div class="technical-row">
                <div class="path">
                  <span>${J(e.path)}</span
                  >${e.confidence ? this.badge(e.confidence) : N}
                </div>
                <code>${e.path}</code>
              </div>` : N}
      </details>
    </article>`;
	}
	raw(e) {
		let t = [
			...e.references,
			...e.uncertain_references,
			...e.other_dashboard_references || []
		].filter(this.matchesFilter);
		return j`<h2>Raw references</h2>
      ${t.length ? N : j`<p>No matching references. Try All sources or All confidence.</p>`}
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
            ${t.map((e) => j`<tr>
                  <td>
                    ${this.sourceControl(e.source_id)}<code
                      >${e.source_id}<br />${e.path}</code
                    >
                  </td>
                  <td>${e.role}</td>
                  <td>
                    ${e.selector ? j`<span class="badge">${tt(e)}</span>` : this.badge(e.confidence)}${e.reason ? j`<p>${Y(e.reason)}</p>` : N}${this.selectorDetail(e)}
                  </td>
                </tr>`)}
          </tbody>
        </table>
      </div>`;
	}
	render() {
		let e = this.report, t = this.entities.filter((e) => `${e.entity_id} ${e.name}`.toLowerCase().includes(this.query.toLowerCase())).slice(0, 80);
		return j`<header>
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
          ${K()}<strong>HA Blast Radius</strong>
        </div>
        <span class="badge"
          >READ ONLY<span class="release-label"> · α ${Qe}</span></span
        >
      </header>
      <main>
        <h1>Where is this entity used?</h1>
        <p class="muted intro">
          Find the Home Assistant configurations that use an entity before
          changing it.
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
            ${t.map((e) => j`<option value=${e.entity_id}>${e.name}${e.exists ? "" : " · missing"}</option>`)}
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
		].map((e) => j`<option value=${e} ?selected=${e === this.depth}>${e}</option>`)}
              </select></label
            >
            <p class="muted">
              Higher depth expands the surrounding dependency graph. Direct
              references do not depend on traversal depth.
            </p>
          </div>
        </details>
        ${this.recentSearches.length ? j`<section
                class="recent-searches"
                aria-label="Recent searches"
              >
                <span class="recent-label">Recent</span>
                <div class="recent-list">
                  ${Le(this.recentSearches, (e) => e.entityId, (e) => j`<button
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
              </section>` : N}
        ${this.loading ? j`<progress aria-label="Inspecting configuration"></progress>` : N}
        ${this.error ? j`<div role="alert" class="notice error">
                ${this.error}
                <div class="controls">
                  <button
                    @click=${() => this.query ? this.run() : this.loadEntities()}
                  >
                    Retry
                  </button>
                </div>
              </div>` : N}
        ${e ? j`
                <div class="result-heading">
                  <div>
                    <h2 tabindex="-1">${this.sourceName(e.entity_id)}</h2>
                    <code>${e.entity_id}</code>
                  </div>
                  <span class="read-only-note">Read-only analysis</span>
                </div>
                ${e.exists ? N : j`<div class="notice">This entity is missing. References to its old ID can still be inspected.</div>`}
                ${e.graph.truncated ? this.completeness(e) : N}
                ${this.plainUses(e)}
                <div class="report-actions">
                  <button class="primary" @click=${this.showChangePreview}>
                    Preview a change
                  </button>
                  <button @click=${this.showAdvanced}>
                    Explore relationships
                  </button>
                  <button @click=${this.download}>Export JSON</button>
                </div>
                <a
                  class="issue-link"
                  href="https://github.com/artur-panek/ha-blast-radius/issues/new?template=bug.yml"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Report issue ↗</a
                >
                <p class="status" role="status" ?hidden=${!this.status}>
                  ${this.status}
                </p>
                ${this.copyFallback ? j`<textarea aria-label="Markdown report" readonly .value=${e.markdown}></textarea>` : N}
                <div class="columns">
                  <details
                    class="advanced-analysis"
                    .open=${this.advancedOpen}
                    @toggle=${(e) => this.advancedOpen = e.currentTarget.open}
                  >
                    <summary>
                      Advanced analysis
                      <small
                        >Detailed impact, relationship map and raw
                        references</small
                      >
                    </summary>
                    <div class="advanced-content">
                      <section
                        class="impact-summary"
                        aria-label="Impact summary"
                      >
                        <div class="impact-verdict">
                          <span class="eyebrow">At a glance</span>
                          <strong>
                            ${e.summary.sources ? `${e.summary.sources} direct ${e.summary.sources === 1 ? "source" : "sources"}` : "No incoming sources found"}
                          </strong>
                          <p>${this.impactNarrative(e)}</p>
                        </div>
                        <div class="impact-metrics semantic-metrics">
                          <div>
                            <strong>${this.directStats(e).action}</strong>
                            <span>sources can change / invoke</span>
                          </div>
                          <div>
                            <strong>${this.directStats(e).read}</strong>
                            <span>sources read / react</span>
                          </div>
                          <div>
                            <strong
                              >${this.downstreamStats(e).possible}</strong
                            >
                            <span>downstream nodes identified</span>
                          </div>
                          <div>
                            <strong>${this.directStats(e).display}</strong>
                            <span>display sources</span>
                          </div>
                        </div>
                      </section>
                      ${this.downstreamStats(e).context ? j`<div class="summary-context-note">
                              <strong
                                >${this.downstreamStats(e).context}</strong
                              >
                              ${this.downstreamStats(e).context === 1 ? "additional node is" : "additional nodes are"}
                              shared-flow context only — useful for
                              understanding the surrounding controller, not an
                              outgoing effect of the selected entity.
                            </div>` : N}
                    </div>
                    <section class="card">
                      <nav role="tablist" aria-label="Analysis views">
                        ${[
			"impact",
			"graph",
			"raw"
		].map((e) => j`<button role="tab" id=${`tab-${e}`} aria-controls="analysis-view" aria-selected=${this.tab === e} tabindex=${this.tab === e ? 0 : -1} @keydown=${this.tabKeydown} @click=${() => this.tab = e}>${e === "impact" ? "Detailed impact" : e === "graph" ? "Relationship map" : "Raw references"}</button>`)}
                      </nav>
                      ${this.filters(e)}
                      <div
                        role="tabpanel"
                        id="analysis-view"
                        aria-labelledby=${`tab-${this.tab}`}
                      >
                        ${this.tab === "impact" ? this.impact(e) : this.tab === "graph" ? this.graph(e) : this.raw(e)}
                      </div>
                      <div class="advanced-tools-row">
                        <button @click=${this.copy}>Copy Markdown</button>
                        <button
                          ?disabled=${this.loading}
                          @click=${() => this.run()}
                        >
                          Refresh snapshot
                        </button>
                      </div>
                    </section>
                  </details>
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
                          aria-describedby="rename-hint"
                          .value=${this.replacement}
                          placeholder=${e.entity_id}
                          @input=${(e) => this.replacement = e.target.value}
                          spellcheck="false"
                      /></label>
                      <p class="preview-hint" id="rename-hint">
                        Keep the same domain:
                        <code>${e.entity_id.split(".")[0]}.</code>
                      </p>
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
                      ${this.previewError ? j`<div
                              class="notice error preview-error"
                              role="alert"
                            >
                              ${this.previewError}
                            </div>` : N}
                      ${e.preview && !this.previewError && !this.loading ? j`<div class="preview" role="status">
                              <h3>
                                ${e.preview.operation === "rename" ? "Rename preview" : "Removal preview"}
                              </h3>
                              <code>${e.entity_id}</code
                              >${e.preview.new_entity_id ? j`<code>→ ${e.preview.new_entity_id}</code>` : N}
                              <ul>
                                ${Object.entries(e.preview.affected_sources).map(([e, t]) => j`<li>${t} ${e} source${t === 1 ? "" : "s"}</li>`)}
                              </ul>
                              <p>${e.preview.note}</p>
                              <strong>No changes have been made.</strong>
                            </div>` : N}
                      <p class="muted">
                        Analysis only. No configuration is written.
                      </p>
                    </div>
                  </details>
                </div>
                <details class="card scan-details" id="coverage">
                  <summary>Scan details</summary>
                  <div class="scan-overview">
                    <p>
                      <strong
                        >${e.coverage.sources} configurations
                        inspected.</strong
                      >
                      This is static analysis: conditions are not executed, and
                      dynamically selected targets may be missed.
                    </p>
                  </div>
                  ${e.coverage.warnings?.length ? j`<div class="scan-warnings">
                          <h3>Not fully inspected</h3>
                          <ul>
                            ${e.coverage.warnings.map((e) => j`<li>${e}</li>`)}
                          </ul>
                        </div>` : N}
                  <details class="coverage-breakdown">
                    <summary>Full scanner counts and limitations</summary>
                    <p class="muted">
                      ${Object.entries(e.coverage.source_types).map(([e, t]) => `${t} ${e}${t === 1 ? "" : "s"}`).join(" · ")}
                    </p>
                    <ul>
                      ${e.warnings.filter((t) => !(e.coverage.warnings || []).includes(t)).map((e) => j`<li>${e}</li>`)}
                      <li>
                        ${e.unresolved_total} locations without a fixed
                        entity target across the full snapshot. Device IDs,
                        selectors and dynamic expressions are not necessarily
                        dependencies of the selected entity.
                      </li>
                      <li>
                        ${$(e.uncertain_references)} in linked
                        configurations;
                        ${$(e.other_dashboard_references || [])}
                        elsewhere in dashboards. These are review locations, not
                        a count of affected entities.
                      </li>
                      ${e.review_summary?.snapshot.locations === e.unresolved_total ? j`<li>
                              Full snapshot:
                              ${e.review_summary.snapshot.device_locations}
                              device-reference locations ·
                              ${e.review_summary.snapshot.selector_locations}
                              unexpanded selectors ·
                              ${e.review_summary.snapshot.unresolved_locations}
                              dynamic or unrecognized locations.
                            </li>` : N}
                    </ul>
                  </details>
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
              ` : !this.loading && !this.error ? j`<section class="card empty">
                  <div class="symbol">${K()}</div>
                  <h2>Start with one entity</h2>
                  <p class="muted">
                    Search for a light, sensor, script or any other entity to
                    find where Home Assistant uses it.
                  </p>
                  <p class="muted">
                    ${this.entities.length} entity IDs available · Missing IDs
                    can be entered manually
                  </p>
                </section>` : N}
      </main>`;
	}
};
customElements.get("blast-radius-panel") || customElements.define("blast-radius-panel", it);
//#endregion
export { it as BlastRadiusPanel };
