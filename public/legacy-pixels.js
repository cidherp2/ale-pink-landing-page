!(function (f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = !0;
  n.version = "2.0";
  n.queue = [];
  t = b.createElement(e);
  t.async = !0;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);
})(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
fbq("init", "2399820307149557");
fbq("track", "PageView");

!(function (w, d, t) {
  w.TiktokAnalyticsObject = t;
  var ttq = (w[t] = w[t] || []);
  ttq.methods = [
    "page", "track", "identify", "instances", "debug", "on", "off",
    "once", "ready", "alias", "group", "enableCookie", "disableCookie",
    "holdConsent", "revokeConsent", "grantConsent",
  ];
  ttq.setAndDefer = function (target, method) {
    target[method] = function () {
      target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
  ttq.instance = function (id) {
    for (var instance = ttq._i[id] || [], i = 0; i < ttq.methods.length; i++)
      ttq.setAndDefer(instance, ttq.methods[i]);
    return instance;
  };
  ttq.load = function (id, options) {
    var url = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = ttq._i || {};
    ttq._i[id] = [];
    ttq._i[id]._u = url;
    ttq._t = ttq._t || {};
    ttq._t[id] = +new Date();
    ttq._o = ttq._o || {};
    ttq._o[id] = options || {};
    var script = d.createElement("script");
    script.type = "text/javascript";
    script.async = !0;
    script.src = url + "?sdkid=" + id + "&lib=" + t;
    var first = d.getElementsByTagName("script")[0];
    first.parentNode.insertBefore(script, first);
  };
  ttq.load("D9OG7D3C77U1C011PR60");
  ttq.page();
})(window, document, "ttq");
