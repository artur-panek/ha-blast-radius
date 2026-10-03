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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: ee, getOwnPropertySymbols: te, getPrototypeOf: ne } = Object, f = globalThis, p = f.trustedTypes, re = p ? p.emptyScript : "", ie = f.reactiveElementPolyfillSupport, m = (e, t) => e, h = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? re : null;
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
}, g = (e, t) => !l(e, t), _ = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	useDefault: !1,
	hasChanged: g
};
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var v = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = _) {
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
		return this.elementProperties.get(e) ?? _;
	}
	static _$Ei() {
		if (this.hasOwnProperty(m("elementProperties"))) return;
		let e = ne(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(m("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(m("properties"))) {
			let e = this.properties, t = [...ee(e), ...te(e)];
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
			let i = (n.converter?.toAttribute === void 0 ? h : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? h : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? g)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[m("elementProperties")] = /* @__PURE__ */ new Map(), v[m("finalized")] = /* @__PURE__ */ new Map(), ie?.({ ReactiveElement: v }), (f.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/lit-html/lit-html.js
var y = globalThis, b = (e) => e, x = y.trustedTypes, S = x ? x.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, C = "$lit$", w = `lit$${Math.random().toFixed(9).slice(2)}$`, T = "?" + w, ae = `<${T}>`, E = document, D = () => E.createComment(""), O = (e) => e === null || typeof e != "object" && typeof e != "function", k = Array.isArray, oe = (e) => k(e) || typeof e?.[Symbol.iterator] == "function", A = "[ 	\n\f\r]", j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, M = /-->/g, N = />/g, P = RegExp(`>|${A}(?:([^\\s"'>=/]+)(${A}*=${A}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), F = /'/g, I = /"/g, L = /^(?:script|style|textarea|title)$/i, R = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), z = R(1), se = R(2), B = Symbol.for("lit-noChange"), V = Symbol.for("lit-nothing"), H = /* @__PURE__ */ new WeakMap(), U = E.createTreeWalker(E, 129);
function W(e, t) {
	if (!k(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return S === void 0 ? t : S.createHTML(t);
}
var ce = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = j;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === j ? c[1] === "!--" ? o = M : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = P) : (L.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = P) : o = N : o === P ? c[0] === ">" ? (o = i ?? j, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? P : c[3] === "\"" ? I : F) : o === I || o === F ? o = P : o === M || o === N ? o = j : (o = P, i = void 0);
		let d = o === P && e[t + 1].startsWith("/>") ? " " : "";
		a += o === j ? n + ae : l >= 0 ? (r.push(s), n.slice(0, l) + C + n.slice(l) + w + d) : n + w + (l === -2 ? t : d);
	}
	return [W(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, G = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ce(t, n);
		if (this.el = e.createElement(l, r), U.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = U.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(C)) {
					let t = u[o++], n = i.getAttribute(e).split(w), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ue : r[1] === "?" ? de : r[1] === "@" ? fe : J
					}), i.removeAttribute(e);
				} else e.startsWith(w) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (L.test(i.tagName)) {
					let e = i.textContent.split(w), t = e.length - 1;
					if (t > 0) {
						i.textContent = x ? x.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], D()), U.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], D());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === T) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(w, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += w.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = E.createElement("template");
		return n.innerHTML = e, n;
	}
};
function K(e, t, n = e, r) {
	if (t === B) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = O(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = K(e, i._$AS(e, t.values), i, r)), t;
}
var le = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? E).importNode(t, !0);
		U.currentNode = r;
		let i = U.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new q(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new pe(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = U.nextNode(), a++);
		}
		return U.currentNode = E, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, q = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = V, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = K(this, e, t), O(e) ? e === V || e == null || e === "" ? (this._$AH !== V && this._$AR(), this._$AH = V) : e !== this._$AH && e !== B && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? oe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== V && O(this._$AH) ? this._$AA.nextSibling.data = e : this.T(E.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = G.createElement(W(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new le(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = H.get(e.strings);
		return t === void 0 && H.set(e.strings, t = new G(e)), t;
	}
	k(t) {
		k(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(D()), this.O(D()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = b(e).nextSibling;
			b(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, J = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = V, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = V;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = K(this, e, t, 0), a = !O(e) || e !== this._$AH && e !== B, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = K(this, r[n + o], t, o), s === B && (s = this._$AH[o]), a ||= !O(s) || s !== this._$AH[o], s === V ? e = V : e !== V && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === V ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ue = class extends J {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === V ? void 0 : e;
	}
}, de = class extends J {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== V);
	}
}, fe = class extends J {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = K(this, e, t, 0) ?? V) === B) return;
		let n = this._$AH, r = e === V && n !== V || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== V && (n === V || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, pe = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		K(this, e);
	}
}, me = y.litHtmlPolyfillSupport;
me?.(G, q), (y.litHtmlVersions ??= []).push("3.3.3");
var he = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new q(t.insertBefore(D(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Y = globalThis, X = class extends v {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = he(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return B;
	}
};
X._$litElement$ = !0, X.finalized = !0, Y.litElementHydrateSupport?.({ LitElement: X });
var ge = Y.litElementPolyfillSupport;
ge?.({ LitElement: X }), (Y.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region src/styles.ts
var _e = o`
  :host {
    display: block;
    height: 100%;
    overflow: auto;
    color: var(--primary-text-color, #212121);
    background: var(--primary-background-color, #fafafa);
    font-family: var(
      --paper-font-body1_-_font-family,
      Roboto,
      Arial,
      sans-serif
    );
    --br-border: var(--divider-color, #dedede);
    --br-card: var(--card-background-color, #fff);
    --br-muted: var(--secondary-text-color, #616161);
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
    max-width: 1240px;
    margin: auto;
    padding: 30px 32px 50px;
  }
  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-size: 11px;
    font-weight: 700;
    color: var(--br-muted);
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
    font-size: 15px;
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
    margin: 24px 0;
  }
  .search label {
    flex: 1;
  }
  label {
    display: block;
    font-size: 13px;
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
    background: var(--br-accent);
    color: var(--text-primary-color, #fff);
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
      12px/1.55 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    overflow-wrap: anywhere;
  }
  .badge {
    display: inline-block;
    font-size: 11px;
    letter-spacing: 0.25px;
    border: 1px solid var(--br-border);
    border-radius: 5px;
    padding: 4px 7px;
    white-space: nowrap;
    color: var(--br-muted);
  }
  .explicit {
    color: var(--success-color, #288048);
    border-color: currentColor;
  }
  .template_literal,
  .dynamic,
  .unknown {
    color: var(--warning-color, #9b6600);
    border-color: currentColor;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin: 22px 0;
  }
  .stat {
    border: 1px solid var(--br-border);
    border-radius: 10px;
    padding: 18px;
    background: var(--br-card);
  }
  .stat strong {
    display: block;
    font-size: 28px;
    font-weight: 500;
    margin-bottom: 5px;
  }
  .stat span {
    font-size: 12px;
    color: var(--br-muted);
  }
  .columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 310px;
    gap: 20px;
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
    gap: 6px;
    border-bottom: 1px solid var(--br-border);
    margin: -8px -8px 20px;
  }
  nav button {
    border: 0;
    border-bottom: 3px solid transparent;
    border-radius: 0;
    background: transparent;
    font-size: 13px;
    padding: 14px;
  }
  nav button[aria-selected="true"] {
    color: var(--br-accent);
    border-bottom-color: var(--br-accent);
  }
  .reference {
    padding: 14px 0;
    border-top: 1px solid var(--br-border);
  }
  .reference:first-of-type {
    border-top: 0;
  }
  .reference-title {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    align-items: start;
  }
  .reference-title code {
    font-size: 13px;
    font-weight: 600;
  }
  .path {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 0 0;
  }
  .path code {
    flex: 1;
    color: var(--br-muted);
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
  .tree {
    list-style: none;
    padding: 0;
  }
  .tree li {
    border-left: 2px solid var(--br-border);
    padding: 12px 14px;
    margin: 6px 0;
  }
  .tree .selected {
    border-color: var(--br-accent);
    background: var(--secondary-background-color, #f5f5f5);
  }
  .tree small {
    display: block;
    margin-top: 5px;
    line-height: 1.5;
    color: var(--br-muted);
    overflow-wrap: anywhere;
  }
  .tree code {
    font-size: 13px;
  }
  .tree .badge {
    margin-top: 5px;
  }
  .controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 18px;
  }
  .controls button {
    font-size: 12px;
  }
  aside label {
    margin: 18px 0;
  }
  aside button {
    width: 100%;
    margin-top: 10px;
  }
  aside p {
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
    font-size: 13px;
  }
  summary {
    cursor: pointer;
    line-height: 1.5;
  }
  details ul {
    padding-left: 20px;
    line-height: 1.6;
    color: var(--br-muted);
  }
  details code {
    display: block;
    margin: 8px 0;
  }
  .foot {
    display: flex;
    gap: 14px;
    justify-content: space-between;
    font-size: 11px;
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
    font-size: 12px;
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
  @media (max-width: 850px) {
    .columns {
      grid-template-columns: 1fr;
    }
    aside {
      order: 1;
    }
    main {
      padding: 22px 18px;
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
    .stats {
      grid-template-columns: repeat(2, 1fr);
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
      flex-wrap: wrap;
    }
    .foot {
      flex-direction: column;
    }
  }
`, Z = {
	viewBox: "0 0 32 32",
	rings: "M 28.943 12.532 A 13.399999999999999 13.399999999999999 0 1 1 19.468 3.057 A 1.2 1.2 0 0 1 18.847 5.375 A 11.0 11.0 0 1 0 26.625 13.153 A 1.2 1.2 0 0 1 28.943 12.532 Z M 23.921 13.878 A 8.2 8.2 0 1 1 18.122 8.079 A 1.2 1.2 0 0 1 17.501 10.398 A 5.8 5.8 0 1 0 21.602 14.499 A 1.2 1.2 0 0 1 23.921 13.878 Z",
	radius: "M 15.222 15.222 L 23.849 6.595 L 25.405 8.151 L 16.778 16.778 Z M 13.600 16.000 a 2.4 2.4 0 1 1 4.8 0 a 2.4 2.4 0 1 1 -4.8 0 Z M 22.227 7.373 a 2.4 2.4 0 1 1 4.8 0 a 2.4 2.4 0 1 1 -4.8 0 Z"
}, Q = () => se`
  <svg class="brand-mark" viewBox=${Z.viewBox} aria-hidden="true" focusable="false">
    <path fill="currentColor" d=${Z.rings}></path>
    <path class="radius" d=${Z.radius}></path>
  </svg>
`, ve = "0.1.3", $ = {
	explicit: "Explicit",
	template_literal: "Template literal",
	dynamic: "Dynamic",
	unknown: "Unclassified"
}, ye = class extends X {
	constructor(...e) {
		super(...e), this.narrow = !1, this.entities = [], this.query = "", this.loading = !1, this.error = "", this.tab = "impact", this.replacement = "", this.depth = 6, this.status = "", this.copyFallback = !1, this.initialized = !1, this.requestId = 0;
	}
	static {
		this.styles = _e;
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
			copyFallback: { state: !0 }
		};
	}
	updated() {
		this.hass && !this.initialized && (this.initialized = !0, this.loadEntities());
	}
	async loadEntities() {
		this.loading = !0, this.error = "";
		try {
			let e = await this.hass.callWS({ type: "blast_radius/entities" });
			this.entities = e.entities;
		} catch (e) {
			this.error = this.message(e);
		} finally {
			this.loading = !1;
		}
	}
	message(e) {
		return e && typeof e == "object" && "message" in e ? String(e.message) : "Connection failed. Try again.";
	}
	changeQuery(e) {
		this.query = e.target.value, this.requestId++, this.loading = !1, this.report = void 0, this.error = "", this.status = "", this.copyFallback = !1;
	}
	async run(e) {
		let t = this.query.trim();
		if (!/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(t)) {
			this.error = "Enter an entity ID such as light.office.";
			return;
		}
		let n = ++this.requestId;
		this.loading = !0, this.error = "", this.status = "", this.copyFallback = !1;
		try {
			this.report = void 0;
			let r = {
				type: e ? "blast_radius/preview" : "blast_radius/analyze",
				entity_id: t,
				max_depth: this.depth
			};
			e && (r.operation = e), e === "rename" && (r.new_entity_id = this.replacement.trim());
			let i = await this.hass.callWS(r);
			n === this.requestId && (this.report = i);
		} catch (e) {
			n === this.requestId && (this.error = this.message(e));
		} finally {
			n === this.requestId && (this.loading = !1);
		}
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
		return z`<span class="badge ${e}">${$[e]}</span>`;
	}
	references(e) {
		let t = /* @__PURE__ */ new Map();
		return e.forEach((e) => t.set(e.source_id, [...t.get(e.source_id) || [], e])), [...t].map(([e, t]) => z`<div class="reference">
          <div class="reference-title">
            <code>${e}</code
            ><span class="badge">${t[0].source_type}</span>
          </div>
          ${t.map((e) => z`<div class="path"><code>${e.path}</code>${this.badge(e.confidence)}</div>`)}
        </div>`);
	}
	impact(e) {
		return z`<h2>
        Direct references
        <span class="badge">${e.summary.sources} sources</span>
      </h2>
      ${e.references.length ? this.references(e.references) : z`<div class="empty">
              <div class="symbol">${Q()}</div>
              <h3>No direct references found</h3>
              <p class="muted">
                Nothing in the inspected sources points to this entity. Check
                coverage and unresolved references before changing it.
              </p>
            </div>`}
      ${e.uncertain_references.length ? z`<div class="notice">
              <strong>Unresolved references in affected configurations</strong>
              <p>
                These expressions may refer to other entities at runtime. Their
                targets are unknown.
              </p>
              ${this.references(e.uncertain_references)}
            </div>` : V}
      <details>
        <summary>How to read confidence</summary>
        <ul>
          <li>
            <strong>Explicit:</strong> an entity ID in a recognized
            configuration field.
          </li>
          <li>
            <strong>Template literal:</strong> visible in Jinja, but execution
            is not guaranteed.
          </li>
          <li>
            <strong>Dynamic:</strong> a target that cannot be resolved
            statically.
          </li>
          <li>
            <strong>Unclassified:</strong> a known entity ID in a field with
            unknown semantics.
          </li>
        </ul>
      </details>`;
	}
	graph(e) {
		return z`<h2>Structural impact</h2>
      <p class="muted">
        Affected configurations, followed by their action targets. This shows
        possible dependencies, not an execution trace.
      </p>
      <ol class="tree">
        ${e.graph.nodes.map((e) => z`<li
              class=${e.relationship}
              style=${`margin-left:${Math.min(e.depth, 4) * 14}px`}
            >
              <code>${e.id}</code
              ><small
                >${e.relationship === "selected" ? "Selected entity" : e.relationship === "dependent" ? `References ${e.via}` : `Action or membership target of ${e.via}`}
                · depth ${e.depth}</small
              >
              ${e.path ? z`<small>${e.path}</small>` : V}${e.confidence ? this.badge(e.confidence) : V}
            </li>`)}
      </ol>
      ${e.graph.cycles.length ? z`<div class="notice">Cycles detected. Nodes are shown once.${e.graph.cycles.map((e) => z`<p><code>${e.join(" → ")}</code></p>`)}</div>` : V}
      <details>
        <summary>All ${e.graph.edges.length} graph edges</summary>
        ${e.graph.edges.map((e) => z`<code>${e.source_id} → ${e.target} (${e.role}, ${$[e.confidence]})<br />${e.path}</code>`)}
      </details>`;
	}
	raw(e) {
		return z`<h2>Raw references</h2>
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
            ${e.references.map((e) => z`<tr>
                  <td>
                    <code>${e.source_id}<br />${e.path}</code>
                  </td>
                  <td>${e.role}</td>
                  <td>${this.badge(e.confidence)}</td>
                </tr>`)}
          </tbody>
        </table>
      </div>`;
	}
	render() {
		let e = this.report, t = this.entities.filter((e) => `${e.entity_id} ${e.name}`.toLowerCase().includes(this.query.toLowerCase())).slice(0, 80);
		return z`<header>
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
          ${Q()}<strong>HA Blast Radius</strong>
        </div>
        <span class="badge"
          >READ ONLY<span class="release-label"> · α ${ve}</span></span
        >
      </header>
      <main>
        <div class="eyebrow">Configuration impact analysis</div>
        <h1>Check dependencies before you make a change.</h1>
        <p class="muted intro">
          Inspect references. Follow dependencies. Preview the change.
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
            ${t.map((e) => z`<option value=${e.entity_id}>${e.name}${e.exists ? "" : " · missing"}</option>`)}
          </datalist>
          <label class="depth"
            >Depth<select
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
		].map((e) => z`<option value=${e} ?selected=${e === this.depth}>${e}</option>`)}
            </select></label
          >
          <button
            class="primary"
            ?disabled=${this.loading || !this.query.trim()}
          >
            ${this.loading ? "Inspecting…" : "Analyze"}
          </button>
        </form>
        ${this.loading ? z`<progress aria-label="Inspecting configuration"></progress>` : V}
        ${this.error ? z`<div role="alert" class="notice error">
                ${this.error}
                <div class="controls">
                  <button
                    @click=${() => this.query ? this.run() : this.loadEntities()}
                  >
                    Retry
                  </button>
                </div>
              </div>` : V}
        ${e ? z`
                <h2><code>${e.entity_id}</code></h2>
                ${e.exists ? V : z`<div class="notice">This entity is missing. References to its old ID can still be inspected.</div>`}
                <div class="stats">
                  <div class="stat">
                    <strong>${e.summary.references}</strong
                    ><span>Direct references</span>
                  </div>
                  <div class="stat">
                    <strong>${e.summary.downstream}</strong
                    ><span>Downstream targets</span>
                  </div>
                  <div class="stat">
                    <strong
                      >${e.summary.template_literal + e.summary.unknown}</strong
                    ><span>References to review</span>
                  </div>
                  <div class="stat">
                    <strong>${e.unresolved_total}</strong
                    ><span>Unresolved across snapshot</span>
                  </div>
                </div>
                <div class="columns">
                  <section class="card">
                    <nav role="tablist" aria-label="Analysis views">
                      ${[
			"impact",
			"graph",
			"raw"
		].map((e) => z`<button role="tab" aria-selected=${this.tab === e} @click=${() => this.tab = e}>${e === "impact" ? "Impact" : e === "graph" ? "Graph" : "Raw references"}</button>`)}
                    </nav>
                    <div role="tabpanel">
                      ${this.tab === "impact" ? this.impact(e) : this.tab === "graph" ? this.graph(e) : this.raw(e)}
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
                    <p class="status" role="status">${this.status}</p>
                    ${this.copyFallback ? z`<textarea aria-label="Markdown report" readonly .value=${e.markdown}></textarea>` : V}
                  </section>
                  <aside class="card">
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
                    ${e.preview ? z`<div class="preview" role="status">
                            <h3>
                              ${e.preview.operation === "rename" ? "Rename preview" : "Removal preview"}
                            </h3>
                            <code>${e.entity_id}</code
                            >${e.preview.new_entity_id ? z`<code>→ ${e.preview.new_entity_id}</code>` : V}
                            <ul>
                              ${Object.entries(e.preview.affected_sources).map(([e, t]) => z`<li>${t} ${e} source${t === 1 ? "" : "s"}</li>`)}
                            </ul>
                            <p>${e.preview.note}</p>
                            <strong>No changes have been made.</strong>
                          </div>` : V}
                    <p class="muted">
                      Analysis only. No configuration is written.
                    </p>
                  </aside>
                </div>
                <details class="card">
                  <summary>
                    Coverage and limitations · ${e.coverage.sources}
                    sources inspected
                  </summary>
                  <p class="muted">
                    ${Object.entries(e.coverage.source_types).map(([e, t]) => `${t} ${e}`).join(" · ")}
                  </p>
                  <ul>
                    ${e.warnings.map((e) => z`<li>${e}</li>`)}
                    <li>
                      ${e.unresolved_total} unresolved references in the
                      entire snapshot cannot be attributed to this entity.
                    </li>
                    <li>
                      Conditional branches are not evaluated. A reference does
                      not prove an action will run.
                    </li>
                  </ul>
                </details>
                <div class="foot">
                  <span
                    >Fresh snapshot:
                    ${new Date(e.snapshot_at).toLocaleString()}</span
                  ><span
                    >Static configuration analysis · No changes applied</span
                  >
                </div>
              ` : !this.loading && !this.error ? z`<section class="card empty">
                  <div class="symbol">${Q()}</div>
                  <h2>Start with one entity</h2>
                  <p class="muted">
                    A button, a helper, an old light.<br />Find out what points
                    to it and what sits downstream.
                  </p>
                  <p class="muted">
                    ${this.entities.length} entity IDs available · Missing IDs
                    can be entered manually
                  </p>
                </section>` : V}
      </main>`;
	}
};
customElements.get("blast-radius-panel") || customElements.define("blast-radius-panel", ye);
//#endregion
export { ye as BlastRadiusPanel };
