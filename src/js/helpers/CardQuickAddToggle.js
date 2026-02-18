if (!window.cardQuickAddToggleBound) {
  window.cardQuickAddToggleBound = true;

  var withJsEndpoint = function (url, fallback) {
    var base = url || fallback;
    return base.endsWith(".js") ? base : base + ".js";
  };

  var getCart = function () {
    return fetch(withJsEndpoint(window.routes && window.routes.cart_url, "/cart"), {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    }).then(function (response) {
      if (!response.ok) throw new Error("Failed cart fetch");
      return response.json();
    });
  };

  var addToCart = function (variantId, quantity) {
    return fetch(withJsEndpoint(window.routes && window.routes.cart_add_url, "/cart/add"), {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity,
      }),
    }).then(function (response) {
      if (!response.ok) throw new Error("Failed add");
      return response.json();
    });
  };

  var changeCart = function (variantId, quantity) {
    return fetch(withJsEndpoint(window.routes && window.routes.cart_change_url, "/cart/change"), {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity,
      }),
    }).then(function (response) {
      if (!response.ok) throw new Error("Failed change");
      return response.json();
    });
  };

  var updateCartBubble = function (itemCount) {
    var bubbles = document.querySelectorAll(".cart-count-bubble");
    bubbles.forEach(function (bubble) {
      if (!itemCount || itemCount < 1) {
        bubble.innerHTML = "";
        return;
      }

      var visible = bubble.querySelector('span[aria-hidden="true"]');
      if (!visible) {
        visible = document.createElement("span");
        visible.setAttribute("aria-hidden", "true");
        bubble.appendChild(visible);
      }
      visible.textContent = String(itemCount);

      var sr = bubble.querySelector(".visually-hidden");
      if (!sr) {
        sr = document.createElement("span");
        sr.className = "visually-hidden";
        bubble.appendChild(sr);
      }
      sr.textContent = "Cart contains " + itemCount + " items";
    });
  };

  var getVariantId = function (switchNode) {
    var dataVariantId = switchNode.dataset.cardVariantId;
    if (dataVariantId) return dataVariantId;
    var form = switchNode.closest("form");
    if (!form) return null;
    var idInput = form.querySelector('input[name="id"]');
    return idInput ? idInput.value : null;
  };

  var setPending = function (switchNode, pending) {
    switchNode.dataset.cardQuickAddPending = pending ? "true" : "false";
    var controls = switchNode.querySelectorAll(
      ".js-card-quick-add-trigger, .js-card-quick-add-plus, .js-card-quick-add-minus"
    );
    controls.forEach(function (button) {
      button.disabled = pending;
    });
  };

  var syncSwitchesFromCart = function (cart) {
    var quantitiesByVariantId = {};
    (cart.items || []).forEach(function (item) {
      quantitiesByVariantId[String(item.variant_id)] = item.quantity;
    });

    var switches = document.querySelectorAll(".js-card-quick-add-switch");
    switches.forEach(function (switchNode) {
      var variantId = getVariantId(switchNode);
      var counterValue = switchNode.querySelector(".js-card-quick-add-value");
      if (!variantId || !counterValue) return;
      var qty = quantitiesByVariantId[String(variantId)] || 0;

      if (qty > 0) {
        counterValue.textContent = String(qty);
        switchNode.classList.add("is-active");
      } else {
        counterValue.textContent = "1";
        switchNode.classList.remove("is-active");
      }
    });

    updateCartBubble(cart.item_count || 0);
  };

  var refreshFromCart = function () {
    return getCart().then(syncSwitchesFromCart);
  };

  document.addEventListener("click", function (event) {
    var addButton = event.target.closest(".js-card-quick-add-trigger");
    if (addButton) {
      var addSwitch = addButton.closest(".js-card-quick-add-switch");
      if (!addSwitch || addButton.disabled) return;
      var mode = addSwitch.dataset.cardQuickAddMode;

      if (mode !== "modal") {
        addSwitch.classList.add("is-active");
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      if (addSwitch.dataset.cardQuickAddPending === "true") return;

      var addVariantId = getVariantId(addSwitch);
      if (!addVariantId) return;

      setPending(addSwitch, true);
      addToCart(addVariantId, 1)
        .then(function () {
          return refreshFromCart();
        })
        .finally(function () {
          setPending(addSwitch, false);
        });
      return;
    }

    var plusButton = event.target.closest(".js-card-quick-add-plus");
    if (plusButton) {
      var plusSwitch = plusButton.closest(".js-card-quick-add-switch");
      if (!plusSwitch) return;
      if (plusSwitch.dataset.cardQuickAddPending === "true") return;
      var plusVariantId = getVariantId(plusSwitch);
      if (!plusVariantId) return;

      setPending(plusSwitch, true);
      addToCart(plusVariantId, 1)
        .then(function () {
          return refreshFromCart();
        })
        .finally(function () {
          setPending(plusSwitch, false);
        });
      return;
    }

    var minusButton = event.target.closest(".js-card-quick-add-minus");
    if (!minusButton) return;
    var minusSwitch = minusButton.closest(".js-card-quick-add-switch");
    if (!minusSwitch) return;
    if (minusSwitch.dataset.cardQuickAddPending === "true") return;
    var minusVariantId = getVariantId(minusSwitch);
    if (!minusVariantId) return;
    var minusValue = minusSwitch.querySelector(".js-card-quick-add-value");
    if (!minusValue) return;
    var current = parseInt(minusValue.textContent, 10) || 1;
    var targetQuantity = current - 1;

    setPending(minusSwitch, true);
    changeCart(minusVariantId, Math.max(targetQuantity, 0))
      .then(function () {
        return refreshFromCart();
      })
      .finally(function () {
        setPending(minusSwitch, false);
      });
  });

  refreshFromCart().catch(function () {});
  document.addEventListener("shopify:section:load", function () {
    refreshFromCart().catch(function () {});
  });
}
