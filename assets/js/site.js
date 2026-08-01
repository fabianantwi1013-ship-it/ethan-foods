/* Ethan Foods — shared site behaviour: nav, product render, cart, reviews, forms */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- mobile nav ---------- */
  var burger = $(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      $(".nav-links").classList.toggle("open");
    });
  }

  /* ---------- scroll reveal ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- picture helper (webp + fallback) ---------- */
  function pic(base, alt, fallbackExt) {
    return '<picture><source srcset="' + base + '.webp" type="image/webp">' +
      '<img src="' + base + '.' + (fallbackExt || "png") + '" alt="' + alt + '" loading="lazy"></picture>';
  }

  /* ---------- product cards ---------- */
  function productCard(p) {
    return '<article class="card reveal" data-heat="' + p.heat.toLowerCase() + '">' +
      '<div class="card-media">' +
      '<span class="card-tag">' + p.tag + '</span>' +
      '<span class="heat ' + p.heat.toLowerCase() + '">' + p.heat + '</span>' +
      pic(p.img, p.name) +
      '</div>' +
      '<div class="card-body">' +
      '<h3>' + p.name + '</h3>' +
      '<span class="unit">' + p.unit + ' &middot; ' + p.flavor + '</span>' +
      '<p class="desc">' + p.desc + '</p>' +
      '<p class="desc" style="font-size:.78rem"><b>Ingredients:</b> ' + p.ingredients + '</p>' +
      '<div class="card-foot">' +
      '<div class="price">$' + p.price.toFixed(2) + '<small>free US shipping</small></div>' +
      '<button class="btn btn-primary btn-sm" data-add="' + p.id + '">Add to Cart</button>' +
      '</div></div></article>';
  }

  function renderProducts(sel, limit) {
    var host = $(sel);
    if (!host || typeof EF_PRODUCTS === "undefined") return;
    var list = limit ? EF_PRODUCTS.slice(0, limit) : EF_PRODUCTS;
    host.innerHTML = list.map(productCard).join("");
    if ("IntersectionObserver" in window) {
      $$(".reveal", host).forEach(function (el) { el.classList.add("in"); });
    }
  }
  renderProducts("[data-products]");
  renderProducts("[data-products-featured]", 3);

  /* ---------- flavour filter ---------- */
  $$(".chip[data-filter]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      $$(".chip[data-filter]").forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      var f = chip.getAttribute("data-filter");
      $$("[data-products] .card").forEach(function (card) {
        card.style.display = (f === "all" || card.getAttribute("data-heat") === f) ? "" : "none";
      });
    });
  });

  /* ---------- reviews ---------- */
  function stars(n) {
    var s = "";
    for (var i = 0; i < 5; i++) s += i < n ? "★" : "☆";
    return s;
  }
  function reviewCard(r) {
    var text = r.text.length > 260 ? r.text.slice(0, 257) + "…" : r.text;
    return '<article class="review reveal in">' +
      '<div class="stars">' + stars(r.rating) + '</div>' +
      '<p>“' + text + '”</p>' +
      '<div class="who">' + r.author + '<span>' + (r.date || "Verified customer") + '</span></div>' +
      '</article>';
  }
  var revHost = $("[data-reviews]");
  if (revHost && typeof EF_REVIEWS !== "undefined") {
    var count = parseInt(revHost.getAttribute("data-reviews"), 10);
    var list = EF_REVIEWS.filter(function (r) { return r.text && r.text.length > 25; });
    revHost.innerHTML = (count ? list.slice(0, count) : EF_REVIEWS).map(reviewCard).join("");
  }
  var avgHost = $("[data-review-avg]");
  if (avgHost && typeof EF_REVIEWS !== "undefined") {
    var avg = EF_REVIEWS.reduce(function (a, r) { return a + r.rating; }, 0) / EF_REVIEWS.length;
    avgHost.textContent = avg.toFixed(1);
  }
  var cntHost = $("[data-review-count]");
  if (cntHost && typeof EF_REVIEWS !== "undefined") cntHost.textContent = EF_REVIEWS.length;

  /* ---------- cart (localStorage demo) ---------- */
  var CART_KEY = "ef_cart_v1";
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { return {}; }
  }
  function setCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); paintCart(); }
  function findProduct(id) {
    return (typeof EF_PRODUCTS !== "undefined" ? EF_PRODUCTS : []).filter(function (p) { return p.id === id; })[0];
  }

  function paintCart() {
    var cart = getCart(), ids = Object.keys(cart);
    var n = ids.reduce(function (a, id) { return a + cart[id]; }, 0);
    $$(".cart-count").forEach(function (el) { el.textContent = n; el.style.display = n ? "flex" : "none"; });

    var itemsHost = $(".drawer-items");
    if (!itemsHost) return;
    if (!ids.length) {
      itemsHost.innerHTML = '<div class="drawer-empty"><p style="font-size:2.4rem">🌿</p><p>Your cart is empty.</p></div>';
    } else {
      itemsHost.innerHTML = ids.map(function (id) {
        var p = findProduct(id); if (!p) return "";
        return '<div class="drawer-item">' +
          '<img src="' + p.img + '.png" alt="">' +
          '<div><h4>' + p.name + '</h4>' +
          '<div class="qty"><button data-dec="' + id + '">−</button><b>' + cart[id] + '</b><button data-inc="' + id + '">+</button></div></div>' +
          '<span class="line">$' + (p.price * cart[id]).toFixed(2) + '</span></div>';
      }).join("");
    }
    var total = ids.reduce(function (a, id) {
      var p = findProduct(id); return a + (p ? p.price * cart[id] : 0);
    }, 0);
    var t = $("[data-cart-total]");
    if (t) t.textContent = "$" + total.toFixed(2);
  }

  var toastTimer;
  function toast(msg) {
    var el = $(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg;
    requestAnimationFrame(function () { el.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  /* ---------- checkout: capture the customer's contact details ---------- */
  var WEB_ORDERS_KEY = "ef_web_orders_v1";

  function cartLines() {
    var cart = getCart();
    return Object.keys(cart).map(function (id) {
      var p = findProduct(id);
      return p ? { id: id, name: p.name + (p.unit ? " (" + p.unit + ")" : ""), qty: cart[id], price: p.price } : null;
    }).filter(Boolean);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function showCheckoutForm() {
    var lines = cartLines();
    if (!lines.length) { toast("Your cart is empty."); return; }
    var total = lines.reduce(function (a, l) { return a + l.qty * l.price; }, 0);
    document.body.classList.add("checkout-mode");
    $(".drawer-items").innerHTML =
      '<form class="co-form" novalidate>' +
      '<p class="co-head">Almost done! Tell us where to send your order and we\'ll be in touch to arrange payment &amp; delivery.</p>' +
      '<div><label>Full name *</label><input name="name" required autocomplete="name" placeholder="Your name"></div>' +
      '<div><label>Phone *</label><input name="phone" required autocomplete="tel" placeholder="+1 (555) 000-0000"></div>' +
      '<div><label>Email</label><input name="email" type="email" autocomplete="email" placeholder="you@email.com"></div>' +
      '<div><label>Delivery address</label><input name="address" autocomplete="street-address" placeholder="Street, city, state, ZIP"></div>' +
      '<div><label>Note (optional)</label><textarea name="note" rows="2" placeholder="Anything we should know?"></textarea></div>' +
      '<button class="btn btn-primary" type="submit">Place Order — $' + total.toFixed(2) + '</button>' +
      '<button class="btn-linklike" type="button" data-co-back>← Back to cart</button>' +
      '</form>';

    $(".co-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target;
      var name = f.name.value.trim(), phone = f.phone.value.trim();
      if (!name || !phone) { toast("Please add your name and phone number."); return; }
      var order = {
        id: Date.now(),
        no: "WEB-" + String(Date.now()).slice(-6),
        date: new Date().toISOString(),
        customer: { name: name, phone: phone, email: f.email.value.trim(),
                    address: f.address.value.trim(), note: f.note.value.trim() },
        items: lines, total: Math.round(total * 100) / 100, status: "New"
      };
      var inbox;
      try { inbox = JSON.parse(localStorage.getItem(WEB_ORDERS_KEY)) || []; } catch (err) { inbox = []; }
      inbox.unshift(order);
      try { localStorage.setItem(WEB_ORDERS_KEY, JSON.stringify(inbox)); } catch (err) {}
      localStorage.setItem(CART_KEY, "{}");
      $$(".cart-count").forEach(function (el) { el.textContent = "0"; el.style.display = "none"; });
      $(".drawer-items").innerHTML =
        '<div class="co-success"><p style="font-size:2.6rem">✅</p>' +
        '<h4>Order received — thank you, ' + esc(name.split(" ")[0]) + '!</h4>' +
        '<p>Your order <b>' + order.no + '</b> ($' + order.total.toFixed(2) + ') is in. ' +
        'We\'ll call you at <b>' + esc(phone) + '</b> to confirm payment and delivery.</p></div>';
      toast("Order " + order.no + " received!");
    });
  }

  document.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");
    if (add) {
      var cart = getCart(), id = add.getAttribute("data-add");
      cart[id] = (cart[id] || 0) + 1;
      setCart(cart);
      toast("Added to cart — " + (findProduct(id) || {}).name);
      return;
    }
    var inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
    if (inc || dec) {
      var c = getCart(), pid = (inc || dec).getAttribute(inc ? "data-inc" : "data-dec");
      c[pid] = (c[pid] || 0) + (inc ? 1 : -1);
      if (c[pid] <= 0) delete c[pid];
      setCart(c);
      return;
    }
    if (e.target.closest("[data-checkout]")) { showCheckoutForm(); return; }
    if (e.target.closest("[data-co-back]")) {
      document.body.classList.remove("checkout-mode");
      paintCart();
      return;
    }
    if (e.target.closest("[data-cart-open]")) {
      document.body.classList.remove("checkout-mode");
      document.body.classList.add("cart-open");
      paintCart();
    }
    if (e.target.closest("[data-cart-close]") || e.target.classList.contains("drawer-veil")) {
      document.body.classList.remove("cart-open");
      document.body.classList.remove("checkout-mode");
    }
  });
  paintCart();

  /* ---------- demo forms ---------- */
  $$("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = $(".form-success", f.parentElement) || $(".form-success", f);
      if (ok) ok.style.display = "block";
      f.reset();
      toast("Thanks! Your message has been noted.");
    });
  });

  /* ---------- footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
