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
var y = globalThis, ae = (e) => e, b = y.trustedTypes, x = b ? b.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, S = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, w = "?" + C, oe = `<${w}>`, T = document, E = () => T.createComment(""), D = (e) => e === null || typeof e != "object" && typeof e != "function", O = Array.isArray, se = (e) => O(e) || typeof e?.[Symbol.iterator] == "function", k = "[ 	\n\f\r]", A = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ce = /-->/g, le = />/g, j = RegExp(`>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ue = /'/g, de = /"/g, fe = /^(?:script|style|textarea|title)$/i, pe = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), M = pe(1), me = pe(2), N = Symbol.for("lit-noChange"), P = Symbol.for("lit-nothing"), he = /* @__PURE__ */ new WeakMap(), F = T.createTreeWalker(T, 129);
function ge(e, t) {
	if (!O(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return x === void 0 ? t : x.createHTML(t);
}
var _e = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = A;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === A ? c[1] === "!--" ? o = ce : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = j) : (fe.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = j) : o = le : o === j ? c[0] === ">" ? (o = i ?? A, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? j : c[3] === "\"" ? de : ue) : o === de || o === ue ? o = j : o === ce || o === le ? o = A : (o = j, i = void 0);
		let d = o === j && e[t + 1].startsWith("/>") ? " " : "";
		a += o === A ? n + oe : l >= 0 ? (r.push(s), n.slice(0, l) + S + n.slice(l) + C + d) : n + C + (l === -2 ? t : d);
	}
	return [ge(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, I = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = _e(t, n);
		if (this.el = e.createElement(l, r), F.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = F.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(S)) {
					let t = u[o++], n = i.getAttribute(e).split(C), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ve : r[1] === "?" ? ye : r[1] === "@" ? be : B
					}), i.removeAttribute(e);
				} else e.startsWith(C) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (fe.test(i.tagName)) {
					let e = i.textContent.split(C), t = e.length - 1;
					if (t > 0) {
						i.textContent = b ? b.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], E()), F.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], E());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === w) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(C, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += C.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = T.createElement("template");
		return n.innerHTML = e, n;
	}
};
function L(e, t, n = e, r) {
	if (t === N) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = D(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = L(e, i._$AS(e, t.values), i, r)), t;
}
var R = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? T).importNode(t, !0);
		F.currentNode = r;
		let i = F.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new z(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new xe(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = F.nextNode(), a++);
		}
		return F.currentNode = T, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, z = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = P, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = L(this, e, t), D(e) ? e === P || e == null || e === "" ? (this._$AH !== P && this._$AR(), this._$AH = P) : e !== this._$AH && e !== N && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? se(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== P && D(this._$AH) ? this._$AA.nextSibling.data = e : this.T(T.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = I.createElement(ge(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new R(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = he.get(e.strings);
		return t === void 0 && he.set(e.strings, t = new I(e)), t;
	}
	k(t) {
		O(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(E()), this.O(E()), this, this.options)) : r = n[i], r._$AI(a), i++;
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
}, B = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = P, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = P;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = L(this, e, t, 0), a = !D(e) || e !== this._$AH && e !== N, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = L(this, r[n + o], t, o), s === N && (s = this._$AH[o]), a ||= !D(s) || s !== this._$AH[o], s === P ? e = P : e !== P && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === P ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ve = class extends B {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === P ? void 0 : e;
	}
}, ye = class extends B {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== P);
	}
}, be = class extends B {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = L(this, e, t, 0) ?? P) === N) return;
		let n = this._$AH, r = e === P && n !== P || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== P && (n === P || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, xe = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		L(this, e);
	}
}, Se = {
	M: S,
	P: C,
	A: w,
	C: 1,
	L: _e,
	R,
	D: se,
	V: L,
	I: z,
	H: B,
	N: ye,
	U: be,
	B: ve,
	F: xe
}, Ce = y.litHtmlPolyfillSupport;
Ce?.(I, z), (y.litHtmlVersions ??= []).push("3.3.3");
var we = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new z(t.insertBefore(E(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, V = globalThis, H = class extends v {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = we(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return N;
	}
};
H._$litElement$ = !0, H.finalized = !0, V.litElementHydrateSupport?.({ LitElement: H });
var Te = V.litElementPolyfillSupport;
Te?.({ LitElement: H }), (V.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/lit-html/directive.js
var Ee = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, De = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Oe = class {
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
}, { I: ke } = Se, Ae = (e) => e, je = () => document.createComment(""), U = (e, t, n) => {
	let r = e._$AA.parentNode, i = t === void 0 ? e._$AB : t._$AA;
	if (n === void 0) n = new ke(r.insertBefore(je(), i), r.insertBefore(je(), i), e, e.options);
	else {
		let t = n._$AB.nextSibling, a = n._$AM, o = a !== e;
		if (o) {
			let t;
			n._$AQ?.(e), n._$AM = e, n._$AP !== void 0 && (t = e._$AU) !== a._$AU && n._$AP(t);
		}
		if (t !== i || o) {
			let e = n._$AA;
			for (; e !== t;) {
				let t = Ae(e).nextSibling;
				Ae(r).insertBefore(e, i), e = t;
			}
		}
	}
	return n;
}, W = (e, t, n = e) => (e._$AI(t, n), e), Me = {}, Ne = (e, t = Me) => e._$AH = t, Pe = (e) => e._$AH, G = (e) => {
	e._$AR(), e._$AA.remove();
}, Fe = (e, t, n) => {
	let r = /* @__PURE__ */ new Map();
	for (let i = t; i <= n; i++) r.set(e[i], i);
	return r;
}, Ie = De(class extends Oe {
	constructor(e) {
		if (super(e), e.type !== Ee.CHILD) throw Error("repeat() can only be used in text expressions");
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
		let i = Pe(e), { values: a, keys: o } = this.dt(t, n, r);
		if (!Array.isArray(i)) return this.ut = o, a;
		let s = this.ut ??= [], c = [], l, u, d = 0, f = i.length - 1, p = 0, m = a.length - 1;
		for (; d <= f && p <= m;) if (i[d] === null) d++;
		else if (i[f] === null) f--;
		else if (s[d] === o[p]) c[p] = W(i[d], a[p]), d++, p++;
		else if (s[f] === o[m]) c[m] = W(i[f], a[m]), f--, m--;
		else if (s[d] === o[m]) c[m] = W(i[d], a[m]), U(e, c[m + 1], i[d]), d++, m--;
		else if (s[f] === o[p]) c[p] = W(i[f], a[p]), U(e, i[d], i[f]), f--, p++;
		else if (l === void 0 && (l = Fe(o, p, m), u = Fe(s, d, f)), l.has(s[d])) {
			if (l.has(s[f])) {
				let t = u.get(o[p]), n = t === void 0 ? null : i[t];
				if (n === null) {
					let t = U(e, i[d]);
					W(t, a[p]), c[p] = t;
				} else c[p] = W(n, a[p]), U(e, i[d], n), i[t] = null;
				p++;
			} else G(i[f]), f--;
		} else G(i[d]), d++;
		for (; p <= m;) {
			let t = U(e, c[m + 1]);
			W(t, a[p]), c[p++] = t;
		}
		for (; d <= f;) {
			let e = i[d++];
			e !== null && G(e);
		}
		return this.ut = o, Ne(e, c), N;
	}
}), Le = o`
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
    max-width: 1180px;
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
    margin: 20px 0;
  }
  .search label {
    flex: 1;
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
  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    margin: 22px 0;
    border: 1px solid var(--br-border);
    border-radius: 10px;
    background: var(--br-card);
    overflow: hidden;
  }
  .stat {
    border-right: 1px solid var(--br-border);
    padding: 14px 20px;
    background: var(--br-card);
  }
  .stat:last-child {
    border-right: 0;
  }
  .stat strong {
    display: block;
    font-size: 25px;
    font-weight: 500;
    margin-bottom: 5px;
  }
  .stat span {
    font-size: 14px;
    color: var(--br-muted);
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
    gap: 6px;
    border-bottom: 1px solid var(--br-border);
    margin: -8px -8px 20px;
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
    padding: 13px 15px;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    min-width: 0;
  }
  .source-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 9px;
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
    padding: 16px 18px;
  }
  .incomplete p {
    margin: 6px 0;
  }
  .incomplete .controls {
    margin-top: 12px;
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
    margin: 26px 0 14px;
  }
  .result-identity {
    min-width: 0;
  }
  .eyebrow {
    display: block;
    margin-bottom: 3px;
    color: var(--br-muted);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .result-heading h2 {
    margin: 0 0 2px;
    font-size: 23px;
    font-weight: 600;
  }
  .result-heading code {
    color: var(--br-muted);
  }
  .result-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    justify-content: flex-end;
  }
  .summary-chip {
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
  .impact-high,
  .confidence-review {
    border-color: color-mix(in srgb, var(--warning-color, #9b6600) 60%, var(--br-border));
  }
  .impact-medium,
  .confidence-mixed {
    border-color: color-mix(in srgb, var(--br-accent) 45%, var(--br-border));
  }
  .confidence-good {
    border-color: color-mix(in srgb, var(--success-color, #288048) 55%, var(--br-border));
  }
  .impact-summary {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
    gap: 18px;
    align-items: stretch;
    margin: 0 0 12px;
    padding: 16px 18px;
    border: 1px solid var(--br-border);
    border-radius: 10px;
    background: var(--br-card);
  }
  .impact-primary {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }
  .impact-primary > strong {
    font-size: 34px;
    font-weight: 500;
    line-height: 1;
  }
  .impact-primary b {
    display: block;
    margin-bottom: 3px;
    font-size: 15px;
  }
  .impact-primary span {
    display: block;
    color: var(--br-muted);
    font-size: 12px;
  }
  .impact-metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-left: 1px solid var(--br-border);
  }
  .impact-metrics > div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 14px;
  }
  .impact-metrics > div + div {
    border-left: 1px solid var(--br-border);
  }
  .impact-metrics strong {
    font-size: 22px;
    font-weight: 500;
  }
  .impact-metrics span {
    color: var(--br-muted);
    font-size: 12px;
  }
  .analysis-options {
    width: fit-content;
    margin: -10px 0 18px auto;
    color: var(--br-muted);
    font-size: 12px;
  }
  .analysis-options > summary {
    padding: 5px 0;
    font-weight: 500;
  }
  .analysis-options > summary span {
    margin-left: 6px;
  }
  .analysis-options-body {
    width: min(360px, calc(100vw - 48px));
    padding: 8px 0 4px;
  }
  .analysis-options-body .depth {
    width: 130px;
  }
  .analysis-options-body p {
    margin: 8px 0 0;
    font-size: 12px;
  }
  .coverage-inline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 0 14px;
    padding: 8px 11px;
    border-left: 2px solid var(--warning-color, #9b6600);
    color: var(--br-muted);
    background: color-mix(in srgb, var(--br-card) 94%, var(--warning-color, #9b6600));
    font-size: 12px;
  }
  .coverage-inline strong {
    color: var(--primary-text-color, #212121);
  }
  .link-button {
    min-height: 0;
    padding: 2px 4px;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 12px;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .section-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin: 2px 0 12px;
  }
  .section-heading h2 {
    margin: 0 0 3px;
  }
  .section-heading p {
    margin: 0;
    color: var(--br-muted);
    font-size: 13px;
  }
  .indirect-callout {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin: 16px 0 0;
    padding: 12px 14px;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    background: color-mix(in srgb, var(--br-card) 97%, var(--primary-text-color, #212121));
  }
  .indirect-callout p {
    max-width: 760px;
    margin: 3px 0 0;
    color: var(--br-muted);
    font-size: 12px;
  }
  .indirect-callout button {
    flex: 0 0 auto;
    min-height: 34px;
    padding: 5px 10px;
    font-size: 12px;
  }
  .compact-empty {
    padding: 22px 12px;
  }
  .confidence-help {
    margin-top: 12px;
  }
  .coverage-explainer {
    margin-bottom: 6px;
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
  .uncertainty {
    border-top: 1px solid var(--br-border);
    margin-top: 18px;
    padding-top: 18px;
  }
  .uncertainty h2 {
    margin-bottom: 8px;
  }
  .uncertainty p {
    font-size: 14px;
    color: var(--br-muted);
    margin: 8px 0 14px;
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
    min-height: 34px;
    border: 1px solid var(--br-border);
    border-radius: 7px;
    padding: 5px 10px;
    background: var(--br-card);
    color: var(--primary-text-color, #212121);
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }
  a.open-source:hover,
  button.open-source:hover {
    border-color: var(--br-accent);
  }
  .purpose {
    margin: 6px 0 0 38px;
    font-size: 13px;
    color: var(--br-muted);
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
    padding: 0;
  }
  .result-filters > summary {
    width: fit-content;
    padding: 4px 0;
    color: var(--br-muted);
    font-size: 12px;
    font-weight: 500;
  }
  .filter-body {
    margin-top: 7px;
    padding: 10px 12px;
    border: 1px solid var(--br-border);
    border-radius: 8px;
    background: color-mix(in srgb, var(--br-card) 97%, var(--primary-text-color, #212121));
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
    .impact-summary {
      grid-template-columns: 1fr;
    }
    .impact-metrics {
      border-left: 0;
      border-top: 1px solid var(--br-border);
      padding-top: 12px;
    }
    main {
      padding: 22px 18px;
    }
  }
  @media (max-width: 1000px) {
    .source-grid,
    .map-columns {
      grid-template-columns: 1fr;
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
    .result-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 9px;
    }
    .result-badges {
      justify-content: flex-start;
    }
    .impact-summary {
      padding: 14px;
    }
    .impact-primary > strong {
      font-size: 30px;
    }
    .impact-metrics > div {
      padding: 0 10px;
    }
    .coverage-inline,
    .indirect-callout {
      align-items: flex-start;
      flex-direction: column;
    }
    .analysis-options {
      margin-left: 0;
    }
    .stats {
      grid-template-columns: repeat(2, 1fr);
    }
    .stat:nth-child(2) {
      border-right: 0;
    }
    .stat:nth-child(-n + 2) {
      border-bottom: 1px solid var(--br-border);
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
    .purpose {
      margin-left: 30px;
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
`, K = {
	viewBox: "0 0 32 32",
	rings: "M 28.943 12.532 A 13.399999999999999 13.399999999999999 0 1 1 19.468 3.057 A 1.2 1.2 0 0 1 18.847 5.375 A 11.0 11.0 0 1 0 26.625 13.153 A 1.2 1.2 0 0 1 28.943 12.532 Z M 23.921 13.878 A 8.2 8.2 0 1 1 18.122 8.079 A 1.2 1.2 0 0 1 17.501 10.398 A 5.8 5.8 0 1 0 21.602 14.499 A 1.2 1.2 0 0 1 23.921 13.878 Z",
	radius: "M 15.222 15.222 L 23.849 6.595 L 25.405 8.151 L 16.778 16.778 Z M 13.600 16.000 a 2.4 2.4 0 1 1 4.8 0 a 2.4 2.4 0 1 1 -4.8 0 Z M 22.227 7.373 a 2.4 2.4 0 1 1 4.8 0 a 2.4 2.4 0 1 1 -4.8 0 Z"
}, q = () => me`
  <svg class="brand-mark" viewBox=${K.viewBox} aria-hidden="true" focusable="false">
    <path fill="currentColor" d=${K.rings}></path>
    <path class="radius" d=${K.radius}></path>
  </svg>
`, J = {
	automation: "Automation",
	script: "Script",
	scene: "Scene",
	dashboard: "Dashboard",
	group: "Group"
};
function Re(e) {
	return [...new Set(e.map((e) => e.source_type === "dashboard" ? "Used on this dashboard" : e.source_type === "scene" ? "Included in this scene" : e.role === "member" ? "Member of this group" : e.role === "call" ? "Called by this configuration" : e.role === "write" ? "Listed as an action target" : /^(triggers?|wait_for_trigger)(\[|\.)/.test(e.path) ? "Used by a trigger" : e.confidence === "template_literal" ? "Referenced in a template" : e.confidence === "unknown" ? "Reference needs review" : "Read by this configuration"))].join(" · ");
}
function ze(e) {
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
var Be = {
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
function Y(e) {
	return e.split(".").map((e) => {
		let t = /^(.*?)(?:\[(\d+)\])?$/.exec(e), n = t[1];
		return `${Be[n] || n.replaceAll("_", " ").replace(/^./, (e) => e.toUpperCase())}${t[2] === void 0 ? "" : ` ${Number(t[2]) + 1}`}`;
	}).join(" › ");
}
var Ve = {
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
function X(e) {
	return e.startsWith("Unexpanded ") ? "This configuration names a device, area, floor or label. Its entity membership and runtime eligibility are not expanded." : e.split("; ").map((e) => Ve[e] || e || "The target cannot be determined from the loaded configuration.").join(" ");
}
//#endregion
//#region src/icons.ts
function He(e) {
	return M`<svg class="source-icon" viewBox="0 0 24 24" aria-hidden="true">
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
var Qe = "0.2.3";
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
	return Q(e) === "device" ? "Device reference" : Q(e) === "selector" ? "Entity set not expanded" : e.reason || "Dynamic or unrecognized target";
}
function tt(e) {
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
var nt = {
	explicit: "Explicit",
	template_literal: "Template literal",
	dynamic: "Dynamic",
	unknown: "Unclassified"
}, rt = class extends H {
	constructor(...e) {
		super(...e), this.narrow = !1, this.entities = [], this.query = "", this.loading = !1, this.error = "", this.tab = "impact", this.recentSearches = [], this.replacement = "", this.depth = 6, this.status = "", this.copyFallback = !1, this.sourceFilters = [], this.reviewFilters = [], this.analyzedRoot = "", this.initialized = !1, this.requestId = 0, this.saveSession = () => {
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
		this.styles = Le;
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
		let t = Ge(this.hass?.user?.id);
		if (this.hass && (!this.initialized || t !== this.storageKey)) {
			this.initialized = !0, this.storageKey = t;
			let e = qe(t);
			this.recentSearches = e.recent, this.lastView = e.last, this.query = e.last?.entityId || "", this.depth = e.last?.depth || 6, this.tab = e.last?.tab || "impact", this.report = void 0, this.sourceFilters = [], this.reviewFilters = [], this.analyzedRoot = "", this.entities = [], this.replacement = "", this.status = "", this.copyFallback = !1, this.loadEntities();
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
			r === this.requestId && (this.report = a, this.recentSearches = Ke(this.recentSearches, {
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
		return M`<span class="badge ${e}">${nt[e]}</span>`;
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
		if (!n) return t ? P : M`<span class=${i}>${r}</span>`;
		if (n.kind === "entity") return M`<button
        class=${i}
        aria-label=${`Open entity details: ${this.sourceName(e)}`}
        @click=${() => this.openEntity(e)}
      >
        ${r}
      </button>`;
		let a = ze(n);
		return a ? M`<a
      class=${i}
      href=${a}
      aria-label=${`Open ${n.kind}: ${this.sourceName(e)}`}
      @click=${(e) => this.navigate(e, a)}
      >${r}</a
    >` : t ? P : M`<span class=${i}>${r}</span>`;
	}
	references(e, t = !1) {
		let n = /* @__PURE__ */ new Map();
		return e.filter(this.matchesFilter).forEach((e) => n.set(e.source_id, [...n.get(e.source_id) || [], e])), [...n].map(([e, n]) => M`<article class="reference source-row" data-source=${e}>
          <div class="reference-title">
            <div class="source-heading">
              ${He(n[0].source_type)}
              <div>
                <h3>${this.sourceControl(e)}</h3>
                <span class="source-meta"
                  >${J[n[0].source_type] || n[0].source_type}
                  ·
                  ${t ? $(n) : `${n.length} ${n.length === 1 ? "reference" : "references"}`}</span
                >
              </div>
            </div>
            ${this.sourceControl(e, !0)}
          </div>
          ${t ? this.unresolvedGroups(n) : M`<p class="purpose">${Re(n)}</p>
                  ${n.some((e) => e.confidence !== "explicit") ? M`<span class="review-hint">Includes references to review</span>` : P}
                  <details class="technical">
                    <summary>Reference details (${n.length})</summary>
                    <code class="source-id">${e}</code>
                    ${n.map((e) => M`<div class="technical-row">
                          <div class="path">
                            <span>${Y(e.path)}</span
                            >${this.badge(e.confidence)}
                          </div>
                          <code>${e.path}</code>
                          ${e.reason ? M`<p>${X(e.reason)}</p>` : P}
                        </div>`)}
                  </details>`}
        </article>`);
	}
	unresolvedGroups(e) {
		return $e(e).map(({ reference: e, paths: t }) => M` <details
          class="reason-group"
          data-resolution=${Q(e)}
        >
          <summary>
            ${et(e)} · ${tt(e)}
            <span class="count"
              >${t.length}
              ${t.length === 1 ? "location" : "locations"}</span
            >
            ${e.selector ? M`<span class="registry-status">${e.selector.exists === !0 ? "Identity found" : e.selector.exists === !1 ? "Identity not found" : "Identity not checked"}</span>` : P}
          </summary>
          <p>${X(e.reason)}</p>
          ${this.selectorDetail(e)}
          ${e.selector ? P : M`<p>
                    Locations share a reason, not necessarily the same
                    expression or target.
                  </p>
                  ${this.badge(e.confidence)}`}
          ${t.map((e) => M`<div class="unresolved-row"><span>${Y(e)}</span><code>${e}</code></div>`)}
        </details>`);
	}
	uncertainty(e) {
		let t = e.uncertain_references.filter(this.matchesFilter), n = (e.other_dashboard_references || []).filter(this.matchesFilter);
		return !t.length && !n.length ? P : M`<section class="uncertainty" aria-label="References to review">
      <h2>References to review</h2>
      <p>
        These are limits of static analysis, not a count of broken entities.
        Device IDs and selectors are listed separately from dynamic or
        unrecognized targets. Repeated locations are grouped; a shared
        configuration does not prove a dependency.
      </p>
      ${t.length ? M`<details class="uncertainty-scope">
              <summary>
                In linked configurations
                <span class="count">${$(t)}</span>
              </summary>
              <p>
                References in linked automation/script configurations or
                dashboard cards, including other conditional branches.
              </p>
              ${this.references(t, !0)}
            </details>` : M`<p class="muted">
              No references requiring review in the linked configurations or
              cards.
            </p>`}
      ${n.length ? M`<details class="uncertainty-scope dashboard-context">
              <summary>
                Elsewhere in linked dashboards
                <span class="count">${$(n)}</span>
              </summary>
              <p>
                Outside cards with known links, or at dashboard level. Kept for
                context; these expressions are not attributed to the selected
                entity.
              </p>
              ${this.references(n, !0)}
            </details>` : P}
    </section>`;
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
		return M`<section class="result-filters" aria-label="Result filters">
      <div role="group" aria-label="Source types" class="filter-row">
        <span class="filter-label">Sources</span>
        <button
          aria-pressed=${!this.sourceFilters.length}
          @click=${() => this.sourceFilters = []}
        >
          All sources
        </button>
        ${Ye.map((e) => M`<button aria-pressed=${this.sourceFilters.includes(e)} @click=${() => this.sourceFilters = this.sourceFilters.includes(e) ? this.sourceFilters.filter((t) => t !== e) : [...this.sourceFilters, e]}>${J[e]}</button>`)}
      </div>
      <div role="group" aria-label="Reference confidence" class="filter-row">
        <span class="filter-label">Confidence</span>
        <button
          aria-pressed=${!this.reviewFilters.length}
          @click=${() => this.reviewFilters = []}
        >
          All confidence
        </button>
        ${Object.keys(t).map((e) => M`<button aria-pressed=${this.reviewFilters.includes(e)} @click=${() => this.reviewFilters = this.reviewFilters.includes(e) ? this.reviewFilters.filter((t) => t !== e) : [...this.reviewFilters, e]}>${t[e]}</button>`)}
      </div>
      <p class="filter-note" role="status">
        ${n} of ${e.references.length} direct references visible. Needs
        review includes unclassified references, device IDs, unexpanded
        selectors and unresolved expressions. Exports and coverage always
        include the full analysis.
      </p>
    </section>`;
	}
	selectorDetail(e) {
		if (!e.selector) return P;
		let t = e.selector;
		return M`<p class="selector-detail">
      <strong
        >${t.kind.replace("_id", "")}
        ${Q(e) === "device" ? "reference" : "selector"}</strong
      >
      <code>${t.value}</code>
      ${t.exists === !0 ? "Identity found in HA registry." : t.exists === !1 ? "Identity not found in HA registry; this does not establish a broken target." : "Registry identity not checked."}
      ${Q(e) === "device" ? "Device identity does not establish an entity dependency or prove an action will run." : "Entity membership and runtime eligibility are not expanded."}
    </p>`;
	}
	impact(e) {
		let t = e.references.filter(this.matchesFilter);
		return M`<h2>
        Where this entity is used
        <span class="badge"
          >${new Set(t.map((e) => e.source_id)).size} visible
          sources</span
        >
      </h2>
      ${t.length ? M`<div class="source-grid">${this.references(t)}</div>` : M`<div class="empty">
              <div class="symbol">${q()}</div>
              <h3>
                ${this.filtersActive ? "No matching direct references" : "No direct references found"}
              </h3>
              <p class="muted">
                ${this.filtersActive ? "Try All sources or All confidence to show more results. Full totals and exports are unchanged." : "Nothing in the inspected sources points to this entity. Check coverage and unresolved references before changing it."}
              </p>
            </div>`}
      ${this.uncertainty(e)}
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
            <strong>Unclassified:</strong> a candidate in a field with unknown
            semantics, or HA-native metadata without a verified location and
            role.
          </li>
        </ul>
      </details>`;
	}
	showCoverage() {
		let e = this.renderRoot.querySelector("#coverage");
		e && (e.open = !0, e.querySelector("summary")?.focus(), e.scrollIntoView({ block: "start" }));
	}
	completeness(e) {
		let t = e.graph.limits_reached || [], n = e.coverage.warnings || [];
		if (!e.graph.truncated && !n.length) return P;
		let r = t.includes("nodes") || t.includes("edges"), i = [
			1,
			2,
			3,
			4,
			6,
			8,
			12
		].find((t) => t > e.graph.max_depth);
		return M`<section
      class="notice incomplete"
      role="status"
      aria-label="Incomplete results"
    >
      <h3>Results are incomplete</h3>
      ${t.includes("depth") ? M`<p>The dependency map reached depth ${e.graph.max_depth}. More dependencies may exist beyond this depth.</p>` : P}
      ${r ? M`<p>The dependency map reached its ${t.includes("nodes") ? "node" : "edge"} limit. Increasing depth will not remove this cap.</p>` : P}
      ${e.graph.truncated && !t.length ? M`<p>The dependency map reached a depth or size limit. More dependencies may exist.</p>` : P}
      ${n.length ? M`<p>Some configuration could not be fully inspected. Review ${n.length === 1 ? "the coverage warning" : `the ${n.length} coverage warnings`} before changing this entity.</p>` : P}
      <p>
        Counts below describe only what was found, not everything that may
        depend on this entity.
      </p>
      <div class="controls">
        ${t.includes("depth") && !r && i ? M`<button
                ?disabled=${this.loading}
                @click=${() => {
			this.depth = i, this.run();
		}}
              >
                Inspect to depth ${i}
              </button>` : P}
        <button @click=${this.showCoverage}>Review coverage</button>
      </div>
    </section>`;
	}
	graph(e) {
		let t = this.filtersActive ? Ze(e, this.matchesFilter) : e.graph.nodes, n = e.graph.edges.filter(this.matchesFilter), r = t.find((e) => e.relationship === "selected"), i = t.filter((e) => e.relationship === "dependent"), a = t.filter((e) => e.relationship === "downstream");
		return M`<h2>Dependency map</h2>
      <p class="muted">
        Read from the selected entity to its linked configurations and their
        targets. Conditions are not evaluated; these links do not prove an
        action will run.
      </p>
      ${this.filtersActive ? M`<p class="filter-note">Showing ${t.length - 1} of ${e.graph.nodes.length - 1} linked nodes. Paths may pass through hidden configurations; filtering does not recalculate the graph.</p>` : P}
      <div class="tree dependency-map">
        <div class="map-selected">
          <span class="map-label">Selected entity</span
          >${this.graphNode(r)}
        </div>
        <div class="map-columns">
          <section class="map-group">
            <h3>Used by <span class="count">${i.length}</span></h3>
            <p class="muted">
              Configurations that reference the selected entity, directly or
              through another configuration.
            </p>
            ${i.length ? i.map((e) => this.graphNode(e)) : M`<p>${this.filtersActive ? "No matching linked configurations. Try All sources or All confidence." : "No linked configurations found."}</p>`}
          </section>
          <section class="map-group">
            <h3>
              Possible targets <span class="count">${a.length}</span>
            </h3>
            <p class="muted">
              Action and membership targets reached through those
              configurations.
            </p>
            ${a.length ? a.map((e) => this.graphNode(e)) : M`<p>${this.filtersActive ? "No matching possible targets. Try All sources or All confidence." : "No downstream targets found."}</p>`}
          </section>
        </div>
      </div>
      ${e.graph.cycles.length ? M`<div class="notice">Cycles detected. Nodes are shown once.${e.graph.cycles.map((e) => M`<p><code>${e.join(" → ")}</code></p>`)}</div>` : P}
      <details>
        <summary>
          ${n.length} visible graph edges / ${e.graph.edges.length}
          total
        </summary>
        ${n.map((e) => M`<div class="edge"><strong>${this.sourceName(e.source_id)} → ${this.sourceName(e.target)}</strong><code>${e.source_id} → ${e.target}</code><code>${e.path}</code><span class="badge">${e.role}</span> ${this.badge(e.confidence)}</div>`)}
      </details>`;
	}
	graphNode(e) {
		let t = e.id.split(".")[0];
		return M`<article
      class="graph-node ${e.relationship}"
      data-source=${e.id}
    >
      <div class="reference-title">
        <div class="source-heading">
          ${He(t)}
          <div>
            <h3>${this.sourceControl(e.id)}</h3>
            <span class="source-meta"
              >${J[t] || t.replaceAll("_", " ")}${e.depth ? ` · ${e.depth} ${e.depth === 1 ? "step" : "steps"} away` : ""}</span
            >
          </div>
        </div>
        <div class="node-actions">
          ${this.sourceControl(e.id, !0)}
          ${/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(e.id) ? M`<button class="analyze-node" aria-label=${`Analyze this: ${e.id}`} @click=${() => this.analyzeNode(e.id)}>Analyze this</button>` : P}
        </div>
      </div>
      ${e.via ? M`<p class="via">${e.relationship === "dependent" ? "References" : "Target of"} ${this.sourceControl(e.via)}</p>` : P}
      <details class="technical">
        <summary>${e.path ? "Connection details" : "Entity ID"}</summary>
        <code class="source-id">${e.id}</code>
        ${e.path ? M`<div class="technical-row">
                <div class="path">
                  <span>${Y(e.path)}</span
                  >${e.confidence ? this.badge(e.confidence) : P}
                </div>
                <code>${e.path}</code>
              </div>` : P}
      </details>
    </article>`;
	}
	raw(e) {
		let t = [
			...e.references,
			...e.uncertain_references,
			...e.other_dashboard_references || []
		].filter(this.matchesFilter);
		return M`<h2>Raw references</h2>
      ${t.length ? P : M`<p>No matching references. Try All sources or All confidence.</p>`}
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
            ${t.map((e) => M`<tr>
                  <td>
                    ${this.sourceControl(e.source_id)}<code
                      >${e.source_id}<br />${e.path}</code
                    >
                  </td>
                  <td>${e.role}</td>
                  <td>
                    ${e.selector ? M`<span class="badge">${et(e)}</span>` : this.badge(e.confidence)}${e.reason ? M`<p>${X(e.reason)}</p>` : P}${this.selectorDetail(e)}
                  </td>
                </tr>`)}
          </tbody>
        </table>
      </div>`;
	}
	render() {
		let e = this.report, t = this.entities.filter((e) => `${e.entity_id} ${e.name}`.toLowerCase().includes(this.query.toLowerCase())).slice(0, 80);
		return M`<header>
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
          ${q()}<strong>HA Blast Radius</strong>
        </div>
        <span class="badge"
          >READ ONLY<span class="release-label"> · α ${Qe}</span></span
        >
      </header>
      <main>
        <h1>Entity dependencies</h1>
        <p class="muted intro">
          Inspect references before renaming or removing an entity.
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
            ${t.map((e) => M`<option value=${e.entity_id}>${e.name}${e.exists ? "" : " · missing"}</option>`)}
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
		].map((e) => M`<option value=${e} ?selected=${e === this.depth}>${e}</option>`)}
            </select></label
          >
          <button
            class="primary"
            ?disabled=${this.loading || !this.query.trim()}
          >
            ${this.loading ? "Inspecting…" : "Analyze"}
          </button>
        </form>
        ${this.recentSearches.length ? M`<section
                class="recent-searches"
                aria-label="Recent searches"
              >
                <span class="recent-label">Recent</span>
                <div class="recent-list">
                  ${Ie(this.recentSearches, (e) => e.entityId, (e) => M`<button
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
              </section>` : P}
        ${this.loading ? M`<progress aria-label="Inspecting configuration"></progress>` : P}
        ${this.error ? M`<div role="alert" class="notice error">
                ${this.error}
                <div class="controls">
                  <button
                    @click=${() => this.query ? this.run() : this.loadEntities()}
                  >
                    Retry
                  </button>
                </div>
              </div>` : P}
        ${e ? M`
                <div class="result-heading">
                  <h2 tabindex="-1">${this.sourceName(e.entity_id)}</h2>
                  <code>${e.entity_id}</code>
                </div>
                ${e.exists ? P : M`<div class="notice">This entity is missing. References to its old ID can still be inspected.</div>`}
                ${this.completeness(e)}
                <p class="muted totals-label">
                  Full analysis totals · filters below affect visible results
                  only
                </p>
                <div class="stats">
                  <div class="stat">
                    <strong>${e.summary.references}</strong
                    ><span>Direct references</span>
                  </div>
                  <div class="stat">
                    <strong>${e.summary.sources}</strong
                    ><span>Linked configurations</span>
                  </div>
                  <div class="stat">
                    <strong>${e.summary.downstream}</strong
                    ><span>Downstream targets</span>
                  </div>
                  <div class="stat">
                    <strong
                      >${e.summary.template_literal + e.summary.unknown}</strong
                    ><span>Direct refs to review</span>
                  </div>
                </div>
                <div class="columns">
                  <section class="card">
                    <nav role="tablist" aria-label="Analysis views">
                      ${[
			"impact",
			"graph",
			"raw"
		].map((e) => M`<button role="tab" id=${`tab-${e}`} aria-controls="analysis-view" aria-selected=${this.tab === e} tabindex=${this.tab === e ? 0 : -1} @keydown=${this.tabKeydown} @click=${() => this.tab = e}>${e === "impact" ? "Impact" : e === "graph" ? "Graph" : "Raw references"}</button>`)}
                    </nav>
                    ${this.filters(e)}
                    <div
                      role="tabpanel"
                      id="analysis-view"
                      aria-labelledby=${`tab-${this.tab}`}
                    >
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
                    <a
                      class="issue-link"
                      href="https://github.com/artur-panek/ha-blast-radius/issues/new?template=bug.yml"
                      target="_blank"
                      rel="noopener noreferrer"
                      >Report issue ↗</a
                    >
                    <p class="status" role="status">${this.status}</p>
                    ${this.copyFallback ? M`<textarea aria-label="Markdown report" readonly .value=${e.markdown}></textarea>` : P}
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
                      ${e.preview ? M`<div class="preview" role="status">
                              <h3>
                                ${e.preview.operation === "rename" ? "Rename preview" : "Removal preview"}
                              </h3>
                              <code>${e.entity_id}</code
                              >${e.preview.new_entity_id ? M`<code>→ ${e.preview.new_entity_id}</code>` : P}
                              <ul>
                                ${Object.entries(e.preview.affected_sources).map(([e, t]) => M`<li>${t} ${e} source${t === 1 ? "" : "s"}</li>`)}
                              </ul>
                              <p>${e.preview.note}</p>
                              <strong>No changes have been made.</strong>
                            </div>` : P}
                      <p class="muted">
                        Analysis only. No configuration is written.
                      </p>
                    </div>
                  </details>
                </div>
                <details class="card" id="coverage">
                  <summary>
                    Coverage and limitations · ${e.coverage.sources}
                    sources inspected
                  </summary>
                  <p class="muted">
                    ${Object.entries(e.coverage.source_types).map(([e, t]) => `${t} ${e}`).join(" · ")}
                  </p>
                  <ul>
                    ${e.warnings.map((e) => M`<li>${e}</li>`)}
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
                    ${e.review_summary?.snapshot.locations === e.unresolved_total ? M`<li>Full snapshot: ${e.review_summary.snapshot.device_locations} device-reference locations · ${e.review_summary.snapshot.selector_locations} unexpanded-selector locations · ${e.review_summary.snapshot.unresolved_locations} dynamic or unrecognized locations.</li>` : P}
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
              ` : !this.loading && !this.error ? M`<section class="card empty">
                  <div class="symbol">${q()}</div>
                  <h2>Start with one entity</h2>
                  <p class="muted">
                    A button, a helper, an old light.<br />Find out what points
                    to it and what sits downstream.
                  </p>
                  <p class="muted">
                    ${this.entities.length} entity IDs available · Missing IDs
                    can be entered manually
                  </p>
                </section>` : P}
      </main>`;
	}
};
customElements.get("blast-radius-panel") || customElements.define("blast-radius-panel", rt);
//#endregion
export { rt as BlastRadiusPanel };
